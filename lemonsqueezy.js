/* =====================================================================
 * PromptRunic — lemonsqueezy.js
 * Payments via Lemon Squeezy (a "merchant of record" — it handles all
 * card processing, sales tax and VAT for you).
 *
 * How it works:
 *   - Buying  -> opens a Lemon Squeezy hosted checkout page.
 *   - Unlocking -> the customer gets a LICENSE KEY by email, types it in,
 *     and this script ACTIVATES it with the Lemon Squeezy license API.
 * This file never touches card numbers.
 *
 * Author: Zongyu Xie <zongyufred@gmail.com>
 * Copyright (c) 2026 Zongyu Xie. All rights reserved.
 *
 * Load AFTER fun.js:  <script src="lemonsqueezy.js"></script>
 * Full setup guide: PAYMENT-SETUP.md
 * ===================================================================== */
(function(){
'use strict';

/* =====================================================================
 * STEP 1 — OWNER: paste your Lemon Squeezy CHECKOUT LINKS.
 * In your Lemon Squeezy dashboard, open each Product -> "Share" and copy
 * the checkout URL. It looks like:
 *   https://YOURSTORE.lemonsqueezy.com/buy/xxxxxxxx-xxxx-xxxx-xxxx-...
 * Until BUY_PRO is filled in, the site shows a friendly "coming soon".
 * ===================================================================== */

/* ---- Membership plans ---- */
var MEMBERSHIP_PLANS = [
  { id:'3day',    name:'3 Days',            price:'$0.99',  productId:1134081,
    url:'https://zongyu220.lemonsqueezy.com/checkout/buy/4c8265f5-9432-4a9b-8539-13fca42a343e', mini:true },
  { id:'1month',  name:'1 Month',           price:'$7.99',  productId:1130711,
    url:'https://zongyu220.lemonsqueezy.com/checkout/buy/c912e170-15f3-419b-8e13-541ea4206f52' },
  { id:'3month',  name:'3 Months',          price:'$18',    productId:1130720,
    url:'https://zongyu220.lemonsqueezy.com/checkout/buy/39586fa1-7758-47ec-91fa-4e3ced552876' },
  { id:'6month',  name:'6 Months',          price:'$29',    productId:1130724,
    url:'https://zongyu220.lemonsqueezy.com/checkout/buy/515f94d1-9555-46b4-8fb5-0199f20bc192' },
  { id:'12month', name:'12 Months (1 Year)',price:'$39',    productId:1130727,
    url:'https://zongyu220.lemonsqueezy.com/checkout/buy/3443c774-2ff7-46f7-9c6a-6d1304050a6c' },
  { id:'lifetime',name:'Lifetime',          price:'$69',    productId:1073472,
    url:'https://zongyu220.lemonsqueezy.com/checkout/buy/96f23dff-e5c8-4766-ae36-1edd2bf5bb4b' }
];

/* Legacy — buyPro now opens the lifetime plan by default */
var BUY_PRO = MEMBERSHIP_PLANS[5].url;

/* ---- Coin packs ---- */
var BUY_COINS = [
  'https://zongyu220.lemonsqueezy.com/checkout/buy/f6176e20-78bf-41ab-949f-fc1be1762cc1',                                   /* 1200-coin pack — Coin Pack S  */
  'https://zongyu220.lemonsqueezy.com/checkout/buy/fd3a7f2a-37ce-4999-896d-b20c74b6efb2',                                   /* 4000-coin pack — Coin Pack M  */
  'https://zongyu220.lemonsqueezy.com/checkout/buy/caac0990-1c3a-42ce-824a-f490e5d76150'                                    /* 12000-coin pack — Coin Pack L */
];

/* =====================================================================
 * STEP 2 — OWNER: so the site knows what a redeemed license key unlocks.
 * Every Lemon Squeezy product/variant has a numeric ID (visible in the
 * dashboard URL, and in the API). Fill these in:
 *   - PRO_PRODUCT_IDS : the Product IDs that grant Pro access.
 *   - COIN_VARIANTS  : map each coin-pack VARIANT ID to the coins it grants.
 * If PRO_PRODUCT_IDS is empty, any valid non-coin key unlocks Pro.
 * ===================================================================== */
var PRO_PRODUCT_IDS = [1134081, 1130711, 1130720, 1130724, 1130727, 1073472];

/* Map each subscription product ID to its duration in days.
 * When a license key is validated, the Lemon Squeezy API tells us the
 * product_id — we look up the duration here and set an expiry date so
 * that "1 month" really expires after 30 days, "3 months" after 90, etc.
 * Lifetime (1073472) is permanent — no expiry.
 */
var PLAN_DURATION_DAYS = {
  1134081: 3,     /* 3 Days   */
  1130711: 30,    /* 1 Month  */
  1130720: 90,    /* 3 Months */
  1130724: 180,   /* 6 Months */
  1130727: 365,   /* 12 Months */
  1073472: 0      /* Lifetime — 0 means permanent */
};

var COIN_VARIANTS = {
  /* replace with real variant IDs from your Lemon Squeezy dashboard */
};

/* Lemon Squeezy license API endpoints (public, no API key needed). */
var VALIDATE_URL = 'https://api.lemonsqueezy.com/v1/licenses/validate';
var ACTIVATE_URL = 'https://api.lemonsqueezy.com/v1/licenses/activate';
var DEACTIVATE_URL = 'https://api.lemonsqueezy.com/v1/licenses/deactivate';

/* --------------------------------------------------------------- helpers */
function openUrl(u){
  if(!u){
    alert('This item is not on sale yet — please check back soon.');
    return;
  }
  try{ window.open(u, '_blank', 'noopener'); }
  catch(e){ location.href = u; }
}
function configured(){ return !!BUY_PRO; }

/* Generate a unique instance name for this browser/device.
 * This is required by Lemon Squeezy when activating a license.
 * We store it so the same instance can be deactivated later if needed. */
function getInstanceName(){
  var name = lsGet('pp_instance_name');
  if(!name){
    name = 'PromptRunic-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2,8);
    lsSet('pp_instance_name', name);
  }
  return name;
}

/* LocalStorage helpers (must exist in fun.js already, but safe fallback) */
function lsGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
function lsSet(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }

/* Verify a license key by ACTIVATING it with Lemon Squeezy.
 * We use the ACTIVATE endpoint (not just validate) because:
 *   - New license keys have status "inactive" — validate returns valid:true
 *     but license_key.status is "inactive", which the old code incorrectly rejected.
 *   - Activate both validates AND activates the key in one step.
 *   - It creates an "instance" so the key is properly registered as in use.
 *
 * Resolves to one of:
 *   { ok:true,  kind:'pro', days:N }   N=0 means lifetime; N>0 = subscription days
 *   { ok:true,  kind:'coins', coins:N }
 *   { ok:true,  kind:'unknown' }
 *   { ok:false }                       (invalid / not found / expired / disabled)
 *   { ok:false, error:'network' }      (could not reach server)
 *   { ok:false, error:'limit' }        (activation limit reached)
 */
function validateLicense(key){
  var instanceName = getInstanceName();

  /* First, try to ACTIVATE the license key (validates + activates in one step) */
  return fetch(ACTIVATE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: 'license_key=' + encodeURIComponent(key) + '&instance_name=' + encodeURIComponent(instanceName)
  })
  .then(function(r){ return r.json(); })
  .then(function(d){
    /* If activation succeeds, the key is valid and now active */
    if(d && d.activated === true){
      return processLicenseResponse(d, key);
    }

    /* If activation fails because limit is reached, try validate instead.
     * This means the key was already activated on this or another device.
     * We still want to let the user use it if it's valid. */
    if(d && d.error && (d.error.indexOf('limit') >= 0 || d.error.indexOf('No more activations') >= 0)){
      return fetch(VALIDATE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: 'license_key=' + encodeURIComponent(key)
      })
      .then(function(r){ return r.json(); })
      .then(function(d2){
        if(!d2 || d2.valid !== true) return { ok:false, error:'limit' };
        return processLicenseResponse(d2, key);
      });
    }

    /* If activation failed for other reasons, try just validating */
    if(d && d.valid === true){
      return processLicenseResponse(d, key);
    }

    /* Completely invalid / not found */
    return { ok:false };
  })
  .catch(function(){ return { ok:false, error:'network' }; });
}

/* Process the license response from Lemon Squeezy API (validate or activate) */
function processLicenseResponse(d, key){
  if(!d || d.valid !== true) return { ok:false };

  var meta = d.meta || {};
  var licenseKey = d.license_key || {};
  var status = licenseKey.status || d.status || '';

  /* Only reject truly dead keys — "expired" and "disabled".
   * IMPORTANT: Do NOT reject "inactive" — a key that hasn't been activated
   * yet is still VALID. The old code incorrectly rejected "inactive" keys,
   * which is why users couldn't activate newly purchased licenses! */
  if(status === 'expired' || status === 'disabled') return { ok:false };

  /* Save the activated instance ID for future deactivation if needed */
  if(d.instance && d.instance.id){
    lsSet('pp_activated_instance_' + key, d.instance.id);
  }

  /* Coin pack? */
  var coins = COIN_VARIANTS[meta.variant_id];
  if(coins) return { ok:true, kind:'coins', coins:coins };

  /* Pro? — any membership product ID counts */
  if(PRO_PRODUCT_IDS.length){
    if(PRO_PRODUCT_IDS.indexOf(meta.product_id) >= 0){
      var days = PLAN_DURATION_DAYS[meta.product_id];
      if(typeof days === 'undefined') days = 0;
      return { ok:true, kind:'pro', days: days };
    }
    /* Valid key but not a Pro product — still let them use it */
    return { ok:true, kind:'unknown' };
  }

  /* PRO_PRODUCT_IDS not set — treat any valid non-coin key as Pro */
  return { ok:true, kind:'pro', days: 0 };
}

/* --------------------------------------------------------------- public */
window.PPLemon = {
  configured: configured,
  buyPro:   function(){ openUrl(BUY_PRO); },
  buyMembership: function(planId){
    var plan = MEMBERSHIP_PLANS.filter(function(p){ return p.id === planId; })[0];
    if(plan) openUrl(plan.url);
    else openUrl('');
  },
  getPlans: function(){ return MEMBERSHIP_PLANS; },
  buyCoins: function(i){
    if(i<0 || i>=BUY_COINS.length){ openUrl(''); return; }
    openUrl(BUY_COINS[i]);
  },
  validateLicense: validateLicense
};

})();
