function hl(src){var esc=function(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;')};
return src.split('\n').map(function(l){var m;
 if(/^\s*#/.test(l))return '<span class="tok-c">'+esc(l)+'</span>';
 if(m=l.match(/^(\s*)(- )?([\w.-]+)(:)(\s.*|)$/)){return m[1]+(m[2]?'<span class="tok-p">- </span>':'')+'<span class="tok-k">'+esc(m[3])+'</span><span class="tok-p">:</span>'+val(m[5]);}
 if(m=l.match(/^(\s*)(- )(.*)$/))return m[1]+'<span class="tok-p">- </span>'+val(' '+m[3]).slice(1);
 return esc(l);
 function val(v){if(/^\s*$/.test(v))return esc(v);var s=v.match(/^(\s*)(.*)$/);var x=s[2];
  if(/^".*"$/.test(x))return s[1]+'<span class="tok-s">'+esc(x)+'</span>';
  if(/^(true|false|null|[\d.:]+)$/.test(x))return s[1]+'<span class="tok-n">'+esc(x)+'</span>';
  if(/^\//.test(x))return s[1]+'<span class="tok-s">'+esc(x)+'</span>';
  return s[1]+'<span class="tok-t">'+esc(x)+'</span>';}
}).join('\n')+'\n';}
document.querySelectorAll('.pb-code').forEach(function(c){var ta=c.querySelector('textarea'),h=c.querySelector('.pb-code__hl'),g=c.querySelector('.pb-code__gutter');if(!ta||!h)return;
 function up(){h.innerHTML=hl(ta.value);g.textContent=ta.value.split('\n').map(function(_,i){return i+1}).join('\n');}
 ta.addEventListener('input',up);up();});
