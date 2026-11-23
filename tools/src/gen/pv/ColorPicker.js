document.querySelectorAll('[data-swatch-group]').forEach(function(g){var s=[].slice.call(g.querySelectorAll('.pb-swatch'));
 function pick(b){s.forEach(function(x){x.setAttribute('aria-checked',x===b);x.tabIndex=x===b?0:-1;});b.focus();}
 s.forEach(function(b,i){b.tabIndex=b.getAttribute('aria-checked')==='true'?0:-1;b.addEventListener('click',function(){pick(b)});
  b.addEventListener('keydown',function(e){var d={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1}[e.key];if(d){e.preventDefault();pick(s[(i+d+s.length)%s.length]);}});});});
var PB_SW=[['#1f3fd6','Blue'],['#ff5b35','Red'],['#ffd23f','Yellow'],['#45d6a5','Mint'],['#0b7a5c','Green'],['#8a5200','Ochre'],['#c42d16','Brick'],['#8a2f9e','Plum'],['#17150f','Ink'],['#5b564c','Grey'],['#dcd6ca','Sand'],['#ffffff','White']];
document.querySelectorAll('[data-colorfield]').forEach(function(f){var sw=f.querySelector('.pb-input__swatch'),inp=f.querySelector('input'),pop=document.createElement('div');pop.className='pb-colorpop';pop.setAttribute('popover','');pop.setAttribute('role','dialog');pop.setAttribute('aria-label','Choose a color');
 pop.innerHTML='<span class="pb-eyebrow">kit colors</span><div class="pb-swatches">'+PB_SW.map(function(c){return '<button type="button" class="pb-swatch" style="--c:'+c[0]+'" data-hex="'+c[0]+'" aria-label="'+c[1]+'"></button>'}).join('')+'</div><span class="pb-eyebrow">custom</span><div class="pb-swatches"><label class="pb-swatch pb-swatch--custom" aria-label="Custom color"><span class="pb-icon pb-icon--plus"></span><input type="color"></label></div>';
 (f.closest('label,.pb-field')||f).after(pop);
 function set(h){if(!/^#[0-9a-f]{6}$/i.test(h)){f.closest('.pb-field').setAttribute('data-invalid','');return;}f.closest('.pb-field').removeAttribute('data-invalid');h=h.toLowerCase();inp.value=h;sw.style.setProperty('--c',h);pop.querySelectorAll('[data-hex]').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.hex===h)});}
 function place(){var r=f.getBoundingClientRect();pop.style.left=Math.max(8,Math.min(r.left,innerWidth-pop.offsetWidth-8))+'px';pop.style.top=(r.bottom+6)+'px';}
 sw.addEventListener('click',function(){if(pop.matches(':popover-open'))return pop.hidePopover();set(inp.value);pop.showPopover();place();(pop.querySelector('[aria-pressed="true"]')||pop.querySelector('.pb-swatch')).focus();});
 addEventListener('scroll',function(){if(pop.matches(':popover-open'))place();},true);
 pop.addEventListener('click',function(e){var b=e.target.closest('[data-hex]');if(b){set(b.dataset.hex);pop.hidePopover();sw.focus();}});
 pop.querySelector('input[type=color]').addEventListener('input',function(e){set(e.target.value);});
 inp.addEventListener('change',function(){set(inp.value.trim().replace(/^([0-9a-f]{6})$/i,'#$1'));});set(inp.value);});
