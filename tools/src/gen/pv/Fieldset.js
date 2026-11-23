document.querySelectorAll('[data-section]').forEach(function(f){var st=f.querySelector('.pb-foot__status'),btns=f.querySelectorAll('button:not(.pb-btn--danger)'),clean=true;
 function set(dirty,msg,state){btns.forEach(function(b){b.disabled=!dirty});if(st){st.textContent=msg;state?st.dataset.state=state:st.removeAttribute('data-state');}}
 f.addEventListener('input',function(){set(true,'Unsaved changes','dirty')});f.addEventListener('change',function(){set(true,'Unsaved changes','dirty')});
 f.addEventListener('reset',function(){setTimeout(function(){set(false,'No changes')})});
 f.addEventListener('click',function(e){var b=e.target.closest('.pb-btn--primary');if(!b)return;set(false,'Saved just now','saved');if(st){st.insertAdjacentHTML('afterbegin','<span class="pb-icon pb-icon--status-ok"></span>');}});});
