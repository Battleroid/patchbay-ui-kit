document.querySelectorAll('[data-confirm-demo]').forEach(function(d){var o=d.querySelector('[data-confirm-out]');
  d.querySelector('form').addEventListener('submit',function(e){e.preventDefault();o.textContent='Submitted '+(e.submitter?e.submitter.name+'='+e.submitter.value:'')+'.';});
  d.querySelector('a[data-confirm]').addEventListener('click',function(e){e.preventDefault();o.textContent='Left the page.';});});
