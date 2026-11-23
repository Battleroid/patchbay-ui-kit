/* Shared setup for csp.html (classic patchbay.js) and csp-esm.html (patchbay.mjs): what an app adds on top of pbInit().
   csp-esm.js calls pbFixtureSetup with the module namespace; the classic page calls it with window. */
function pbFixtureSetup(pb){
  // Relative times from offsets, and a closed copy of the session-timeout dialog (the example shows one open in place).
  document.querySelectorAll('time[data-ago]').forEach(function(t){t.setAttribute('datetime',new Date(Date.now()-t.dataset.ago*1000).toISOString());});
  document.querySelectorAll('dialog.pb-session[open]').forEach(function(s){var d=s.cloneNode(true);d.removeAttribute('open');['id','aria-labelledby','aria-describedby'].forEach(function(a){d.removeAttribute(a);});
    d.querySelectorAll('[id]').forEach(function(x){x.removeAttribute('id');});s.after(d);});
  // Captions from a blob: URL, added before the players bind so the CC button shows.
  document.querySelectorAll('[data-player] video').forEach(function(v){if(v.querySelector('track'))return;var t=document.createElement('track');t.kind='captions';t.label='English';t.srclang='en';
    t.src=URL.createObjectURL(new Blob(['WEBVTT\n\n00:00.500 --> 00:03.500\nFour blocks drift across the frame.\n'],{type:'text/vtt'}));v.appendChild(t);});
  // Virtual list rows are strings; per-row styles go in data-style and pbVirtual applies them.
  document.querySelectorAll('[data-vlist]').forEach(function(v){pb.pbInit(v);pb.pbVirtual(v,{count:5000,render:function(i){var c=i%7?'ink-muted':'down';
    return '<span>'+(i+1)+'</span><span>GET</span><span>/api/items/'+i+' <span data-style="color:var(--'+c+')">'+(i%7?200:500)+'</span></span><span>00:00:'+String(i%60).padStart(2,'0')+'</span>';}});});
  // Time series data.
  document.querySelectorAll('[data-ts]').forEach(function(ts){pb.pbInit(ts);var now=Date.now(),d=[];for(var i=0;i<=90;i++)d.push([now-(90-i)*6e4,40+25*Math.sin(i/9)]);
    ts.pbSetData({unit:'%',max:100,threshold:{v:85,label:'alert 85%'},series:[{name:'pve-01',c:'var(--chart-1)',data:d},{name:'nas-01',c:'var(--chart-2)',data:d.map(function(p){return [p[0],p[1]/2];})}]});});
  document.querySelectorAll('form').forEach(function(f){f.addEventListener('submit',function(e){e.preventDefault();});});
}
if(typeof window.pbInit==='function'){window.pb=window;pbFixtureSetup(window);document.addEventListener('DOMContentLoaded',function(){window.pbReady=true;});}
