function pbCopied(b,ok){var lab=b.querySelector('span:not(.pb-icon)'),ic=b.querySelector('.pb-icon');var o1=lab&&lab.textContent,o2=ic&&ic.className;
 if(lab)lab.textContent=ok?'Copied':'Press ⌘C';if(ic&&ok)ic.className='pb-icon pb-icon--check';if(ok)b.setAttribute('data-done','');if(b.dataset.tip!=null){b.dataset.tip=ok?'Copied':'Press ⌘C';b.setAttribute('data-tip-open','');}
 setTimeout(function(){if(lab)lab.textContent=o1;if(ic)ic.className=o2;b.removeAttribute('data-done');if(b.dataset.tip!=null){b.dataset.tip='Copy';b.removeAttribute('data-tip-open');}},1600);}
document.querySelectorAll('[data-copy],[data-copy-text]').forEach(function(b){b.addEventListener('click',function(){var inp=b.parentNode.querySelector('input'),t=b.dataset.copyText||inp.value;
 var p=navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(t):Promise.reject();
 p.then(function(){pbCopied(b,true)},function(){if(inp){var ty=inp.type;inp.type='text';inp.focus();inp.select();}pbCopied(b,false);});});});
document.querySelectorAll('[data-reveal]').forEach(function(b){b.onclick=function(){var i=b.parentNode.querySelector('input');var s=i.type==='password';i.type=s?'text':'password';b.firstChild.className='pb-icon pb-icon--'+(s?'eye-off':'eye');b.setAttribute('aria-label',s?'Hide':'Show');}});
