document.querySelectorAll('[data-validate]').forEach(function(f){pbInit(f);f.addEventListener('submit',function(e){e.preventDefault();});});
