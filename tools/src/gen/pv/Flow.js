var NS='http://www.w3.org/2000/svg',fid=0;
function flowDraw(d){var s=d.querySelector('svg'),o=d.getBoundingClientRect(),id='pbf'+(d.dataset.fid||(d.dataset.fid=++fid));
 var defs='<defs>'+['','accent','down'].map(function(k){return '<marker id="'+id+'-'+(k||'base')+'" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto-start-reverse"><path class="pb-arrowhead'+(k?' pb-arrowhead--'+k:'')+'" d="M1 1L9 5L1 9"/></marker>'}).join('')+'</defs>';
 function b(n){var r=d.querySelector('[data-id='+n+']').getBoundingClientRect();return {l:r.left-o.left,r:r.right-o.left,t:r.top-o.top,b:r.bottom-o.top,cx:r.left-o.left+r.width/2,cy:r.top-o.top+r.height/2};}
 var h=defs,E=[['cl','px','accent','https'],['px','app','accent','proxy'],['app','db','accent','sql',1],['app','bk','base','snapshot'],['bk','b2','down','upload']];
 E.forEach(function(e){var a=b(e[0]),c=b(e[1]),cls='pb-edge'+(e[2]==='accent'?' pb-edge--active':e[2]==='down'?' pb-edge--down':' pb-edge--async'),p,lx,ly;
  if(Math.abs(a.cy-c.cy)<4){p='M'+(a.r+2)+' '+a.cy+' H'+(c.l-3);lx=(a.r+c.l)/2;ly=a.cy-8;}
  else{p='M'+a.cx+' '+(a.b+2)+' V'+(c.t-3);lx=a.cx+8;ly=(a.b+c.t)/2+4;}
  h+='<path class="'+cls+'" d="'+p+'" marker-end="url(#'+id+'-'+e[2]+')"'+(e[4]?' marker-start="url(#'+id+'-'+e[2]+')"':'')+'/>';
  h+='<text class="pb-edge-label" x="'+lx+'" y="'+ly+'" text-anchor="'+(Math.abs(a.cy-c.cy)<4?'middle':'start')+'">'+e[3]+'</text>';});
 s.innerHTML=h;}
function flowAll(){document.querySelectorAll('[data-flow]').forEach(flowDraw);}
flowAll();addEventListener('resize',flowAll);if(document.fonts)document.fonts.ready.then(flowAll);
