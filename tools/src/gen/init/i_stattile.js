document.querySelectorAll('svg[data-tile]').forEach(function(s){var W=200,H=48,k=+s.dataset.tile,d=[];for(var i=0;i<30;i++)d.push(50+14*Math.sin(i/4+k)+5*Math.sin(i/1.7+k*2));var p=pbPath(d,W,H,6);
 s.setAttribute('viewBox','0 0 '+W+' '+H);s.setAttribute('preserveAspectRatio','none');s.setAttribute('aria-hidden','true');
 s.innerHTML='<path class="pb-tile__area" d="'+p+' L'+W+' '+H+' L0 '+H+'Z"/><path d="'+p+'"/>';});
