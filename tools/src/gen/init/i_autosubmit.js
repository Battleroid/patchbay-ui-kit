document.querySelectorAll('[data-autosubmit-demo]').forEach(function(d){var o=d.querySelector('[data-autosubmit-out]'),f=d.querySelector('form'),n=0;
  f.addEventListener('submit',function(e){e.preventDefault();n++;o.textContent='Submitted '+n+': '+new URLSearchParams(new FormData(f)).toString();});});
