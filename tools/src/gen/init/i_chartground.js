var NS='http://www.w3.org/2000/svg';
function cgDraw(){document.querySelectorAll('.pb-chart[data-g] svg').forEach(function(s){var c=s.parentNode,g=c.dataset.g,W=Math.max(200,s.parentNode.clientWidth-(g==='plain'?0:32)),H=150;s.setAttribute('viewBox','0 0 '+W+' '+H);s.style.height=H+'px';
 var L=34,R=W-4,T=10,B=H-22,h='';function y(v,mx){return B-(v/mx)*(B-T)}function x(i,n){return L+i*(R-L)/(n-1)}
 if(g==='plain'){var d=[38,41,40,52,39,44,47,40,42,61,45,43,44,46];var mx=70,bw=(R-L)/d.length;[0,35,70].forEach(function(v){h+='<line class="pb-grid" x1="'+L+'" x2="'+R+'" y1="'+y(v,mx)+'" y2="'+y(v,mx)+'"/><text class="pb-axis" x="'+(L-6)+'" y="'+(y(v,mx)+4)+'" text-anchor="end">'+v+'</text>';});
  d.forEach(function(v,i){h+='<rect class="pb-bar '+(v>55?'pb-s2':'pb-s1')+'" x="'+(L+i*bw+2)+'" y="'+y(v,mx)+'" width="'+Math.max(1,bw-4)+'" height="'+(B-y(v,mx))+'"/>';});
  h+='<line class="pb-threshold" x1="'+L+'" x2="'+R+'" y1="'+y(55,mx)+'" y2="'+y(55,mx)+'"/><text class="pb-threshold-label" x="'+R+'" y="'+(y(55,mx)-6)+'" text-anchor="end">quota 55</text>';
  ['nov 9','nov 15','nov 22'].forEach(function(t,i){h+='<text class="pb-axis" x="'+(L+[0,0.5,1][i]*(R-L))+'" y="'+(B+16)+'" text-anchor="'+['start','middle','end'][i]+'">'+t+'</text>';});}
 else{var n=36,mx=g==='ink'?300:1000,a=pbSeries(g==='ink'?2:0.3,n,g==='ink'?190:360,g==='ink'?40:120),b=g==='ink'?pbSeries(4,n,70,12):null;if(g==='panel')a=a.map(function(v,i){return i>=21&&i<=26?v+420:v});
  if(g==='panel')h+='<rect class="pb-band pb-band--warn" x="'+x(21,n)+'" y="'+T+'" width="'+(x(26,n)-x(21,n))+'" height="'+(B-T)+'"/><text class="pb-band-label" x="'+(x(21,n)+6)+'" y="'+(T+12)+'">redis full</text>';
  if(g==='ink')h+='<rect class="pb-band" x="'+x(8,n)+'" y="'+T+'" width="'+(x(13,n)-x(8,n))+'" height="'+(B-T)+'"/><text class="pb-band-label" x="'+(x(8,n)+6)+'" y="'+(T+12)+'">scrub</text>';
  var ticks=g==='ink'?[0,150,300]:[0,500,1000];ticks.forEach(function(v){h+='<line class="pb-grid" x1="'+L+'" x2="'+R+'" y1="'+y(v,mx)+'" y2="'+y(v,mx)+'"/><text class="pb-axis" x="'+(L-6)+'" y="'+(y(v,mx)+4)+'" text-anchor="end">'+v+'</text>';});
  function path(d){return d.map(function(v,i){return (i?'L':'M')+x(i,n).toFixed(1)+' '+y(Math.min(v,mx),mx).toFixed(1)}).join(' ')}
  h+='<path class="pb-area pb-s1" d="'+path(a)+' L'+R+' '+B+' L'+L+' '+B+'Z"/>';if(b)h+='<path class="pb-line pb-s2" d="'+path(b)+'"/>';h+='<path class="pb-line pb-s1" d="'+path(a)+'"/>';
  h+='<circle class="pb-s1 pb-dot-end" cx="'+R+'" cy="'+y(a[n-1],mx)+'" r="4"/>';
  if(g==='panel')h+='<line class="pb-threshold" x1="'+L+'" x2="'+R+'" y1="'+y(500,mx)+'" y2="'+y(500,mx)+'"/><text class="pb-threshold-label" x="'+(L+6)+'" y="'+(y(500,mx)-6)+'">slo 500</text>';
  (g==='ink'?['mon','thu','sun']:['00','12','24']).forEach(function(t,i){h+='<text class="pb-axis" x="'+(L+[0,0.5,1][i]*(R-L))+'" y="'+(B+16)+'" text-anchor="'+['start','middle','end'][i]+'">'+t+'</text>';});}
 s.innerHTML=h;});}
cgDraw();addEventListener('resize',cgDraw);if(document.fonts)document.fonts.ready.then(cgDraw);
