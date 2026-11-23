document.querySelectorAll('[data-toast]').forEach(function(b){b.addEventListener('click',function(){var c=b.closest('section[data-edge]')||document.body,k=b.dataset.toast;
  if(k==='ok')pbToast({status:'ok',title:'Settings saved',container:c});
  else if(k==='undo')pbToast({title:'3 files deleted',body:'They stay in trash for 30 days.',actions:[{label:'Undo',onClick:function(){pbToast({status:'ok',title:'Files restored',container:c});}}],container:c});
  else if(k==='down')pbToast({status:'down',title:'Backup failed',body:'Offsite bucket refused the upload (403).',actions:[{label:'Retry'},{label:'View log'}],container:c});
  else if(k==='ink')pbToast({ink:true,status:'ok',title:'Copied to clipboard',body:'<code>nas-01.lan:/tank/media</code>',container:c});
  else{var t=pbToast({status:'busy',title:'Uploading 6 files…',body:'0 of 6',container:c}),n=0,iv=setInterval(function(){n++;if(n<6)t.update({body:n+' of 6'});else{clearInterval(iv);t.update({status:'ok',title:'Upload complete',body:'6 files · 18.2 MB'});}},500);}});});
