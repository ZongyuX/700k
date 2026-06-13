/* =====================================================================
 * PromptRunic — lemonsqueezy.js
 * Payments via Lemon Squeezy (a "merchant of record" — it handles all
 * card processing, sales tax and VAT for you).
 *
 * How it works:
 *   - Buying  -> opens a Lemon Squeezy hosted checkout page.
 *   - Unlocking -> the customer gets a LICENSE KEY by email, types it in,
 *     and this script verifies it with the Lemon Squeezy license API.
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

/* Coin pack product IDs — these products grant coins when activated.
 * The number of coins is determined by the product ID. */
var COIN_PRODUCT_IDS = {
  /* Coin Pack S — 1200 coins */
  /* The product ID for coin packs needs to be filled from Lemon Squeezy dashboard.
   * For now, we match by checking: if a valid license key's product_id is NOT in
   * PRO_PRODUCT_IDS, it's treated as a coin pack. */
};

var COIN_VARIANTS = {
  /* replace with real variant IDs from your Lemon Squeezy dashboard */
};

/* Lemon Squeezy's public license-key endpoint (no API key needed). */
var VALIDATE_URL = 'https://api.lemonsqueezy.com/v1/licenses/validate';

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

/* Verify a license key. Resolves to one of:
 *   { ok:true,  kind:'pro', days:N }   N=0 means lifetime; N>0 = subscription days
 *   { ok:true,  kind:'coins', coins:N }
 *   { ok:true,  kind:'unknown' }
 *   { ok:false }                       (invalid / not found / expired / inactive)
 *   { ok:false, error:'network' }      (could not reach server)
 */
function validateLicense(key){
  /* Use the "activate" endpoint which also increments the activation count.
   * This is needed because LemonSqueezy license keys have a limited number
   * of activations. Using just "validate" may fail after the first activation. */
  var ACTIVATE_URL = 'https://api.lemonsqueezy.com/v1/licenses/activate';
  return fetch(ACTIVATE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: 'license_key=' + encodeURIComponent(key)
  })
  .then(function(r){ return r.json(); })
  .then(function(d){
    if(!d || d.activated !== true) {
      /* Check if activation limit was reached — the key is valid but maxed out.
       * In this case, the license IS valid, it just can't be activated on more devices. */
      if(d && d.error === 'activation_limit_reached'){
        /* Key is valid but hit activation limit — still treat as valid since the user purchased it */
        var meta = d.meta || {};
        var licenseKey = d.license_key || {};
        var productId = licenseKey.product_id || meta.product_id || 0;
        var status = licenseKey.status || '';
        if(status === 'expired' || status === 'disabled') return { ok:false };
        /* Determine what this key unlocks */
        if(PRO_PRODUCT_IDS.length && PRO_PRODUCT_IDS.indexOf(productId) >= 0){
          var days = PLAN_DURATION_DAYS[productId];
          if(typeof days === 'undefined') days = 0;
          return { ok:true, kind:'pro', days: days };
        }
        var coins = COIN_VARIANTS[meta.variant_id];
        if(coins) return { ok:true, kind:'coins', coins:coins };
        /* If not Pro, treat as coins with default amount */
        return { ok:true, kind:'coins', coins:1200 };
      }
      /* Try validate as fallback */
      return fetch(VALIDATE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: 'license_key=' + encodeURIComponent(key)
      }).then(function(r2){ return r2.json(); }).then(function(d2){
        if(!d2 || d2.valid !== true) return { ok:false, error: d2 && d2.error || 'invalid' };
        var meta2 = d2.meta || {};
        var status2 = d2.license_key && d2.license_key.status || d2.status || '';
        if(status2 === 'expired' || status2 === 'inactive' || status2 === 'disabled') return { ok:false };
        var productId2 = (d2.license_key && d2.license_key.product_id) || meta2.product_id || 0;
        if(PRO_PRODUCT_IDS.length && PRO_PRODUCT_IDS.indexOf(productId2) >= 0){
          var days2 = PLAN_DURATION_DAYS[productId2];
          if(typeof days2 === 'undefined') days2 = 0;
          return { ok:true, kind:'pro', days: days2 };
        }
        var coins2 = COIN_VARIANTS[meta2.variant_id];
        if(coins2) return { ok:true, kind:'coins', coins:coins2 };
        return { ok:true, kind:'coins', coins:1200 };
      });
    }
    var meta = d.meta || {};
    var status = d.license_key && d.license_key.status || d.status || '';
    /* Reject expired / inactive licenses */
    if(status === 'expired' || status === 'inactive' || status === 'disabled') return { ok:false };
    /* coin pack? — first check variant ID, then product ID mapping */
    var coins = COIN_VARIANTS[meta.variant_id];
    if(coins) return { ok:true, kind:'coins', coins:coins };
    /* Pro? — check against known Pro product IDs */
    if(PRO_PRODUCT_IDS.length){
      if(PRO_PRODUCT_IDS.indexOf(meta.product_id) >= 0){
        var days = PLAN_DURATION_DAYS[meta.product_id];
        if(typeof days === 'undefined') days = 0;
        return { ok:true, kind:'pro', days: days };
      }
      /* Valid license but NOT a Pro product — treat as coin pack.
       * Default coin amounts by product ID pattern or 1200 as fallback. */
      var defaultCoins = 1200;
      /* Try to determine coins from the product — check if there's a store_products mapping */
      var coinProductMap = {
        /* Add your coin pack product IDs here from Lemon Squeezy dashboard.
         * Key = product_id, Value = number of coins */
      };
      if(coinProductMap[meta.product_id]){
        defaultCoins = coinProductMap[meta.product_id];
      }
      return { ok:true, kind:'coins', coins:defaultCoins };
    }
    /* PRO_PRODUCT_IDS not set — treat any valid non-coin key as Pro */
    return { ok:true, kind:'pro', days: 0 };
  })
  .catch(function(){ return { ok:false, error:'network' }; });
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
