document.querySelectorAll('[data-dropset]').forEach(function(d){d.addEventListener('pb:default',function(){
  /* The demo plays the app: it "saves" the defaults, then settles it. A real app posts them and dispatches pb:saved or pb:error ({message}) on the element. */
  setTimeout(function(){d.dispatchEvent(new CustomEvent('pb:saved'));},600);});});
