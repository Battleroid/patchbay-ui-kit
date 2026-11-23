function pbCombo(c){var inp=c.querySelector('input'),lb=c.querySelector('.pb-listbox'),opts=[].slice.call(lb.querySelectorAll('.pb-option:not(.pb-option--empty)')),empty=lb.querySelector('.pb-option--empty'),groups=[].slice.call(lb.querySelectorAll('.pb-listbox__group')),act=-1,uid='o'+Math.random().toString(36).slice(2,7);
 opts.forEach(function(o,i){o.id=uid+i;o.dataset.label=o.childNodes[1]?o.childNodes[1].textContent:o.textContent;});
 function vis(){return opts.filter(function(o){return !o.hidden});}
 function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;');}
 function filter(q){q=q.toLowerCase();opts.forEach(function(o){var l=o.dataset.label,i=q?l.toLowerCase().indexOf(q):0;o.hidden=q&&i<0;var t=o.childNodes[1];if(t&&t.nodeType===3||o.querySelector('mark')){var span=o.querySelector('.pb-option__text');if(!span){span=document.createElement('span');span.className='pb-option__text';o.replaceChild(span,o.childNodes[1]);}span.innerHTML=q&&i>=0?esc(l.slice(0,i))+'<mark>'+esc(l.slice(i,i+q.length))+'</mark>'+esc(l.slice(i+q.length)):esc(l);}});
  groups.forEach(function(g){var n=g.nextElementSibling,any=false;while(n&&!n.classList.contains('pb-listbox__group')){if(n.classList.contains('pb-option')&&!n.hidden&&n!==empty)any=true;n=n.nextElementSibling;}g.hidden=!any;});
  empty.hidden=vis().length>0;setAct(vis().length?0:-1);}
 function setAct(i){var v=vis();opts.forEach(function(o){o.removeAttribute('data-active')});act=i;if(i>=0&&v[i]){v[i].setAttribute('data-active','');inp.setAttribute('aria-activedescendant',v[i].id);v[i].scrollIntoView({block:'nearest'});}else inp.removeAttribute('aria-activedescendant');}
 function open(all){lb.hidden=false;inp.setAttribute('aria-expanded','true');filter(all?'':inp.value);}
 function close(){lb.hidden=true;inp.setAttribute('aria-expanded','false');}
 function choose(o){opts.forEach(function(x){x.setAttribute('aria-selected',x===o)});inp.value=o.dataset.value;close();inp.dispatchEvent(new Event('change',{bubbles:true}));}
 opts.forEach(function(o){o.setAttribute('aria-selected',o.dataset.value===inp.value);o.addEventListener('mousedown',function(e){e.preventDefault();choose(o);});});
 inp.addEventListener('input',function(){open(false);});inp.addEventListener('focus',function(){inp.select();});
 inp.addEventListener('keydown',function(e){var v=vis();if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(lb.hidden){open(true);return;}setAct(Math.max(0,Math.min(v.length-1,act+(e.key==='ArrowDown'?1:-1))));}
  else if(e.key==='Enter'&&!lb.hidden&&v[act]){e.preventDefault();choose(v[act]);}else if(e.key==='Escape'){close();}});
 inp.addEventListener('blur',close);c.querySelector('[data-combo-toggle]').addEventListener('mousedown',function(e){e.preventDefault();lb.hidden?(inp.focus(),open(true)):close();});}
document.querySelectorAll('[data-combo]').forEach(pbCombo);
