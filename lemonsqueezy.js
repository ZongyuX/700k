/* =====================================================================
 * PromptRunic — lemonsqueezy.js (完全修复版)
 * 支持所有测试环境和正式环境
 * ===================================================================== */
(function(){
'use strict';

/* =====================================================================
 * STEP 1 — 产品配置
 * ===================================================================== */

/* ---- Membership plans (正式环境) ---- */
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

var BUY_PRO = MEMBERSHIP_PLANS[5].url;

/* ---- Coin packs ---- */
var BUY_COINS = [
  'https://zongyu220.lemonsqueezy.com/checkout/buy/f6176e20-78bf-41ab-949f-fc1be1762cc1',   // Coin Pack S
  'https://zongyu220.lemonsqueezy.com/checkout/buy/fd3a7f2a-37ce-4999-896d-b20c74b6efb2',   // Coin Pack M
  'https://zongyu220.lemonsqueezy.com/checkout/buy/caac0990-1c3a-42ce-824a-f490e5d76150'    // Coin Pack L
];

/* =====================================================================
 * STEP 2 — Product ID 映射（完整版，同时支持测试和正式环境）
 * ===================================================================== */

/* 正式环境 Pro 产品 ID */
var PRO_PRODUCT_IDS_PROD = [1134081, 1130711, 1130720, 1130724, 1130727, 1073472];

/* 测试环境 Pro 产品 ID */
var PRO_PRODUCT_IDS_TEST = [1136122, 1136123, 1136124, 1136125, 1136126, 1136128];

/* 合并所有 Pro ID */
var PRO_PRODUCT_IDS = PRO_PRODUCT_IDS_PROD.concat(PRO_PRODUCT_IDS_TEST);

/* 正式环境 Pro 产品天数 */
var PLAN_DURATION_DAYS_PROD = {
  1134081: 3,     /* 3 Days */
  1130711: 30,    /* 1 Month */
  1130720: 90,    /* 3 Months */
  1130724: 180,   /* 6 Months */
  1130727: 365,   /* 12 Months */
  1073472: 0      /* Lifetime */
};

/* 测试环境 Pro 产品天数 */
var PLAN_DURATION_DAYS_TEST = {
  1136122: 30,    /* Pro 1 month 测试 */
  1136123: 365,   /* Pro 12 months 测试 */
  1136124: 3,     /* Pro 3 days 测试 */
  1136125: 90,    /* Pro 3 months 测试 */
  1136126: 180,   /* Pro 6 months 测试 */
  1136128: 0      /* Pro Permanently 测试 */
};

/* 合并天数映射 */
var PLAN_DURATION_DAYS = Object.assign({}, PLAN_DURATION_DAYS_PROD, PLAN_DURATION_DAYS_TEST);

/* 正式环境金币产品映射 */
var COIN_PRODUCT_MAP_PROD = {
  1086196: 1200,   /* Coin Pack S */
  1086203: 4000,   /* Coin Pack M */
  1086212: 12000   /* Coin Pack L */
};

/* 测试环境金币产品映射 */
var COIN_PRODUCT_MAP_TEST = {
  1136119: 1200,   /* Coin Pack S 测试 */
  1136118: 4000,   /* Coin Pack M 测试 */
  1136117: 12000   /* Coin Pack L 测试 */
};

/* 合并金币映射 */
var COIN_PRODUCT_MAP = Object.assign({}, COIN_PRODUCT_MAP_PROD, COIN_PRODUCT_MAP_TEST);

/* 游戏积分产品映射（正式环境）*/
var CREDIT_PRODUCT_MAP_PROD = {
  1091714: 1200,   /* Prompt Matrix Bundle 1200 Credits */
  1092744: 3800    /* Prompt Matrix Bundle 3800 Credits */
};

/* 游戏积分产品映射（测试环境）*/
var CREDIT_PRODUCT_MAP_TEST = {
  1136120: 1200,   /* Prompt Matrix Bundle 1200 credits 测试 */
  1136121: 3800    /* Prompt Matrix Bundle 3800 Credits 测试 */
};

/* 合并积分映射 */
var CREDIT_PRODUCT_MAP = Object.assign({}, CREDIT_PRODUCT_MAP_PROD, CREDIT_PRODUCT_MAP_TEST);

/* API 端点 */
var VALIDATE_URL = 'https://api.lemonsqueezy.com/v1/licenses/validate';
var ACTIVATE_URL = 'https://api.lemonsqueezy.com/v1/licenses/activate';

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

function openUrl(u){
  if(!u){ console.warn('No URL provided'); return; }
  try{ window.open(u, '_blank', 'noopener'); }
  catch(e){ location.href = u; }
}

function configured(){ return true; }

/* 从产品名称推断类型（备用方案，当ID匹配失败时使用）*/
function classifyByProductName(productName, productId){
  if(!productName) return null;
  
  var nameLower = productName.toLowerCase();
  
  /* Pro 产品 */
  if(nameLower.indexOf('pro') >= 0){
    var days = 30;
    if(nameLower.indexOf('permanent') >= 0 || nameLower.indexOf('lifetime') >= 0){
      days = 0;
    } else if(nameLower.indexOf('3 day') >= 0){
      days = 3;
    } else if(nameLower.indexOf('1 month') >= 0){
      days = 30;
    } else if(nameLower.indexOf('3 month') >= 0){
      days = 90;
    } else if(nameLower.indexOf('6 month') >= 0){
      days = 180;
    } else if(nameLower.indexOf('12 month') >= 0 || nameLower.indexOf('1 year') >= 0){
      days = 365;
    }
    console.log('[LemonSqueezy] → Inferred Pro from name, days:', days === 0 ? 'Lifetime' : days);
    return { kind: 'pro', days: days };
  }
  
  /* 金币产品 */
  if(nameLower.indexOf('coin') >= 0){
    var match = nameLower.match(/(\d+)/);
    var coins = match ? parseInt(match[0], 10) : 0;
    if(coins === 1200 || coins === 4000 || coins === 12000){
      console.log('[LemonSqueezy] → Inferred Coins from name:', coins);
      // 同时返回 amount 和 coins
      return { kind: 'coins', amount: coins, coins: coins };
    }
    if(coins > 0){
      console.log('[LemonSqueezy] → Inferred Coins from name (fallback):', coins);
      return { kind: 'coins', amount: coins, coins: coins };
    }
  }
  
  /* 积分产品 */
  if(nameLower.indexOf('credit') >= 0 || nameLower.indexOf('bundle') >= 0){
    var match2 = nameLower.match(/(\d+)/);
    var credits = match2 ? parseInt(match2[0], 10) : 0;
    if(credits === 1200 || credits === 3800){
      console.log('[LemonSqueezy] → Inferred Credits from name:', credits);
      // 同时返回 credits 和 amount
      return { kind: 'credits', credits: credits, amount: credits };
    }
  }
  
  return null;
}

/* 根据 product_id 和 product_name 分类产品 */
function classifyProduct(productId, productName){
  console.log('[LemonSqueezy] Classifying product_id:', productId, 'name:', productName);
  
  /* 1. 先从 ID 映射检查 */
  
  /* 检查 Pro 产品 ID */
  if(PRO_PRODUCT_IDS.indexOf(productId) >= 0){
    var days = PLAN_DURATION_DAYS[productId];
    if(typeof days === 'undefined') days = 30;
    console.log('[LemonSqueezy] → Matched as Pro by ID, days:', days === 0 ? 'Lifetime' : days);
    return { ok: true, kind: 'pro', days: days, productId: productId };
  }
  
  /* 检查金币映射 */
  if(COIN_PRODUCT_MAP[productId]){
    var coins = COIN_PRODUCT_MAP[productId];
    console.log('[LemonSqueezy] → Matched as Coins by ID map, amount:', coins);
    // 同时返回 amount 和 coins 字段，确保两种都能被读取
    return { ok: true, kind: 'coins', amount: coins, coins: coins, productId: productId };
  }
  
  /* 检查积分映射 */
  if(CREDIT_PRODUCT_MAP[productId]){
    var credits = CREDIT_PRODUCT_MAP[productId];
    console.log('[LemonSqueezy] → Matched as Credits by ID map, amount:', credits);
    // 同时返回 credits 和 amount 字段
    return { ok: true, kind: 'credits', credits: credits, amount: credits, productId: productId };
  }
  
  /* 2. 从名称推断（备用）*/
  var nameResult = classifyByProductName(productName, productId);
  if(nameResult){
    return Object.assign({ ok: true, productId: productId }, nameResult);
  }
  
  /* 3. 未知类型 — 默认给 Pro 30天（重要：不是金币！）*/
  console.warn('[LemonSqueezy] → Unknown product, defaulting to 30-day Pro');
  return { ok: true, kind: 'pro', days: 30, productId: productId };
}

function validateLicense(key){
  console.log('[LemonSqueezy] Validating license key:', key.substring(0,8)+'...');
  
  return fetch(VALIDATE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: 'license_key=' + encodeURIComponent(key)
  })
  .then(function(r){ return r.json(); })
  .then(function(d){
    console.log('[LemonSqueezy] Validate response:', JSON.stringify(d, null, 2));
    
    if(!d || d.valid !== true){
      console.log('[LemonSqueezy] → Invalid key');
      return { ok: false, error: 'invalid' };
    }
    
    var licenseKey = d.license_key || {};
    var status = licenseKey.status || '';
    
    /* status: 'inactive' 是正常的未激活状态，不是错误 */
    if(status === 'expired'){
      console.log('[LemonSqueezy] → Key expired');
      return { ok: false, error: 'expired' };
    }
    if(status === 'disabled'){
      console.log('[LemonSqueezy] → Key disabled');
      return { ok: false, error: 'invalid' };
    }
    
    /* 获取 product_id 和 product_name */
    var productId = licenseKey.product_id || (d.meta && d.meta.product_id) || 0;
    var productName = (d.meta && d.meta.product_name) || '';
    console.log('[LemonSqueezy] → Product ID:', productId, 'Name:', productName);
    
    if(productId || productName){
      return classifyProduct(productId, productName);
    }
    
    console.log('[LemonSqueezy] → No product info found');
    return { ok: true, kind: 'unknown' };
  })
  .catch(function(err){
    console.error('[LemonSqueezy] Network error:', err);
    return { ok: false, error: 'network' };
  });
}

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
    console.log('[LemonSqueezy] Activate response:', JSON.stringify(d, null, 2));
    
    if(d && (d.activated || d.valid)){
      var licenseKey = d.license_key || {};
      var status = licenseKey.status || d.status || '';
      if(status === 'expired' || status === 'disabled') return { ok: false, error: 'invalid' };
      
      var productId = licenseKey.product_id || (d.meta && d.meta.product_id) || d.product_id || 0;
      var productName = (d.meta && d.meta.product_name) || '';
      if(productId || productName) return classifyProduct(productId, productName);
      return { ok: true, kind: 'unknown' };
    }
    
    if(d && d.error === 'activation_limit_reached'){
      var productId2 = (d.meta && d.meta.product_id) || d.product_id || 0;
      var productName2 = (d.meta && d.meta.product_name) || '';
      if(productId2 || productName2) return classifyProduct(productId2, productName2);
      return { ok: true, kind: 'unknown' };
    }
    
    return { ok: false, error: (d && d.error) || 'invalid' };
  })
  .catch(function(err){
    console.error('[LemonSqueezy] Activate network error:', err);
    return { ok: false, error: 'network' };
  });
}

/* 公开 API */
window.PPLemon = {
  configured: configured,
  buyPro: function(){ openUrl(BUY_PRO); },
  buyMembership: function(planId){
    var plan = MEMBERSHIP_PLANS.filter(function(p){ return p.id === planId; })[0];
    if(plan) openUrl(plan.url);
    else openUrl('');
  },
  getPlans: function(){ return MEMBERSHIP_PLANS; },
  buyCoins: function(index){
    if(index < 0 || index >= BUY_COINS.length){ openUrl(''); return; }
    openUrl(BUY_COINS[index]);
  },
  validateLicense: validateLicense,
  tryActivate: tryActivate,
  coinProductMapHas: function(productId){ return !!COIN_PRODUCT_MAP[productId]; },
  getProductMaps: function(){
    return { pro: PRO_PRODUCT_IDS, coins: COIN_PRODUCT_MAP, credits: CREDIT_PRODUCT_MAP };
  }
};

console.log('[LemonSqueezy] Initialized with product maps:', {
  pro_count: PRO_PRODUCT_IDS.length,
  coins: COIN_PRODUCT_MAP,
  credits: CREDIT_PRODUCT_MAP
});

})();
