/* Avatar editor: pick a photo (button, drop or paste), crop it square in a dialog (drag, wheel, pinch, slider or keys), save a re-encoded blob. The kit never uploads: pb:avatar carries the blob and the app settles it with pb:saved or pb:error. */
Object.assign(pbStrings,Object.assign({avUpload:'Upload photo',avChange:'Change photo',avRemove:'Remove',avEdit:'Edit photo',avEditSub:'Drag to move it. Scroll, pinch or use the slider to zoom.',avCrop:'Crop area',avKeys:'Arrow keys move · + and − zoom · R rotates · 0 resets',
  avZoom:'Zoom',avZoomIn:'Zoom in',avZoomOut:'Zoom out',avRotate:'Rotate',avReset:'Reset',avAnother:'Choose another',avSave:'Save photo',avPreview:'Preview',avOut:'{w} × {h} · from {sw} × {sh}',
  avType:'{name} isn’t a PNG, JPEG or WebP image.',avBig:'{name} is {size}. Use one up to {max}.',avSmall:'This image is {w} × {h}. Use one at least {min} × {min}.',avUnreadable:'Couldn’t read {name}. Try exporting it as PNG or JPEG.',
  avUpdated:'Photo updated',avRemoved:'Photo removed',avUndo:'Undo',avRestored:'Photo restored',avDrop:'Release to use this photo'},pbStrings));
function pbAvatarEdit(el){var av=el.querySelector('.pb-avatar'),pick=el.querySelector('[data-avatar-pick]'),rm=el.querySelector('[data-avatar-remove]'),hint=el.querySelector('.pb-avfield__hint'),
  N=+(el.dataset.size||512),MIN=+(el.dataset.min||128),MAXB=(+(el.dataset.maxMb||8))*1048576,TYPE=el.dataset.type||'image/webp',OK=/^image\/(png|jpeg|webp)$/,hint0=hint?hint.textContent:'',
  d,stage,img,zoom,stat,saveB,prevs=[],src=null,file=null,url='',st={x:0,y:0,z:1,r:0},zmax=4,pending=null,last='',back='',opener=null,ptrs=new Map(),pinch=null,raf=0;
  function T(k,v){return pbT(k,v);}
  function sync(){var s=el.dataset.avatarSync;return [av].concat(s?[].slice.call(document.querySelectorAll(s)):[]).filter(function(a,i,l){return a&&l.indexOf(a)===i;});}
  function photo(){var i=av&&av.querySelector(':scope > img');return i?i.getAttribute('src'):'';}
  /* Swap a photo in (or out, with no src) on every synced avatar, keeping its presence dot; pbAvatar rewrites initials and the label. */
  function apply(s){sync().forEach(function(a){var i=a.querySelector(':scope > img');if(s){if(!i){[].slice.call(a.childNodes).forEach(function(n){if(n.nodeType===3)n.remove();});i=document.createElement('img');i.alt='';a.prepend(i);}i.src=s;}else if(i)i.remove();pbAvatar(a);});
    var has=!!s;if(rm)rm.hidden=!has;var lb=pick&&pick.closest('label');if(lb){var t=lb.querySelector('[data-label]');if(t)t.textContent=T(has?'avChange':'avUpload');}}
  function say(msg){if(!hint)return;hint.textContent=msg||hint0;if(msg){hint.dataset.state='error';var i=document.createElement('span');i.className='pb-icon pb-icon--status-down';hint.prepend(i);}else hint.removeAttribute('data-state');}
  function size(b){return b>=1048576?pbNum(b/1048576,{maximumFractionDigits:1})+' MB':pbNum(Math.round(b/1024))+' KB';}
  /* Reject what the browser can't use before opening anything; the reason goes in the hint, under the button. */
  function take(f){if(!f)return;var nm=f.name||'image';if(!OK.test(f.type))return say(T('avType',{name:nm}));if(f.size>MAXB)return say(T('avBig',{name:nm,size:size(f.size),max:size(MAXB)}));
    var u=URL.createObjectURL(f),i=new Image();i.decoding='async';
    i.onload=function(){var w=i.naturalWidth,h=i.naturalHeight;if(Math.min(w,h)<MIN){URL.revokeObjectURL(u);return say(T('avSmall',{w:w,h:h,min:MIN}));}say('');open(i,u,f);};
    i.onerror=function(){URL.revokeObjectURL(u);say(T('avUnreadable',{name:nm}));};i.src=u;}
  function build(){d=document.createElement('dialog');d.className='pb-dialog pb-avedit';var id=pbId('pb-avedit'),I=function(n){return '<span class="pb-icon pb-icon--'+n+'"></span>';},pv='';
    [['xl',64],['lg',44],['',32],['sm',24]].forEach(function(p){pv+='<span class="pb-avatar'+(p[0]?' pb-avatar--'+p[0]:'')+'" aria-hidden="true"><canvas width="'+p[1]*2+'" height="'+p[1]*2+'"></canvas></span>';});
    d.innerHTML='<form method="dialog"><div class="pb-dialog__head"><div><h3 class="pb-dialog__title">'+pbEsc(T('avEdit'))+'</h3><p class="pb-dialog__sub" id="'+id+'-sub">'+pbEsc(T('avEditSub'))+'</p></div><button class="pb-btn pb-btn--ghost pb-btn--icon pb-btn--sm" value="cancel" aria-label="'+pbEsc(pbStrings.close)+'">'+I('close')+'</button></div>'+
      '<div class="pb-dialog__body pb-avedit__body"><div class="pb-avedit__stage" tabindex="0" role="group" aria-roledescription="'+pbEsc(T('avCrop'))+'" aria-label="'+pbEsc(T('avCrop'))+'" aria-describedby="'+id+'-keys"><img class="pb-avedit__img" alt="" draggable="false"><span class="pb-avedit__frame"></span></div>'+
      '<div class="pb-avedit__side"><div class="pb-avedit__previews" role="img" aria-label="'+pbEsc(T('avPreview'))+'">'+pv+'</div>'+
      '<div class="pb-field"><label class="pb-field__label" for="'+id+'-z">'+pbEsc(T('avZoom'))+'</label><div class="pb-avedit__zoom"><button type="button" class="pb-btn pb-btn--ghost pb-btn--icon pb-btn--sm" data-z="-1" aria-label="'+pbEsc(T('avZoomOut'))+'">'+I('zoom-out')+'</button><input type="range" class="pb-range" id="'+id+'-z" min="100" max="400" step="1" value="100" data-unit="%"><button type="button" class="pb-btn pb-btn--ghost pb-btn--icon pb-btn--sm" data-z="1" aria-label="'+pbEsc(T('avZoomIn'))+'">'+I('zoom-in')+'</button></div></div>'+
      '<div class="pb-avedit__tools"><button type="button" class="pb-btn pb-btn--sm" data-rotate>'+I('refresh')+pbEsc(T('avRotate'))+'</button><button type="button" class="pb-btn pb-btn--ghost pb-btn--sm" data-reset>'+pbEsc(T('avReset'))+'</button><label class="pb-btn pb-btn--ghost pb-btn--sm"><input type="file" class="pb-sr" accept="image/png,image/jpeg,image/webp">'+pbEsc(T('avAnother'))+'</label></div>'+
      '<p class="pb-avedit__keys" id="'+id+'-keys">'+pbEsc(T('avKeys'))+'</p></div></div>'+
      '<div class="pb-dialog__foot"><span class="pb-foot__status"></span><button class="pb-btn pb-btn--ghost" value="cancel">'+pbEsc(pbStrings.cancel)+'</button><button type="button" class="pb-btn pb-btn--primary" data-save data-busy-label="'+pbEsc(pbStrings.saving)+'">'+pbEsc(T('avSave'))+'</button></div></form>';
    el.appendChild(d);stage=d.querySelector('.pb-avedit__stage');img=d.querySelector('.pb-avedit__img');zoom=d.querySelector('input[type=range]');stat=d.querySelector('.pb-foot__status');saveB=d.querySelector('[data-save]');
    prevs=[].slice.call(d.querySelectorAll('.pb-avedit__previews canvas'));pbInit(d);
    zoom.addEventListener('input',function(){st.z=zoom.value/100;draw();});
    d.querySelectorAll('[data-z]').forEach(function(b){b.addEventListener('click',function(){by(+b.dataset.z*0.1);});});
    d.querySelector('[data-rotate]').addEventListener('click',rot);d.querySelector('[data-reset]').addEventListener('click',reset);
    d.querySelector('.pb-avedit__tools input[type=file]').addEventListener('change',function(e){var f=e.target.files[0];e.target.value='';if(f){d.close();take(f);}});
    saveB.addEventListener('click',save);d.addEventListener('close',function(){if(pending!=='save'){if(url)URL.revokeObjectURL(url);url='';}stat.removeAttribute('data-state');
      /* A drop or a paste opens the dialog with nothing focused to go back to: return to the opener, else the Upload button, unless something else took focus. */
      var a=document.activeElement,to=opener&&opener!==document.body&&opener.isConnected&&!d.contains(opener)?opener:pick;if(to&&(!a||a===document.body||a===d||d.contains(a)))to.focus();});
    d.addEventListener('paste',paste);
    stage.addEventListener('keydown',function(e){var k=e.key,m=e.shiftKey?0.1:0.02;if(k==='ArrowLeft')st.x-=m;else if(k==='ArrowRight')st.x+=m;else if(k==='ArrowUp')st.y-=m;else if(k==='ArrowDown')st.y+=m;
      else if(k==='+'||k==='=')return by(0.1),e.preventDefault();else if(k==='-'||k==='_')return by(-0.1),e.preventDefault();else if(k==='r'||k==='R')return rot(),e.preventDefault();else if(k==='0')return reset(),e.preventDefault();else return;e.preventDefault();draw();});
    stage.addEventListener('wheel',function(e){e.preventDefault();by(-e.deltaY/(e.deltaMode?3:300));},{passive:false});
    stage.addEventListener('pointerdown',function(e){stage.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});if(ptrs.size===2)pinch={d:dist(),z:st.z};stage.dataset.drag='';});
    stage.addEventListener('pointermove',function(e){var p=ptrs.get(e.pointerId);if(!p)return;var F=stage.querySelector('.pb-avedit__frame').offsetWidth||1;
      if(ptrs.size===1){st.x+=(e.clientX-p.x)/F;st.y+=(e.clientY-p.y)/F;}p.x=e.clientX;p.y=e.clientY;if(ptrs.size===2&&pinch){st.z=pinch.z*dist()/pinch.d;zoom.value=Math.round(st.z*100);}draw();});
    function up(e){ptrs.delete(e.pointerId);if(ptrs.size<2)pinch=null;if(!ptrs.size)stage.removeAttribute('data-drag');}
    stage.addEventListener('pointerup',up);stage.addEventListener('pointercancel',up);
    if(window.ResizeObserver)new ResizeObserver(function(){if(src)draw();}).observe(stage);}
  function dist(){var a=[].slice.call(ptrs.values());return Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)||1;}
  function by(dz){st.z=st.z*(1+dz);draw();}
  function rot(){st.r=(st.r+90)%360;var t=st.x;st.x=-st.y;st.y=t;draw();}
  function reset(){st={x:0,y:0,z:1,r:0};draw();}
  /* The crop is kept in frame units (the frame is 1 wide), so it survives a resize; the image always covers the frame. */
  function geo(){var w=src.naturalWidth,h=src.naturalHeight,q=st.r%180,ew=q?h:w,eh=q?w:h;st.z=Math.max(1,Math.min(zmax,st.z));var s=st.z/Math.min(ew,eh),W=ew*s,H=eh*s;
    st.x=Math.max(-(W-1)/2,Math.min((W-1)/2,st.x));st.y=Math.max(-(H-1)/2,Math.min((H-1)/2,st.y));return {w:w,h:h,s:s,ew:ew,eh:eh};}
  function paint(cv,n,g){var c=cv.getContext('2d');c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,n,n);c.imageSmoothingQuality='high';c.translate(n/2+st.x*n,n/2+st.y*n);c.rotate(st.r*Math.PI/180);c.drawImage(src,-g.w*g.s*n/2,-g.h*g.s*n/2,g.w*g.s*n,g.h*g.s*n);}
  function draw(){if(!src)return;var g=geo(),F=stage.querySelector('.pb-avedit__frame').offsetWidth||1,S=stage.style;zoom.value=Math.round(st.z*100);
    S.setProperty('--x',st.x*F+'px');S.setProperty('--y',st.y*F+'px');S.setProperty('--w',g.w*g.s*F+'px');S.setProperty('--h',g.h*g.s*F+'px');S.setProperty('--r',st.r+'deg');
    zoom.style.setProperty('--pct',(zoom.value-zoom.min)/((zoom.max-zoom.min)||1)*100+'%');zoom.setAttribute('aria-valuetext',zoom.value+'%');
    if(!raf)raf=requestAnimationFrame(function(){raf=0;prevs.forEach(function(cv){paint(cv,cv.width,geo());});});}
  function open(i,u,f){if(!d)build();if(url&&url!==u)URL.revokeObjectURL(url);src=i;url=u;file=f;img.src=u;var short=Math.min(i.naturalWidth,i.naturalHeight);
    /* Zoom stops where the crop would hold fewer source pixels than the minimum. */
    zmax=Math.max(1,Math.min(4,short/MIN));zoom.max=Math.round(zmax*100);st={x:0,y:0,z:1,r:0};stat.textContent=T('avOut',{w:N,h:N,sw:i.naturalWidth,sh:i.naturalHeight});stat.removeAttribute('data-state');
    if(!d.open){opener=document.activeElement;d.showModal();}draw();stage.focus();}
  function paste(e){var it=[].slice.call((e.clipboardData&&e.clipboardData.files)||[]).filter(function(f){return /^image\//.test(f.type);})[0];if(it){e.preventDefault();if(d&&d.open)d.close();take(it);}}
  function busy(b,on){if(typeof pbBusy==='function')pbBusy(on,b);else b.disabled=on;}
  function save(){if(pending)return;var cv=document.createElement('canvas');cv.width=cv.height=N;paint(cv,N,geo());pending='save';busy(saveB,true);
    cv.toBlob(function(b){if(!b)return fail({detail:{message:pbStrings.saveFailed}});
      /* crop is the square that was kept, in pixels of the source turned by rotate, so a server can redo it from the original. */
      last=URL.createObjectURL(b);var g=geo(),side=1/g.s;pbEmit(el,'pb:avatar',{action:'save',blob:b,file:file,width:N,height:N,
        crop:{rotate:st.r,x:Math.round(g.ew/2-st.x/g.s-side/2),y:Math.round(g.eh/2-st.y/g.s-side/2),size:Math.round(side)}});},TYPE,0.9);}
  /* A failed save says why in the dialog footer, or in the hint if the dialog was closed while it saved; either way Save and Remove come back. */
  function fail(e){var m=(e.detail&&e.detail.message)||pbStrings.saveFailed,p=pending;if(!p)return;pending=null;
    if(p==='save'){busy(saveB,false);if(last){URL.revokeObjectURL(last);last='';}
      if(d.open){stat.textContent=m;stat.dataset.state='error';var i=document.createElement('span');i.className='pb-icon pb-icon--status-down';stat.prepend(i);return;}}
    else if(rm)busy(rm,false);say(m);}
  el.addEventListener('pb:error',fail);
  el.addEventListener('pb:saved',function(e){var p=pending,u=e.detail&&e.detail.url;pending=null;if(!p)return;
    if(p==='save'){apply(u||last);busy(saveB,false);if(d.open)d.close();if(url)URL.revokeObjectURL(url);url='';pbToast({status:'ok',title:T('avUpdated')});}
    else if(p==='remove'){var was=photo();apply('');if(rm)busy(rm,false);if(pick)pick.focus();
      pbToast({status:'ok',title:T('avRemoved'),actions:[{label:T('avUndo'),onClick:function(){if(pending)return;pending='restore';back=was;pbEmit(el,'pb:avatar',{action:'restore',url:was});}}]});}
    /* A bare pb:saved puts back the photo the Undo asked for. */
    else if(p==='restore'){apply(u||back);back='';pbToast({status:'ok',title:T('avRestored')});}});
  if(rm){rm.hidden=!photo();rm.addEventListener('click',function(){if(pending)return;pending='remove';busy(rm,true);say('');pbEmit(el,'pb:avatar',{action:'remove'});});}
  if(pick)pick.addEventListener('change',function(){var f=pick.files[0];pick.value='';take(f);});
  /* The whole field takes a dropped image; paste works while focus is inside it. */
  el.addEventListener('dragover',function(e){if(![].some.call(e.dataTransfer.types,function(t){return t==='Files';}))return;e.preventDefault();el.dataset.state='over';});
  el.addEventListener('dragleave',function(e){if(!el.contains(e.relatedTarget))el.removeAttribute('data-state');});
  el.addEventListener('drop',function(e){e.preventDefault();el.removeAttribute('data-state');take(e.dataTransfer.files[0]);});
  el.addEventListener('paste',function(e){if(!d||!d.contains(e.target))paste(e);});
  el.pbAvatarOpen=take;apply(photo());}
