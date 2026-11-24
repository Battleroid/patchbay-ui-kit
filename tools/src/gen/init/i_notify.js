document.querySelectorAll('[data-notify]').forEach(function(n){n.addEventListener('pb:test',function(e){var ch=e.detail.channel;
  /* The demo plays the app: it "sends" the test, then settles it. A real app posts to its server and dispatches pb:saved or pb:error ({message}) on the grid. */
  setTimeout(function(){n.dispatchEvent(new CustomEvent('pb:saved',{detail:{channel:ch}}));pbToast({title:'Test sent to '+ch,status:'ok',container:n.closest('section')||document.body});},700);});});
