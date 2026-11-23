var bad=[{60:'warn',89:'warn'},{},{41:'down',42:'warn',77:'none',78:'none'}];
document.querySelectorAll('.pb-service').forEach(function(s){var u=document.createElement('div');u.className='pb-uptime';
 var b=bad[+s.dataset.u]||{};for(var i=0;i<90;i++){var c=document.createElement('i');var st=b[i]||'ok';if(st!=='ok')c.dataset.s=st;c.title=(89-i)+'d ago · '+st;u.appendChild(c);}
 s.appendChild(u);var a=document.createElement('div');a.className='pb-uptime__axis';a.innerHTML='<span>90 days ago</span><span>today</span>';s.appendChild(a);});
