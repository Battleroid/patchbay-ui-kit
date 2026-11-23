var NS='http://www.w3.org/2000/svg';
document.querySelectorAll('svg[data-spark],svg[data-bars]').forEach(function(s){var r=s.getBoundingClientRect(),W=r.width,H=r.height;s.setAttribute('viewBox','0 0 '+W+' '+H);
 var seed=+(s.dataset.spark||s.dataset.bars),d=pbSeries(seed,24,50,18);if(s.hasAttribute('data-rise'))d=d.map(function(v,i){return v+i*2.2});var h='';
 if(s.dataset.bars){var bw=W/d.length;var mx=Math.max.apply(0,d);d.forEach(function(v,i){var bh=Math.max(2,(v/mx)*H);h+='<rect x="'+(i*bw+0.5).toFixed(1)+'" y="'+(H-bh).toFixed(1)+'" width="'+(bw-1.5).toFixed(1)+'" height="'+bh.toFixed(1)+'"/>';});}
 else{var p=pbPath(d,W,H,3);if(s.hasAttribute('data-base'))h+='<path class="pb-spark__base" d="M0 '+(H/2)+' H'+W+'"/>';if(s.hasAttribute('data-area'))h+='<path class="pb-spark__area" d="'+p+' L'+W+' '+H+' L0 '+H+'Z"/>';h+='<path d="'+p+'"/>';
  if(s.hasAttribute('data-end')){var last=p.split(' ');h+='<circle cx="'+W+'" cy="'+last[last.length-1]+'" r="2.5"/>';}}
 s.innerHTML=h;});
