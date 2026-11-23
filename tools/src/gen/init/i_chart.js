var NS='http://www.w3.org/2000/svg';function el(n,a,p){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);p.appendChild(e);return e;}
function series(seed,base,amp){var o=[];for(var i=0;i<25;i++){o.push(base+amp*Math.sin(i/3+seed)+amp*0.5*Math.sin(i*1.7+seed*2));}return o;}
document.querySelectorAll('.pb-chart[data-kind=line] svg').forEach(function(s){var L=36,R=396,T=8,B=126,max=600;
 [0,200,400,600].forEach(function(v){var y=B-(v/max)*(B-T);el('line',{x1:L,x2:R,y1:y,y2:y,class:'pb-grid'},s);el('text',{x:L-6,y:y+4,'text-anchor':'end',class:'pb-axis'},s).textContent=v;});
 ['00','06','12','18','24'].forEach(function(t,i){el('text',{x:L+i*(R-L)/4,y:B+18,'text-anchor':'middle',class:'pb-axis'},s).textContent=t;});
 function path(d){return d.map(function(v,i){return (i?'L':'M')+(L+i*(R-L)/24).toFixed(1)+' '+(B-(v/max)*(B-T)).toFixed(1)}).join(' ');}
 var a=series(0.4,360,110),b=series(2,90,30),c=series(1.1,320,60);
 el('path',{d:path(a)+' L'+R+' '+B+' L'+L+' '+B+'Z',class:'pb-area pb-s1'},s);
 el('path',{d:path(c),class:'pb-line pb-s3 pb-dashed'},s);el('path',{d:path(a),class:'pb-line pb-s1'},s);el('path',{d:path(b),class:'pb-line pb-s2'},s);
 var xs=a.map(function(v,i){return L+i*(R-L)/24}),at=function(d){return d.map(function(v,i){return [xs[i],B-(v/max)*(B-T)]})};
 s.setAttribute('aria-label','WAN throughput over 24 hours, down, up and last week');
 pbChartHover(s,{pos:xs,top:T,bottom:B,unit:' mbps',labels:xs.map(function(v,i){return ('0'+i).slice(-2)+':00'}),series:[{name:'down',c:'var(--chart-1)',v:a,at:at(a)},{name:'up',c:'var(--chart-2)',v:b,at:at(b)},{name:'last week',c:'var(--chart-3)',v:c,at:at(c)}]});});
document.querySelectorAll('.pb-chart[data-kind=bar] svg').forEach(function(s){var d=[['tank',6.2,8],['fast',1.4,2],['backup',9.1,12],['scratch',0.3,1]];var L=64,R=396,h=20,g=10;
 d.forEach(function(r,i){var y=4+i*(h+g),w=(R-L);el('text',{x:L-8,y:y+14,'text-anchor':'end',class:'pb-axis'},s).textContent=r[0];
  el('rect',{x:L,y:y,width:w,height:h,class:'pb-bar',style:'fill:var(--surface-sunk);stroke:var(--line)'},s);
  el('rect',{x:L,y:y,width:w*r[1]/r[2],height:h,class:'pb-bar '+(r[1]/r[2]>0.75?'pb-s2':'pb-s1')},s);
  el('text',{x:L+w*r[1]/r[2]+6,y:y+14,class:'pb-axis',style:'fill:var(--ink)'},s).textContent=r[1]+' / '+r[2];});
 s.setAttribute('aria-label','Disk used per pool');
 pbChartHover(s,{axis:'y',band:h+g,pos:d.map(function(r,i){return 4+i*(h+g)+h/2}),labels:d.map(function(r){return r[0]}),series:[
  {name:'used',c:d.map(function(r){return r[1]/r[2]>0.75?'var(--chart-2)':'var(--chart-1)'}),unit:' TB',v:d.map(function(r){return r[1]}),at:d.map(function(r,i){return [L+(R-L)*r[1]/r[2],4+i*(h+g)+h/2]})},
  {name:'size',c:'var(--ink-muted)',unit:' TB',v:d.map(function(r){return r[2]})},
  {name:'free',c:'var(--ink-muted)',unit:'%',v:d.map(function(r){return Math.round((1-r[1]/r[2])*100)})}]});});
