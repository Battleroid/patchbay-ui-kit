document.querySelectorAll('[data-trange]').forEach(function(tr){var wrap=tr.closest('.pb-toolbar').parentElement,ts=wrap.querySelector('[data-ts]'),rf=wrap.querySelector('[data-refresh]'),out=wrap.querySelector('[data-tr-out]');
  function r(i,k){var x=Math.sin(i*12.9898+k*78.233)*43758.5453;return x-Math.floor(x);}
  function gen(a,b){var n=120,S=[['pve-01','var(--chart-1)',34,18],['pve-02','var(--chart-2)',58,22],['nas-01','var(--chart-4)',18,9]];return {unit:'%',max:100,threshold:{v:85,label:'alert 85%'},series:S.map(function(s,k){var d=[];for(var i=0;i<=n;i++){var t=a+(b-a)*i/n,m=Math.floor(t/6e4);d.push([t,Math.max(1,Math.min(99,s[2]+s[3]*Math.sin(m/47+k)+s[3]*0.5*Math.sin(m/9+k*2)+(r(m,k)-0.5)*s[3]*0.6+(k===1&&m%400<25?30:0)))]);}return {name:s[0],c:s[1],data:d};})};}
  pbTimeRange(tr);pbRefresh(rf);pbTimeSeries(ts);
  function load(){var R=tr.pbRange();ts.pbSetData(gen(R.fromMs,R.toMs));}
  tr.addEventListener('change',function(e){out.textContent=e.detail.label;load();});
  rf.addEventListener('refresh',load);
  ts.addEventListener('zoom',function(e){if(e.detail){tr.pbSet(pbTFmtAbs(e.detail.fromMs),pbTFmtAbs(e.detail.toMs));}});
  load();});
