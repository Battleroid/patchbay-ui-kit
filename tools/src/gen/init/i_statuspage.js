var bad=[{60:'warn',89:'warn'},{},{41:'down',42:'warn',77:'none',78:'none'}];
var WORD={ok:'up',warn:'degraded',down:'down',none:'no data'};
function when(i){var d=89-i;return d===0?'today':d===1?'yesterday':d+' days ago';}
document.querySelectorAll('.pb-service').forEach(function(s){var u=document.createElement('div');u.className='pb-uptime';
 var b=bad[+s.dataset.u]||{},odd=[];for(var i=0;i<90;i++){var c=document.createElement('i');var st=b[i]||'ok';if(st!=='ok'){c.dataset.s=st;odd.push(when(i)+' '+WORD[st]);}c.title=when(i)+' · '+WORD[st];c.dataset.day=i;u.appendChild(c);}
 /* Phones have no hover: the bar is one tab stop, arrows or a tap read a day out, and the label lists the days that were not up. */
 u.tabIndex=0;u.setAttribute('role','group');u.setAttribute('aria-label','Last 90 days: '+(odd.length?odd.join(', '):'up every day')+'. Arrow keys read a day.');
 s.appendChild(u);var a=document.createElement('div');a.className='pb-uptime__axis';a.innerHTML='<span>90 days ago</span><span>today</span>';s.appendChild(a);
 var r=document.createElement('div');r.className='pb-uptime__read';r.setAttribute('role','status');s.appendChild(r);
 var cur=89;function show(i){cur=Math.max(0,Math.min(89,i));var c=u.children[cur];[].forEach.call(u.children,function(x){x.removeAttribute('data-cur');});c.setAttribute('data-cur','');r.textContent=when(cur)+' · '+WORD[b[cur]||'ok'];}
 u.addEventListener('click',function(e){var c=e.target.closest('i');if(c)show(+c.dataset.day);});
 u.addEventListener('keydown',function(e){var k={ArrowLeft:-1,ArrowRight:1}[e.key];if(!k&&e.key!=='Home'&&e.key!=='End')return;e.preventDefault();show(e.key==='Home'?0:e.key==='End'?89:cur+k);});});
