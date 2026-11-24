document.querySelectorAll('[data-tpl="print"]').forEach(function(r){pbInit(r);});
document.querySelectorAll('[data-tpl="print"] [data-print]').forEach(function(b){b.addEventListener('click',function(){window.print();});});
