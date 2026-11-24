var NS='http://www.w3.org/2000/svg';
function draw(d){var s=d.querySelector('svg');s.innerHTML='';var o=d.getBoundingClientRect();
 function box(id){var r=d.querySelector('[data-id='+id+']').getBoundingClientRect();return {cx:r.left-o.left+r.width/2,t:r.top-o.top,b:r.bottom-o.top};}
 var E=[['wan','gw','pb-edge pb-edge--active','wan'],['gw','nas','pb-edge','10G'],['gw','pve','pb-edge pb-edge--active','10G'],['gw','pi','pb-edge pb-edge--down','1G']];pbDiagramText(d,E,function(e){return /active/.test(e[2])?'active':/down/.test(e[2])?'down':'';});E.forEach(function(e){
  var a=box(e[0]),b=box(e[1]),my=(a.b+b.t)/2;var p=document.createElementNS(NS,'path');
  p.setAttribute('d','M'+a.cx+' '+a.b+' V'+my+' H'+b.cx+' V'+b.t);p.setAttribute('class',e[2]);s.appendChild(p);
  var t=document.createElementNS(NS,'text');t.setAttribute('class','pb-edge-label');t.setAttribute('x',b.cx+6);t.setAttribute('y',b.t-8);t.textContent=e[3];s.appendChild(t);});}
function all(){document.querySelectorAll('.pb-diagram:not([data-flow])').forEach(draw);}
all();addEventListener('resize',all);if(document.fonts)document.fonts.ready.then(all);
