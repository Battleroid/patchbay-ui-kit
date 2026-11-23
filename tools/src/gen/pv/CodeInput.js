function pbOtp(g){var ins=[].slice.call(g.querySelectorAll('input'));
 function done(){var v=ins.map(function(i){return i.value}).join('');var f=g.closest('.pb-field');if(v.length===ins.length){f&&f.setAttribute('data-valid','');g.dispatchEvent(new CustomEvent('complete',{detail:v,bubbles:true}));}else f&&f.removeAttribute('data-valid');}
 ins.forEach(function(inp,i){inp.addEventListener('input',function(){inp.value=inp.value.replace(/\D/g,'').slice(-1);if(inp.value&&ins[i+1])ins[i+1].focus();done();});
  inp.addEventListener('keydown',function(e){if(e.key==='Backspace'&&!inp.value&&ins[i-1]){ins[i-1].value='';ins[i-1].focus();e.preventDefault();done();}
   else if(e.key==='ArrowLeft'&&ins[i-1])ins[i-1].focus();else if(e.key==='ArrowRight'&&ins[i+1])ins[i+1].focus();});
  inp.addEventListener('focus',function(){inp.select();});
  inp.addEventListener('paste',function(e){var t=(e.clipboardData||window.clipboardData).getData('text').replace(/\D/g,'');if(!t)return;e.preventDefault();for(var k=0;k<ins.length-i&&k<t.length;k++)ins[i+k].value=t[k];(ins[Math.min(ins.length-1,i+t.length)]).focus();done();});});}
document.querySelectorAll('[data-otp]').forEach(pbOtp);
