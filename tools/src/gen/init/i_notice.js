document.querySelectorAll('[data-notice-demo]').forEach(function(d){var t=d.querySelector('[data-notice-target]');
  d.querySelector('[data-notice-fail]').addEventListener('click',function(){pbNoticeInto(t,{variant:'down',title:'Could not save the share',body:'The server answered 502 after 3 tries.',dismissible:true,actions:[{label:'Try again',onClick:function(e,n){n.remove();}},{label:'View log',href:'#log'}]});});
  d.querySelector('[data-notice-ok]').addEventListener('click',function(){pbNoticeInto(t,{variant:'ok',title:'Saved',dismissible:true});});
  d.querySelector('[data-notice-html]').addEventListener('click',function(){pbNoticeInto(t,{variant:'warn',title:'<b>Not bold</b>',body:'<img src=x> shows as text; bodyHTML is the opt-in.'});});});
