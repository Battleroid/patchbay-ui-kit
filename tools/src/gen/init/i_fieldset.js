/* Example only: pretend the server saves each section after a moment. */
document.querySelectorAll('form[data-section]').forEach(function(f){f.addEventListener('submit',function(e){e.preventDefault();setTimeout(function(){f.dispatchEvent(new CustomEvent('pb:saved'));},600);});});
