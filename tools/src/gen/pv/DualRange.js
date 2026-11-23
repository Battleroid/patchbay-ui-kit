function pbSize(p){var b=Math.pow(10,p/100*8);return b<1e3?Math.round(b)+' KB':b<1e6?Math.round(b/1e3)+' MB':(b<1e7?(b/1e6).toFixed(1).replace('.0',''):Math.round(b/1e6))+' GB';}
document.querySelectorAll('[data-range2]').forEach(function(w){var r=w.querySelectorAll('input'),out=w.closest('.pb-field').querySelector('[data-out]'),u=w.dataset.unit;
 function fmt(v){return u==='hour'?String(v).padStart(2,'0')+':00':pbSize(+v);}
 function up(e){var a=+r[0].value,b=+r[1].value;if(a>b){if(e&&e.target===r[0])r[0].value=b;else r[1].value=a;}a=+r[0].value;b=+r[1].value;var mx=+r[0].max;
  w.style.setProperty('--lo',a/mx*100+'%');w.style.setProperty('--hi',b/mx*100+'%');r[0].style.zIndex=a>mx-2?2:1;out.textContent=fmt(a)+' – '+fmt(b);}
 r.forEach(function(x){x.addEventListener('input',up)});up();});
