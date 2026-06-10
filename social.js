/* =====================================================================
 * PromptRunic — social.js
 * Level leaderboard · Coin leaderboard · Mood Wall · public profiles.
 * Reads & writes Firestore:  pp_public/{uid}   pp_moods/{uid_pid}
 * Author: Zongyu Xie <zongyufred@gmail.com>
 * Copyright (c) 2026 Zongyu Xie. All rights reserved.
 *
 * Load AFTER fun.js:  <script src="social.js"></script>
 * Needs Firestore enabled + the security rules in FIRESTORE-RULES.md.
 * Degrades gracefully (shows a friendly notice) if Firestore is off.
 * ===================================================================== */
(function(){
'use strict';
var D = document;

/* ---------------------------------------------------------------- styles */
var CSS = ''
+'.sc-tabs{display:flex;gap:6px;margin:4px 0 12px}'
+'.sc-tab{flex:1;padding:8px 6px;border-radius:9px;border:1px solid var(--border);'
+'background:var(--panel2);color:var(--muted);font-weight:700;font-size:12px;cursor:pointer}'
+'.sc-tab.on{border-color:var(--accent);color:var(--text);background:rgba(124,92,255,.16)}'
+'.sc-cap{font-size:11.5px;font-weight:700;color:var(--muted);margin:4px 0 8px}'
+'.sc-load,.sc-empty{font-size:12.5px;color:var(--muted);text-align:center;padding:22px 12px;line-height:1.6}'
+'.sc-empty code{background:var(--panel3);padding:1px 5px;border-radius:5px;font-size:11px}'
+'.sc-list{display:flex;flex-direction:column;gap:6px}'
+'.sc-row{display:flex;align-items:center;gap:10px;background:var(--panel2);border:1px solid var(--border);'
+'border-radius:10px;padding:8px 10px;cursor:pointer;transition:.12s}'
+'.sc-row:hover{border-color:var(--accent)}'
+'.sc-row.me{border-color:var(--accent2);box-shadow:inset 0 0 0 1px var(--accent2)}'
+'.sc-rank{width:26px;text-align:center;font-weight:800;font-size:14px;flex-shrink:0}'
+'.sc-av{width:38px;height:38px;border-radius:9px;overflow:hidden;flex-shrink:0;border:1px solid var(--border)}'
+'.sc-av svg{width:100%;height:100%;display:block}'
+'.sc-name{flex:1;min-width:0}'
+'.sc-name b{display:block;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
+'.sc-name span{font-size:10.5px;color:var(--muted)}'
+'.sc-val{font-weight:800;font-size:13px;flex-shrink:0}'
+'.sc-back{background:none;border:none;color:var(--accent2);font-weight:700;font-size:12.5px;'
+'cursor:pointer;padding:4px 0;margin-bottom:6px}'
+'.sc-prof{text-align:center;padding:6px 0 2px}'
+'.sc-prof-av{width:74px;height:74px;border-radius:17px;overflow:hidden;margin:0 auto 8px;border:1px solid var(--border)}'
+'.sc-prof-av svg{width:100%;height:100%;display:block}'
+'.sc-prof-nm{font-size:17px;font-weight:800}'
+'.sc-prof-ti{font-size:12px;color:var(--muted);margin-top:3px}'
+'.mw-list{display:flex;flex-direction:column;gap:6px}'
+'.mw-row{display:flex;align-items:center;gap:10px;background:var(--panel2);border:1px solid var(--border);'
+'border-radius:10px;padding:8px 10px;cursor:pointer;transition:.12s}'
+'.mw-row:hover{border-color:var(--accent)}'
+'.mw-txt{flex:1;min-width:0;font-size:12px;line-height:1.45}'
+'.mw-txt b{font-size:12.5px}'
+'.mw-emo{font-size:16px;vertical-align:-2px}'
+'.mw-on{color:var(--muted);font-size:11px}'
+'.mw-ago{font-size:10.5px;color:var(--muted);flex-shrink:0;white-space:nowrap}'
+'.mo-grid{display:flex;flex-wrap:wrap;gap:5px;margin-top:2px}'
+'.mo-chip{display:flex;align-items:center;gap:4px;background:var(--panel);border:1px solid var(--border);'
+'border-radius:14px;padding:3px 9px 3px 6px;font-size:11px}'
+'.mo-e{font-size:15px}';
(function(){ var s=D.createElement('style'); s.textContent=CSS; D.head.appendChild(s); })();

/* ---------------------------------------------------------------- helpers */
function elById(id){ return D.getElementById(id); }
function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){
  return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function fb(){
  try{ return (typeof firebase!=='undefined' && firebase.apps && firebase.apps.length) ? firebase : null; }
  catch(e){ return null; }
}
function db(){ var f=fb(); try{ return f?f.firestore():null; }catch(e){ return null; } }
function me(){ var f=fb(); try{ return f ? f.auth().currentUser : null; }catch(e){ return null; } }
function av(i){
  try{ if(window.PPGame && PPGame.avatarSVG) return PPGame.avatarSVG(i||0); }catch(e){}
  return '';
}
function rankOf(l){
  try{ if(window.PPGame && PPGame.rankOf) return PPGame.rankOf(l||1); }catch(e){}
  return { name:'Bronze', color:'#cd7f32' };
}
function titleOf(l){
  try{ if(window.PPGame && PPGame.levelTitle) return PPGame.levelTitle(l||1); }catch(e){}
  return 'Newcomer';
}
function gameState(){
  try{ if(window.PPGame && PPGame.exportState) return PPGame.exportState(); }catch(e){}
  return {};
}
function timeAgo(ts){
  var d;
  try{ d = ts && ts.toDate ? ts.toDate() : (ts instanceof Date ? ts : null); }catch(e){ d=null; }
  if(!d) return '';
  var s = Math.floor((Date.now()-d.getTime())/1000);
  var zh = PPI18n.isZh();
  if(s<60) return zh ? '刚刚' : 'just now';
  if(s<3600) return zh ? Math.floor(s/60)+'分钟前' : Math.floor(s/60)+'m ago';
  if(s<86400) return zh ? Math.floor(s/3600)+'小时前' : Math.floor(s/3600)+'h ago';
  if(s<604800) return zh ? Math.floor(s/86400)+'天前' : Math.floor(s/86400)+'d ago';
  return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);
}
function myName(){
  var u = me();
  if(u){
    if(u.displayName) return u.displayName;
    if(u.email) return u.email.split('@')[0];
    return 'Member';
  }
  return '';
}

/* ------------------------------------------------------ public profile sync */
function syncProfile(){
  var u = me(), database = db();
  if(!u || !database) return;
  var g = gameState();
  database.collection('pp_public').doc(u.uid).set({
    name:    myName(),
    avatar:  g.avatar||0,
    lvl:     g.lvl||1,
    xp:      g.xp||0,
    coins:   g.coins||0,
    best:    g.best||0,
    achN:    (g.ach && g.ach.length) || 0,
    gameScore: g.gameScore || 0,
    gameTime:  g.gameTime  || 0,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }, {merge:true}).catch(function(){});
}
var syncT = null;
function syncSoon(){ clearTimeout(syncT); syncT = setTimeout(syncProfile, 1500); }

/* chain into fun.js's save() notifier without clobbering index.html's */
var prevGameChanged = window.ppGameChanged;
window.ppGameChanged = function(){
  try{ if(typeof prevGameChanged==='function') prevGameChanged(); }catch(e){}
  syncSoon();
};

/* ------------------------------------------------------ moods -> Firestore */
function promptName(pid){
  var P = window.PROMPTS_DATA || [];
  for(var i=0;i<P.length;i++){ if(P[i].id===pid) return P[i].title || 'a prompt'; }
  return 'a prompt';
}
function onMood(pid, em){
  var u = me(), database = db();
  if(!u || !database) return;
  var ref = database.collection('pp_moods').doc(u.uid + '_' + pid);
  if(!em){ ref.delete().catch(function(){}); return; }
  var g = gameState();
  ref.set({
    pid:    pid,
    pname:  promptName(pid),
    emoji:  em,
    uid:    u.uid,
    name:   myName(),
    avatar: g.avatar||0,
    at:     firebase.firestore.FieldValue.serverTimestamp()
  }).catch(function(){});
}

/* ------------------------------------------------- "how others felt" panel */
function showPromptMoods(id){
  var database = db();
  var row  = elById('ppMoodRow');
  var host = row && row.parentNode;
  if(!host){
    var fields = elById('pmFields');
    host = fields && fields.parentNode;
  }
  if(!host) return;
  var box = elById('ppMoodOthers');
  if(!box){
    box = D.createElement('div'); box.id='ppMoodOthers'; box.className='ppmood';
    if(row && row.nextSibling) host.insertBefore(box, row.nextSibling);
    else host.appendChild(box);
  }
  function head(t){ return '<div class="ppmood-h">'+PPI18n.t('community.mood.others')+'</div>'
    + '<div style="font-size:11.5px;color:var(--muted)">'+t+'</div>'; }
  if(!database){
    box.innerHTML = head(PPI18n.t('community.mood.signin'));
    return;
  }
  box.innerHTML = head(PPI18n.t('community.loading'));
  database.collection('pp_moods').where('pid','==',id).limit(40).get()
    .then(function(qs){
      var mine = me() && me().uid, arr = [];
      qs.forEach(function(d){ var x=d.data()||{}; if(x.uid!==mine) arr.push(x); });
      if(!arr.length){
        box.innerHTML = head(PPI18n.t('community.mood.nobody'));
        return;
      }
      var _m = PPI18n.t('community.member');
      var h = '<div class="ppmood-h">'+PPI18n.t('community.mood.others.count').replace('{n}',arr.length)+'</div><div class="mo-grid">';
      arr.forEach(function(x){
        h += '<div class="mo-chip" title="'+esc(x.name||_m)+'">'
           + '<span class="mo-e">'+esc(x.emoji||'')+'</span>'+esc(x.name||_m)+'</div>';
      });
      h += '</div>';
      box.innerHTML = h;
    })
    .catch(function(){ box.innerHTML = head(PPI18n.t('community.mood.couldnotload')); });
}
(function(){
  var orig = window.openPrompt;
  if(typeof orig==='function'){
    window.openPrompt = function(id){
      orig(id);
      try{ showPromptMoods(id); }catch(e){}
    };
  }
})();

/* ---------------------------------------------------------- community modal */
var comBtn, comPanel, comTab='lvl', lastRows=[];
function buildComBtn(){
  var existing = D.getElementById('communityBtn');
  if(existing){
    comBtn = existing;
    comBtn.addEventListener('click', openCommunity);
    return;
  }
  var bar = D.querySelector('.hbtns');
  if(!bar) return;
  comBtn = D.createElement('button');
  comBtn.className = 'pp-chip';
  comBtn.id = 'communityBtn';
  comBtn.title = 'Leaderboards & Mood Wall';
  comBtn.setAttribute('data-i18n','header.community');
  comBtn.innerHTML = '🏆 Community';
  comBtn.addEventListener('click', openCommunity);
  bar.insertBefore(comBtn, bar.firstChild);
}

/* Tab translation key map */
var TAB_KEYS = {
  lvl:  'community.tab.level',
  coin: 'community.tab.coins',
  game: 'community.tab.games',
  time: 'community.tab.speed',
  mood: 'community.tab.mood'
};

function openCommunity(){
  if(!comPanel){
    comPanel = D.createElement('div');
    comPanel.className = 'overlay'; comPanel.id = 'ppCommunity';
    comPanel.innerHTML = '<div class="modal sm"><button class="x" id="ppComX">&times;</button>'
      + '<h2 id="ppComH2"></h2>'
      + '<div class="desc" id="ppComDesc"></div>'
      + '<div class="sc-tabs">'
      + '<button class="sc-tab on" data-t="lvl"></button>'
      + '<button class="sc-tab" data-t="coin"></button>'
      + '<button class="sc-tab" data-t="game"></button>'
      + '<button class="sc-tab" data-t="time"></button>'
      + '<button class="sc-tab" data-t="mood"></button></div>'
      + '<div id="ppComBody"></div></div>';
    D.body.appendChild(comPanel);
    elById('ppComX').addEventListener('click', function(){ comPanel.classList.remove('show'); });
    comPanel.addEventListener('click', function(e){ if(e.target===comPanel) comPanel.classList.remove('show'); });
    Array.prototype.forEach.call(comPanel.querySelectorAll('[data-t]'), function(t){
      t.addEventListener('click', function(){
        comTab = t.getAttribute('data-t');
        Array.prototype.forEach.call(comPanel.querySelectorAll('.sc-tab'),
          function(x){ x.classList.remove('on'); });
        t.classList.add('on');
        paintCommunity();
      });
    });
  }
  /* Update text for current language every time the modal opens */
  var h2 = elById('ppComH2');
  if(h2) h2.textContent = PPI18n.t('community.title');
  var desc = elById('ppComDesc');
  if(desc) desc.textContent = PPI18n.t('community.desc');
  Array.prototype.forEach.call(comPanel.querySelectorAll('[data-t]'), function(t){
    t.textContent = PPI18n.t(TAB_KEYS[t.getAttribute('data-t')]);
  });

  syncProfile();          /* push my latest stats before showing the board */
  paintCommunity();
  comPanel.classList.add('show');
}
function paintCommunity(){
  if(comTab==='mood') return paintMoodWall();
  return paintBoard(comTab);
}
function offline(body, what){
  body.innerHTML = '<div class="sc-empty">'+PPI18n.t('community.offline').replace('{what}',what)+'</div>';
}
function fmtTime(s){ s = s|0; if(s<=0) return '—'; var m=Math.floor(s/60), ss=s%60; return (m?m+'m ':'')+(m?(ss<10?'0':''):'')+ss+'s'; }
function paintBoard(kind){
  var body = elById('ppComBody');
  var field = kind==='coin' ? 'coins' : kind==='game' ? 'gameScore' : kind==='time' ? 'gameTime' : 'xp';
  body.innerHTML = '<div class="sc-load">'+PPI18n.t('community.loading')+'</div>';
  var demo = (window.PPDemo && PPDemo.users) ? PPDemo.users.slice() : [];
  function render(rows){
    rows = rows.slice();
    if(kind==='time'){
      rows = rows.filter(function(r){ return (r.gameTime||0) > 0; });
      rows.sort(function(a,b){ return (a.gameTime||9e9) - (b.gameTime||9e9); });
    } else {
      rows.sort(function(a,b){ return (b[field]||0) - (a[field]||0); });
    }
    rows = rows.slice(0,50);
    lastRows = rows;
    if(!rows.length){
      body.innerHTML = '<div class="sc-empty">'+PPI18n.t('community.empty')+'</div>';
      return;
    }
    var mine = me() && me().uid;
    var _m = PPI18n.t('community.member');
    var _y = PPI18n.t('community.you');
    var h = '<div class="sc-cap">'
      + (kind==='coin' ? PPI18n.t('community.top50.coins') : kind==='game' ? PPI18n.t('community.top50.games') : kind==='time' ? PPI18n.t('community.top50.speed') : PPI18n.t('community.top50.level'))
      + '</div><div class="sc-list">';
    rows.forEach(function(r,i){
      var n=i+1, l=r.lvl||1;
      var medal = n===1?'🥇':n===2?'🥈':n===3?'🥉':n;
      var val = kind==='coin' ? ('🪙 '+(r.coins||0)) : kind==='game' ? ('🎮 '+(r.gameScore||0)) : kind==='time' ? ('⏱️ '+fmtTime(r.gameTime)) : ('Lv '+l);
      h += '<div class="sc-row'+(r._uid===mine?' me':'')+'" data-uid="'+esc(r._uid)+'">'
        + '<div class="sc-rank">'+medal+'</div>'
        + '<div class="sc-av">'+av(r.avatar||0)+'</div>'
        + '<div class="sc-name"><b>'+esc(r.name||_m)+(r._uid===mine?' '+_y:'')+'</b>'
        + '<span>'+esc(titleOf(l))+'</span></div>'
        + '<div class="sc-val">'+val+'</div></div>';
    });
    h += '</div>';
    body.innerHTML = h;
    Array.prototype.forEach.call(body.querySelectorAll('[data-uid]'), function(row){
      row.addEventListener('click', function(){ showUser(row.getAttribute('data-uid')); });
    });
  }
  if(!db()){ render(demo); return; }
  db().collection('pp_public').orderBy(field,'desc').limit(50).get()
    .then(function(qs){
      var rows = [];
      qs.forEach(function(d){ var x=d.data()||{}; x._uid=d.id; rows.push(x); });
      render(rows.concat(demo));
    })
    .catch(function(){ render(demo); });
}
function showUser(uid){
  var r = null;
  for(var i=0;i<lastRows.length;i++){ if(lastRows[i]._uid===uid){ r=lastRows[i]; break; } }
  if(!r) return;
  var body = elById('ppComBody');
  var l = r.lvl||1, rk = rankOf(l);
  var _m = PPI18n.t('community.member');
  body.innerHTML = '<button class="sc-back" id="ppComBack">'+PPI18n.t('community.back')+'</button>'
    + '<div class="sc-prof"><div class="sc-prof-av">'+av(r.avatar||0)+'</div>'
    + '<div class="sc-prof-nm">'+esc(r.name||_m)+'</div>'
    + '<div class="sc-prof-ti">'+esc(titleOf(l))
    + ' <span class="rankpill" style="border-color:'+rk.color+';color:'+rk.color+'">'+esc(rk.name)+'</span>'
    + '</div></div>'
    + '<div class="statpills">'
    + '<div class="statpill"><b>'+l+'</b><span>'+PPI18n.t('community.level')+'</span></div>'
    + '<div class="statpill"><b>'+(r.xp||0)+'</b><span>'+PPI18n.t('community.totalxp')+'</span></div>'
    + '<div class="statpill"><b>🪙 '+(r.coins||0)+'</b><span>'+PPI18n.t('community.coins')+'</span></div></div>'
    + '<div class="statpills">'
    + '<div class="statpill"><b>'+(r.achN||0)+'</b><span>'+PPI18n.t('community.achievements')+'</span></div>'
    + '<div class="statpill"><b>🔥 '+(r.best||0)+'</b><span>'+PPI18n.t('community.beststreak')+'</span></div>'
    + '<div class="statpill"><b>🎮 '+(r.gameScore||0)+'</b><span>'+PPI18n.t('community.matrixbest')+'</span></div>'
    + '<div class="statpill"><b>⏱️ '+fmtTime(r.gameTime||0)+'</b><span>'+PPI18n.t('community.fastestclear')+'</span></div></div>';
  elById('ppComBack').addEventListener('click', function(){ paintCommunity(); });
}
function paintMoodWall(){
  var body = elById('ppComBody');
  body.innerHTML = '<div class="sc-load">'+PPI18n.t('community.moodwall.loading')+'</div>';
  var demo = (window.PPDemo && PPDemo.moods) ? PPDemo.moods() : [];
  function render(rows){
    rows = rows.slice();
    rows.sort(function(a,b){
      var ta = (a.at && a.at.toDate) ? a.at.toDate().getTime() : 0;
      var tb = (b.at && b.at.toDate) ? b.at.toDate().getTime() : 0;
      return tb - ta;
    });
    rows = rows.slice(0,40);
    if(!rows.length){
      body.innerHTML = '<div class="sc-empty">'+PPI18n.t('community.moodwall.empty')+'</div>';
      return;
    }
    var _m = PPI18n.t('community.member');
    var _felt = PPI18n.t('community.felt');
    var _on = PPI18n.t('community.on');
    var h = '<div class="sc-cap">'+PPI18n.t('community.moodwall.recent')+'</div><div class="mw-list">';
    rows.forEach(function(r){
      h += '<div class="mw-row" data-pid="'+esc(r.pid)+'">'
        + '<div class="sc-av">'+av(r.avatar||0)+'</div>'
        + '<div class="mw-txt"><b>'+esc(r.name||_m)+'</b> '+_felt+' '
        + '<span class="mw-emo">'+esc(r.emoji||'')+'</span><br>'
        + '<span class="mw-on">'+_on+' &ldquo;'+esc(r.pname||'a prompt')+'&rdquo;</span></div>'
        + '<div class="mw-ago">'+esc(timeAgo(r.at))+'</div></div>';
    });
    h += '</div>';
    body.innerHTML = h;
    Array.prototype.forEach.call(body.querySelectorAll('[data-pid]'), function(row){
      row.addEventListener('click', function(){
        var pid = parseInt(row.getAttribute('data-pid'),10);
        if(pid && typeof window.openPrompt==='function'){
          comPanel.classList.remove('show');
          window.openPrompt(pid);
        }
      });
    });
  }
  if(!db()){ render(demo); return; }
  db().collection('pp_moods').orderBy('at','desc').limit(40).get()
    .then(function(qs){
      var rows = [];
      qs.forEach(function(d){ rows.push(d.data()||{}); });
      render(rows.concat(demo));
    })
    .catch(function(){ render(demo); });
}

/* ------------------------------------------------------------------- public */
window.PPSocial = {
  onMood: onMood,
  sync:   syncProfile,
  open:   openCommunity
};

/* ------------------------------------------------------------------- boot */
function boot(){
  buildComBtn();
  var f = fb();
  if(f){
    try{
      f.auth().onAuthStateChanged(function(u){ if(u) syncProfile(); });
    }catch(e){}
  }
}
if(D.readyState==='loading') D.addEventListener('DOMContentLoaded', boot);
else boot();

})();
