function pbSeries(seed,n,base,amp){var o=[];for(var i=0;i<n;i++)o.push(base+amp*Math.sin(i/2.6+seed)+amp*0.45*Math.sin(i*1.9+seed*3));return o;}
function pbPath(d,W,H,pad){var mn=Math.min.apply(0,d),mx=Math.max.apply(0,d),r=mx-mn||1;pad=pad||2;return d.map(function(v,i){return (i?'L':'M')+(i*(W/(d.length-1))).toFixed(1)+' '+(pad+(H-2*pad)*(1-(v-mn)/r)).toFixed(1)}).join(' ');}
document.querySelectorAll('svg[data-tile]').forEach(function(s){var W=200,H=48,k=+s.dataset.tile,d=[];for(var i=0;i<30;i++)d.push(50+14*Math.sin(i/4+k)+5*Math.sin(i/1.7+k*2));var p=pbPath(d,W,H,6);
 s.setAttribute('viewBox','0 0 '+W+' '+H);s.setAttribute('preserveAspectRatio','none');s.setAttribute('aria-hidden','true');
 s.innerHTML='<path class="pb-tile__area" d="'+p+' L'+W+' '+H+' L0 '+H+'Z"/><path d="'+p+'"/>';});
