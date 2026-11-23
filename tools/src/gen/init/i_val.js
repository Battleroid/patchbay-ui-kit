document.querySelectorAll('[data-validate]').forEach(function(f){pbValidate(f);f.addEventListener('submit',function(e){e.preventDefault();});});
