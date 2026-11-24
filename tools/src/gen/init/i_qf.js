document.querySelectorAll('[data-qf]').forEach(function(q){var wrap=q.parentElement,list=wrap.querySelector('[data-qf-list]'),cnt=wrap.querySelector('[data-qf-count]'),rs=wrap.querySelector('[data-qf-reset]');
  q.addEventListener('pb:change',function(){var m=q.pbMatch(function(r,k){return k?r.dataset[k]:r.textContent;}),n=0,all=list.children.length;Array.from(list.children).forEach(function(r){var ok=m(r);r.hidden=!ok;if(ok)n++;});cnt.textContent=n+' of '+all+' services';});
  pbInit(q);if(rs)rs.addEventListener('click',function(){q.pbSet('');});});
