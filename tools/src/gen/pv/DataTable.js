document.querySelectorAll('.pb-table').forEach(function(t){var wrap=t.closest('.pb-tablewrap'),all=t.querySelector('[data-all]'),rows=[].slice.call(t.tBodies[0].rows),out=wrap&&wrap.querySelector('[data-selcount]');
 function sync(){var n=0;rows.forEach(function(r){var c=r.querySelector('.pb-check').checked;r.setAttribute('aria-selected',c);if(c)n++;});all.checked=n===rows.length;all.indeterminate=n>0&&n<rows.length;out.textContent=n?n+' selected':'';}
 var sel=all&&out&&!t.closest('[data-bulk]');if(sel){rows.forEach(function(r){var c=r.querySelector('.pb-check');if(c)c.onchange=sync;});all.onchange=function(){rows.forEach(function(r){r.querySelector('.pb-check').checked=all.checked});sync();};}
 t.querySelectorAll('th[aria-sort]').forEach(function(th,ci){th.querySelector('button').onclick=function(){var col=[].indexOf.call(th.parentNode.children,th);var dir=th.getAttribute('aria-sort')==='ascending'?'descending':'ascending';
  t.querySelectorAll('th[aria-sort]').forEach(function(x){x.setAttribute('aria-sort','none')});th.setAttribute('aria-sort',dir);
  rows.sort(function(a,b){var x=a.cells[col].textContent,y=b.cells[col].textContent,nx=parseFloat(x),ny=parseFloat(y);var c=isNaN(nx)||isNaN(ny)?x.localeCompare(y):nx-ny;return dir==='ascending'?c:-c;});
  rows.forEach(function(r){t.tBodies[0].appendChild(r)});};});
 if(sel)sync();});
