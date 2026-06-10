/* =====================================================================
 * PromptRunic — i18n.js  (Internationalization Engine)
 * Supports English / Chinese / Spanish trilingual switching.
 * Loads BEFORE main.js so all UI text can be resolved.
 * Author: i18n module for PromptRunic
 * ===================================================================== */
(function(){
'use strict';

/* ---- Language preference ---- */
var STORAGE_KEY = 'pp_lang';
var SUPPORTED  = ['en','zh','es'];
var DEFAULT    = 'en';

/* Language display info for the switcher */
var LANG_INFO = {
  en: { icon: 'EN',  label: 'English',  locale: 'en-US' },
  zh: { icon: '中',  label: '中文',     locale: 'zh-CN' },
  es: { icon: 'ES',  label: 'Español',  locale: 'es-ES' }
};

function detectLang(){
  /* 1. User's explicit choice (only use saved preference, never auto-detect from browser) */
  var saved = null;
  try{ saved = localStorage.getItem(STORAGE_KEY); }catch(e){}
  if(saved && SUPPORTED.indexOf(saved)>=0) return saved;
  /* 2. Default to English — user must explicitly switch language */
  return DEFAULT;
}

var _lang = detectLang();

function getLang(){ return _lang; }
function setLang(lang){
  if(SUPPORTED.indexOf(lang)<0) return;
  _lang = lang;
  try{ localStorage.setItem(STORAGE_KEY, lang); }catch(e){}
}
function isZh(){ return _lang === 'zh'; }
function isEn(){ return _lang === 'en'; }
function isEs(){ return _lang === 'es'; }

/* ---- Translation dictionaries (populated by lang-en.js / lang-zh.js / lang-es.js) ---- */
var _dicts = {};   /* { en: { key: value }, zh: { key: value }, es: { key: value } } */

function registerDict(lang, dict){
  _dicts[lang] = dict;
}

/* ---- Core translate function ---- */
function t(key, fallback){
  var d = _dicts[_lang] || {};
  if(d.hasOwnProperty(key)) return d[key];
  /* Fallback chain: try English */
  if(_lang !== 'en' && _dicts['en'] && _dicts['en'][key]) return _dicts['en'][key];
  /* Final fallback: the key itself or provided fallback */
  return fallback || key;
}

/* ---- Translate an element and its children ---- */
function translateDOM(root){
  root = root || document;
  /* Elements with data-i18n attribute */
  var els = root.querySelectorAll('[data-i18n]');
  for(var i=0; i<els.length; i++){
    var el = els[i];
    var key = el.getAttribute('data-i18n');
    if(!key) continue;
    var val = t(key);
    if(val && val !== key){
      /* data-i18n-attr specifies which attribute to set (default: textContent) */
      var attr = el.getAttribute('data-i18n-attr');
      if(attr === 'placeholder') el.placeholder = val;
      else if(attr === 'title') el.title = val;
      else if(attr === 'href') el.href = val;
      else if(attr === 'html') el.innerHTML = val;
      else el.textContent = val;
    }
  }
  /* Update document language attribute */
  document.documentElement.lang = _lang;
}

/* ---- Apply language to the full page ---- */
function applyLang(lang){
  if(lang) setLang(lang);
  translateDOM(document);
  /* Dispatch a custom event so other scripts can react */
  var evt;
  try{ evt = new CustomEvent('pp:langchange', {detail:{lang:getLang()}}); }
  catch(e){ evt = document.createEvent('Event'); evt.initEvent('pp:langchange',true,true); evt.detail={lang:getLang()}; }
  document.dispatchEvent(evt);
}

/* ---- Build the language switcher (3-language cycle: en → zh → es → en) ---- */
function buildSwitcher(){
  var bar = document.querySelector('.hbtns');
  if(!bar) return;
  /* Create a dropdown-style language switcher */
  var wrapper = document.createElement('div');
  wrapper.className = 'lang-switch-wrapper';
  wrapper.id = 'langSwitchWrapper';

  /* Current language button */
  var btn = document.createElement('button');
  btn.id = 'langSwitch';
  btn.className = 'lang-switch-btn';
  btn.title = 'Switch language / 切换语言 / Cambiar idioma';
  updateSwitcherLabel(btn);
  btn.addEventListener('click', function(e){
    e.stopPropagation();
    var dropdown = document.getElementById('langDropdown');
    if(dropdown) {
      dropdown.classList.toggle('show');
    }
  });

  /* Dropdown menu */
  var dropdown = document.createElement('div');
  dropdown.id = 'langDropdown';
  dropdown.className = 'lang-dropdown';

  SUPPORTED.forEach(function(lang){
    var info = LANG_INFO[lang];
    var opt = document.createElement('button');
    opt.className = 'lang-option' + (lang === _lang ? ' active' : '');
    opt.setAttribute('data-lang', lang);
    opt.innerHTML = '<span class="lang-opt-icon">' + info.icon + '</span><span class="lang-opt-label">' + info.label + '</span>';
    opt.addEventListener('click', function(){
      if(lang !== _lang){
        applyLang(lang);
        updateSwitcherLabel(null);
        /* Update active state */
        var opts = dropdown.querySelectorAll('.lang-option');
        for(var i=0;i<opts.length;i++) opts[i].className = 'lang-option' + (opts[i].getAttribute('data-lang')===lang?' active':'');
        /* Refresh dynamic content */
        if(typeof window._ppI18nRefresh === 'function') window._ppI18nRefresh();
      }
      dropdown.classList.remove('show');
    });
    dropdown.appendChild(opt);
  });

  /* Close dropdown when clicking outside */
  document.addEventListener('click', function(){
    var dd = document.getElementById('langDropdown');
    if(dd) dd.classList.remove('show');
  });

  wrapper.appendChild(btn);
  wrapper.appendChild(dropdown);
  /* Insert as the FIRST item in the header buttons bar (top-right position) */
  if(bar.firstChild) bar.insertBefore(wrapper, bar.firstChild);
  else bar.appendChild(wrapper);
}

function updateSwitcherLabel(btn){
  if(!btn) btn = document.getElementById('langSwitch');
  if(!btn) return;
  var info = LANG_INFO[_lang] || LANG_INFO['en'];
  /* Show the next language as a hint (cycle through) */
  var nextIdx = (SUPPORTED.indexOf(_lang) + 1) % SUPPORTED.length;
  var nextInfo = LANG_INFO[SUPPORTED[nextIdx]];
  btn.innerHTML = '<span class="lang-icon">' + info.icon + '</span><span class="lang-text">' + info.label + '</span><span class="lang-arrow">▾</span>';
}

/* ---- Format number based on language ---- */
function fmtLocal(n){
  var info = LANG_INFO[_lang] || LANG_INFO['en'];
  return Number(n).toLocaleString(info.locale);
}

/* ---- Public API ---- */
window.PPI18n = {
  t: t,
  getLang: getLang,
  setLang: setLang,
  isZh: isZh,
  isEn: isEn,
  isEs: isEs,
  applyLang: applyLang,
  translateDOM: translateDOM,
  registerDict: registerDict,
  buildSwitcher: buildSwitcher,
  fmtLocal: fmtLocal,
  SUPPORTED: SUPPORTED,
  LANG_INFO: LANG_INFO
};

})();
