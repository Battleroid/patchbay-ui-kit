document.querySelectorAll('[data-busy-demo]').forEach(function(d){var r=d.querySelector('[data-busy-region]');
  function go(ms){pbBusy(true,r);setTimeout(function(){pbBusy(false,r);},ms);}
  d.querySelector('[data-busy-slow]').addEventListener('click',function(){go(2000);});d.querySelector('[data-busy-fast]').addEventListener('click',function(){go(150);});
  var sb=d.querySelector('[data-busy-btn]');sb.addEventListener('click',function(){pbBusy(true,sb);setTimeout(function(){pbBusy(false,sb);},2000);});
  d.querySelector('[data-busy-bar]').addEventListener('click',function(){pbBusy(true);setTimeout(function(){pbBusy(false);},2000);});});
