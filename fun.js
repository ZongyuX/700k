/* =====================================================================
 * PromptRunic — fun.js  (v4.1-i18n)
 * Animated background · hero AI-chat demo · gamification
 * (XP & levels, achievements, daily streak, daily challenge, rewards).
 * Author: Zongyu Xie <zongyufred@gmail.com>
 * Copyright (c) 2026 Zongyu Xie. All rights reserved.
 *
 * Self-contained. Include AFTER the main script:
 *   <script src="fun.js"></script>
 * Exposes window.PPGame { award, exportState, importState, openPanel, refresh }.
 * ===================================================================== */
(function(){
'use strict';
var D = document;

/* ---------------------------------------------------------------- styles */
var CSS = ''
+'#ppbg{position:fixed;inset:0;z-index:0;pointer-events:none;opacity:.55}'
+'.hero,.app,.upsell,.guide,.optimizer-section,footer{position:relative;z-index:2}'
/* header chip */
+'.pp-chip{display:flex;align-items:center;gap:6px;background:var(--panel2)!important;'
+'border:1px solid var(--border)!important;color:var(--text)!important;border-radius:8px;'
+'font-weight:700!important;font-size:13px!important;cursor:pointer}'
+'.pp-chip:hover{border-color:var(--accent)!important}'
+'.pp-chip .lv{background:linear-gradient(90deg,var(--accent),var(--accent2));'
+'-webkit-background-clip:text;-webkit-text-fill-color:transparent}'
+'.pp-chip .xpmini{width:46px;height:6px;border-radius:4px;background:var(--panel3);overflow:hidden}'
+'.pp-chip .xpmini i{display:block;height:100%;background:linear-gradient(90deg,var(--accent),var(--accent2))}'
/* hero AI demo */
+'.ppchat{max-width:520px;margin:26px auto 0;background:var(--panel);border:1px solid var(--border);'
+'border-radius:14px;overflow:hidden;box-shadow:0 18px 50px rgba(0,0,0,.4);text-align:left}'
+'.ppchat-bar{display:flex;align-items:center;gap:6px;padding:10px 13px;border-bottom:1px solid var(--border);background:var(--panel2)}'
+'.ppchat-bar i{width:9px;height:9px;border-radius:50%}'
+'.ppchat-bar span{margin-left:8px;font-size:11.5px;color:var(--muted);font-weight:600}'
+'.ppchat-bar .live{margin-left:auto;display:flex;align-items:center;gap:5px;color:#7ee2a4}'
+'.ppchat-bar .live b{width:7px;height:7px;border-radius:50%;background:#22c55e;animation:ppblink 1.4s infinite}'
+'@keyframes ppblink{0%,100%{opacity:1}50%{opacity:.25}}'
+'.ppchat-body{padding:15px;min-height:182px;display:flex;flex-direction:column;gap:10px}'
+'.ppmsg{max-width:86%;padding:9px 12px;border-radius:12px;font-size:12.8px;line-height:1.5;white-space:pre-wrap}'
+'.ppmsg.u{align-self:flex-end;background:linear-gradient(90deg,var(--accent),var(--accent2));color:#fff;border-bottom-right-radius:4px}'
+'.ppmsg.a{align-self:flex-start;background:var(--panel2);border:1px solid var(--border);color:var(--text);border-bottom-left-radius:4px}'
+'.ppcaret{display:inline-block;width:7px;background:currentColor;margin-left:1px;animation:ppblink .9s steps(1) infinite;height:1em;vertical-align:-2px}'
+'.ppdots i{display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--muted);margin:0 2px;animation:ppbob 1s infinite}'
+'.ppdots i:nth-child(2){animation-delay:.15s}.ppdots i:nth-child(3){animation-delay:.3s}'
+'@keyframes ppbob{0%,100%{transform:translateY(0);opacity:.4}50%{transform:translateY(-4px);opacity:1}}'
/* rewards modal */
+'.xpbar{height:14px;border-radius:8px;background:var(--panel3);overflow:hidden;margin:6px 0 4px}'
+'.xpbar i{display:block;height:100%;background:linear-gradient(90deg,var(--accent),var(--accent2));transition:width .5s}'
+'.lvrow{display:flex;align-items:center;gap:12px;margin-bottom:4px}'
+'.lvbadge{width:46px;height:46px;flex-shrink:0;border-radius:12px;display:flex;align-items:center;justify-content:center;'
+'font-weight:800;font-size:17px;color:#fff;background:linear-gradient(135deg,var(--accent),var(--accent2))}'
+'.statpills{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}'
+'.statpill{flex:1;min-width:90px;background:var(--panel2);border:1px solid var(--border);border-radius:10px;padding:10px;text-align:center}'
+'.statpill b{display:block;font-size:18px}.statpill span{font-size:11px;color:var(--muted)}'
+'.dchal{background:linear-gradient(135deg,rgba(124,92,255,.15),rgba(34,211,238,.06));'
+'border:1px solid var(--accent);border-radius:11px;padding:13px;margin:10px 0}'
+'.dchal h4{font-size:13px;margin-bottom:3px}.dchal p{font-size:12px;color:var(--muted);margin-bottom:8px}'
+'.achgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:9px;margin-top:8px}'
+'.ach{background:var(--panel2);border:1px solid var(--border);border-radius:10px;padding:11px;text-align:center;opacity:.42;transition:.15s}'
+'.ach.on{opacity:1;border-color:var(--accent)}'
+'.ach .ic{font-size:22px}.ach .nm{font-size:11.5px;font-weight:700;margin-top:3px}'
+'.ach .ds{font-size:10px;color:var(--muted);margin-top:2px;line-height:1.35}'
/* xp popup + confetti */
+'#ppxp{position:fixed;right:22px;bottom:74px;z-index:240;display:flex;flex-direction:column;align-items:flex-end;gap:5px;pointer-events:none}'
+'.ppgain{background:linear-gradient(90deg,var(--accent),var(--accent2));color:#fff;font-weight:800;font-size:12.5px;'
+'padding:5px 11px;border-radius:20px;opacity:0;transform:translateY(8px);animation:pprise 1.6s ease forwards;box-shadow:0 6px 18px rgba(124,92,255,.4)}'
+'@keyframes pprise{12%{opacity:1;transform:translateY(0)}80%{opacity:1}100%{opacity:0;transform:translateY(-22px)}}'
+'#ppconf{position:fixed;inset:0;z-index:260;pointer-events:none}'
+'@media(max-width:680px){.ppchat{margin-top:20px}.achgrid{grid-template-columns:repeat(auto-fill,minmax(120px,1fr))}}'
+'.pp-bbar{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;'
+'padding:0 0 16px;margin-bottom:14px;border-bottom:1px solid var(--border);position:relative;z-index:2;background:transparent}'
+'.pp-bbtn{background:var(--panel2);border:1px solid var(--border);color:var(--text);'
+'font-weight:700;font-size:13px;padding:9px 16px;border-radius:22px;cursor:pointer;transition:.15s}'
+'.pp-bbtn:hover{border-color:var(--accent);transform:translateY(-1px)}'
+'.ppbg-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:6px}'
+'.ppbg-card{background:var(--panel2);border:1px solid var(--border);border-radius:10px;padding:9px;cursor:pointer}'
+'.ppbg-card:hover{border-color:var(--accent)}'
+'.ppbg-card.on{border-color:var(--accent);box-shadow:inset 0 0 0 1px var(--accent)}'
+'.ppbg-card.lock{opacity:.6}'
+'.ppbg-sw{height:46px;border-radius:7px;margin-bottom:6px}'
+'.ppbg-nm{font-size:12px;font-weight:700}'
+'.ppbg-ds{font-size:10.5px;color:var(--muted);margin-top:2px}'
+'.sw-constellation{background:linear-gradient(135deg,#1a2238,#7c5cff)}'
+'.sw-drift{background:linear-gradient(135deg,#0b0f1a,#b4c8ff)}'
+'.sw-aurora{background:linear-gradient(120deg,#7c5cff,#22d3ee,#ff6b9d)}'
+'.sw-coderain{background:linear-gradient(180deg,#0b0f1a,#22d3ee)}'
+'.sw-starfield{background:radial-gradient(circle,#bab4ff,#0b0f1a)}'
+'.sw-neural{background:linear-gradient(135deg,#22d3ee,#7c5cff)}'
+'.sw-bubbles{background:linear-gradient(135deg,#1a2238,#22d3ee)}'
+'.sw-waves{background:linear-gradient(180deg,#7c5cff,#22d3ee)}'
+'.sw-orbits{background:radial-gradient(circle at 30% 40%,#22d3ee,#1a2238)}'
+'.sw-grid{background:linear-gradient(180deg,#1a2238,#7c5cff)}'
+'.sw-live{background:linear-gradient(135deg,#0b0f1a,#7c5cff)}'
+'.sw-ai1{background:linear-gradient(135deg,#1a2238,#22d3ee)}'
+'.rankpill{font-size:9.5px;font-weight:800;border:1px solid;border-radius:10px;padding:1px 7px;margin-left:4px;text-transform:uppercase;letter-spacing:.04em}'
+'.ppbg-live{position:fixed;inset:0;z-index:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .4s;pointer-events:none}'
+'.ppbg-live.on{opacity:1}'
+'.ppbg-live-dim{position:fixed;inset:0;z-index:0;background:rgba(11,15,26,.45);opacity:0;transition:opacity .4s;pointer-events:none}'
+'.ppbg-live-dim.on{opacity:1}'
+'.ppbg-live-vig{position:fixed;inset:0;z-index:0;box-shadow:inset 0 0 150px rgba(11,15,26,.3);opacity:0;transition:opacity .4s;pointer-events:none}'
+'.ppbg-live-vig.on{opacity:1}'
+'.ppbg-live-fade{position:fixed;inset:0;z-index:1;background:var(--bg);opacity:0;transition:opacity .15s;pointer-events:none}'
+'.emojicol{display:flex;flex-wrap:wrap;gap:4px;max-height:150px;overflow-y:auto;background:var(--panel2);border:1px solid var(--border);border-radius:9px;padding:8px}'
+'.emojicol .emo{font-size:18px;width:26px;height:26px;display:flex;align-items:center;justify-content:center}'
+'.emojicol .emo.lk{opacity:.4;font-size:12px}'
+'.ppmood{margin:10px 0;background:var(--panel2);border:1px solid var(--border);border-radius:10px;padding:10px 11px}'
+'.ppmood-h{font-size:12px;font-weight:700;color:var(--muted);margin-bottom:7px}'
+'.ppmood-cur{font-size:16px}'
+'.ppmood-grid{display:flex;flex-wrap:wrap;gap:4px;max-height:122px;overflow-y:auto}'
+'.ppmood-e{font-size:18px;width:30px;height:30px;border:1px solid var(--border);border-radius:7px;background:var(--panel);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}'
+'.ppmood-e:hover{border-color:var(--accent)}'
+'.ppmood-e.on{border-color:var(--accent);background:rgba(124,92,255,.2)}'
+'.ppmood-e.clr{font-size:12px;color:var(--muted)}'
+'.ppmood-lock{font-size:10.5px;color:var(--muted);margin-top:6px}';

var st = D.createElement('style'); st.textContent = CSS; D.head.appendChild(st);

/* ---------------------------------------------------- helpers / storage */
function lg(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
function ls(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
function elById(id){ return D.getElementById(id); }
function dayStr(off){
  var d = new Date(Date.now() + (off||0)*86400000);
  return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);
}
function esc(s){ return String(s==null?'':s).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];}); }

/* ---- i18n helpers ---- */
function isZh(){ try{ return window.PPI18n && PPI18n.isZh(); }catch(e){ return false; } }
function ppT(key, fb){ try{ return window.PPI18n ? PPI18n.t(key, fb) : (fb||key); }catch(e){ return fb||key; } }

/* ---------------------------------------------------- gamification state */
var DEF = { xp:0, lvl:1, streak:0, best:0, lastDay:'', dDay:'', sDay:'', sN:0,
            coins:0, avatar:0, tDay:'', tToday:0, duelDay:'', duelN:0,
            ach:[], cnt:{ open:0, copy:0, send:0, search:0, fav:0, daily:0, mood:0, tmin:0 } };
var game = clone(DEF);

/* UID-aware game storage: each account gets its own localStorage key.
 * Logged in  -> pp_game_{uid}
 * Guest      -> pp_game_guest
 * This prevents data bleeding between accounts on the same browser. */
var _gameUid = null; // null = guest mode
function _gameKey(){ return _gameUid ? ('pp_game_'+_gameUid) : 'pp_game_guest'; }

/* Migrate legacy pp_game key: if pp_game_guest doesn't exist yet but the
 * old pp_game key does, copy its data to pp_game_guest (guest mode storage)
 * and remove the old key so accounts don't bleed into each other. */
try{
  if(!lg('pp_game_guest') && lg('pp_game')){
    ls('pp_game_guest', lg('pp_game'));
    try{ localStorage.removeItem('pp_game'); }catch(e){}
  }
}catch(e){}

try{
  var saved = JSON.parse(lg(_gameKey())||'{}');
  game = mergeGame(game, saved);
}catch(e){}

function clone(o){ return JSON.parse(JSON.stringify(o)); }
function mergeGame(a,b){
  if(!b||typeof b!=='object') return a;
  var r = clone(a);
  r.xp = Math.max(a.xp||0, b.xp||0);
  r.best = Math.max(a.best||0, b.best||0);
  r.cnt = r.cnt||{};
  ['open','copy','send','search','fav','daily','mood','tmin'].forEach(function(k){
    r.cnt[k] = Math.max((a.cnt&&a.cnt[k])||0, (b.cnt&&b.cnt[k])||0);
  });
  /* coins / avatar / online-time: keep whichever record is more recent */
  var bNewer = (b.lastDay||'') >= (a.lastDay||'');
  r.coins  = (bNewer ? b.coins  : a.coins ) || 0;
  r.avatar = (bNewer ? b.avatar : a.avatar) || 0;
  r.tDay   = (bNewer ? b.tDay   : a.tDay  ) || '';
  r.tToday = (bNewer ? b.tToday : a.tToday) || 0;
  var s = {};
  [].concat(a.ach||[], b.ach||[]).forEach(function(x){ s[x]=1; });
  r.ach = Object.keys(s);
  /* streak / daily — keep whichever record is more recent */
  if((b.lastDay||'') >= (a.lastDay||'')){ r.lastDay=b.lastDay||''; r.streak=b.streak||0; }
  else { r.lastDay=a.lastDay||''; r.streak=a.streak||0; }
  r.dDay = (b.dDay||'') > (a.dDay||'') ? b.dDay : (a.dDay||'');
  if((b.sDay||'') >= (a.sDay||'')){ r.sDay=b.sDay||''; r.sN=b.sN||0; }
  else { r.sDay=a.sDay||''; r.sN=a.sN||0; }
  r.lvl = levelFromXp(r.xp);
  return r;
}
function save(){
  game.lvl = levelFromXp(game.xp);
  ls(_gameKey(), JSON.stringify(game));
  if(typeof window.ppGameChanged==='function'){ try{ window.ppGameChanged(); }catch(e){} }
}

/* levels: XP needed to *reach* level L = 50*L*(L-1) -> 0,100,300,600,1000,1500... */
function xpFloor(l){ return 50*l*(l-1); }
function levelFromXp(xp){ var l=1; while(xpFloor(l+1)<=xp) l++; return l; }

/* level titles + ranks */
var TITLES=[[1,'Newcomer'],[3,'Curious Mind'],[5,'Prompt Explorer'],[8,'Prompt Hand'],[12,'Prompt Adept'],[18,'Prompt Pro'],[25,'Prompt Specialist'],[35,'Prompt Expert'],[50,'Prompt Master'],[65,'Prompt Sage'],[80,'Prompt Virtuoso'],[100,'PromptRunic Grandmaster']];
var ZH_TITLES={1:'新手',3:'好奇者',5:'提示语探索者',8:'提示语熟手',12:'提示语达人',18:'提示语专家',25:'提示语大师',35:'提示语高手',50:'提示语宗师',65:'提示语贤者',80:'提示语巨匠',100:'PromptRunic 宗师'};
function levelTitle(l){ var t=TITLES[0][1],k=TITLES[0][0],i; for(i=0;i<TITLES.length;i++) if(l>=TITLES[i][0]){t=TITLES[i][1];k=TITLES[i][0];} return isZh()?(ZH_TITLES[k]||t):t; }
var RANKS=[[1,'Bronze','#cd7f32'],[10,'Silver','#c0c8d4'],[20,'Gold','#f5b942'],[35,'Platinum','#5fd3c4'],[50,'Diamond','#56b4ff'],[70,'Master','#7c5cff'],[90,'Legend','#ff6b9d']];
var ZH_RANKS={1:'青铜',10:'白银',20:'黄金',35:'铂金',50:'钻石',70:'大师',90:'传奇'};
function rankOf(l){ var r=RANKS[0],i; for(i=0;i<RANKS.length;i++) if(l>=RANKS[i][0]) r=RANKS[i]; return {name:r[1],color:r[2]}; }
function getRankName(l){ var r=RANKS[0],i; for(i=0;i<RANKS.length;i++) if(l>=RANKS[i][0]) r=RANKS[i]; return isZh()?(ZH_RANKS[r[0]]||r[1]):r[1]; }

var XP = { open:5, copy:6, send:12, fav:8, search:3, checkin:25, daily:60, ach:40 };

/* ---------------------------------------------------- achievements */
var ACH = [];
(function(){
  var W=['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI'];
  function tier(idp,ic,base,label,val,thr,baseZh,labelZh){
    thr.forEach(function(n,k){
      ACH.push({ id:idp+n, ic:ic, nm:base+' '+W[k], ds:label.replace('{n}',n),
        nmZh:baseZh+' '+W[k], dsZh:labelZh.replace('{n}',n),
        t:(function(n){ return function(g){ return val(g)>=n; }; })(n) });
    });
  }
  tier('open','🧭','Explorer','Open {n} prompts',function(g){return g.cnt.open;},[1,10,30,75,150,300,600,1200],'探索者','打开 {n} 个提示语');
  tier('copy','📋','Copy Hand','Copy {n} prompts',function(g){return g.cnt.copy;},[5,25,60,150,350,700,1500],'复制手','复制 {n} 个提示语');
  tier('send','🚀','Launcher','Send {n} prompts to an AI',function(g){return g.cnt.send;},[5,20,60,150,400,900,2000],'发射者','向 AI 发送 {n} 个提示语');
  tier('srch','🔍','Detective','Run {n} searches',function(g){return g.cnt.search;},[3,15,50,120,300,700],'侦探','运行 {n} 次搜索');
  tier('fav','⭐','Curator','Save {n} favorites',function(g){return g.cnt.fav;},[3,15,40,90,200,400,800],'策展人','收藏 {n} 个');
  tier('day','🎯','Challenger','Complete {n} daily challenges',function(g){return g.cnt.daily;},[1,3,8,20,50,120,300,700],'挑战者','完成 {n} 个每日挑战');
  tier('strk','🔥','Streak Keeper','Reach a {n}-day streak',function(g){return g.best;},[2,3,5,7,14,21,30,50,75,100,150,200,300,365],'连续守护者','达成 {n} 天连续签到');
  tier('lvl','👑','Ascendant','Reach level {n}',function(g){return g.lvl;},[2,3,5,8,10,15,20,25,30,40,50,60,70,80,90,100],'攀升者','达到等级 {n}');
  tier('xp','💎','XP Hoard','Earn {n} total XP',function(g){return g.xp;},[200,500,1200,3000,6000,12000,25000,50000,100000,250000,500000],'XP 收藏家','获得总计 {n} XP');
  tier('mood','😊','Mood Setter','Set a mood on {n} prompts',function(g){return (g.cnt&&g.cnt.mood)||0;},[1,5,15,40,100],'心情设定者','为 {n} 个提示语设定心情');
  tier('pm','🎮','Matrix Run','PROMPT MATRIX score of {n}',function(g){return g.gameScore||0;},[10000,50000,100000,150000,200000,250000,300000],'矩阵奔跑','PROMPT MATRIX 分数 {n}');
  var sp=[
   ['combo1','🎖️','Well Rounded','Open 50, send 25, save 10','全面发展','打开50、发送25、收藏10',function(g){return g.cnt.open>=50&&g.cnt.send>=25&&g.cnt.fav>=10;}],
   ['combo2','🏅','Power Trio','Open 300, send 150, search 100','力量三人组','打开300、发送150、搜索100',function(g){return g.cnt.open>=300&&g.cnt.send>=150&&g.cnt.search>=100;}],
   ['ach25','🏵️','Badge Collector','Unlock 25 badges','徽章收藏家','解锁25个徽章',function(g){return g.ach.length>=25;}],
   ['ach50','🎗️','Badge Hunter','Unlock 50 badges','徽章猎人','解锁50个徽章',function(g){return g.ach.length>=50;}],
   ['ach80','🏆','Badge Legend','Unlock 80 badges','徽章传奇','解锁80个徽章',function(g){return g.ach.length>=80;}],
   ['unbroken','🗓️','Unbroken','30-day streak and 20 daily challenges','不间断','30天连续签到和20个每日挑战',function(g){return g.best>=30&&g.cnt.daily>=20;}],
   ['grinder','⚙️','The Grinder','20,000 XP and level 25','磨砺者','20,000 XP和等级25',function(g){return g.xp>=20000&&g.lvl>=25;}],
   ['apex','🔱','Apex User','Level 50 with a 50-day streak','顶尖用户','等级50且50天连续签到',function(g){return g.lvl>=50&&g.best>=50;}],
   ['devotee','💠','PromptRunic Devotee','Reach level 75','PromptRunic 忠实用户','达到等级75',function(g){return g.lvl>=75;}],
   ['centurion','💯','Centurion','Reach level 100','百夫长','达到等级100',function(g){return g.lvl>=100;}],
   ['omni','🌌','Omniscient','Unlock 99 badges','全知者','解锁99个徽章',function(g){return g.ach.length>=99;}],
   ['pmwin','🏆','Matrix Champion','Clear PROMPT MATRIX even once','矩阵冠军','通关一次 PROMPT MATRIX',function(g){return (g.gameScore||0)>0;}],
   ['pmpeak','🥇','Matrix Apex','PROMPT MATRIX score above 300000','矩阵巅峰','PROMPT MATRIX 分数超过300000',function(g){return (g.gameScore||0)>=300000;}],
   ['spd60','⏱️','Speed Clear I','Clear PROMPT MATRIX in under 1 min','速通 I','在1分钟内通关 PROMPT MATRIX',function(g){return (g.gameTime||0)>0 && g.gameTime<=60;}],
   ['spd120','⏱️','Speed Clear II','Clear PROMPT MATRIX in under 2 min','速通 II','在2分钟内通关 PROMPT MATRIX',function(g){return (g.gameTime||0)>0 && g.gameTime<=120;}],
   ['spd180','⏱️','Speed Clear III','Clear PROMPT MATRIX in under 3 min','速通 III','在3分钟内通关 PROMPT MATRIX',function(g){return (g.gameTime||0)>0 && g.gameTime<=180;}],
   ['spd240','⏱️','Speed Clear IV','Clear PROMPT MATRIX in under 4 min','速通 IV','在4分钟内通关 PROMPT MATRIX',function(g){return (g.gameTime||0)>0 && g.gameTime<=240;}],
   ['spd300','⏱️','Speed Clear V','Clear PROMPT MATRIX in under 5 min','速通 V','在5分钟内通关 PROMPT MATRIX',function(g){return (g.gameTime||0)>0 && g.gameTime<=300;}],
   ['spd360','⏱️','Speed Clear VI','Clear PROMPT MATRIX in under 6 min','速通 VI','在6分钟内通关 PROMPT MATRIX',function(g){return (g.gameTime||0)>0 && g.gameTime<=360;}],
   ['spd420','⏱️','Speed Clear VII','Clear PROMPT MATRIX in under 7 min','速通 VII','在7分钟内通关 PROMPT MATRIX',function(g){return (g.gameTime||0)>0 && g.gameTime<=420;}],
   ['spd480','⏱️','Speed Clear VIII','Clear PROMPT MATRIX in under 8 min','速通 VIII','在8分钟内通关 PROMPT MATRIX',function(g){return (g.gameTime||0)>0 && g.gameTime<=480;}],
   ['spd540','⏱️','Speed Clear IX','Clear PROMPT MATRIX in under 9 min','速通 IX','在9分钟内通关 PROMPT MATRIX',function(g){return (g.gameTime||0)>0 && g.gameTime<=540;}],
   ['spd600','⏱️','Speed Clear X','Clear PROMPT MATRIX in under 10 min','速通 X','在10分钟内通关 PROMPT MATRIX',function(g){return (g.gameTime||0)>0 && g.gameTime<=600;}],
   ['spd900','⏱️','Speed Clear XI','Clear PROMPT MATRIX in under 15 min','速通 XI','在15分钟内通关 PROMPT MATRIX',function(g){return (g.gameTime||0)>0 && g.gameTime<=900;}],
   ['spd1200','⏱️','Speed Clear XII','Clear PROMPT MATRIX in under 20 min','速通 XII','在20分钟内通关 PROMPT MATRIX',function(g){return (g.gameTime||0)>0 && g.gameTime<=1200;}],
   ['spd1800','⏱️','Speed Clear XIII','Clear PROMPT MATRIX in under 30 min','速通 XIII','在30分钟内通关 PROMPT MATRIX',function(g){return (g.gameTime||0)>0 && g.gameTime<=1800;}],
   ['spd3600','⏱️','Speed Clear XIV','Clear PROMPT MATRIX in under 60 min','速通 XIV','在60分钟内通关 PROMPT MATRIX',function(g){return (g.gameTime||0)>0 && g.gameTime<=3600;}],
   ['spd7200','⏱️','Speed Clear XV','Clear PROMPT MATRIX in under 120 min','速通 XV','在120分钟内通关 PROMPT MATRIX',function(g){return (g.gameTime||0)>0 && g.gameTime<=7200;}],
  ];
  sp.forEach(function(a){ ACH.push({id:a[0],ic:a[1],nm:a[2],ds:a[3],nmZh:a[4],dsZh:a[5],t:a[6]}); });
})();
window._ACH = ACH;
function getAchNm(a){ return isZh()?(a.nmZh||a.nm):a.nm; }
function getAchDs(a){ return isZh()?(a.dsZh||a.ds):a.ds; }

/* ---------------------------------------------------- emoji system */
var EMOJIS=[
['😀',1],['😃',1],['😄',1],['😁',1],['😊',1],['🙂',1],['😉',1],['😍',1],['🤩',1],['😎',1],
['🤔',1],['😐',1],['😴',1],['😢',1],['😭',1],['😡',1],['😱',1],['👍',1],['👎',1],['👏',1],
['🙏',1],['❤️',1],['🔥',1],['⭐',1],
['🥳',3],['😇',3],['🤗',3],['😅',3],['😂',3],['🤣',3],['😏',3],['😬',3],['🥺',3],['😤',3],
['💪',3],['✌️',3],['🤝',3],['💯',3],['✨',3],
['🤯',5],['🥶',5],['🤐',5],['🫠',5],['🫡',5],['🤓',5],['🧐',5],['🤤',5],['💡',5],['🎯',5],
['🚀',5],['🏆',5],['🎉',5],['😻',5],['🙌',5],
['🦄',8],['🐉',8],['🦊',8],['🐱',8],['🐶',8],['🦁',8],['🐼',8],['🦋',8],['🌈',8],['☀️',8],
['🌙',8],['⚡',8],['❄️',8],['🌊',8],['🍀',8],
['☕',12],['🍕',12],['🍩',12],['🍪',12],['🍫',12],['🍿',12],['🧋',12],['🍉',12],['🎂',12],['🥑',12],
['🎨',12],['🎸',12],['🎮',12],['📚',12],['💻',12],
['💎',18],['🔮',18],['🗝️',18],['🛡️',18],['⚔️',18],['🏅',18],['🥇',18],['🎖️',18],['🏵️',18],['👑',18],
['🌟',25],['💫',25],['☄️',25],['🌠',25],['🪐',25],['🌌',25],['🛸',25],['🔭',25],
['🐲',35],['🔱',35],['⚜️',35],['🧿',35],['💠',35],['🎆',35],
['👽',50],['🤖',50],['🦾',50],['🧠',50],['♾️',50],['🆒',50]
];
function moods(){ try{ return JSON.parse(lg('pp_moods')||'{}'); }catch(e){ return {}; } }
function getMood(id){ return moods()[id]||''; }
function setMood(id,em){
  var m=moods();
  if(em) m[id]=em; else delete m[id];
  ls('pp_moods',JSON.stringify(m));
  game.cnt.mood=Math.max(game.cnt.mood||0, Object.keys(m).length);
  checkAch(); save(); refresh();
  try{ if(window.PPSocial&&window.PPSocial.onMood) window.PPSocial.onMood(id,em); }catch(e){}
}
function injectMoodRow(id){
  var fields=elById('pmFields'); if(!fields||!fields.parentNode) return;
  var row=elById('ppMoodRow');
  if(!row){
    row=D.createElement('div'); row.id='ppMoodRow'; row.className='ppmood';
    fields.parentNode.appendChild(row);
  }
  var cur=getMood(id);
  var un=EMOJIS.filter(function(e){ return game.lvl>=e[1]; });
  var locked=EMOJIS.length-un.length;
  row.innerHTML='<div class="ppmood-h">'+esc(ppT('game.mood.header'))
    +(cur?' <span class="ppmood-cur">'+cur+'</span>':'')+'</div>'
    +'<div class="ppmood-grid">'
    + un.map(function(e){ return '<button class="ppmood-e'+(e[0]===cur?' on':'')+'" data-em="'+e[0]+'">'+e[0]+'</button>'; }).join('')
    + (cur?'<button class="ppmood-e clr" data-em="" title="Clear">&times;</button>':'')
    +'</div>'
    +(locked>0?'<div class="ppmood-lock">'+esc(ppT('game.mood.locked').replace('{n}',locked))+'</div>':'');
  Array.prototype.forEach.call(row.querySelectorAll('[data-em]'),function(b){
    b.addEventListener('click',function(){
      var em=b.getAttribute('data-em');
      setMood(id,em);
      if(em) addXp(3,'+3 XP');
      injectMoodRow(id);
    });
  });
}
(function(){
  var orig=window.openPrompt;
  if(typeof orig==='function'){
    window.openPrompt=function(id){ orig(id); try{ injectMoodRow(id); }catch(e){} };
  }
})();

/* ---------------------------------------------------- daily challenge */
function dailyId(){
  var P = window.PROMPTS_DATA || [];
  if(!P.length) return null;
  var d = dayStr(0), h = 5381;
  for(var i=0;i<d.length;i++) h = ((h*33) ^ d.charCodeAt(i)) >>> 0;
  var pool = P.filter(function(p){ return p.free; });
  if(!pool.length) pool = P;
  return pool[h % pool.length].id;
}
function dailyPrompt(){
  var id = dailyId(), P = window.PROMPTS_DATA || [];
  for(var i=0;i<P.length;i++) if(P[i].id===id) return P[i];
  return null;
}

/* ---------------------------------------------------- core: award XP */
function addXp(n, label){
  if(n>0) showGain(n, label);
  var before = game.lvl;
  game.xp += n;
  game.lvl = levelFromXp(game.xp);
  if(game.lvl>before){
    var coinReward=100*(game.lvl-before);
    game.coins=(game.coins||0)+coinReward;
    confetti();
    setTimeout(function(){ ppToast(ppT('game.levelup').replace('{lvl}',game.lvl).replace('{coins}',coinReward)); }, 250);
  }
  checkAch();
  refresh();
}
function checkAch(){
  ACH.forEach(function(a){
    if(game.ach.indexOf(a.id)<0 && a.t(game)){
      game.ach.push(a.id);
      confetti();
      ppToast(ppT('game.achievement').replace('{name}',getAchNm(a)).replace('{xp}',XP.ach));
      game.xp += XP.ach;
      game.lvl = levelFromXp(game.xp);
    }
  });
}

/* public: award XP for an action. type: open|copy|send|fav|search  */
function award(type, detail){
  var t = dayStr(0);
  if(type==='open'){
    game.cnt.open++;
    var dp = dailyId();
    if(detail!=null && detail===dp && game.dDay!==t){
      game.dDay = t; game.cnt.daily++;
      addXp(XP.open, '+'+XP.open);
      addXp(XP.daily, 'Daily challenge! +'+XP.daily);
      ppToast(ppT('game.daily.complete').replace('{xp}',XP.daily));
      save(); return;
    }
    addXp(XP.open, '+'+XP.open);
  }else if(type==='copy'){
    game.cnt.copy++; addXp(XP.copy, '+'+XP.copy);
  }else if(type==='send'){
    game.cnt.send++; addXp(XP.send, '+'+XP.send);
  }else if(type==='fav'){
    game.cnt.fav++; addXp(XP.fav, '+'+XP.fav);
  }else if(type==='search'){
    game.cnt.search++;
    if(game.sDay!==t){ game.sDay=t; game.sN=0; }
    if(game.sN<12){ game.sN++; addXp(XP.search, '+'+XP.search); }
    else { checkAch(); refresh(); }
  }else{ return; }
  save();
}

/* daily check-in / streak */
function checkIn(){
  var t = dayStr(0);
  if(game.lastDay===t){ return; }
  if(game.lastDay===dayStr(-1)) game.streak = (game.streak||0)+1;
  else game.streak = 1;
  game.lastDay = t;
  game.best = Math.max(game.best||0, game.streak);
  setTimeout(function(){
    ppToast(ppT('game.streak').replace('{n}',game.streak).replace('{xp}',XP.checkin));
  }, 700);
  addXp(XP.checkin, 'Daily check-in +'+XP.checkin);
  save();
}

/* ---------------------------------------------------- feedback: toast/gain */
function ppToast(msg){
  /* reuse the site's toast if present, else a quick fallback */
  var t = elById('toast');
  if(t){
    t.textContent = msg; t.className = 'toast show info';
    clearTimeout(t._pp); t._pp = setTimeout(function(){ t.className='toast info'; }, 2600);
  }
}
function showGain(n, label){
  var box = elById('ppxp');
  if(!box){ box = D.createElement('div'); box.id='ppxp'; D.body.appendChild(box); }
  var g = D.createElement('div'); g.className='ppgain'; g.textContent = label || ('+'+n+' XP');
  box.appendChild(g);
  setTimeout(function(){ if(g.parentNode) g.parentNode.removeChild(g); }, 1700);
}

/* ---------------------------------------------------- confetti */
function confetti(){
  var c = elById('ppconf');
  if(!c){ c = D.createElement('canvas'); c.id='ppconf'; D.body.appendChild(c); }
  c.width = innerWidth; c.height = innerHeight;
  var x = c.getContext('2d');
  var cols = ['#7c5cff','#22d3ee','#f5b942','#22c55e','#ff6b9d'];
  var bits = [];
  for(var i=0;i<90;i++){
    bits.push({ x:Math.random()*c.width, y:-20-Math.random()*c.height*0.4,
      w:5+Math.random()*7, h:8+Math.random()*8, c:cols[(Math.random()*cols.length)|0],
      vy:2.5+Math.random()*3.5, vx:-1.5+Math.random()*3, r:Math.random()*6, vr:-0.2+Math.random()*0.4 });
  }
  var t0 = Date.now();
  (function frame(){
    var el = Date.now()-t0;
    x.clearRect(0,0,c.width,c.height);
    bits.forEach(function(b){
      b.x+=b.vx; b.y+=b.vy; b.r+=b.vr;
      x.save(); x.translate(b.x,b.y); x.rotate(b.r);
      x.fillStyle=b.c; x.globalAlpha = el>1600 ? Math.max(0,1-(el-1600)/600) : 1;
      x.fillRect(-b.w/2,-b.h/2,b.w,b.h); x.restore();
    });
    if(el<2200) requestAnimationFrame(frame);
    else x.clearRect(0,0,c.width,c.height);
  })();
}

/* ---------------------------------------------------- animated backgrounds */
var bgC, bgX, bgDef, bgS, bgReduce=false;
try{ bgReduce = matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){}
function rnd(a,b){ return a + Math.random()*(b-a); }

/* 15 backgrounds. Constellation + AI1 + AI2 + AI3 + AI4 + AI5 + Live are free; the rest are a Pro feature. */
var bgVideo=null, bgDim=null, bgVig=null, bgFade=null;
var bgScrollListener=false;
var ZH_BG_NAMES={constellation:'星座',drift:'星尘漂流',aurora:'极光',coderain:'代码雨',starfield:'超空间',neural:'神经脉冲',bubbles:'气泡',waves:'波浪',orbits:'轨道',grid:'霓虹网格',ai1:'PromptRunic AI',ai2:'数字流光',ai3:'梦境神经',ai4:'赛博网络',ai5:'量子领域',ai6:'暗黑仪式',ai7:'血月',ai8:'冰霜洞穴',ai9:'暗影领域',ai10:'虚空风暴',live:'实时编码'};
var ZH_BG_DESCS={constellation:'飘移的光点连线',drift:'柔和上升的光点',aurora:'缓慢流动的彩色云',coderain:'下落的字符流',starfield:'星星从身旁掠过',neural:'呼吸的网络节点',bubbles:'平静上升的圆圈',waves:'层叠流动的线条',orbits:'静静旋转的粒子',grid:'复古地平线网格',ai1:'电影级 AI 视频背景',ai2:'流动的 AI 动态背景',ai3:'梦幻 AI 氛围背景',ai4:'赛博神经网络 AI 背景',ai5:'量子计算 AI 梦境背景',ai6:'暗黑紫魔法 AI 背景',ai7:'深红炼狱 AI 背景',ai8:'冰蓝霜冻 AI 背景',ai9:'暗绿矩阵 AI 背景',ai10:'深紫虚空 AI 背景',live:'真实的人在工作'};
var ES_BG_NAMES={constellation:'Constelación',drift:'Deriva estelar',aurora:'Aurora',coderain:'Lluvia de código',starfield:'Hiperespacio',neural:'Pulso neuronal',bubbles:'Burbujas',waves:'Ondas',orbits:'Órbitas',grid:'Cuadrícula neón',ai1:'PromptRunic AI',ai2:'Flujo Digital',ai3:'Sueño Neural',ai4:'Red Cibernética',ai5:'Reino Cuántico',ai6:'Ritual Oscuro',ai7:'Luna de Sangre',ai8:'Caverna Helada',ai9:'Reino de Sombras',ai10:'Tormenta del Vacío',live:'Código en vivo'};
var ES_BG_DESCS={constellation:'Nodos flotantes unidos por luz',drift:'Partículas brillantes ascendiendo',aurora:'Nubes de color fluyendo',coderain:'Flujo de caracteres cayendo',starfield:'Estrellas pasando a gran velocidad',neural:'Red de nodos pulsante',bubbles:'Círculos ascendentes calmados',waves:'Líneas fluidas superpuestas',orbits:'Partículas orbitando',grid:'Cuadrícula de horizonte retro',ai1:'Fondo de video IA cinematográfico',ai2:'Fondo de video IA fluido',ai3:'Fondo de video IA onírico',ai4:'Fondo de video IA red neuronal cibernética',ai5:'Fondo de video IA computing cuántico',ai6:'Fondo de video IA magia oscura púrpura',ai7:'Fondo de video IA infierno carmesí',ai8:'Fondo de video IA hielo teal',ai9:'Fondo de video IA matriz esmeralda',ai10:'Fondo de video IA vacío violeta',live:'Persona real trabajando'};
function getBgName(b){ var lang=(typeof PPI18n!=='undefined')?PPI18n.getLang():'en'; if(lang==='zh') return ZH_BG_NAMES[b.id]||b.name; if(lang==='es') return ES_BG_NAMES[b.id]||b.name; return b.name; }
function getBgDesc(b){ var lang=(typeof PPI18n!=='undefined')?PPI18n.getLang():'en'; if(lang==='zh') return ZH_BG_DESCS[b.id]||b.desc; if(lang==='es') return ES_BG_DESCS[b.id]||b.desc; return b.desc; }

var BGS = [
  { id:'constellation', name:'Constellation', desc:'Drifting nodes linked by light', free:true,
    init:function(w,h){ var p=[],n=bgReduce?24:68,i; for(i=0;i<n;i++) p.push({x:rnd(0,w),y:rnd(0,h),vx:rnd(-.25,.25),vy:rnd(-.25,.25),r:rnd(1,2.8)}); return {p:p}; },
    step:function(x,w,h,s){ x.clearRect(0,0,w,h); var P=s.p,i,j; for(i=0;i<P.length;i++){ var p=P[i]; p.x+=p.vx;p.y+=p.vy; if(p.x<0||p.x>w)p.vx*=-1; if(p.y<0||p.y>h)p.vy*=-1;
      for(j=i+1;j<P.length;j++){ var q=P[j],dx=p.x-q.x,dy=p.y-q.y,d=dx*dx+dy*dy; if(d<15000){ x.strokeStyle='rgba(124,92,255,'+(.16*(1-d/15000))+')'; x.lineWidth=1; x.beginPath();x.moveTo(p.x,p.y);x.lineTo(q.x,q.y);x.stroke(); } }
      x.fillStyle='rgba(34,211,238,.55)'; x.beginPath();x.arc(p.x,p.y,p.r,0,6.2832);x.fill(); } } },
  { id:'drift', name:'Stardust Drift', desc:'Soft glowing motes rising', free:false,
    init:function(w,h){ var p=[],i; for(i=0;i<58;i++) p.push({x:rnd(0,w),y:rnd(0,h),vx:rnd(-.15,.15),vy:rnd(-.22,-.04),r:rnd(.6,2.6),a:rnd(.2,.7)}); return {p:p}; },
    step:function(x,w,h,s){ x.clearRect(0,0,w,h); x.shadowBlur=8; x.shadowColor='rgba(124,92,255,.8)'; var P=s.p,i; for(i=0;i<P.length;i++){ var p=P[i]; p.x+=p.vx;p.y+=p.vy; if(p.y<-6){p.y=h+6;p.x=rnd(0,w);} if(p.x<-6)p.x=w+6; if(p.x>w+6)p.x=-6; x.fillStyle='rgba(186,200,255,'+p.a+')'; x.beginPath();x.arc(p.x,p.y,p.r,0,6.2832);x.fill(); } x.shadowBlur=0; } },
  { id:'aurora', name:'Aurora', desc:'Slow flowing colour clouds', free:false,
    init:function(w,h){ var c=['124,92,255','34,211,238','255,107,157','34,197,94'],b=[],i; for(i=0;i<4;i++) b.push({x:rnd(0,w),y:rnd(0,h),vx:rnd(-.35,.35),vy:rnd(-.35,.35),r:rnd(200,360),c:c[i]}); return {b:b}; },
    step:function(x,w,h,s){ x.clearRect(0,0,w,h); var B=s.b,i; for(i=0;i<B.length;i++){ var b=B[i]; b.x+=b.vx;b.y+=b.vy; if(b.x<0||b.x>w)b.vx*=-1; if(b.y<0||b.y>h)b.vy*=-1; var g=x.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r); g.addColorStop(0,'rgba('+b.c+',.32)'); g.addColorStop(1,'rgba('+b.c+',0)'); x.fillStyle=g; x.beginPath();x.arc(b.x,b.y,b.r,0,6.2832);x.fill(); } } },
  { id:'coderain', name:'Code Rain', desc:'Falling streams of characters', free:false,
    init:function(w,h){ var n=Math.max(8,Math.floor(w/16)),y=[],i; for(i=0;i<n;i++) y.push(rnd(-h,0)); return {y:y}; },
    step:function(x,w,h,s){ x.fillStyle='rgba(11,15,26,.20)'; x.fillRect(0,0,w,h); x.font='15px monospace'; var i; for(i=0;i<s.y.length;i++){ var ch=String.fromCharCode(0x30A0+Math.floor(Math.random()*96)); x.fillStyle='rgba(34,211,238,.9)'; x.fillText(ch,i*16,s.y[i]); s.y[i]+=9; if(s.y[i]>h+rnd(0,260)) s.y[i]=rnd(-260,0); } } },
  { id:'starfield', name:'Hyperspace', desc:'Stars streaking past you', free:false,
    init:function(w,h){ var st=[],i; for(i=0;i<170;i++) st.push({x:rnd(-w/2,w/2),y:rnd(-h/2,h/2),z:rnd(.05,1)}); return {st:st}; },
    step:function(x,w,h,s){ x.clearRect(0,0,w,h); x.save(); x.translate(w/2,h/2); var i; for(i=0;i<s.st.length;i++){ var p=s.st[i]; p.z-=.006; if(p.z<=.03){ p.z=1; p.x=rnd(-w/2,w/2); p.y=rnd(-h/2,h/2); } var sx=p.x/p.z,sy=p.y/p.z,r=(1-p.z)*2.6; x.fillStyle='rgba('+(p.z<.5?'34,211,238':'190,180,255')+','+(1-p.z)+')'; x.beginPath();x.arc(sx,sy,Math.max(.4,r),0,6.2832);x.fill(); } x.restore(); } },
  { id:'neural', name:'Neural Pulse', desc:'A breathing network of nodes', free:false,
    init:function(w,h){ var n=[],i; for(i=0;i<44;i++) n.push({x:rnd(0,w),y:rnd(0,h),ph:rnd(0,6.28)}); return {n:n}; },
    step:function(x,w,h,s,t){ x.clearRect(0,0,w,h); var N=s.n,i,j; for(i=0;i<N.length;i++) for(j=i+1;j<N.length;j++){ var dx=N[i].x-N[j].x,dy=N[i].y-N[j].y,d=dx*dx+dy*dy; if(d<25000){ x.strokeStyle='rgba(124,92,255,'+(.14*(1-d/25000))+')'; x.lineWidth=1; x.beginPath();x.moveTo(N[i].x,N[i].y);x.lineTo(N[j].x,N[j].y);x.stroke(); } } for(i=0;i<N.length;i++){ var p=N[i],pr=2+Math.sin(t*2+p.ph)*1.6; x.fillStyle='rgba(34,211,238,.85)'; x.beginPath();x.arc(p.x,p.y,Math.max(.7,pr),0,6.2832);x.fill(); } } },
  { id:'bubbles', name:'Bubbles', desc:'Calm rising circles', free:false,
    init:function(w,h){ var b=[],i; for(i=0;i<32;i++) b.push({x:rnd(0,w),y:rnd(0,h),r:rnd(8,48),v:rnd(.2,.9),d:rnd(-.3,.3)}); return {b:b}; },
    step:function(x,w,h,s,t){ x.clearRect(0,0,w,h); var B=s.b,i; for(i=0;i<B.length;i++){ var b=B[i]; b.y-=b.v; b.x+=Math.sin(t+b.r)*.3+b.d; if(b.y<-b.r){ b.y=h+b.r; b.x=rnd(0,w); } x.strokeStyle='rgba(124,92,255,.28)'; x.lineWidth=1.4; x.beginPath();x.arc(b.x,b.y,b.r,0,6.2832);x.stroke(); x.fillStyle='rgba(34,211,238,.05)'; x.fill(); } } },
  { id:'waves', name:'Waves', desc:'Layered flowing lines', free:false,
    init:function(){ return {}; },
    step:function(x,w,h,s,t){ x.clearRect(0,0,w,h); var L,px; for(L=0;L<4;L++){ x.beginPath(); var amp=22+L*16,yo=h*.34+L*h*.13,sp=.6+L*.18; for(px=0;px<=w;px+=8){ var py=yo+Math.sin(px*.008+t*sp+L)*amp+Math.sin(px*.02-t*sp)*8; if(px===0)x.moveTo(px,py); else x.lineTo(px,py); } x.strokeStyle='rgba('+(L%2?'34,211,238':'124,92,255')+','+(.3-L*.05)+')'; x.lineWidth=2; x.stroke(); } } },
  { id:'orbits', name:'Orbits', desc:'Particles circling quietly', free:false,
    init:function(w,h){ var c=[],k; for(k=0;k<5;k++){ var o=[],m=Math.floor(rnd(3,7)),i; for(i=0;i<m;i++) o.push({rad:rnd(20,150),ang:rnd(0,6.28),sp:rnd(.2,.8)*(Math.random()<.5?-1:1),sz:rnd(1,3)}); c.push({cx:rnd(w*.15,w*.85),cy:rnd(h*.15,h*.85),o:o}); } return {c:c}; },
    step:function(x,w,h,s){ x.clearRect(0,0,w,h); var k,i; for(k=0;k<s.c.length;k++){ var C=s.c[k]; for(i=0;i<C.o.length;i++){ var o=C.o[i]; o.ang+=o.sp*.012; var px=C.cx+Math.cos(o.ang)*o.rad,py=C.cy+Math.sin(o.ang)*o.rad; x.strokeStyle='rgba(124,92,255,.07)'; x.lineWidth=1; x.beginPath();x.arc(C.cx,C.cy,o.rad,0,6.2832);x.stroke(); x.fillStyle='rgba(34,211,238,.75)'; x.beginPath();x.arc(px,py,o.sz,0,6.2832);x.fill(); } } } },
  { id:'grid', name:'Neon Grid', desc:'A retro horizon grid', free:false,
    init:function(){ return {}; },
    step:function(x,w,h,s,t){ x.clearRect(0,0,w,h); x.strokeStyle='rgba(124,92,255,.30)'; x.lineWidth=1; var hz=h*.44,sp=46,off=(t*42)%sp,i,c; for(i=0;i<28;i++){ var yy=hz+i*sp+off; if(yy>h)break; x.globalAlpha=Math.min(1,(yy-hz)/(h-hz)); x.beginPath();x.moveTo(0,yy);x.lineTo(w,yy);x.stroke(); } for(c=-22;c<=22;c++){ x.globalAlpha=.45; x.beginPath();x.moveTo(w/2+c*sp,hz);x.lineTo(w/2+c*sp*8,h);x.stroke(); } x.globalAlpha=1; } },
  { id:'ai1', name:'PromptRunic AI', desc:'Cinematic AI video background', free:true, isVideo:true,
    init:function(w,h){
      if(!bgVideo){
        bgVideo=D.createElement('video'); bgVideo.className='ppbg-live';
        bgVideo.setAttribute('autoplay',''); bgVideo.setAttribute('muted','');
        bgVideo.setAttribute('loop',''); bgVideo.setAttribute('playsinline','');
        bgVideo.setAttribute('preload','auto'); bgVideo.setAttribute('type','video/mp4');
        bgVideo.setAttribute('webkit-playsinline','');
        bgVideo.setAttribute('x5-video-player-type','h5');
        bgVideo.muted=true; bgVideo.playsInline=true; bgVideo.autoplay=true; bgVideo.volume=0;
        bgVideo.src='videos/AI1.mp4';
        D.body.insertBefore(bgVideo, D.body.firstChild);
        bgDim=D.createElement('div'); bgDim.className='ppbg-live-dim';
        D.body.insertBefore(bgDim, D.body.firstChild);
        bgVig=D.createElement('div'); bgVig.className='ppbg-live-vig';
        D.body.insertBefore(bgVig, D.body.firstChild);
        bgFade=D.createElement('div'); bgFade.className='ppbg-live-fade';
        D.body.insertBefore(bgFade, D.body.firstChild);
        initScrollFade();
        /* Reliable autoplay with retries */
        bgVideo.addEventListener('canplay',function(){ tryPlayBgVideo(); },{once:true});
        bgVideo.addEventListener('loadeddata',function(){ tryPlayBgVideo(); },{once:true});
        bgVideo.addEventListener('canplaythrough',function(){ tryPlayBgVideo(); },{once:true});
        /* Handle video load error — fall back to constellation */
        bgVideo.addEventListener('error',function(){
          bgVideo.style.display='none';
          if(bgDim){bgDim.style.display='none';}
          if(bgVig){bgVig.style.display='none';}
          applyBg('constellation',true);
        },{once:true});
        if(bgVideo.readyState>=3) tryPlayBgVideo();
        setTimeout(function(){ tryPlayBgVideo(); },100);
        setTimeout(function(){ tryPlayBgVideo(); },500);
        setTimeout(function(){ tryPlayBgVideo(); },1500);
        setTimeout(function(){ tryPlayBgVideo(); },3000);
      } else {
        bgVideo.src='videos/AI1.mp4';
        bgVideo.muted=true; bgVideo.playsInline=true; bgVideo.volume=0;
        try{ bgVideo.load(); tryPlayBgVideo(); }catch(e){}
        setTimeout(function(){ tryPlayBgVideo(); },500);
      }
      return {};
    },
    step:function(x,w,h,s,t){ /* video plays automatically */ } },
  { id:'ai2', name:'Digital Flow', desc:'Fluid AI motion background', free:true, isVideo:true,
    init:function(w,h){
      if(!bgVideo){
        bgVideo=D.createElement('video'); bgVideo.className='ppbg-live';
        bgVideo.setAttribute('autoplay',''); bgVideo.setAttribute('muted','');
        bgVideo.setAttribute('loop',''); bgVideo.setAttribute('playsinline','');
        bgVideo.setAttribute('preload','auto'); bgVideo.setAttribute('type','video/mp4');
        bgVideo.setAttribute('webkit-playsinline','');
        bgVideo.setAttribute('x5-video-player-type','h5');
        bgVideo.muted=true; bgVideo.playsInline=true; bgVideo.autoplay=true; bgVideo.volume=0;
        bgVideo.src='videos/AI2.mp4';
        D.body.insertBefore(bgVideo, D.body.firstChild);
        bgDim=D.createElement('div'); bgDim.className='ppbg-live-dim';
        D.body.insertBefore(bgDim, D.body.firstChild);
        bgVig=D.createElement('div'); bgVig.className='ppbg-live-vig';
        D.body.insertBefore(bgVig, D.body.firstChild);
        bgFade=D.createElement('div'); bgFade.className='ppbg-live-fade';
        D.body.insertBefore(bgFade, D.body.firstChild);
        initScrollFade();
        bgVideo.addEventListener('canplay',function(){ tryPlayBgVideo(); },{once:true});
        bgVideo.addEventListener('loadeddata',function(){ tryPlayBgVideo(); },{once:true});
        bgVideo.addEventListener('canplaythrough',function(){ tryPlayBgVideo(); },{once:true});
        bgVideo.addEventListener('error',function(){
          bgVideo.style.display='none';
          if(bgDim){bgDim.style.display='none';}
          if(bgVig){bgVig.style.display='none';}
          applyBg('constellation',true);
        },{once:true});
        if(bgVideo.readyState>=3) tryPlayBgVideo();
        setTimeout(function(){ tryPlayBgVideo(); },100);
        setTimeout(function(){ tryPlayBgVideo(); },500);
        setTimeout(function(){ tryPlayBgVideo(); },1500);
        setTimeout(function(){ tryPlayBgVideo(); },3000);
      } else {
        bgVideo.src='videos/AI2.mp4';
        bgVideo.muted=true; bgVideo.playsInline=true; bgVideo.volume=0;
        try{ bgVideo.load(); tryPlayBgVideo(); }catch(e){}
        setTimeout(function(){ tryPlayBgVideo(); },500);
      }
      return {};
    },
    step:function(x,w,h,s,t){ /* video plays automatically */ } },
  { id:'ai3', name:'Neural Dream', desc:'Dreamy AI ambient background', free:true, isVideo:true,
    init:function(w,h){
      if(!bgVideo){
        bgVideo=D.createElement('video'); bgVideo.className='ppbg-live';
        bgVideo.setAttribute('autoplay',''); bgVideo.setAttribute('muted','');
        bgVideo.setAttribute('loop',''); bgVideo.setAttribute('playsinline','');
        bgVideo.setAttribute('preload','auto'); bgVideo.setAttribute('type','video/mp4');
        bgVideo.setAttribute('webkit-playsinline','');
        bgVideo.setAttribute('x5-video-player-type','h5');
        bgVideo.muted=true; bgVideo.playsInline=true; bgVideo.autoplay=true; bgVideo.volume=0;
        bgVideo.src='videos/AI3.mp4';
        D.body.insertBefore(bgVideo, D.body.firstChild);
        bgDim=D.createElement('div'); bgDim.className='ppbg-live-dim';
        D.body.insertBefore(bgDim, D.body.firstChild);
        bgVig=D.createElement('div'); bgVig.className='ppbg-live-vig';
        D.body.insertBefore(bgVig, D.body.firstChild);
        bgFade=D.createElement('div'); bgFade.className='ppbg-live-fade';
        D.body.insertBefore(bgFade, D.body.firstChild);
        initScrollFade();
        bgVideo.addEventListener('canplay',function(){ tryPlayBgVideo(); },{once:true});
        bgVideo.addEventListener('loadeddata',function(){ tryPlayBgVideo(); },{once:true});
        bgVideo.addEventListener('canplaythrough',function(){ tryPlayBgVideo(); },{once:true});
        bgVideo.addEventListener('error',function(){
          bgVideo.style.display='none';
          if(bgDim){bgDim.style.display='none';}
          if(bgVig){bgVig.style.display='none';}
          applyBg('constellation',true);
        },{once:true});
        if(bgVideo.readyState>=3) tryPlayBgVideo();
        setTimeout(function(){ tryPlayBgVideo(); },100);
        setTimeout(function(){ tryPlayBgVideo(); },500);
        setTimeout(function(){ tryPlayBgVideo(); },1500);
        setTimeout(function(){ tryPlayBgVideo(); },3000);
      } else {
        bgVideo.src='videos/AI3.mp4';
        bgVideo.muted=true; bgVideo.playsInline=true; bgVideo.volume=0;
        try{ bgVideo.load(); tryPlayBgVideo(); }catch(e){}
        setTimeout(function(){ tryPlayBgVideo(); },500);
      }
      return {};
    },
    step:function(x,w,h,s,t){ /* video plays automatically */ } },
  { id:'ai4', name:'Cyber Network', desc:'Cybernetic neural network AI background', free:true, isVideo:true,
    init:function(w,h){
      if(!bgVideo){
        bgVideo=D.createElement('video'); bgVideo.className='ppbg-live';
        bgVideo.setAttribute('autoplay',''); bgVideo.setAttribute('muted','');
        bgVideo.setAttribute('loop',''); bgVideo.setAttribute('playsinline','');
        bgVideo.setAttribute('preload','auto'); bgVideo.setAttribute('type','video/mp4');
        bgVideo.setAttribute('webkit-playsinline','');
        bgVideo.setAttribute('x5-video-player-type','h5');
        bgVideo.muted=true; bgVideo.playsInline=true; bgVideo.autoplay=true; bgVideo.volume=0;
        bgVideo.src='videos/AI4.mp4';
        D.body.insertBefore(bgVideo, D.body.firstChild);
        bgDim=D.createElement('div'); bgDim.className='ppbg-live-dim';
        D.body.insertBefore(bgDim, D.body.firstChild);
        bgVig=D.createElement('div'); bgVig.className='ppbg-live-vig';
        D.body.insertBefore(bgVig, D.body.firstChild);
        bgFade=D.createElement('div'); bgFade.className='ppbg-live-fade';
        D.body.insertBefore(bgFade, D.body.firstChild);
        initScrollFade();
        bgVideo.addEventListener('canplay',function(){ tryPlayBgVideo(); },{once:true});
        bgVideo.addEventListener('loadeddata',function(){ tryPlayBgVideo(); },{once:true});
        bgVideo.addEventListener('canplaythrough',function(){ tryPlayBgVideo(); },{once:true});
        bgVideo.addEventListener('error',function(){
          bgVideo.style.display='none';
          if(bgDim){bgDim.style.display='none';}
          if(bgVig){bgVig.style.display='none';}
          applyBg('constellation',true);
        },{once:true});
        if(bgVideo.readyState>=3) tryPlayBgVideo();
        setTimeout(function(){ tryPlayBgVideo(); },100);
        setTimeout(function(){ tryPlayBgVideo(); },500);
        setTimeout(function(){ tryPlayBgVideo(); },1500);
        setTimeout(function(){ tryPlayBgVideo(); },3000);
      } else {
        bgVideo.src='videos/AI4.mp4';
        bgVideo.muted=true; bgVideo.playsInline=true; bgVideo.volume=0;
        try{ bgVideo.load(); tryPlayBgVideo(); }catch(e){}
        setTimeout(function(){ tryPlayBgVideo(); },500);
      }
      return {};
    },
    step:function(x,w,h,s,t){ /* video plays automatically */ } },
  { id:'ai5', name:'Quantum Realm', desc:'Quantum computing AI dreamscape background', free:true, isVideo:true,
    init:function(w,h){
      if(!bgVideo){
        bgVideo=D.createElement('video'); bgVideo.className='ppbg-live';
        bgVideo.setAttribute('autoplay',''); bgVideo.setAttribute('muted','');
        bgVideo.setAttribute('loop',''); bgVideo.setAttribute('playsinline','');
        bgVideo.setAttribute('preload','auto'); bgVideo.setAttribute('type','video/mp4');
        bgVideo.setAttribute('webkit-playsinline','');
        bgVideo.setAttribute('x5-video-player-type','h5');
        bgVideo.muted=true; bgVideo.playsInline=true; bgVideo.autoplay=true; bgVideo.volume=0;
        bgVideo.src='videos/AI5.mp4';
        D.body.insertBefore(bgVideo, D.body.firstChild);
        bgDim=D.createElement('div'); bgDim.className='ppbg-live-dim';
        D.body.insertBefore(bgDim, D.body.firstChild);
        bgVig=D.createElement('div'); bgVig.className='ppbg-live-vig';
        D.body.insertBefore(bgVig, D.body.firstChild);
        bgFade=D.createElement('div'); bgFade.className='ppbg-live-fade';
        D.body.insertBefore(bgFade, D.body.firstChild);
        initScrollFade();
        bgVideo.addEventListener('canplay',function(){ tryPlayBgVideo(); },{once:true});
        bgVideo.addEventListener('loadeddata',function(){ tryPlayBgVideo(); },{once:true});
        bgVideo.addEventListener('canplaythrough',function(){ tryPlayBgVideo(); },{once:true});
        bgVideo.addEventListener('error',function(){
          bgVideo.style.display='none';
          if(bgDim){bgDim.style.display='none';}
          if(bgVig){bgVig.style.display='none';}
          applyBg('constellation',true);
        },{once:true});
        if(bgVideo.readyState>=3) tryPlayBgVideo();
        setTimeout(function(){ tryPlayBgVideo(); },100);
        setTimeout(function(){ tryPlayBgVideo(); },500);
        setTimeout(function(){ tryPlayBgVideo(); },1500);
        setTimeout(function(){ tryPlayBgVideo(); },3000);
      } else {
        bgVideo.src='videos/AI5.mp4';
        bgVideo.muted=true; bgVideo.playsInline=true; bgVideo.volume=0;
        try{ bgVideo.load(); tryPlayBgVideo(); }catch(e){}
        setTimeout(function(){ tryPlayBgVideo(); },500);
      }
      return {};
    },
    step:function(x,w,h,s,t){ /* video plays automatically */ } },
  { id:'ai6', name:'Dark Ritual', desc:'Dark arcane purple magic background', free:true, isVideo:true,
    init:function(w,h){
      if(!bgVideo){
        bgVideo=D.createElement('video'); bgVideo.className='ppbg-live';
        bgVideo.setAttribute('autoplay',''); bgVideo.setAttribute('muted','');
        bgVideo.setAttribute('loop',''); bgVideo.setAttribute('playsinline','');
        bgVideo.setAttribute('preload','auto'); bgVideo.setAttribute('type','video/mp4');
        bgVideo.setAttribute('webkit-playsinline','');
        bgVideo.setAttribute('x5-video-player-type','h5');
        bgVideo.muted=true; bgVideo.playsInline=true; bgVideo.autoplay=true; bgVideo.volume=0;
        bgVideo.src='videos/AI6.mp4';
        D.body.insertBefore(bgVideo, D.body.firstChild);
        bgDim=D.createElement('div'); bgDim.className='ppbg-live-dim';
        D.body.insertBefore(bgDim, D.body.firstChild);
        bgVig=D.createElement('div'); bgVig.className='ppbg-live-vig';
        D.body.insertBefore(bgVig, D.body.firstChild);
        bgFade=D.createElement('div'); bgFade.className='ppbg-live-fade';
        D.body.insertBefore(bgFade, D.body.firstChild);
        initScrollFade();
        bgVideo.addEventListener('canplay',function(){ tryPlayBgVideo(); },{once:true});
        bgVideo.addEventListener('loadeddata',function(){ tryPlayBgVideo(); },{once:true});
        bgVideo.addEventListener('canplaythrough',function(){ tryPlayBgVideo(); },{once:true});
        bgVideo.addEventListener('error',function(){
          bgVideo.style.display='none';
          if(bgDim){bgDim.style.display='none';}
          if(bgVig){bgVig.style.display='none';}
          applyBg('constellation',true);
        },{once:true});
        if(bgVideo.readyState>=3) tryPlayBgVideo();
        setTimeout(function(){ tryPlayBgVideo(); },100);
        setTimeout(function(){ tryPlayBgVideo(); },500);
        setTimeout(function(){ tryPlayBgVideo(); },1500);
        setTimeout(function(){ tryPlayBgVideo(); },3000);
      } else {
        bgVideo.src='videos/AI6.mp4';
        bgVideo.muted=true; bgVideo.playsInline=true; bgVideo.volume=0;
        try{ bgVideo.load(); tryPlayBgVideo(); }catch(e){}
        setTimeout(function(){ tryPlayBgVideo(); },500);
      }
      return {};
    },
    step:function(x,w,h,s,t){ /* video plays automatically */ } },
  { id:'ai7', name:'Blood Moon', desc:'Crimson red inferno AI background', free:true, isVideo:true,
    init:function(w,h){
      if(!bgVideo){
        bgVideo=D.createElement('video'); bgVideo.className='ppbg-live';
        bgVideo.setAttribute('autoplay',''); bgVideo.setAttribute('muted','');
        bgVideo.setAttribute('loop',''); bgVideo.setAttribute('playsinline','');
        bgVideo.setAttribute('preload','auto'); bgVideo.setAttribute('type','video/mp4');
        bgVideo.setAttribute('webkit-playsinline','');
        bgVideo.setAttribute('x5-video-player-type','h5');
        bgVideo.muted=true; bgVideo.playsInline=true; bgVideo.autoplay=true; bgVideo.volume=0;
        bgVideo.src='videos/AI7.mp4';
        D.body.insertBefore(bgVideo, D.body.firstChild);
        bgDim=D.createElement('div'); bgDim.className='ppbg-live-dim';
        D.body.insertBefore(bgDim, D.body.firstChild);
        bgVig=D.createElement('div'); bgVig.className='ppbg-live-vig';
        D.body.insertBefore(bgVig, D.body.firstChild);
        bgFade=D.createElement('div'); bgFade.className='ppbg-live-fade';
        D.body.insertBefore(bgFade, D.body.firstChild);
        initScrollFade();
        bgVideo.addEventListener('canplay',function(){ tryPlayBgVideo(); },{once:true});
        bgVideo.addEventListener('loadeddata',function(){ tryPlayBgVideo(); },{once:true});
        bgVideo.addEventListener('canplaythrough',function(){ tryPlayBgVideo(); },{once:true});
        bgVideo.addEventListener('error',function(){
          bgVideo.style.display='none';
          if(bgDim){bgDim.style.display='none';}
          if(bgVig){bgVig.style.display='none';}
          applyBg('constellation',true);
        },{once:true});
        if(bgVideo.readyState>=3) tryPlayBgVideo();
        setTimeout(function(){ tryPlayBgVideo(); },100);
        setTimeout(function(){ tryPlayBgVideo(); },500);
        setTimeout(function(){ tryPlayBgVideo(); },1500);
        setTimeout(function(){ tryPlayBgVideo(); },3000);
      } else {
        bgVideo.src='videos/AI7.mp4';
        bgVideo.muted=true; bgVideo.playsInline=true; bgVideo.volume=0;
        try{ bgVideo.load(); tryPlayBgVideo(); }catch(e){}
        setTimeout(function(){ tryPlayBgVideo(); },500);
      }
      return {};
    },
    step:function(x,w,h,s,t){ /* video plays automatically */ } },
  { id:'ai8', name:'Frost Cavern', desc:'Icy teal frozen AI background', free:true, isVideo:true,
    init:function(w,h){
      if(!bgVideo){
        bgVideo=D.createElement('video'); bgVideo.className='ppbg-live';
        bgVideo.setAttribute('autoplay',''); bgVideo.setAttribute('muted','');
        bgVideo.setAttribute('loop',''); bgVideo.setAttribute('playsinline','');
        bgVideo.setAttribute('preload','auto'); bgVideo.setAttribute('type','video/mp4');
        bgVideo.setAttribute('webkit-playsinline','');
        bgVideo.setAttribute('x5-video-player-type','h5');
        bgVideo.muted=true; bgVideo.playsInline=true; bgVideo.autoplay=true; bgVideo.volume=0;
        bgVideo.src='videos/AI8.mp4';
        D.body.insertBefore(bgVideo, D.body.firstChild);
        bgDim=D.createElement('div'); bgDim.className='ppbg-live-dim';
        D.body.insertBefore(bgDim, D.body.firstChild);
        bgVig=D.createElement('div'); bgVig.className='ppbg-live-vig';
        D.body.insertBefore(bgVig, D.body.firstChild);
        bgFade=D.createElement('div'); bgFade.className='ppbg-live-fade';
        D.body.insertBefore(bgFade, D.body.firstChild);
        initScrollFade();
        bgVideo.addEventListener('canplay',function(){ tryPlayBgVideo(); },{once:true});
        bgVideo.addEventListener('loadeddata',function(){ tryPlayBgVideo(); },{once:true});
        bgVideo.addEventListener('canplaythrough',function(){ tryPlayBgVideo(); },{once:true});
        bgVideo.addEventListener('error',function(){
          bgVideo.style.display='none';
          if(bgDim){bgDim.style.display='none';}
          if(bgVig){bgVig.style.display='none';}
          applyBg('constellation',true);
        },{once:true});
        if(bgVideo.readyState>=3) tryPlayBgVideo();
        setTimeout(function(){ tryPlayBgVideo(); },100);
        setTimeout(function(){ tryPlayBgVideo(); },500);
        setTimeout(function(){ tryPlayBgVideo(); },1500);
        setTimeout(function(){ tryPlayBgVideo(); },3000);
      } else {
        bgVideo.src='videos/AI8.mp4';
        bgVideo.muted=true; bgVideo.playsInline=true; bgVideo.volume=0;
        try{ bgVideo.load(); tryPlayBgVideo(); }catch(e){}
        setTimeout(function(){ tryPlayBgVideo(); },500);
      }
      return {};
    },
    step:function(x,w,h,s,t){ /* video plays automatically */ } },
  { id:'ai9', name:'Shadow Realm', desc:'Dark emerald matrix AI background', free:true, isVideo:true,
    init:function(w,h){
      if(!bgVideo){
        bgVideo=D.createElement('video'); bgVideo.className='ppbg-live';
        bgVideo.setAttribute('autoplay',''); bgVideo.setAttribute('muted','');
        bgVideo.setAttribute('loop',''); bgVideo.setAttribute('playsinline','');
        bgVideo.setAttribute('preload','auto'); bgVideo.setAttribute('type','video/mp4');
        bgVideo.setAttribute('webkit-playsinline','');
        bgVideo.setAttribute('x5-video-player-type','h5');
        bgVideo.muted=true; bgVideo.playsInline=true; bgVideo.autoplay=true; bgVideo.volume=0;
        bgVideo.src='videos/AI9.mp4';
        D.body.insertBefore(bgVideo, D.body.firstChild);
        bgDim=D.createElement('div'); bgDim.className='ppbg-live-dim';
        D.body.insertBefore(bgDim, D.body.firstChild);
        bgVig=D.createElement('div'); bgVig.className='ppbg-live-vig';
        D.body.insertBefore(bgVig, D.body.firstChild);
        bgFade=D.createElement('div'); bgFade.className='ppbg-live-fade';
        D.body.insertBefore(bgFade, D.body.firstChild);
        initScrollFade();
        bgVideo.addEventListener('canplay',function(){ tryPlayBgVideo(); },{once:true});
        bgVideo.addEventListener('loadeddata',function(){ tryPlayBgVideo(); },{once:true});
        bgVideo.addEventListener('canplaythrough',function(){ tryPlayBgVideo(); },{once:true});
        bgVideo.addEventListener('error',function(){
          bgVideo.style.display='none';
          if(bgDim){bgDim.style.display='none';}
          if(bgVig){bgVig.style.display='none';}
          applyBg('constellation',true);
        },{once:true});
        if(bgVideo.readyState>=3) tryPlayBgVideo();
        setTimeout(function(){ tryPlayBgVideo(); },100);
        setTimeout(function(){ tryPlayBgVideo(); },500);
        setTimeout(function(){ tryPlayBgVideo(); },1500);
        setTimeout(function(){ tryPlayBgVideo(); },3000);
      } else {
        bgVideo.src='videos/AI9.mp4';
        bgVideo.muted=true; bgVideo.playsInline=true; bgVideo.volume=0;
        try{ bgVideo.load(); tryPlayBgVideo(); }catch(e){}
        setTimeout(function(){ tryPlayBgVideo(); },500);
      }
      return {};
    },
    step:function(x,w,h,s,t){ /* video plays automatically */ } },
  { id:'ai10', name:'Void Storm', desc:'Deep violet void AI background', free:true, isVideo:true,
    init:function(w,h){
      if(!bgVideo){
        bgVideo=D.createElement('video'); bgVideo.className='ppbg-live';
        bgVideo.setAttribute('autoplay',''); bgVideo.setAttribute('muted','');
        bgVideo.setAttribute('loop',''); bgVideo.setAttribute('playsinline','');
        bgVideo.setAttribute('preload','auto'); bgVideo.setAttribute('type','video/mp4');
        bgVideo.setAttribute('webkit-playsinline','');
        bgVideo.setAttribute('x5-video-player-type','h5');
        bgVideo.muted=true; bgVideo.playsInline=true; bgVideo.autoplay=true; bgVideo.volume=0;
        bgVideo.src='videos/AI10.mp4';
        D.body.insertBefore(bgVideo, D.body.firstChild);
        bgDim=D.createElement('div'); bgDim.className='ppbg-live-dim';
        D.body.insertBefore(bgDim, D.body.firstChild);
        bgVig=D.createElement('div'); bgVig.className='ppbg-live-vig';
        D.body.insertBefore(bgVig, D.body.firstChild);
        bgFade=D.createElement('div'); bgFade.className='ppbg-live-fade';
        D.body.insertBefore(bgFade, D.body.firstChild);
        initScrollFade();
        bgVideo.addEventListener('canplay',function(){ tryPlayBgVideo(); },{once:true});
        bgVideo.addEventListener('loadeddata',function(){ tryPlayBgVideo(); },{once:true});
        bgVideo.addEventListener('canplaythrough',function(){ tryPlayBgVideo(); },{once:true});
        bgVideo.addEventListener('error',function(){
          bgVideo.style.display='none';
          if(bgDim){bgDim.style.display='none';}
          if(bgVig){bgVig.style.display='none';}
          applyBg('constellation',true);
        },{once:true});
        if(bgVideo.readyState>=3) tryPlayBgVideo();
        setTimeout(function(){ tryPlayBgVideo(); },100);
        setTimeout(function(){ tryPlayBgVideo(); },500);
        setTimeout(function(){ tryPlayBgVideo(); },1500);
        setTimeout(function(){ tryPlayBgVideo(); },3000);
      } else {
        bgVideo.src='videos/AI10.mp4';
        bgVideo.muted=true; bgVideo.playsInline=true; bgVideo.volume=0;
        try{ bgVideo.load(); tryPlayBgVideo(); }catch(e){}
        setTimeout(function(){ tryPlayBgVideo(); },500);
      }
      return {};
    },
    step:function(x,w,h,s,t){ /* video plays automatically */ } },
  { id:'live', name:'Live Coder', desc:'Real person at work on a laptop', free:true, isVideo:true,
    init:function(w,h){
      if(!bgVideo){
        bgVideo=D.createElement('video'); bgVideo.className='ppbg-live';
        bgVideo.setAttribute('autoplay',''); bgVideo.setAttribute('muted','');
        bgVideo.setAttribute('loop',''); bgVideo.setAttribute('playsinline','');
        bgVideo.setAttribute('preload','auto'); bgVideo.setAttribute('type','video/mp4');
        bgVideo.setAttribute('webkit-playsinline','');
        bgVideo.setAttribute('x5-video-player-type','h5');
        bgVideo.muted=true; bgVideo.playsInline=true; bgVideo.autoplay=true; bgVideo.volume=0;
        bgVideo.src='videos/person-computer-loop.mp4';
        D.body.insertBefore(bgVideo, D.body.firstChild);
        bgDim=D.createElement('div'); bgDim.className='ppbg-live-dim';
        D.body.insertBefore(bgDim, D.body.firstChild);
        bgVig=D.createElement('div'); bgVig.className='ppbg-live-vig';
        D.body.insertBefore(bgVig, D.body.firstChild);
        bgFade=D.createElement('div'); bgFade.className='ppbg-live-fade';
        D.body.insertBefore(bgFade, D.body.firstChild);
        initScrollFade();
        /* Reliable autoplay with retries */
        bgVideo.addEventListener('canplay',function(){ tryPlayBgVideo(); },{once:true});
        bgVideo.addEventListener('loadeddata',function(){ tryPlayBgVideo(); },{once:true});
        bgVideo.addEventListener('canplaythrough',function(){ tryPlayBgVideo(); },{once:true});
        /* Handle video load error — fall back to constellation */
        bgVideo.addEventListener('error',function(){
          bgVideo.style.display='none';
          if(bgDim){bgDim.style.display='none';}
          if(bgVig){bgVig.style.display='none';}
          applyBg('constellation',true);
        },{once:true});
        if(bgVideo.readyState>=3) tryPlayBgVideo();
        setTimeout(function(){ tryPlayBgVideo(); },100);
        setTimeout(function(){ tryPlayBgVideo(); },500);
        setTimeout(function(){ tryPlayBgVideo(); },1500);
        setTimeout(function(){ tryPlayBgVideo(); },3000);
      } else {
        bgVideo.src='videos/person-computer-loop.mp4';
        bgVideo.muted=true; bgVideo.playsInline=true; bgVideo.volume=0;
        try{ bgVideo.load(); tryPlayBgVideo(); }catch(e){}
        setTimeout(function(){ tryPlayBgVideo(); },500);
      }
      return {};
    },
    step:function(x,w,h,s,t){ /* video plays automatically — nothing to draw on canvas */ } }
];

function isProUser(){ try{ return (typeof isPro!=='undefined') && !!isPro; }catch(e){ return false; } }
function bgById(id){ for(var i=0;i<BGS.length;i++) if(BGS[i].id===id) return BGS[i]; return BGS[0]; }
/* Helper: reliably play background video with retries */
var bgPlayAttempts=0;
function tryPlayBgVideo(){
  if(!bgVideo) return;
  if(!bgVideo.paused && !bgVideo.ended) return;
  if(bgPlayAttempts>10) return;
  bgPlayAttempts++;
  try{
    bgVideo.muted=true;
    bgVideo.volume=0;
    var p=bgVideo.play();
    if(p&&p.then) p.catch(function(){
      /* Retry after a short delay with forced muted */
      setTimeout(function(){
        if(bgVideo && bgVideo.paused){
          bgVideo.muted=true;
          bgVideo.volume=0;
          bgVideo.play().catch(function(){
            /* Final retry — reload the video src */
            setTimeout(function(){
              if(bgVideo && bgVideo.paused){
                var curSrc=bgVideo.src;
                bgVideo.removeAttribute('src');
                bgVideo.src=curSrc;
                bgVideo.muted=true;
                bgVideo.volume=0;
                bgVideo.play().catch(function(){});
              }
            },800);
          });
        }
      },500);
    });
  }catch(e){}
}

function startBg(){
  bgC = D.createElement('canvas'); bgC.id='ppbg';
  bgC.style.transition='opacity .6s';
  D.body.insertBefore(bgC, D.body.firstChild);
  bgX = bgC.getContext('2d');
  sizeBg();
  addEventListener('resize', function(){ sizeBg(); if(bgDef) bgS = bgDef.init(bgC.width,bgC.height); });
  /* Every visit: randomly pick from AI1-AI10 as default background */
  applyBg(['ai1','ai2','ai3','ai4','ai5','ai6','ai7','ai8','ai9','ai10'][Math.floor(Math.random()*10)], true);
  var t0 = Date.now();
  (function frame(){
    var t=(Date.now()-t0)/1000;
    if(bgDef && bgDef.step && !bgDef.isVideo) bgDef.step(bgX,bgC.width,bgC.height,bgS,t);
    if(!bgReduce) requestAnimationFrame(frame);
  })();
  /* On first user interaction, try to play background video (browsers may block autoplay until interaction) */
  function onFirstInteraction(){
    tryPlayBgVideo();
    D.removeEventListener('click',onFirstInteraction);
    D.removeEventListener('keydown',onFirstInteraction);
    D.removeEventListener('touchstart',onFirstInteraction);
  }
  D.addEventListener('click',onFirstInteraction);
  D.addEventListener('keydown',onFirstInteraction);
  D.addEventListener('touchstart',onFirstInteraction);
}
function sizeBg(){ bgC.width=innerWidth; bgC.height=innerHeight; }
function initScrollFade(){
  if(bgScrollListener) return;
  bgScrollListener=true;
  function onScroll(){
    var sy=window.pageYOffset||document.documentElement.scrollTop||0;
    var vh=window.innerHeight;
    var heroH=vh*0.8;
    var fadeRatio=Math.min(1, Math.max(0, sy/heroH));
    if(bgFade){
      bgFade.style.opacity=fadeRatio;
      bgFade.style.display=fadeRatio>0.01?'block':'none';
    }
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
}
function setVideoBg(on){
  if(bgVideo) bgVideo.classList.toggle('on', on);
  if(bgDim) bgDim.classList.toggle('on', on);
  if(bgVig) bgVig.classList.toggle('on', on);
  if(bgC) bgC.style.opacity = on ? '0' : '1';
  if(bgFade){
    if(!on){ bgFade.style.opacity='0'; bgFade.style.display='none'; }
    else{
      var sy=window.pageYOffset||document.documentElement.scrollTop||0;
      var vh=window.innerHeight;
      var heroH=vh*0.8;
      var fadeRatio=Math.min(1, Math.max(0, sy/heroH));
      bgFade.style.opacity=fadeRatio;
      bgFade.style.display=fadeRatio>0.01?'block':'none';
    }
  }
}
function applyBg(id, silent){
  var def = bgById(id);
  if(!def.free && !isProUser()){
    if(!silent) ppToast(ppT('bg.pro.only'));
    def = BGS[0];
  }
  var wasVideo = bgDef && bgDef.isVideo;
  bgDef = def;
  bgS = def.init(bgC.width, bgC.height);
  ls('pp_bg', def.id);
  if(def.isVideo){ setVideoBg(true); }
  else { setVideoBg(false); if(wasVideo) bgX.clearRect(0,0,bgC.width,bgC.height); }
  if(bgPanel && bgPanel.classList.contains('show')) paintBgPanel();
}

/* background picker button + modal */
var bgBtn, bgPanel;
function buildBgBtn(){
  var bar = D.querySelector('.hbtns');
  if(!bar) return;
  bgBtn = D.createElement('button');
  bgBtn.className = 'pp-chip';
  bgBtn.title = ppT('bg.choose');
  bgBtn.textContent = '🎨';
  bgBtn.addEventListener('click', openBgPicker);
  if(chip && chip.nextSibling) bar.insertBefore(bgBtn, chip.nextSibling);
  else bar.insertBefore(bgBtn, bar.firstChild);
}
function openBgPicker(){
  if(!bgPanel){
    bgPanel = D.createElement('div');
    bgPanel.className = 'overlay'; bgPanel.id='ppBgPanel';
    bgPanel.innerHTML = '<div class="modal sm"><button class="x" id="ppBgX">&times;</button>'
      + '<h2>'+esc(ppT('bg.title'))+'</h2><div class="desc" id="ppBgDesc"></div>'
      + '<div class="ppbg-grid" id="ppBgGrid"></div></div>';
    D.body.appendChild(bgPanel);
    D.getElementById('ppBgX').addEventListener('click',function(){ bgPanel.classList.remove('show'); });
    bgPanel.addEventListener('click',function(e){ if(e.target===bgPanel) bgPanel.classList.remove('show'); });
  }
  paintBgPanel();
  bgPanel.classList.add('show');
}
function paintBgPanel(){
  var pro = isProUser();
  D.getElementById('ppBgDesc').textContent = pro
    ? ppT('bg.desc.pro')
    : ppT('bg.desc.free');
  var grid = D.getElementById('ppBgGrid'), cur = (bgDef&&bgDef.id)||'constellation';
  grid.innerHTML = BGS.map(function(b){
    var locked = !b.free && !pro, on = b.id===cur;
    return '<div class="ppbg-card'+(on?' on':'')+(locked?' lock':'')+'" data-bg="'+b.id+'">'
      + '<div class="ppbg-sw sw-'+b.id+'"></div>'
      + '<div class="ppbg-nm">'+esc(getBgName(b))+(locked?' 🔒':'')+(on?' ✓':'')+'</div>'
      + '<div class="ppbg-ds">'+esc(getBgDesc(b))+'</div></div>';
  }).join('');
  Array.prototype.forEach.call(grid.querySelectorAll('[data-bg]'), function(card){
    card.addEventListener('click', function(){
      var id=card.getAttribute('data-bg'), b=bgById(id);
      if(!b.free && !isProUser()){ ppToast(ppT('bg.pro.only')); return; }
      applyBg(id);
      ppToast(ppT('bg.set').replace('{name}',getBgName(b)));
      paintBgPanel();
    });
  });
}
window.PPBg = { open:openBgPicker, apply:applyBg, _bgs:BGS };

/* ---------------------------------------------------- hero AI-chat demo */
var DEMO = [
  { q:'Write a cold email to a potential client',
    a:'Subject: A quick idea for {Company}\n\nHi Alex — noticed your team just launched X. Here is one way to…' },
  { q:'Plan a 5-day trip to Japan on a budget',
    a:'Day 1 — Tokyo: Asakusa + street food. Day 2 — day trip to Nikko…\nRough budget: flights, stays, rail pass…' },
  { q:'Explain compound interest like I am new',
    a:'Picture a snowball rolling downhill — it grows faster the bigger it gets. Your money does the same…' },
  { q:'Make this resume line sound stronger',
    a:'"Managed a team" becomes "Led a 6-person team to ship 3 products, cutting costs 20%."' },
  { q:'Write a product description for an eco water bottle',
    a:'Meet the bottle that gives back — 100% recycled stainless steel, keeps drinks cold 24h…' },
  { q:'Summarize this 3-page report in 5 bullet points',
    a:'• Revenue up 12% YoY  • Customer churn dropped to 3.2%  • New market: Southeast Asia…' },
  { q:'Draft a follow-up email after a job interview',
    a:'Hi Sarah — thank you for the conversation today. I enjoyed learning about the team…' },
  { q:'Create a weekly meal plan for a vegetarian diet',
    a:'Monday: chickpea curry + brown rice. Tuesday: black-bean tacos with mango salsa…' },
  { q:'Turn these meeting notes into action items',
    a:'1. @Alex: finalize API spec by Friday  2. @Mia: schedule user-testing session…' },
  { q:'Write a social media caption for a sunset photo',
    a:'Golden hour, golden vibes. Where the sky paints its own masterpiece…' },
  { q:'Explain blockchain to a 10-year-old',
    a:'Imagine a notebook that everyone can read but nobody can erase — every page is permanent…' },
  { q:'Write a Python function that sorts a list of dictionaries by a key',
    a:'def sort_by_key(items, key):\n  return sorted(items, key=lambda x: x[key])' },
  { q:'Draft an apology email for a delayed shipment',
    a:'Dear customer — your order is running 2 days late due to a logistics issue. We have…' },
  { q:'Brainstorm 10 name ideas for a pet-sitting app',
    a:'1. PawStay  2. FidoWatch  3. PetNest  4. CritterCare  5. WhiskerKeep…' },
  { q:'Rewrite this paragraph in a professional tone',
    a:'Original: "The thing is kinda hard to use." → Revised: "The current interface presents…' },
  { q:'Create a workout plan for a beginner at home',
    a:'Week 1 — 3 days/week: 10 squats, 10 push-ups (knee OK), 30s plank, 15 lunges…' },
  { q:'Write a LinkedIn post about a career change into tech',
    a:'Six months ago I could not write a line of code. Today I shipped my first app…' },
  { q:'Compare GPT-4, Claude, and Gemini for coding tasks',
    a:'GPT-4: strong at complex reasoning, verbose. Claude: careful, great at refactoring…' },
  { q:'Translate "thank you for your patience" into 5 languages',
    a:'French: Merci pour votre patience  Spanish: Gracias por su paciencia…' },
  { q:'Write a short poem about the ocean at night',
    a:'The tide whispers secrets to the shore, moonlight dances on waves…' },
  { q:'Help me outline a 10-slide pitch deck for a startup',
    a:'Slide 1: Hook + vision  2: Problem  3: Solution  4: Demo  5: Market size…' }
];
function getDemoTitle(){ return ppT('demo.title'); }
function getDemoQ(idx){ return ppT('demo.q'+(idx+1), DEMO[idx%DEMO.length].q); }
function getDemoA(idx){ return ppT('demo.a'+(idx+1), DEMO[idx%DEMO.length].a); }
function startDemo(){
  var host = elById('heroFx');
  if(!host) return;
  host.innerHTML =
    '<div class="ppchat"><div class="ppchat-bar">'
    +'<i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i>'
    +'<span>'+esc(getDemoTitle())+'</span>'
    +'<span class="live"><b></b>live</span></div>'
    +'<div class="ppchat-body" id="ppchatBody"></div></div>';
  var body = elById('ppchatBody'), idx = 0;
  function typeInto(el, text, speed, done){
    var i=0, car=D.createElement('span'); car.className='ppcaret';
    el.appendChild(car);
    (function tick(){
      if(i<text.length){
        car.insertAdjacentText('beforebegin', text.charAt(i));
        i++; setTimeout(tick, speed);
      }else{ if(car.parentNode) car.parentNode.removeChild(car); if(done) done(); }
    })();
  }
  function round(){
    body.innerHTML='';
    var i = idx % DEMO.length; idx++;
    var u = D.createElement('div'); u.className='ppmsg u'; body.appendChild(u);
    typeInto(u, getDemoQ(i), 38, function(){
      setTimeout(function(){
        var a = D.createElement('div'); a.className='ppmsg a';
        a.innerHTML='<span class="ppdots"><i></i><i></i><i></i></span>';
        body.appendChild(a);
        setTimeout(function(){
          a.innerHTML='';
          typeInto(a, getDemoA(i), 20, function(){ setTimeout(round, 2600); });
        }, 1100);
      }, 420);
    });
  }
  round();
}

/* ---------------------------------------------------- header chip */
var chip;
function buildChip(){
  var bar = D.querySelector('.hbtns');
  if(!bar) return;
  chip = D.createElement('button');
  chip.className = 'pp-chip';
  chip.title = 'Your progress & rewards';
  chip.addEventListener('click', openPanel);
  bar.insertBefore(chip, bar.firstChild);
  paintChip();
}
function paintChip(){
  if(!chip) return;
  var l = game.lvl, f = xpFloor(l), nx = xpFloor(l+1);
  var pct = Math.max(0, Math.min(100, ((game.xp-f)/(nx-f))*100));
  chip.innerHTML = '<span class="lv">⚡ Lv '+l+'</span>'
    + '<span class="xpmini"><i style="width:'+pct+'%"></i></span>';
  chip.title = 'Level '+l+' · '+levelTitle(l)+' ('+getRankName(l)+') — open your progress';
}

/* ---------------------------------------------------- rewards modal */
var panel;
function buildPanel(){
  panel = D.createElement('div');
  panel.className = 'overlay';
  panel.id = 'ppPanel';
  panel.innerHTML = '<div class="modal sm"><button class="x" id="ppPanelX">&times;</button>'
    + '<h2>Your progress</h2>'
    + '<div class="desc">Earn XP every time you use PromptRunic. Signed in? It syncs across your devices.</div>'
    + '<div id="ppPanelBody"></div></div>';
  D.body.appendChild(panel);
  elById('ppPanelX').addEventListener('click', closePanel);
  panel.addEventListener('click', function(e){ if(e.target===panel) closePanel(); });
}
function closePanel(){ if(panel) panel.classList.remove('show'); }
function openPanel(){
  if(!panel) buildPanel();
  paintPanel();
  panel.classList.add('show');
}
function paintPanel(){
  var body = elById('ppPanelBody');
  if(!body) return;
  var l=game.lvl, f=xpFloor(l), nx=xpFloor(l+1);
  var pct = Math.max(0, Math.min(100, ((game.xp-f)/(nx-f))*100));
  var dp = dailyPrompt();
  var dDone = (game.dDay===dayStr(0));
  var unlocked = game.ach.length;
  var rk=rankOf(l), ttl=levelTitle(l);
  var unEmoji=EMOJIS.filter(function(e){return l>=e[1];}).length;

  var h = '<div class="lvrow"><div class="lvbadge" style="background:linear-gradient(135deg,'+rk.color+',var(--accent2))">'+l+'</div>'
    + '<div style="flex:1"><div style="font-size:13.5px;font-weight:700">'+esc(ttl)
    + '<span class="rankpill" style="border-color:'+rk.color+';color:'+rk.color+'">'+esc(getRankName(l))+'</span></div>'
    + '<div style="font-size:11px;color:var(--muted)">Level '+l+' · '+game.xp+' XP total</div>'
    + '<div class="xpbar"><i style="width:'+pct+'%"></i></div>'
    + '<div style="font-size:11px;color:var(--muted)">'+(nx-game.xp)+' XP to Level '+(l+1)+'</div></div></div>';

  h += '<div class="statpills">'
    + '<div class="statpill"><b>🔥 '+(game.streak||0)+'</b><span>day streak</span></div>'
    + '<div class="statpill"><b>'+game.best+'</b><span>best streak</span></div>'
    + '<div class="statpill"><b>'+unlocked+'/'+ACH.length+'</b><span>badges</span></div></div>';

  h += '<div class="dchal"><h4>🎯 Daily challenge'+(dDone?' — done ✅':'')+'</h4>'
    + '<p>'+(dDone
        ? 'Nice — come back tomorrow for a new one. (+'+XP.daily+' XP earned)'
        : 'Open today\'s featured prompt to earn +'+XP.daily+' XP:')+'</p>';
  if(dp && !dDone){
    h += '<button class="mbtn mbtn-primary" id="ppDaily">Open: '+esc(dp.title)+'</button>';
  }
  h += '</div>';

  h += '<div style="font-size:12px;font-weight:700;color:var(--muted);margin:14px 0 2px">ACHIEVEMENTS · '+unlocked+'/'+ACH.length+'</div>';
  h += '<div class="achgrid">' + ACH.map(function(a){
    var on = game.ach.indexOf(a.id)>=0;
    return '<div class="ach'+(on?' on':'')+'"><div class="ic">'+a.ic+'</div>'
      + '<div class="nm">'+esc(getAchNm(a))+'</div><div class="ds">'+esc(on?getAchNm(a)+' — unlocked':getAchDs(a))+'</div></div>';
  }).join('') + '</div>';

  h += '<div style="font-size:12px;font-weight:700;color:var(--muted);margin:14px 0 2px">EMOJI COLLECTION · '+unEmoji+'/'+EMOJIS.length+'</div>';
  h += '<div class="emojicol">' + EMOJIS.map(function(e){
    var on = l>=e[1];
    return '<span class="emo'+(on?'':' lk')+'" title="'+(on?'Unlocked':'Unlocks at level '+e[1])+'">'+(on?e[0]:'🔒')+'</span>';
  }).join('') + '</div>';
  h += '<div style="font-size:11px;color:var(--muted);margin-top:5px">Level up to unlock more emojis — use them as a mood on any prompt.</div>';

  body.innerHTML = h;
  var db = elById('ppDaily');
  if(db) db.addEventListener('click', function(){
    closePanel();
    if(typeof window.openPrompt==='function' && dp) window.openPrompt(dp.id);
  });
}

/* ---------------------------------------------------- public API + refresh */
function refresh(){ paintChip(); if(panel && panel.classList.contains('show')) paintPanel(); }

window.PPGame = {
  award: award,
  exportState: function(){ return clone(game); },
  importState: function(obj){ game = mergeGame(game, obj||{}); save(); refresh(); },
  /* Switch the game storage to a specific user (or guest if uid is null).
   * Reloads game state from the appropriate localStorage key. */
  setUserId: function(uid){
    _gameUid = uid || null;
    game = clone(DEF);
    try{
      var saved = JSON.parse(lg(_gameKey())||'{}');
      game = mergeGame(game, saved);
    }catch(e){}
    save(); refresh();
  },
  /* Get the current game localStorage key (for external use) */
  getGameKey: function(){ return _gameKey(); },
  /* Reset game state to defaults (used on logout/account switch) */
  resetToDefaults: function(){
    game = clone(DEF);
    save(); refresh();
  },
  openPanel: openPanel,
  openProfile: function(){ openProfile(); },
  paintProfile: function(){ paintProfile(); },
  refresh: refresh,
  dailyId: dailyId,
  avatarSVG: function(i){ return avatarSVG(i); },
  rankOf: rankOf,
  levelTitle: levelTitle,
  getRankName: getRankName,
  addCoins: function(n){
    n = Math.max(0, n|0);
    game.coins = (game.coins||0) + n;
    save(); refresh();
    try{ paintArcadeBtn(); }catch(e){}
    if(n>0){ try{ confetti(); ppToast('+'+n+' 🪙 added to your balance'); }catch(e){} }
  },
  setGameScore: function(n){
    n = Math.max(0, n|0);
    game.gameScore = Math.max(game.gameScore||0, n);
    checkAch(); save(); refresh();
  },
  setGameTime: function(n){
    n = Math.max(0, n|0);
    if(!n) return;
    /* lower is better — keep the fastest clear */
    game.gameTime = game.gameTime > 0 ? Math.min(game.gameTime, n) : n;
    checkAch(); save(); refresh();
  }
};

/* ---------------------------------------------------- feedback modal */
var fbPanel;
function buildFeedback(){
  var bar=D.createElement('div'); bar.className='pp-bbar';
  bar.innerHTML='<button class="pp-bbtn" id="ppFbBtn" title="Send feedback to the PromptRunic team">💬 Feedback</button>'
    +'<button class="pp-bbtn" id="ppTopBtn" title="Back to top">↑ Back to top</button>';
  /* Mount inside the page footer (above the legal copy) instead of floating. */
  var ftr=D.querySelector('footer');
  if(ftr) ftr.insertBefore(bar, ftr.firstChild);
  else    D.body.appendChild(bar);
  elById('ppFbBtn').addEventListener('click', openFeedback);
  elById('ppTopBtn').addEventListener('click', function(){
    try{ window.scrollTo({top:0,behavior:'smooth'}); }
    catch(e){ window.scrollTo(0,0); }
  });
}
function openFeedback(){
  if(!fbPanel){
    fbPanel=D.createElement('div');
    fbPanel.className='overlay'; fbPanel.id='ppFbPanel';
    fbPanel.innerHTML='<div class="modal sm"><button class="x" id="ppFbX">&times;</button>'
      +'<h2>Send feedback</h2>'
      +'<div class="desc">Found a bug, have an idea, or just want to say hi? We read every message.</div>'
      +'<div id="ppFbForm">'
      +'<div class="field"><label>Your message</label><textarea id="ppFbText" placeholder="Tell us what you think..."></textarea></div>'
      +'<div class="field"><label>Your email (optional, so we can reply)</label><input id="ppFbEmail" type="email" placeholder="you@example.com" /></div>'
      +'<button class="mbtn mbtn-primary" id="ppFbSend" style="width:100%">Send feedback</button>'
      +'<div class="msg" id="ppFbMsg"></div></div></div>';
    D.body.appendChild(fbPanel);
    elById('ppFbX').addEventListener('click',function(){ fbPanel.classList.remove('show'); });
    fbPanel.addEventListener('click',function(e){ if(e.target===fbPanel) fbPanel.classList.remove('show'); });
    elById('ppFbSend').addEventListener('click', sendFeedback);
  }
  var form=elById('ppFbForm');
  form.style.display='';
  elById('ppFbText').value='';
  var em=elById('ppFbEmail'); em.value='';
  try{ if(window.firebase && firebase.auth && firebase.auth().currentUser) em.value=firebase.auth().currentUser.email||''; }catch(e){}
  var msg=elById('ppFbMsg'); msg.className='msg'; msg.textContent='';
  fbPanel.classList.add('show');
}
function thankYou(){
  elById('ppFbForm').innerHTML='<div style="text-align:center;padding:16px 4px">'
    +'<div style="font-size:40px">🙏</div>'
    +'<div style="font-size:15px;font-weight:700;margin-top:8px">Thank you for your valuable feedback!</div>'
    +'<div style="font-size:13px;color:var(--muted);margin-top:6px">We truly appreciate your use and support of PromptRunic.</div>'
    +'<button class="mbtn mbtn-ghost" id="ppFbClose" style="margin-top:14px">Close</button></div>';
  elById('ppFbClose').addEventListener('click',function(){ fbPanel.classList.remove('show'); });
}
function fbMailto(txt,email){
  try{
    location.href='mailto:zongxie22@gmail.com?subject='+encodeURIComponent('PromptRunic feedback')
      +'&body='+encodeURIComponent(txt+(email?('\n\nFrom: '+email):''));
  }catch(e){}
}
function sendFeedback(){
  var txt=(elById('ppFbText').value||'').trim();
  var email=(elById('ppFbEmail').value||'').trim();
  var msg=elById('ppFbMsg'); msg.style.display='block';
  if(!txt){ msg.className='msg err'; msg.textContent='Please write a message first.'; return; }
  var btn=elById('ppFbSend'); btn.disabled=true;
  msg.className='msg'; msg.textContent='Sending…';
  var handled=false;
  try{
    if(window.firebase && firebase.apps && firebase.apps.length){
      handled=true;
      firebase.firestore().collection('feedback').add({
        message:txt, email:email||null,
        page:(location&&location.href)||'',
        at:firebase.firestore.FieldValue.serverTimestamp()
      }).then(thankYou).catch(function(){ fbMailto(txt,email); thankYou(); });
    }
  }catch(e){ handled=false; }
  if(!handled){ fbMailto(txt,email); thankYou(); }
}

/* ---------------------------------------------------- boot */
function boot(){
  startBg();
  startDemo();
  buildChip();
  buildBgBtn();
  buildFeedback();
  checkIn();
  refresh();
}
/* ============================ ARCADE: coins · online time · 100 avatars · safe battle ============================ */
var ARCSS=''
+'.arc-sec{font-size:12px;font-weight:700;color:var(--muted);margin:16px 0 6px}'
+'.arc-top{display:flex;align-items:center;gap:12px;background:var(--panel2);border:1px solid var(--border);border-radius:12px;padding:12px}'
+'.arc-av{width:54px;height:54px;border-radius:13px;overflow:hidden;flex-shrink:0;border:1px solid var(--border)}'
+'.arc-av svg{width:100%;height:100%;display:block}'
+'.arc-stat b{font-size:16px}.arc-stat span{font-size:11px;color:var(--muted)}'
+'.avgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(52px,1fr));gap:6px;max-height:236px;overflow-y:auto;padding:2px}'
+'.avcell{position:relative;border-radius:10px;overflow:hidden;cursor:pointer;border:2px solid transparent;aspect-ratio:1}'
+'.avcell svg{width:100%;height:100%;display:block}'
+'.avcell.on{border-color:var(--accent)}'
+'.avcell.lk::after{content:"";position:absolute;inset:0;background:rgba(4,7,14,.66)}'
+'.avcell .tag2{position:absolute;left:0;right:0;bottom:0;font-size:8px;font-weight:800;text-align:center;z-index:2;color:#fff;padding:1px 0}'
+'.avcell .tag2.pro{background:rgba(245,185,66,.92);color:#1a1205}'
+'.avcell .tag2.lvl{background:rgba(34,211,238,.9);color:#04212b}'
+'.avcell .tag2.coin{background:rgba(124,92,255,.92)}'
+'.bq{background:var(--panel2);border:1px solid var(--border);border-radius:11px;padding:13px;margin-top:6px}'
+'.bq h4{font-size:13px;margin-bottom:8px}'
+'.bq-opt{display:block;width:100%;text-align:left;margin:5px 0;padding:9px 11px;border-radius:8px;border:1px solid var(--border);background:var(--panel);color:var(--text);font-size:12.5px;cursor:pointer}'
+'.bq-opt:hover{border-color:var(--accent)}'
+'.bq-score{display:flex;justify-content:space-around;font-size:12px;font-weight:700;margin-bottom:8px}'
+'.cpack{display:flex;align-items:center;justify-content:space-between;gap:8px;background:var(--panel2);border:1px solid var(--border);border-radius:9px;padding:9px 11px;margin:6px 0}'
+'.cpack b{font-size:13px}.cpack span{font-size:11px;color:var(--muted)}';
(function(){ var s=D.createElement('style'); s.textContent=ARCSS; D.head.appendChild(s); })();

if(!Array.isArray(game.ava)) game.ava=[];

/* ---- 200 app-icon style avatars (gradient tile + glyph) ---- */
var AV_EMOJI=['🤖','🧠','✨','🚀','⭐','🔥','💡','🎮','🕹️','👾','🎯','🏆','👑','💎','🦄','🐉','🔮','⚡','🌈','🎨','🎸','🎲','🧩','🔑','🛡️','⚔️','🏅','🥇','🌟','💫','☄️','🪐','🌌','🛸','🧬','⚗️','🔬','📡','🛰️','🔋','💠','🦅','🦁','🐯','🐺','🦉','🐢','🐙','🦖','🦊','🐼','🐱','🦋','🐝','🦇','🐧','🦜','🦚','🪲','🌵','🍄','🌊','❄️','☀️','🌙','🍀','🌻','🌸','💥','🎆','🎇','🧨','🪄','🎃','👻','💀','🤡','🦾','👁️','🧿','🔱','⚜️','🎴','🃏','🎰','⏳','🧭','🗺️','📿','🪙','⚙️','🧲','🎧','📚','💻','🌐','🐳','🦈','🦩','🐲','🍔','🍟','🌮','🌯','🍣','🍱','🍜','🍝','🍤','🍩','🍪','🍰','🧁','🥐','🥑','🍇','🍓','🍒','🍑','🍍','🥥','🍉','🥝','🥭','🌶️','🥕','🌽','🥦','🥨','🍫','🧋','🍷','🍺','🍹','🎂','🏀','⚽','🏈','⚾','🎾','🏐','🎱','🏓','🏸','🥊','⛳','🏹','🎣','🎽','🛹','🛼','⛸️','🎿','🏂','🪂','🚁','🛩️','✈️','🚂','🚕','🚜','🚓','🚒','🚑','🚲','🛵','🏍️','🚤','⛵','🚢','🛥️','🚆','🛺','🛞','🌍','🌎','🌏','🗻','🏔️','🌋','🏕️','🏝️','🌅','🌄','🌠','🌇','🌆','🌃','🌉','🌁','🌫️','🍞','🍯','🍨','🍵','🥛','🥗','🥪','🌷','🌹'];
var _avg=0;
function avatarSVG(i){
  i=((i%200)+200)%200;
  var emo = AV_EMOJI[i] || '⭐';
  var h1=(i*47)%360, h2=(i*47+105)%360, gid='av'+(_avg++);
  /* ---- FREE (i<15): plain flat tile ---- */
  if(i<15){
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
      +'<rect width="64" height="64" rx="13" fill="hsl('+h1+',45%,55%)"/>'
      +'<text x="32" y="35" font-size="32" text-anchor="middle" dominant-baseline="central">'+emo+'</text>'
      +'</svg>';
  }
  /* ---- PRO (i<50): clean gradient + soft border ---- */
  if(i<50){
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
      +'<defs><linearGradient id="'+gid+'" x1="0" y1="0" x2="1" y2="1">'
      +'<stop offset="0" stop-color="hsl('+h1+',75%,62%)"/>'
      +'<stop offset="1" stop-color="hsl('+h2+',70%,42%)"/></linearGradient></defs>'
      +'<rect x="1.5" y="1.5" width="61" height="61" rx="14" fill="url(#'+gid+')" stroke="rgba(255,255,255,0.35)" stroke-width="1.4"/>'
      +'<rect x="1.5" y="1.5" width="61" height="28" rx="14" fill="#fff" opacity="0.10"/>'
      +'<text x="32" y="35" font-size="31" text-anchor="middle" dominant-baseline="central">'+emo+'</text>'
      +'</svg>';
  }
  /* ---- LEVEL (i<125): bold diagonal accent + neon outline ---- */
  if(i<125){
    var h3=(h1+60)%360;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
      +'<defs><linearGradient id="'+gid+'" x1="0" y1="0" x2="1" y2="1">'
      +'<stop offset="0" stop-color="hsl('+h1+',85%,58%)"/>'
      +'<stop offset="1" stop-color="hsl('+h2+',80%,36%)"/></linearGradient></defs>'
      +'<rect width="64" height="64" rx="14" fill="url(#'+gid+')"/>'
      +'<polygon points="0,42 64,8 64,22 0,56" fill="hsl('+h3+',95%,75%)" opacity="0.30"/>'
      +'<rect x="1" y="1" width="62" height="62" rx="13" fill="none" stroke="hsl('+h3+',95%,75%)" stroke-width="1.3" opacity="0.85"/>'
      +'<text x="32" y="35" font-size="31" text-anchor="middle" dominant-baseline="central">'+emo+'</text>'
      +'</svg>';
  }
  /* ---- COIN (i>=125): luxurious. Tier scales with price band. ---- */
  var ci = i - 125;
  var tier = ci<25 ? 1 : ci<50 ? 2 : 3;
  var ring1 = '<rect x="3.5" y="3.5" width="57" height="57" rx="12" fill="none" stroke="#ffd700" stroke-width="1.3" opacity="0.85"/>';
  var ring2 = tier>=2 ? '<rect x="7" y="7" width="50" height="50" rx="10" fill="none" stroke="#ffffff" stroke-width="0.8" opacity="0.55"/>' : '';
  var outerGlow = tier>=2 ? '<circle cx="32" cy="32" r="31" fill="none" stroke="hsl('+((h1+30)%360)+',95%,72%)" stroke-width="1.0" opacity="0.60"/>' : '';
  var crown = tier===3 ? '<polygon points="22,10 26,4 32,11 38,4 42,10 40,15 24,15" fill="#ffd700" stroke="#b8860b" stroke-width="0.5" opacity="0.95"/>' : '';
  var spk = tier===1
    ? '<text x="51" y="15" font-size="10" fill="#fff" opacity="0.9">✦</text>'
    : tier===2
    ? '<text x="51" y="15" font-size="11" fill="#fff" opacity="0.95">✦</text><text x="11" y="58" font-size="9" fill="#fff" opacity="0.85">✧</text>'
    : '<text x="51" y="15" font-size="12" fill="#fff" opacity="0.95">✦</text><text x="11" y="15" font-size="10" fill="#fff" opacity="0.85">✧</text><text x="51" y="58" font-size="10" fill="#fff" opacity="0.85">✧</text><text x="11" y="58" font-size="11" fill="#fff" opacity="0.95">✦</text>';
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
    +'<defs><radialGradient id="'+gid+'" cx="0.3" cy="0.3" r="0.95">'
    +'<stop offset="0" stop-color="hsl('+h1+',95%,72%)"/>'
    +'<stop offset="0.55" stop-color="hsl('+h1+',88%,52%)"/>'
    +'<stop offset="1" stop-color="hsl('+h2+',82%,28%)"/></radialGradient></defs>'
    +outerGlow
    +'<rect width="64" height="64" rx="16" fill="url(#'+gid+')"/>'
    +ring1+ring2+crown
    +'<text x="32" y="' + (tier===3?40:36) + '" font-size="' + (tier===3?27:30) + '" text-anchor="middle" dominant-baseline="central">'+emo+'</text>'
    +spk
    +'</svg>';
}
function avatarStatus(i){
  if(i<15) return {type:'free',locked:false};
  if(i<50) return {type:'pro',locked:!isProUser()};
  if(i<125){ var req=5+(i-50)*2; return {type:'lvl',req:req,locked:(game.lvl||1)<req}; }
  var cost=300+(i-125)*200;
  return {type:'coin',req:cost,locked:game.ava.indexOf(i)<0};
}

/* ---- online-time XP (capped, anti-AFK) ---- */
function startTimer(){
  setInterval(function(){
    if(D.hidden) return;
    var t=dayStr(0);
    if(game.tDay!==t){ game.tDay=t; game.tToday=0; }
    if((game.tToday||0) < 40){
      game.tToday=(game.tToday||0)+1;
      game.cnt.tmin=(game.cnt.tmin||0)+1;
      addXp(4,'+4 XP · time');
    } else { save(); }
    paintArcadeBtn();
  }, 60000);
}

/* ---- header coin button ---- */
var arcBtn, arcPanel;
function buildArcadeBtn(){
  /* Reuse the existing #coinBtn in the header instead of creating a duplicate.
   * The #coinBtn already shows 🪙 + coin count and has its own click handler. */
  arcBtn = elById('coinBtn');
  if(!arcBtn) return;
  /* Ensure clicking the existing coinBtn opens the arcade panel */
  arcBtn.removeEventListener('click', arcBtn._prevArcadeClick);
  arcBtn._prevArcadeClick = function(e){
    e.stopPropagation();
    openArcade();
  };
  arcBtn.addEventListener('click', arcBtn._prevArcadeClick);
  paintArcadeBtn();
}
function paintArcadeBtn(){
  /* Update the existing coinBtn's count display */
  var countEl = elById('coinBtnCount');
  if(countEl) countEl.textContent = ' '+(game.coins||0);
}

/* ---- arcade panel ---- */
function openArcade(){
  if(!arcPanel){
    arcPanel=D.createElement('div');
    arcPanel.className='overlay'; arcPanel.id='ppArcade';
    arcPanel.innerHTML='<div class="modal sm"><button class="x" id="ppArcX" data-close>&times;</button>'
      +'<h2>Arcade</h2><div class="desc">Earn coins by levelling up, staying active and winning battles. Spend them on avatars.</div>'
      +'<div id="ppArcBody"></div></div>';
    D.body.appendChild(arcPanel);
    elById('ppArcX').addEventListener('click',function(){ arcPanel.classList.remove('show'); });
    arcPanel.addEventListener('click',function(e){ if(e.target===arcPanel) arcPanel.classList.remove('show'); });
  }
  paintArcade();
  arcPanel.classList.add('show');
}
function paintArcade(){
  var b=elById('ppArcBody'); if(!b) return;
  var av=game.avatar||0;
  var h='<div class="arc-top"><div class="arc-av">'+avatarSVG(av)+'</div>'
    +'<div style="flex:1"><div class="arc-stat"><b>🪙 '+(game.coins||0)+'</b> <span>coins</span></div>'
    +'<div style="font-size:11px;color:var(--muted);margin-top:2px">Win duels and level up to earn coins. Change your avatar in Account.</div></div></div>';

  h+='<div class="arc-sec">⚔️ PROMPT DUEL</div>';
  var today=dayStr(0);
  var duelsLeft=game.duelDay===today ? Math.max(0, 3-(game.duelN||0)) : 3;
  h+='<div class="bq"><h4>Beat the AI bot in a 5-round prompt quiz</h4>'
    +'<p style="font-size:12px;color:var(--muted);margin-bottom:8px">Win and the prize pool pays you coins. You never lose your own coins. <b>'+duelsLeft+'/3 duels remaining today.</b></p>';
  if(duelsLeft>0){
    h+='<button class="mbtn mbtn-primary" id="ppBattle">Start a duel</button>';
  } else {
    h+='<button class="mbtn mbtn-primary" id="ppBattle" disabled style="opacity:.5;cursor:not-allowed">No duels left today</button>';
  }
  h+='</div>';

  h+='<div class="arc-sec">🪙 COIN STORE</div>';
  COIN_PACKS.forEach(function(p,k){
    h+='<div class="cpack"><div><b>'+p.coins+' coins</b> <span>'+p.price+'</span></div>'
      +'<button class="mbtn mbtn-gold" data-pack="'+k+'">Buy</button></div>';
  });
  h+='<div class="field" style="margin-top:8px"><label>Have a coin code? Redeem it</label>'
    +'<input id="ppCoinCode" type="text" placeholder="Paste your coin-pack code" /></div>'
    +'<button class="mbtn mbtn-ghost" id="ppRedeemCoin">Redeem code</button>'
    +'<div class="msg" id="ppCoinMsg"></div>'
    +'<div class="note">Coins are a cosmetic currency for avatars and duels. They cannot be cashed out.</div>';

  h+='<div class="arc-sec">🎭 CHOOSE YOUR AVATAR — 200 to collect</div>';
  h+='<div class="avgrid">';
  for(var i=0;i<200;i++){
    var st=avatarStatus(i), cls='avcell'+(i===av?' on':'')+(st.locked?' lk':'');
    var tag=st.type==='pro'?'<span class="tag2 pro">PRO</span>'
          :st.type==='lvl'?'<span class="tag2 lvl">L'+st.req+'</span>'
          :st.type==='coin'?'<span class="tag2 coin">'+st.req+'</span>':'';
    h+='<div class="'+cls+'" data-av="'+i+'">'+avatarSVG(i)+(st.locked?tag:'')+'</div>';
  }
  h+='</div>';
  h+='<div style="font-size:10.5px;color:var(--muted);margin-top:4px">15 free · 35 Pro · 75 level-locked · 75 buy with coins. Tap one to equip or unlock.</div>';

  b.innerHTML=h;
  elById('ppBattle').addEventListener('click', startBattle);
  Array.prototype.forEach.call(b.querySelectorAll('[data-pack]'),function(c){
    c.addEventListener('click',function(){
      var k=parseInt(c.getAttribute('data-pack'));
      if(window.PPLemon && PPLemon.buyCoins){ PPLemon.buyCoins(k); }
      else { ppToast('The coin store is not set up yet.'); }
    });
  });
  elById('ppRedeemCoin').addEventListener('click', redeemCoinCode);
  Array.prototype.forEach.call(b.querySelectorAll('[data-av]'),function(c){
    c.addEventListener('click',function(){ tapAvatar(parseInt(c.getAttribute('data-av'))); paintArcade(); paintArcadeBtn(); });
  });
}
function tapAvatar(i){
  var st=avatarStatus(i);
  if(!st.locked){ game.avatar=i; save(); refresh(); paintProfile(); ppToast('Avatar equipped'); return; }
  if(st.type==='pro'){ ppToast('That avatar is a Pro feature — activate Pro to use it'); return; }
  if(st.type==='lvl'){ ppToast('Reach level '+st.req+' to unlock this avatar'); return; }
  if(st.type==='coin'){
    if((game.coins||0)>=st.req){
      game.coins-=st.req; game.ava.push(i); game.avatar=i;
      save(); refresh(); paintProfile(); paintArcadeBtn();
      confetti(); ppToast('Avatar unlocked for '+st.req+' 🪙');
    } else {
      ppToast('Need '+st.req+' coins — you have '+(game.coins||0));
    }
  }
}

/* ---- safe battle: prompt-knowledge duel vs an AI bot ---- */
var BQUIZ=[
{q:'Which makes a prompt stronger?',o:['Adding your real context and numbers','Writing it in ALL CAPS','Making it as short as possible'],a:0},
{q:'What does giving the AI a role do?',o:['Nothing useful','Focuses the answer with relevant expertise','Slows it down'],a:1},
{q:'A vague prompt usually gets...',o:['A vague, generic answer','A perfect answer','An error'],a:0},
{q:'Best way to fix a disappointing answer?',o:['Start over from scratch','Say what was wrong and refine the prompt','Ask the exact same thing again'],a:1},
{q:'Which belongs in a good prompt?',o:['The format you want the answer in','Random emojis','Your password'],a:0},
{q:'"Act as a senior editor" is an example of...',o:['A constraint','A role','A typo'],a:1},
{q:'Letting the AI ask YOU questions first helps when...',o:['Your request is complex or unclear','Never','You want a shorter answer'],a:0},
{q:'Which is a constraint?',o:['"Keep it under 100 words"','"Write something"','"Go"'],a:0},
{q:'Giving an example of what good looks like...',o:['Confuses the AI','Helps the AI match your intent','Is not allowed'],a:1},
{q:'For a step-by-step task, ask for...',o:['A wall of text','Numbered steps','One word'],a:1},
{q:'The first AI answer is best treated as...',o:['Final and perfect','A draft to refine','Always wrong'],a:1},
{q:'Which detail improves a cold-email prompt?',o:['The recipient and your goal','Your favourite colour','The weather'],a:0},
{q:'Specifying tone (e.g. friendly) changes...',o:['Only the length','How the answer sounds','Nothing'],a:1},
{q:'A good prompt length is...',o:['Always one line','As short as possible','Detailed enough to be clear'],a:2}
];
function startBattle(){
  var today=dayStr(0);
  if(game.duelDay!==today){ game.duelDay=today; game.duelN=0; }
  if((game.duelN||0)>=3){ ppToast('You have used all 3 duels for today — come back tomorrow!'); return; }
  game.duelN=(game.duelN||0)+1;
  save();
  var b=elById('ppArcBody');
  var pool=BQUIZ.slice(); for(var i=pool.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=pool[i];pool[i]=pool[j];pool[j]=t; }
  var rounds=pool.slice(0,5), idx=0, you=0, bot=0;
  function render(){
    if(idx>=rounds.length){ return finish(); }
    var Q=rounds[idx];
    var h='<div class="bq"><div class="bq-score"><span>🙂 You '+you+'</span><span>Round '+(idx+1)+'/5</span><span>🤖 Bot '+bot+'</span></div>'
      +'<h4>'+esc(Q.q)+'</h4>';
    Q.o.forEach(function(opt,k){ h+='<button class="bq-opt" data-o="'+k+'">'+esc(opt)+'</button>'; });
    h+='</div>';
    b.innerHTML=h;
    Array.prototype.forEach.call(b.querySelectorAll('[data-o]'),function(btn){
      btn.addEventListener('click',function(){ answer(Q, parseInt(btn.getAttribute('data-o'))); });
    });
  }
  function answer(Q, pick){
    if(pick===Q.a) you++;
    if(Math.random()<0.62) bot++;            /* bot ~62% accurate — beatable */
    idx++;
    var ok=pick===Q.a;
    b.innerHTML='<div class="bq"><h4>'+(ok?'✅ Correct!':'❌ Not quite — answer: '+esc(Q.o[Q.a]))+'</h4>'
      +'<div class="bq-score"><span>🙂 You '+you+'</span><span>🤖 Bot '+bot+'</span></div></div>';
    setTimeout(render, 950);
  }
  function finish(){
    var prize = you>bot?60 : (you===bot?25:12);
    game.coins=(game.coins||0)+prize;
    game.cnt.daily=game.cnt.daily;          /* no-op keep */
    save(); checkAch(); refresh(); paintArcadeBtn();
    if(you>bot) confetti();
    var verdict = you>bot?'🏆 You win!' : (you===bot?'🤝 A tie!':'🤖 Bot wins this one');
    var today2=dayStr(0);
    var duelsLeft2=game.duelDay===today2 ? Math.max(0, 3-(game.duelN||0)) : 3;
    b.innerHTML='<div class="bq" style="text-align:center"><h4>'+verdict+'</h4>'
      +'<div class="bq-score" style="justify-content:center;gap:20px"><span>🙂 You '+you+'</span><span>🤖 Bot '+bot+'</span></div>'
      +'<p style="font-size:13px;margin:8px 0">Prize pool pays you <b>+'+prize+' 🪙</b></p>'
      +'<p style="font-size:12px;color:var(--muted);margin-bottom:8px"><b>'+duelsLeft2+'/3 duels remaining today.</b></p>';
    if(duelsLeft2>0){
      b.innerHTML+='<button class="mbtn mbtn-primary" id="ppBattleAgain">Play again</button> ';
    }
    b.innerHTML+='<button class="mbtn mbtn-ghost" id="ppBattleBack">Back to Arcade</button></div>';
    if(duelsLeft2>0){
      elById('ppBattleAgain').addEventListener('click', startBattle);
    }
    elById('ppBattleBack').addEventListener('click', paintArcade);
  }
  render();
}

/* ---- coin store (checkout handled by lemonsqueezy.js) ---- */
var COIN_PACKS=[
  { coins:1200,  price:'$2.99'  },
  { coins:4000, price:'$6.99'  },
  { coins:12000, price:'$14.99' }
];
async function redeemCoinCode(){
  var code = (document.getElementById('ppCoinCode').value || '').trim();
  var m = document.getElementById('ppCoinMsg');
  m.style.display = 'block';
  
  if(!code){
    m.className = 'msg err';
    m.textContent = 'Please enter a code.';
    return;
  }

  /* TEST mode: codes starting with ZXTEST- */
  if(code.toUpperCase().indexOf('ZXTEST-') === 0){
    if(_isCodeUsed(code)){
      m.className = 'msg err';
      m.textContent = 'This test code has already been used.';
      return;
    }
    var testAmount = 1200;
    if(code.includes('4000') || code.includes('M')) testAmount = 4000;
    if(code.includes('12000') || code.includes('L')) testAmount = 12000;
    if(code.includes('3800')) testAmount = 3800;
    
    game.coins = (game.coins || 0) + testAmount;
    save(); refresh(); paintArcadeBtn();
    _markCodeUsed(code);
    m.className = 'msg ok';
    m.textContent = '+' + testAmount + ' coins added! (TEST)';
    setTimeout(paintArcade, 900);
    return;
  }
  
  if(!window.PPLemon || !PPLemon.validateLicense){
    m.className = 'msg err';
    m.textContent = 'Code redemption is not set up yet.';
    return;
  }
  
  m.className = 'msg';
  m.textContent = 'Verifying code...';
  
  try{
    console.log('[Redeem] Validating key with Lemon Squeezy...');
    var res = await PPLemon.validateLicense(code);
    console.log('[Redeem] Validation result:', JSON.stringify(res));
    
    /* ========== 金币类激活码 ========== */
    if(res.ok && res.kind === 'coins'){
      console.log('[Redeem] ========== COINS ==========');
      console.log('[Redeem] Response:', JSON.stringify(res));
      
      if(_isCodeUsed(code)){
        m.className = 'msg err';
        m.textContent = 'This code has already been used on your account.';
        return;
      }
      _markCodeUsed(code);
      
      // 直接从响应中获取金额，不经过任何选择器
      var coinAmount = res.coins || res.amount || 0;
      
      // 如果金额为0，从 product_id 精确匹配
      if(coinAmount === 0 && res.productId){
        var productMap = {
          1136119: 1200, 1086196: 1200,  // Coin Pack S
          1136118: 4000, 1086203: 4000,  // Coin Pack M
          1136117: 12000, 1086212: 12000, // Coin Pack L
          1136120: 1200, 1091714: 1200,  // Credits 1200
          1136121: 3800, 1092744: 3800   // Credits 3800
        };
        coinAmount = productMap[res.productId] || 1200;
      }
      
      console.log('[Redeem] Coin amount:', coinAmount);
      
      var beforeCoins = game.coins || 0;
      game.coins = beforeCoins + coinAmount;
      console.log('[Redeem] Coins: ' + beforeCoins + ' -> ' + game.coins);
      
      save();
      refresh();
      paintArcadeBtn();
      
      m.className = 'msg ok';
      m.textContent = 'Successfully added ' + coinAmount.toLocaleString() + ' coins!';
      if(typeof ppToast === 'function') ppToast('+' + coinAmount.toLocaleString() + ' coins!');
      
      setTimeout(paintArcade, 900);
      return;
    }
    
    /* ========== 积分类激活码 ========== */
    if(res.ok && res.kind === 'credits'){
      console.log('[Redeem] ========== CREDITS ==========');
      console.log('[Redeem] Response:', JSON.stringify(res));
      
      if(_isCodeUsed(code)){
        m.className = 'msg err';
        m.textContent = 'This code has already been used on your account.';
        return;
      }
      _markCodeUsed(code);
      
      // 直接从响应中获取金额
      var creditAmount = res.credits || res.amount || 0;
      
      // 如果金额为0，从 product_id 精确匹配
      if(creditAmount === 0 && res.productId){
        var creditMap = {
          1136120: 1200, 1091714: 1200,  // Credits 1200
          1136121: 3800, 1092744: 3800   // Credits 3800
        };
        creditAmount = creditMap[res.productId] || 1200;
      }
      
      console.log('[Redeem] Credit amount:', creditAmount);
      
      var curCreds = parseInt(localStorage.getItem('pm_unlock_credits') || '0', 10);
      var newCreds = curCreds + creditAmount;
      localStorage.setItem('pm_unlock_credits', String(newCreds));
      console.log('[Redeem] Credits: ' + curCreds + ' -> ' + newCreds);
      
      // 通知游戏 iframe
      try{
        var gameFrame = document.querySelector('iframe[src*="game-pm"]');
        if(gameFrame && gameFrame.contentWindow){
          gameFrame.contentWindow.postMessage({
            type: 'add_credits',
            amount: creditAmount
          }, '*');
        }
      } catch(e){}
      
      m.className = 'msg ok';
      m.textContent = 'Successfully added ' + creditAmount.toLocaleString() + ' game credits!';
      if(typeof ppToast === 'function') ppToast('+' + creditAmount.toLocaleString() + ' credits!');
      setTimeout(paintArcade, 900);
      return;
    }
    
    /* Pro 激活码 - 提示去正确的地方激活 */
    if(res.ok && res.kind === 'pro'){
      m.className = 'msg err';
      m.textContent = 'This is a Pro subscription code. Please use the "Activate Pro" button to redeem it.';
      return;
    }
    
    /* 未知类型 - 尝试根据 product_id 推断 */
    if(res.ok){
      console.log('[Redeem] Unknown kind, inferring from product_id');
      if(_isCodeUsed(code)){
        m.className = 'msg err';
        m.textContent = 'This code has already been used.';
        return;
      }
      _markCodeUsed(code);
      
      var inferredAmount = 1200;
      if(res.productId === 1136118 || res.productId === 1086203) inferredAmount = 4000;
      if(res.productId === 1136117 || res.productId === 1086212) inferredAmount = 12000;
      if(res.productId === 1136121 || res.productId === 1092744) inferredAmount = 3800;
      
      game.coins = (game.coins || 0) + inferredAmount;
      save(); refresh(); paintArcadeBtn();
      m.className = 'msg ok';
      m.textContent = '+' + inferredAmount + ' coins added!';
      setTimeout(paintArcade, 900);
      return;
    }
    
    /* 网络错误 */
    if(res.error === 'network'){
      m.className = 'msg err';
      m.textContent = 'Network error. Please check your connection and try again.';
      return;
    }
    
    /* 激活次数已达上限 - 但 key 仍然有效，直接添加对应金额 */
    if(res.error === 'activation_limit_reached'){
      console.log('[Redeem] activation_limit_reached, treating as valid');
      if(_isCodeUsed(code)){
        m.className = 'msg err';
        m.textContent = 'This code has already been used on your account.';
      } else {
        _markCodeUsed(code);
        var limitAmount = 1200;
        if(res.productId === 1136118 || res.productId === 1086203) limitAmount = 4000;
        if(res.productId === 1136117 || res.productId === 1086212) limitAmount = 12000;
        if(res.productId === 1136121 || res.productId === 1092744) limitAmount = 3800;
        
        game.coins = (game.coins || 0) + limitAmount;
        save(); refresh(); paintArcadeBtn();
        m.className = 'msg ok';
        m.textContent = '+' + limitAmount + ' coins added!';
        setTimeout(paintArcade, 900);
      }
      return;
    }
    
    /* 无效激活码 */
    m.className = 'msg err';
    m.textContent = 'Invalid code. Please check and try again.';
    
  } catch(e){
    console.error('[Redeem] Error:', e);
    m.className = 'msg err';
    m.textContent = 'Error verifying code. Please try again.';
  }
}

/* Helper: check if a code has been used locally (per account) */
function _isCodeUsed(code){
  var key = _gameUid ? ('pp_used_codes_'+_gameUid) : 'pp_used_codes';
  var usedCodes=[];
  try{ usedCodes=JSON.parse(localStorage.getItem(key)||'[]'); }catch(e){ usedCodes=[]; }
  return usedCodes.indexOf(code)>=0;
}
/* Helper: mark a code as used locally (per account) */
function _markCodeUsed(code){
  var key = _gameUid ? ('pp_used_codes_'+_gameUid) : 'pp_used_codes';
  var uc=[];try{uc=JSON.parse(localStorage.getItem(key)||'[]');}catch(e){uc=[];}
  if(uc.indexOf(code)<0){uc.push(code);localStorage.setItem(key,JSON.stringify(uc));}
}
/* Helper: check if product_id is in COIN_PRODUCT_MAP (via PPLemon) */
function COIN_PRODUCT_MAP_HAS(productId){
  try{
    if(window.PPLemon && PPLemon.coinProductMapHas) return PPLemon.coinProductMapHas(productId);
  }catch(e){}
  return false;
}
/* [DEPRECATED] Show coin pack size selector — no longer used, amount is auto-detected */
function showCoinPackSelector(code, msgEl){
  // 这个函数已经不再使用 — 金额直接从 API 响应获取
  console.warn('[Redeem] showCoinPackSelector is deprecated, amount is auto-detected');
}
/* Apply selected coin pack amount */
function applyCoinPack(code,amount,parentEl){
  console.log('[ApplyCoinPack] Adding', amount, 'coins');
  var beforeCoins = game.coins || 0;
  game.coins = beforeCoins + amount;
  console.log('[ApplyCoinPack] 金币: ' + beforeCoins + ' -> ' + game.coins);
  save(); refresh(); paintArcadeBtn();
  var msgEl=elById('ppCoinMsg');
  if(msgEl){
    msgEl.className='msg ok';
    msgEl.textContent='+' + amount.toLocaleString() + ' coins added! Total: ' + (game.coins || 0).toLocaleString();
  }
  if(typeof ppToast === 'function') ppToast('+' + amount.toLocaleString() + ' coins!');
  setTimeout(paintArcade, 900);
}

/* ---- Account / Profile panel: removed — duplicate of header authBtn ---- */
var profBtn, profPanel;
function buildProfileBtn(){
  /* Removed: the Account button is now handled by the header authBtn.
   * openProfile() is kept for backward compatibility but no button is created. */
}
function openProfile(){
  if(!profPanel){
    profPanel=D.createElement('div');
    profPanel.className='overlay'; profPanel.id='ppProfile';
    profPanel.innerHTML='<div class="modal sm"><button class="x" id="ppProfX" data-close>&times;</button>'
      +'<h2>Account &amp; Profile</h2>'
      +'<div class="desc">Your avatar, level and stats — this is the profile other members can view.</div>'
      +'<div id="ppProfBody"></div></div>';
    D.body.appendChild(profPanel);
    elById('ppProfX').addEventListener('click',function(){ profPanel.classList.remove('show'); });
    profPanel.addEventListener('click',function(e){ if(e.target===profPanel) profPanel.classList.remove('show'); });
  }
  paintProfile();
  profPanel.classList.add('show');
}
function paintProfile(){
  var b=elById('ppProfBody'); if(!b) return;
  var l=game.lvl||1, av=game.avatar||0, rk=rankOf(l), c=game.cnt||{};
  var h='<div class="arc-top"><div class="arc-av" style="width:64px;height:64px">'+avatarSVG(av)+'</div>'
    +'<div style="flex:1"><div style="font-size:15px;font-weight:800">'+esc(levelTitle(l))
    +'<span class="rankpill" style="border-color:'+rk.color+';color:'+rk.color+'">'+esc(getRankName(l))+'</span></div>'
    +'<div style="font-size:12px;color:var(--muted)">Level '+l+' · '+(game.xp||0)+' XP</div></div></div>';
  h+='<div class="statpills" style="margin-top:10px">'
    +'<div class="statpill"><b>'+game.ach.length+'/'+ACH.length+'</b><span>achievements</span></div>'
    +'<div class="statpill"><b>'+(c.search||0)+'</b><span>searches</span></div>'
    +'<div class="statpill"><b>'+(c.tmin||0)+'m</b><span>online time</span></div></div>';
  h+='<div class="statpills">'
    +'<div class="statpill"><b>🪙 '+(game.coins||0)+'</b><span>coins</span></div>'
    +'<div class="statpill"><b>🔥 '+(game.best||0)+'</b><span>best streak</span></div>'
    +'<div class="statpill"><b>'+(c.open||0)+'</b><span>prompts opened</span></div></div>';
  h+='<div class="arc-sec">CHOOSE YOUR AVATAR — 200 to collect</div>';
  h+='<div class="avgrid">';
  for(var i=0;i<200;i++){
    var st=avatarStatus(i), cls='avcell'+(i===av?' on':'')+(st.locked?' lk':'');
    var tag=st.type==='pro'?'<span class="tag2 pro">PRO</span>'
          :st.type==='lvl'?'<span class="tag2 lvl">L'+st.req+'</span>'
          :st.type==='coin'?'<span class="tag2 coin">'+st.req+'</span>':'';
    h+='<div class="'+cls+'" data-av="'+i+'">'+avatarSVG(i)+(st.locked?tag:'')+'</div>';
  }
  h+='</div>';
  h+='<div style="font-size:10.5px;color:var(--muted);margin-top:4px">15 free · 35 Pro · 75 level-locked · 75 buy with coins. Tap one to equip or unlock.</div>';
  h+='<div style="margin-top:14px;text-align:center"><button id="ppProfSettings" style="background:var(--panel2);border:1px solid var(--border);color:var(--text);padding:9px 20px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;transition:.15s">⚙️ Account Settings</button></div>';
  b.innerHTML=h;
  Array.prototype.forEach.call(b.querySelectorAll('[data-av]'),function(c){
    c.addEventListener('click',function(){ tapAvatar(parseInt(c.getAttribute('data-av'))); });
  });
  var settingsBtn=elById('ppProfSettings');
  if(settingsBtn) settingsBtn.addEventListener('click',function(){ profPanel.classList.remove('show'); if(typeof window.openAccountSettings==='function') window.openAccountSettings(); });
}

function arcadeBoot(){ buildArcadeBtn(); buildProfileBtn(); startTimer(); }
if(D.readyState==='loading') D.addEventListener('DOMContentLoaded', arcadeBoot);
else arcadeBoot();

if(D.readyState==='loading') D.addEventListener('DOMContentLoaded', boot);
else boot();

/* ---- Expose functions needed by onclick handlers in generated HTML ---- */
window.applyCoinPack = applyCoinPack;

})();
