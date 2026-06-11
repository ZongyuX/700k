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
 *   - COIN_PRODUCTS  : map each coin-pack PRODUCT ID to the coins it grants.
 *     Used as fallback if variant_id is not in COIN_VARIANTS.
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

/* ---- Coin pack detection ----
 * IMPORTANT: You MUST fill in the real variant IDs and/or product IDs
 * from your Lemon Squeezy dashboard for coin packs to work!
 *
 * To find them:
 *   1. Go to Lemon Squeezy dashboard → Products → your coin pack product
 *   2. Check the URL or API for the product_id and variant_id
 *   3. Add them below
 *
 * COIN_VARIANTS maps variant_id → coin count (most precise)
 * COIN_PRODUCTS maps product_id → coin count (fallback)
 * If neither matches, product_name is checked as last resort.
 */
var COIN_VARIANTS = {
  /* TODO: Fill in your real coin pack variant IDs from Lemon Squeezy.
   * Example:  12345: 1200,  12346: 4000,  12347: 12000  */
};

var COIN_PRODUCTS = {
  /* TODO: Fill in your real coin pack product IDs from Lemon Squeezy.
   * Example:  111: 1200,  112: 4000,  113: 12000  */
};

/* Fallback: detect coin packs by product_name keywords.
 * Maps lowercase keyword → coin count.  Checked if neither
 * COIN_VARIANTS nor COIN_PRODUCTS matched. */
var COIN_NAME_MAP = {
  'coin pack s': 1200,
  'coin pack m': 4000,
  'coin pack l': 12000,
  '1200': 1200,
  '4000': 4000,
  '12000': 12000
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
    console.log('[PromptRunic] ACTIVATE response:', JSON.stringify(d, null, 2));

    /* If activation succeeds, the key is valid and now active */
    if(d && d.activated === true){
      return processLicenseResponse(d, key);
    }

    /* If activation fails because limit is reached, try validate instead.
     * This means the key was already activated on this or another device.
     * We still want to let the user use it if it's valid. */
    if(d && d.error && (String(d.error).indexOf('limit') >= 0 || String(d.error).indexOf('No more activations') >= 0 || String(d.error).indexOf('activation') >= 0)){
      console.log('[PromptRunic] Activation limit reached, trying VALIDATE instead...');
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
        console.log('[PromptRunic] VALIDATE response (after limit):', JSON.stringify(d2, null, 2));
        if(!d2 || d2.valid !== true) return { ok:false, error:'limit' };
        return processLicenseResponse(d2, key);
      });
    }

    /* If activation failed for other reasons but the response still indicates
     * the key is valid (shouldn't normally happen, but just in case) */
    if(d && d.valid === true){
      return processLicenseResponse(d, key);
    }

    /* If the error is something other than "not found", it might still be
     * worth trying VALIDATE. For example, if the key was already activated
     * on this instance, the activate endpoint might return an error but
     * the key is still valid. */
    if(d && d.error && String(d.error).indexOf('not found') < 0 && String(d.error).indexOf('invalid') < 0){
      console.log('[PromptRunic] ACTIVATE had unexpected error, trying VALIDATE as fallback...');
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
        console.log('[PromptRunic] VALIDATE fallback response:', JSON.stringify(d2, null, 2));
        if(!d2 || d2.valid !== true) return { ok:false };
        return processLicenseResponse(d2, key);
      });
    }

    /* Completely invalid / not found */
    console.log('[PromptRunic] License key invalid or not found');
    return { ok:false };
  })
  .catch(function(e){
    console.error('[PromptRunic] Network error during license validation:', e);
    return { ok:false, error:'network' };
  });
}

/* Process the license response from Lemon Squeezy API (validate or activate)
 *
 * IMPORTANT: The ACTIVATE endpoint returns { activated: true, ... }
 *            The VALIDATE endpoint returns { valid: true, ... }
 * We must accept BOTH formats because processLicenseResponse is called
 * from both code paths. */
function processLicenseResponse(d, key){
  /* Accept both VALIDATE responses (valid: true) and ACTIVATE responses (activated: true) */
  if(!d) return { ok:false };
  var isValid = (d.valid === true) || (d.activated === true);
  if(!isValid) return { ok:false };

  var meta = d.meta || {};
  var licenseKey = d.license_key || {};
  var status = licenseKey.status || d.status || '';

  console.log('[PromptRunic] Processing license: status=' + status +
    ', product_id=' + meta.product_id + ', variant_id=' + meta.variant_id +
    ', product_name=' + meta.product_name + ', variant_name=' + meta.variant_name);

  /* Only reject truly dead keys — "expired" and "disabled".
   * IMPORTANT: Do NOT reject "inactive" — a key that hasn't been activated
   * yet is still VALID. The old code incorrectly rejected "inactive" keys,
   * which is why users couldn't activate newly purchased licenses! */
  if(status === 'expired' || status === 'disabled'){
    console.log('[PromptRunic] License is expired or disabled:', status);
    return { ok:false };
  }

  /* Save the activated instance ID for future deactivation if needed */
  if(d.instance && d.instance.id){
    lsSet('pp_activated_instance_' + key, d.instance.id);
  }

  /* ---- Coin pack detection (3 levels of fallback) ---- */

  /* Level 1: Check COIN_VARIANTS (variant_id → coins) — most precise */
  var coins = COIN_VARIANTS[meta.variant_id];
  if(coins){
    console.log('[PromptRunic] Detected coin pack via COIN_VARIANTS: ' + coins + ' coins');
    return { ok:true, kind:'coins', coins:coins };
  }

  /* Level 2: Check COIN_PRODUCTS (product_id → coins) — fallback */
  coins = COIN_PRODUCTS[meta.product_id];
  if(coins){
    console.log('[PromptRunic] Detected coin pack via COIN_PRODUCTS: ' + coins + ' coins');
    return { ok:true, kind:'coins', coins:coins };
  }

  /* Level 3: Check product_name keywords — last resort */
  if(meta.product_name){
    var nameLower = String(meta.product_name).toLowerCase();
    for(var keyword in COIN_NAME_MAP){
      if(nameLower.indexOf(keyword) >= 0){
        console.log('[PromptRunic] Detected coin pack via product_name "' + meta.product_name + '": ' + COIN_NAME_MAP[keyword] + ' coins');
        return { ok:true, kind:'coins', coins: COIN_NAME_MAP[keyword] };
      }
    }
  }

  /* ---- Pro membership detection ---- */

  /* Pro? — any membership product ID counts */
  if(PRO_PRODUCT_IDS.length){
    if(PRO_PRODUCT_IDS.indexOf(meta.product_id) >= 0){
      var days = PLAN_DURATION_DAYS[meta.product_id];
      if(typeof days === 'undefined') days = 0;
      console.log('[PromptRunic] Detected Pro membership: product_id=' + meta.product_id + ', days=' + days);
      return { ok:true, kind:'pro', days: days };
    }
    /* Valid key but not a Pro product and not a coin product */
    console.log('[PromptRunic] Valid key but not Pro or coin product: product_id=' + meta.product_id + ', product_name=' + meta.product_name);
    return { ok:true, kind:'unknown', product_id: meta.product_id, product_name: meta.product_name || '' };
  }

  /* PRO_PRODUCT_IDS not set — treat any valid non-coin key as Pro */
  console.log('[PromptRunic] No PRO_PRODUCT_IDS set, treating as Pro');
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
