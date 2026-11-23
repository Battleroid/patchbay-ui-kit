/* Time expressions: "now", "now-15m", "now-6h", "now-7d", "now-2w", or a date/time like "2026-11-22 03:00". */
function pbTParseExpr(s,now){s=String(s).trim();now=now||Date.now();if(s==='now')return now;var m=s.match(/^now\s*-\s*(\d+)\s*([smhdw])$/);if(m)return now-(+m[1])*{s:1e3,m:6e4,h:36e5,d:864e5,w:6048e5}[m[2]];var t=Date.parse(s.replace(' ','T'));return isNaN(t)?null:t;}
function pbTFmtAbs(t){var d=new Date(t);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');}
var PB_QUICK=[['now-5m','Last 5 minutes'],['now-15m','Last 15 minutes'],['now-30m','Last 30 minutes'],['now-1h','Last 1 hour'],['now-3h','Last 3 hours'],['now-6h','Last 6 hours'],['now-12h','Last 12 hours'],['now-24h','Last 24 hours'],['now-2d','Last 2 days'],['now-7d','Last 7 days'],['now-30d','Last 30 days']];
/* Time range picker: .pb-trange[data-trange] with data-from/data-to. Fires change {from,to,fromMs,toMs,label}. */
function pbTimeRange(el){var from=el.dataset.from||'now-6h',to=el.dataset.to||'now',recent=[],lbl=el.querySelector('.pb-trange__label'),btn=el.querySelector('[data-trange-open]'),pop=el.querySelector('.pb-trange__pop');
  pop.id=pop.id||'tr'+Math.random().toString(36).slice(2,7);pop.setAttribute('popover','');btn.setAttribute('popovertarget',pop.id);btn.setAttribute('aria-haspopup','dialog');
  var fi=pop.querySelector('[data-tr-from]'),ti=pop.querySelector('[data-tr-to]'),err=pop.querySelector('[data-tr-err]'),ql=pop.querySelector('.pb-trange__quick ul'),qs=pop.querySelector('.pb-trange__quick input'),rc=pop.querySelector('.pb-trange__recent');
  function label(){if(to==='now'){var q=PB_QUICK.filter(function(x){return x[0]===from})[0];if(q)return q[1];}var a=pbTParseExpr(from),b=pbTParseExpr(to);return (/^now/.test(from)?from:pbTFmtAbs(a))+' to '+(/^now/.test(to)?to:pbTFmtAbs(b));}
  function quick(){var q=(qs&&qs.value||'').toLowerCase();ql.innerHTML=PB_QUICK.filter(function(x){return !q||x[1].toLowerCase().indexOf(q)>=0||x[0].indexOf(q)>=0}).map(function(x){return '<li><button type="button" data-q="'+x[0]+'" aria-current="'+(x[0]===from&&to==='now')+'">'+x[1]+'</button></li>'}).join(''),pbStyled(ql);}
  function recents(){if(!rc)return;rc.parentElement.hidden=!recent.length;rc.innerHTML=recent.map(function(r,i){return '<button type="button" data-r="'+i+'">'+pbEsc(r.label)+'</button>'}).join(''),pbStyled(rc);}
  function set(f,t,quiet){var a=pbTParseExpr(f),b=pbTParseExpr(t);if(a==null||b==null||a>=b)return false;from=f;to=t;el.dataset.from=f;el.dataset.to=t;var L=label();lbl.textContent=L;btn.setAttribute('aria-label','Time range: '+L);
    if(!quiet){recent=[{from:f,to:t,label:L}].concat(recent.filter(function(r){return r.from!==f||r.to!==t})).slice(0,4);el.dispatchEvent(new CustomEvent('change',{detail:{from:f,to:t,fromMs:a,toMs:b,label:L}}));}return true;}
  pop.addEventListener('toggle',function(e){if(e.newState==='open'){fi.value=/^now/.test(from)?from:pbTFmtAbs(pbTParseExpr(from));ti.value=/^now/.test(to)?to:pbTFmtAbs(pbTParseExpr(to));err.textContent='Use now-6h, now, or 2026-11-22 03:00.';err.removeAttribute('data-invalid');if(qs)qs.value='';quick();recents();if(typeof pbPlace==='function')pbPlace(btn,pop,{align:'end'});}});
  pop.querySelector('[data-tr-apply]').addEventListener('click',function(){var a=pbTParseExpr(fi.value),b=pbTParseExpr(ti.value);if(a==null||b==null){err.textContent='Couldn’t read '+(a==null?'From':'To')+'. Try now-6h or 2026-11-22 03:00.';err.setAttribute('data-invalid','');return;}if(a>=b){err.textContent='From must be before To.';err.setAttribute('data-invalid','');return;}set(fi.value.trim(),ti.value.trim());pop.hidePopover();btn.focus();});
  [fi,ti].forEach(function(i){i.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();pop.querySelector('[data-tr-apply]').click();}});});
  pop.addEventListener('click',function(e){var q=e.target.closest('[data-q]');if(q){set(q.dataset.q,'now');pop.hidePopover();btn.focus();return;}var r=e.target.closest('[data-r]');if(r){var x=recent[+r.dataset.r];set(x.from,x.to);pop.hidePopover();btn.focus();}});
  if(qs)qs.addEventListener('input',quick);
  function shift(dir){var a=pbTParseExpr(from),b=pbTParseExpr(to),w=b-a,na=a+dir*w/2,nb=b+dir*w/2,now=Date.now();if(nb>now){nb=now;na=now-w;}set(pbTFmtAbs(na),nb===now?'now':pbTFmtAbs(nb));}
  var bk=el.querySelector('[data-trange-back]'),fw=el.querySelector('[data-trange-fwd]'),zo=el.querySelector('[data-trange-zoom]');
  if(bk)bk.addEventListener('click',function(){shift(-1)});if(fw)fw.addEventListener('click',function(){shift(1)});
  if(zo)zo.addEventListener('click',function(){var a=pbTParseExpr(from),b=pbTParseExpr(to),c=(a+b)/2,w=(b-a)*2,now=Date.now(),nb=Math.min(now,c+w/2);set(pbTFmtAbs(nb-w),nb===now?'now':pbTFmtAbs(nb));});
  el.pbSet=function(f,t){return set(f,t);};el.pbRange=function(){return {from:from,to:to,fromMs:pbTParseExpr(from),toMs:pbTParseExpr(to)};};set(from,to,true);}
/* Refresh picker: .pb-refresh[data-refresh]; menu items data-interval (seconds, 0 = off). Fires refresh on click and on each tick. */
function pbRefresh(el){var go=el.querySelector('[data-refresh-now]'),menu=el.querySelector('.pb-menu'),trig=el.querySelector('[data-refresh-menu]'),lab=el.querySelector('[data-refresh-label]'),bar=document.createElement('span'),sec=+(el.dataset.interval||0),t0=0,raf=0,tm=0;
  bar.className='pb-refresh__bar';go.appendChild(bar);menu.id=menu.id||'rf'+Math.random().toString(36).slice(2,7);menu.setAttribute('popover','');trig.setAttribute('popovertarget',menu.id);
  function fire(){el.dispatchEvent(new CustomEvent('refresh'));t0=Date.now();}
  function tick(){if(!sec){bar.style.setProperty('--p','0%');return;}var p=Math.min(1,(Date.now()-t0)/(sec*1000));bar.style.setProperty('--p',(p*100)+'%');if(p>=1)fire();raf=requestAnimationFrame(tick);}
  function set(s){sec=s;el.dataset.interval=s;el.toggleAttribute('data-on',!!s);lab.textContent=s?(s<60?s+'s':s/60+'m'):'Off';trig.setAttribute('aria-label','Auto-refresh: '+(s?'every '+lab.textContent:'off'));menu.querySelectorAll('[data-interval]').forEach(function(i){i.setAttribute('aria-checked',+i.dataset.interval===s)});cancelAnimationFrame(raf);t0=Date.now();if(s)tick();else bar.style.setProperty('--p','0%');}
  go.addEventListener('click',function(){fire();go.classList.add('pb-spin-once');setTimeout(function(){go.classList.remove('pb-spin-once')},600);});
  menu.addEventListener('click',function(e){var i=e.target.closest('[data-interval]');if(i){set(+i.dataset.interval);menu.hidePopover();trig.focus();}});
  menu.addEventListener('toggle',function(e){if(e.newState==='open'&&typeof pbPlace==='function')pbPlace(trig,menu,{align:'end'});});
  pbOnDoc('visibilitychange',el,function(){if(document.hidden)cancelAnimationFrame(raf);else if(sec){tick();}});
  el.pbSet=set;set(sec);}
/* Time-series chart: figure.pb-ts[data-ts] with JSON {series:[{name,c,data:[[t,v]]}], unit, h, threshold:{v,label}}. Crosshair, legend toggles, drag to zoom. Fires zoom {fromMs,toMs}. */
function pbTimeSeries(el){var D=JSON.parse((el.querySelector('script[type="application/json"]')||{}).textContent||'{}'),plot=el.querySelector('.pb-ts__plot'),leg=el.querySelector('.pb-ts__legend'),rst=el.querySelector('.pb-ts__reset'),tip=document.createElement('div'),NS='http://www.w3.org/2000/svg',dom=null,off={},W=0,H=0,P={l:40,r:8,t:10,b:22},u=D.unit||'',sel=null,hx=null;
  tip.className='pb-ts__tip';plot.appendChild(tip);plot.tabIndex=0;plot.setAttribute('role','img');
  function S(){return D.series||[];}
  function full(){var a=Infinity,b=-Infinity;S().forEach(function(s){s.data.forEach(function(p){if(p[0]<a)a=p[0];if(p[0]>b)b=p[0];})});return [a,b];}
  function nice(max){var n=4,raw=max/n,p=Math.pow(10,Math.floor(Math.log10(raw||1))),f=raw/p,st=(f<=1?1:f<=2?2:f<=2.5?2.5:f<=3?3:f<=5?5:10)*p;return {max:st*Math.ceil(max/st)||1,step:st||1};}
  function fmtV(v){return Math.abs(v)>=1000?(v/1000).toFixed(1)+'k':String(Math.round(v*10)/10);}
  function fmtT(t,span){var d=new Date(t);if(span>2*864e5)return (d.getMonth()+1)+'/'+d.getDate()+(span<10*864e5?' '+String(d.getHours()).padStart(2,'0')+'h':'');return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');}
  function draw(){W=plot.clientWidth;H=plot.clientHeight;if(!W||!S().some(function(x){return x.data&&x.data.length}))return;var d=dom||full(),span=d[1]-d[0]||1,vis=S().filter(function(s){return !off[s.name]}),mx=0;
    vis.forEach(function(s){s.data.forEach(function(p){if(p[0]>=d[0]&&p[0]<=d[1]&&p[1]>mx)mx=p[1];})});if(D.threshold&&D.threshold.v>mx)mx=D.threshold.v;var nv=D.max?{max:D.max,step:D.max/(D.ticks||4)}:nice(mx*1.05);
    function X(t){return P.l+(t-d[0])/span*(W-P.l-P.r);}function Y(v){return P.t+(1-v/nv.max)*(H-P.t-P.b);}el._X=X;el._Y=Y;el._d=d;
    var h='';for(var v=0;v<=nv.max+1e-9;v+=nv.step){h+='<line class="pb-grid" x1="'+P.l+'" x2="'+(W-P.r)+'" y1="'+Y(v)+'" y2="'+Y(v)+'"/><text class="pb-axis" x="'+(P.l-6)+'" y="'+(Y(v)+4)+'" text-anchor="end">'+fmtV(v)+'</text>';}
    var nt=Math.max(2,Math.floor((W-P.l)/90));for(var i=0;i<=nt;i++){var t=d[0]+span*i/nt;h+='<text class="pb-axis" x="'+X(t)+'" y="'+(H-6)+'" text-anchor="'+(i===0?'start':i===nt?'end':'middle')+'">'+fmtT(t,span)+'</text>';}
    S().forEach(function(s,si){if(off[s.name])return;var pts=s.data.filter(function(p,k,a){return (p[0]>=d[0]&&p[0]<=d[1])||(a[k+1]&&a[k+1][0]>=d[0]&&p[0]<d[0])||(a[k-1]&&a[k-1][0]<=d[1]&&p[0]>d[1])});if(!pts.length)return;
      var line=pts.map(function(p,k){return (k?'L':'M')+X(p[0]).toFixed(1)+' '+Y(p[1]).toFixed(1)}).join(' ');
      if(si===0&&D.area!==false)h+='<path class="pb-ts__area" data-s="'+si+'" d="'+line+' L'+X(pts[pts.length-1][0]).toFixed(1)+' '+Y(0)+' L'+X(pts[0][0]).toFixed(1)+' '+Y(0)+'Z" data-style="fill:'+s.c+'"/>';
      h+='<path class="pb-ts__line" data-s="'+si+'" d="'+line+'" data-style="stroke:'+s.c+'"'+(s.dash?' stroke-dasharray="5 4"':'')+'/>';});
    if(D.threshold){h+='<line class="pb-ts__threshold" x1="'+P.l+'" x2="'+(W-P.r)+'" y1="'+Y(D.threshold.v)+'" y2="'+Y(D.threshold.v)+'"/><text class="pb-ts__thlabel" x="'+(W-P.r)+'" y="'+(Y(D.threshold.v)-6)+'" text-anchor="end">'+pbEsc(D.threshold.label||'')+'</text>';}
    h+='<g class="pb-ts__hover"></g><rect class="pb-ts__sel" x="0" y="'+P.t+'" width="0" height="'+(H-P.t-P.b)+'" data-style="display:none"/>';
    var svg=plot.querySelector('svg');if(!svg){svg=document.createElementNS(NS,'svg');plot.insertBefore(svg,tip);}svg.setAttribute('viewBox','0 0 '+W+' '+H);svg.innerHTML=h,pbStyled(svg);
    plot.setAttribute('aria-label',(el.querySelector('.pb-eyebrow')||{}).textContent+': '+vis.map(function(s){var l=s.data[s.data.length-1];return s.name+' '+fmtV(l[1])+u}).join(', ')+'. Arrow keys read values.');
    if(rst)rst.hidden=!dom;legend();if(hx!=null)hover(hx);}
  function legend(){if(!leg)return;leg.innerHTML=S().map(function(s){var l=s.data[s.data.length-1];return '<li><button type="button" data-n="'+pbEsc(s.name)+'" aria-pressed="'+!off[s.name]+'" title="Click to hide, Alt-click to show only this"><i data-style="--c:'+s.c+'"></i>'+pbEsc(s.name)+' <span>'+fmtV(l[1])+u+'</span></button></li>'}).join(''),pbStyled(leg);}
  function near(s,t){var a=s.data,lo=0,hi=a.length-1;while(hi-lo>1){var m=(lo+hi)>>1;if(a[m][0]<t)lo=m;else hi=m;}return Math.abs(a[lo][0]-t)<Math.abs(a[hi][0]-t)?a[lo]:a[hi];}
  function hover(x){hx=x;var d=el._d,X=el._X,Y=el._Y;if(!d)return;var t=d[0]+(x-P.l)/(W-P.l-P.r)*(d[1]-d[0]);if(x<P.l||x>W-P.r){out();return;}var g=plot.querySelector('.pb-ts__hover'),vis=S().filter(function(s){return !off[s.name]});if(!vis.length)return;var p0=near(vis[0],t),cx=X(p0[0]);
    var h='<line class="pb-ts__cross" x1="'+cx+'" x2="'+cx+'" y1="'+P.t+'" y2="'+(H-P.b)+'"/>';vis.forEach(function(s){var p=near(s,t);h+='<circle class="pb-ts__dot" cx="'+X(p[0])+'" cy="'+Y(p[1])+'" r="4" data-style="fill:'+s.c+'"/>';});g.innerHTML=h,pbStyled(g);
    tip.innerHTML='<b>'+new Date(p0[0]).toLocaleString(undefined,{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})+'</b>'+S().map(function(s){var p=near(s,t);return '<span class="pb-bars__tr"'+(off[s.name]?' data-off':'')+'><i data-style="--c:'+s.c+'"></i>'+pbEsc(s.name)+'<span>'+fmtV(p[1])+u+'</span></span>'}).join(''),pbStyled(tip);
    tip.setAttribute('data-show','');var tw=tip.offsetWidth;tip.style.left=(cx+14+tw>W?cx-14-tw:cx+14)+'px';}
  function out(){hx=null;tip.removeAttribute('data-show');var g=plot.querySelector('.pb-ts__hover');if(g)g.innerHTML='',pbStyled(g);}
  plot.addEventListener('pointermove',function(e){var r=plot.getBoundingClientRect(),x=e.clientX-r.left;if(sel){var a=Math.max(P.l,Math.min(sel,x)),b=Math.min(W-P.r,Math.max(sel,x)),R=plot.querySelector('.pb-ts__sel');R.style.display='';R.setAttribute('x',a);R.setAttribute('width',b-a);}hover(x);});
  plot.addEventListener('pointerleave',function(){if(!sel)out();});
  plot.addEventListener('pointerdown',function(e){if(e.button!==0)return;var r=plot.getBoundingClientRect();sel=e.clientX-r.left;plot.setPointerCapture(e.pointerId);});
  plot.addEventListener('pointerup',function(e){if(sel==null)return;var r=plot.getBoundingClientRect(),x=e.clientX-r.left,a=Math.min(sel,x),b=Math.max(sel,x);sel=null;var R=plot.querySelector('.pb-ts__sel');if(R)R.style.display='none';
    if(b-a>8){var d=el._d,span=d[1]-d[0],ta=d[0]+(Math.max(P.l,a)-P.l)/(W-P.l-P.r)*span,tb=d[0]+(Math.min(W-P.r,b)-P.l)/(W-P.l-P.r)*span;dom=[ta,tb];draw();el.dispatchEvent(new CustomEvent('zoom',{detail:{fromMs:ta,toMs:tb}}));}});
  plot.addEventListener('keydown',function(e){var d=el._d;if(!d)return;var step=(W-P.l-P.r)/40;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();hover(Math.max(P.l,Math.min(W-P.r,(hx==null?W-P.r:hx)+(e.key==='ArrowRight'?step:-step))));}else if(e.key==='Escape'){out();if(dom){dom=null;draw();el.dispatchEvent(new CustomEvent('zoom',{detail:null}));}}});
  plot.addEventListener('blur',out);
  if(leg)leg.addEventListener('click',function(e){var b=e.target.closest('[data-n]');if(!b)return;var n=b.dataset.n;if(e.altKey){var solo=S().every(function(s){return s.name===n||off[s.name]});S().forEach(function(s){off[s.name]=solo?false:s.name!==n});}else{off[n]=!off[n];if(S().every(function(s){return off[s.name]}))off[n]=false;}draw();});
  if(leg)leg.addEventListener('mouseover',function(e){var b=e.target.closest('[data-n]');el.toggleAttribute('data-focus',!!b);plot.querySelectorAll('.pb-ts__line,.pb-ts__area').forEach(function(p){var s=S()[+p.dataset.s];p.toggleAttribute('data-focus',!!b&&s&&s.name===b.dataset.n);});});
  if(leg)leg.addEventListener('mouseleave',function(){el.removeAttribute('data-focus');});
  if(rst)rst.addEventListener('click',function(){dom=null;draw();el.dispatchEvent(new CustomEvent('zoom',{detail:null}));});
  if(window.ResizeObserver)new ResizeObserver(function(){draw()}).observe(plot);
  el.pbSetData=function(d){D=d;dom=null;draw();};el.pbZoom=function(a,b){dom=a==null?null:[a,b];draw();};draw();}
