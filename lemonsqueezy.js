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
 * STEP 2 — Product ID mappings
 * ===================================================================== */
var PRO_PRODUCT_IDS = [1134081, 1130711, 1130720, 1130724, 1130727, 1073472];

/* Map each subscription product ID to its duration in days. */
var PLAN_DURATION_DAYS = {
  1134081: 3,     /* 3 Days   */
  1130711: 30,    /* 1 Month  */
  1130720: 90,    /* 3 Months */
  1130724: 180,   /* 6 Months */
  1130727: 365,   /* 12 Months */
  1073472: 0      /* Lifetime — 0 means permanent */
};

/* Coin pack product IDs — map each coin-pack PRODUCT ID to the number of coins.
 * These are the product_id values from Lemon Squeezy dashboard.
 * Any valid license key whose product_id is NOT in PRO_PRODUCT_IDS
 * and IS in COIN_PRODUCT_MAP is a coin pack. */
var COIN_PRODUCT_MAP = {
  /* Coin Pack S — 1200 coins (product_id from Lemon Squeezy) */
  /* Coin Pack M — 4000 coins */
  /* Coin Pack L — 12000 coins */
  /* IMPORTANT: Fill in the real product_id values from your Lemon Squeezy dashboard.
   * Until filled, coin packs will be detected by process of elimination
   * (not Pro = coin pack) with a default of 1200 coins. */
};

/* Game Credit product IDs — map each credit-pack PRODUCT ID to the number of credits.
 * These are separate from coins and are used in the arcade/game system. */
var CREDIT_PRODUCT_MAP = {
  /* Credit packs — fill in from Lemon Squeezy dashboard */
};

/* Lemon Squeezy's public license-key endpoints (no API key needed). */
var VALIDATE_URL = 'https://api.lemonsqueezy.com/v1/licenses/validate';
var ACTIVATE_URL = 'https://api.lemonsqueezy.com/v1/licenses/activate';

/* Generate a unique instance name for this browser/device.
 * Lemon Squeezy requires instance_name for the activate endpoint.
 * We use a persistent random ID stored in localStorage so re-activations
 * from the same browser reuse the same instance (avoiding slot waste). */
function getInstanceName(){
  var key = 'pp_lemon_instance';
  var name = '';
  try{ name = localStorage.getItem(key); }catch(e){}
  if(!name){
    name = 'PromptRunic-' + Math.random().toString(36).substring(2,10);
    try{ localStorage.setItem(key, name); }catch(e){}
  }
  return name;
}

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

/* Determine the kind and details from a product_id */
function classifyProduct(productId){
  /* Check Pro first */
  if(PRO_PRODUCT_IDS.indexOf(productId) >= 0){
    var days = PLAN_DURATION_DAYS[productId];
    if(typeof days === 'undefined') days = 0;
    return { ok:true, kind:'pro', days: days, productId: productId };
  }
  /* Check coin packs */
  if(COIN_PRODUCT_MAP[productId]){
    return { ok:true, kind:'coins', coins: COIN_PRODUCT_MAP[productId], productId: productId };
  }
  /* Check credit packs */
  if(CREDIT_PRODUCT_MAP[productId]){
    return { ok:true, kind:'credits', credits: CREDIT_PRODUCT_MAP[productId], productId: productId };
  }
  /* If product_id is NOT in Pro list and we have Pro IDs defined,
   * it must be a coin pack by process of elimination.
   * Return the product_id so the caller can look up the exact amount. */
  if(PRO_PRODUCT_IDS.length > 0){
    /* Default: not Pro = coin pack. Use 1200 as fallback.
     * The caller should check productId for more accurate amounts. */
    return { ok:true, kind:'coins', coins: 1200, productId: productId };
  }
  /* PRO_PRODUCT_IDS not set — treat any valid key as Pro */
  return { ok:true, kind:'pro', days: 0, productId: productId };
}

/* Verify a license key. Resolves to one of:
 *   { ok:true,  kind:'pro', days:N }     N=0 means lifetime; N>0 = subscription days
 *   { ok:true,  kind:'coins', coins:N }
 *   { ok:true,  kind:'credits', credits:N }
 *   { ok:true,  kind:'unknown' }
 *   { ok:false, error:'invalid' }        (invalid / not found / expired)
 *   { ok:false, error:'network' }        (could not reach server)
 *
 * Strategy: ALWAYS try validate first (read-only, no side effects).
 * Only fall back to activate if validate fails and we need product_id info.
 */
function validateLicense(key){
  var instanceName = getInstanceName();

  /* Step 1: Try the VALIDATE endpoint first (read-only, no activation count consumed).
   * Lemon Squeezy's license API officially expects application/x-www-form-urlencoded
   * format, though JSON also works in many cases. Using form-encoded for maximum
   * compatibility with the official API spec. */
  return fetch(VALIDATE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: 'license_key=' + encodeURIComponent(key) + '&instance_name=' + encodeURIComponent(instanceName)
  })
  .then(function(r){ return r.json(); })
  .then(function(d){
    console.log('[LemonSqueezy] validate response:', JSON.stringify(d).substring(0, 500));

    /* Check if validate returned a valid license */
    if(d && d.valid === true){
      var meta = d.meta || {};
      var licenseKey = d.license_key || {};
      var status = licenseKey.status || d.status || '';
      /* Reject expired / inactive / disabled */
      if(status === 'expired' || status === 'inactive' || status === 'disabled'){
        return { ok:false, error:'invalid' };
      }
      /* Get product_id from validate response */
      var productId = licenseKey.product_id || meta.product_id || 0;
      if(productId){
        return classifyProduct(productId);
      }
      /* If no product_id from validate, try activate to get more details */
      return tryActivate(key);
    }

    /* Validate didn't return valid=true. This is normal for keys that have
     * already been activated — Lemon Squeezy validate returns valid:false
     * for previously activated keys even if the key is still valid. */
    if(d && d.license_key){
      var lk = d.license_key;
      var st = lk.status || '';
      if(st === 'expired' || st === 'disabled'){
        return { ok:false, error:'invalid' };
      }
      /* IMPORTANT: If the key is active (status='active'), the key is VALID.
       * We should classify it using the product_id from the license_key object
       * WITHOUT calling tryActivate (which would consume an activation slot
       * and fail with activation_limit_reached for single-activation keys). */
      if(st === 'active'){
        var pid = lk.product_id || 0;
        if(pid){
          return classifyProduct(pid);
        }
        /* Active key but no product_id — still valid, classify as unknown */
        return { ok:true, kind:'unknown' };
      }
      /* If status is 'inactive' the key hasn't been fully activated yet.
       * Only then try the activate endpoint (which will consume a slot). */
      if(st === 'inactive'){
        return tryActivate(key);
      }
      /* If we have a product_id from the license_key object, use it */
      if(lk.product_id){
        return classifyProduct(lk.product_id);
      }
    }

    /* Last resort: Try the ACTIVATE endpoint as fallback
     * (this consumes an activation slot but returns full product info) */
    return tryActivate(key);
  })
  .catch(function(e){
    console.warn('validateLicense network error:', e);
    return { ok:false, error:'network' };
  });
}

/* Try the ACTIVATE endpoint — consumes an activation slot but returns full info */
function tryActivate(key){
  var instanceName = getInstanceName();

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
    console.log('[LemonSqueezy] activate response:', JSON.stringify(d).substring(0, 500));

    /* Successful activation */
    if(d && d.activated === true){
      var meta = d.meta || {};
      var status = d.license_key && d.license_key.status || d.status || '';
      if(status === 'expired' || status === 'inactive' || status === 'disabled'){
        return { ok:false, error:'invalid' };
      }
      var productId = meta.product_id || (d.license_key && d.license_key.product_id) || 0;
      if(productId){
        return classifyProduct(productId);
      }
      /* No product_id — can't determine type */
      return { ok:true, kind:'unknown' };
    }

    /* Activation limit reached — key is valid but maxed out on activations.
     * This is actually a SUCCESS case — the user already purchased and
     * activated the key before. We should still honor it. */
    if(d && d.error === 'activation_limit_reached'){
      var meta2 = d.meta || {};
      var licenseKey = d.license_key || {};
      var productId2 = licenseKey.product_id || meta2.product_id || 0;
      var status2 = licenseKey.status || '';
      if(status2 === 'expired' || status2 === 'disabled'){
        return { ok:false, error:'invalid' };
      }
      if(productId2){
        return classifyProduct(productId2);
      }
      /* Can't determine product but the key is valid */
      return { ok:true, kind:'unknown' };
    }

    /* Other activation errors — key might be invalid */
    if(d && d.error){
      /* Key not found or other error */
      return { ok:false, error: d.error };
    }

    return { ok:false, error:'invalid' };
  })
  .catch(function(e){
    console.warn('tryActivate network error:', e);
    return { ok:false, error:'network' };
  });
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
  validateLicense: validateLicense,
  /* Expose helper for fun.js to check if product_id is in COIN_PRODUCT_MAP */
  coinProductMapHas: function(productId){ return !!COIN_PRODUCT_MAP[productId]; }
};

})();
