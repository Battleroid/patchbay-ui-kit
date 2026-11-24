document.querySelectorAll('[data-keys-demo]').forEach(function(d){var ul=d.querySelector('[data-keys-notes]');
  d.querySelector('#keys-demo-add').addEventListener('click',function(){var li=document.createElement('li');li.textContent='Note '+(ul.children.length+1);ul.appendChild(li);});
  pbShortcuts({'/':{do:'#keys-demo-field',desc:'Focus the demo field',group:'demo'},'n':{do:'#keys-demo-add',desc:'Add a note',group:'demo'},'g c':{do:function(){ul.replaceChildren();},desc:'Clear the notes',group:'demo'},
    'mod+enter':{do:'#keys-demo-add',desc:'Add a note from the field',group:'demo',allowInInput:true}},{scope:d});});
