/* pbPlayer(figure): builds controls for the <video> or <audio> inside a figure.pb-player. */
function pbTime(s){if(!isFinite(s))s=0;s=Math.floor(s);var h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=String(s%60).padStart(2,'0');return h?h+':'+String(m).padStart(2,'0')+':'+x:m+':'+x;}
function pbPlayer(fig){
  if(fig.__pbPlayer)return fig;fig.__pbPlayer=true;
  var v=fig.querySelector('video,audio'),isA=v.tagName==='AUDIO',I=function(n){return '<span class="pb-icon pb-icon--'+n+'"></span>'};v.controls=false;v.removeAttribute('controls');
  if(!isA){var st=document.createElement('div');st.className='pb-player__stage';v.before(st);st.appendChild(v);st.insertAdjacentHTML('beforeend','<button type="button" class="pb-player__big" aria-label="Play">'+I('play')+'</button><span class="pb-player__spinner" aria-hidden="true"></span>');}
  var bar=document.createElement('div');bar.className='pb-player__bar';
  bar.innerHTML='<div class="pb-player__seek"><input type="range" class="pb-player__range" min="0" max="1000" step="1" value="0" aria-label="Seek"><span class="pb-player__tip" hidden></span></div>'+
   '<div class="pb-player__row"><button type="button" class="pb-player__btn" data-play aria-label="Play">'+I('play')+'</button>'+
   '<button type="button" class="pb-player__btn" data-back aria-label="Back 10 seconds" title="Back 10 s (J)">'+I('skip-back')+'</button><button type="button" class="pb-player__btn" data-fwd aria-label="Forward 10 seconds" title="Forward 10 s (L)">'+I('skip-forward')+'</button>'+
   '<span class="pb-player__time" aria-live="off"><b data-cur>0:00</b> / <span data-dur>0:00</span></span><span class="pb-player__spacer"></span>'+
   '<span class="pb-player__vol"><button type="button" class="pb-player__btn" data-mute aria-label="Mute" title="Mute (M)">'+I('volume')+'</button><input type="range" class="pb-player__range pb-player__volrange" min="0" max="100" value="100" aria-label="Volume"></span>'+
   '<button type="button" class="pb-player__btn pb-player__speed" data-speed aria-haspopup="menu" aria-label="Playback speed">1×</button>'+
   (isA?'':'<button type="button" class="pb-player__btn" data-cc aria-label="Captions" aria-pressed="false" title="Captions (C)" hidden>'+I('captions')+'</button><button type="button" class="pb-player__btn" data-pip aria-label="Picture in picture" hidden>'+I('pip')+'</button><button type="button" class="pb-player__btn" data-fs aria-label="Fullscreen" title="Fullscreen (F)" hidden>'+I('fullscreen')+'</button>')+'</div>';
  fig.appendChild(bar);if(!fig.hasAttribute('tabindex'))fig.tabIndex=0;fig.setAttribute('role','region');if(!fig.getAttribute('aria-label'))fig.setAttribute('aria-label',isA?'Audio player':'Video player');
  var q=function(s){return fig.querySelector(s)},seek=q('.pb-player__seek input'),tip=q('.pb-player__tip'),vol=q('.pb-player__volrange'),bPlay=q('[data-play]'),bMute=q('[data-mute]'),bSpeed=q('[data-speed]'),bCC=q('[data-cc]'),bPip=q('[data-pip]'),bFs=q('[data-fs]'),drag=false,idle;
  var RATES=[0.5,0.75,1,1.25,1.5,2],menu=document.createElement('div');menu.className='pb-menu';menu.setAttribute('popover','');menu.setAttribute('role','menu');menu.setAttribute('aria-label','Playback speed');
  menu.innerHTML=RATES.map(function(r){return '<button type="button" class="pb-menu__item" role="menuitemradio" data-rate="'+r+'" aria-checked="'+(r===1)+'">'+(r===1?'Normal':r+'×')+'</button>'}).join('');fig.appendChild(menu);
  function toggle(){if(v.paused||v.ended){var p=v.play();if(p&&p.catch)p.catch(function(){});}else v.pause();}
  function jump(d){v.currentTime=Math.max(0,Math.min((v.duration||0),v.currentTime+d));}
  function setVol(x){v.volume=Math.max(0,Math.min(1,x));v.muted=v.volume===0;}
  function sync(){var d=v.duration||0,c=v.currentTime||0,pct=d?c/d*100:0;q('[data-cur]').textContent=pbTime(c);q('[data-dur]').textContent=pbTime(d);
    if(!drag)seek.value=d?Math.round(c/d*1000):0;seek.style.setProperty('--played',(drag?seek.value/10:pct)+'%');seek.setAttribute('aria-valuetext',pbTime(c)+' of '+pbTime(d));
    var b=0;for(var i=0;i<v.buffered.length;i++)if(v.buffered.start(i)<=c+0.5)b=Math.max(b,v.buffered.end(i));seek.style.setProperty('--buffered',(d?b/d*100:0)+'%');}
  function state(){var p=!v.paused&&!v.ended;p?fig.setAttribute('data-playing',''):fig.removeAttribute('data-playing');bPlay.innerHTML=I(p?'pause':'play');bPlay.setAttribute('aria-label',p?'Pause':'Play');bPlay.title=(p?'Pause':'Play')+' (K)';poke();}
  function vstate(){var m=v.muted||v.volume===0;bMute.innerHTML=I(m?'volume-off':'volume');bMute.setAttribute('aria-label',m?'Unmute':'Mute');vol.value=m?0:Math.round(v.volume*100);vol.style.setProperty('--played',vol.value+'%');}
  function rstate(){bSpeed.textContent=(v.playbackRate===1?'1':v.playbackRate)+'×';menu.querySelectorAll('[data-rate]').forEach(function(b){b.setAttribute('aria-checked',+b.dataset.rate===v.playbackRate)});}
  function poke(){fig.removeAttribute('data-idle');clearTimeout(idle);idle=setTimeout(function(){if(!fig.contains(document.activeElement)||document.activeElement===fig)fig.setAttribute('data-idle','');},2500);}
  ['timeupdate','durationchange','progress','loadedmetadata','seeked'].forEach(function(e){v.addEventListener(e,sync)});
  ['play','pause','ended'].forEach(function(e){v.addEventListener(e,state)});
  v.addEventListener('play',function(){fig.setAttribute('data-started','')});
  v.addEventListener('waiting',function(){fig.setAttribute('data-waiting','')});['playing','canplay','pause'].forEach(function(e){v.addEventListener(e,function(){fig.removeAttribute('data-waiting')})});
  v.addEventListener('volumechange',vstate);v.addEventListener('ratechange',rstate);
  if(!isA){v.addEventListener('click',toggle);v.addEventListener('dblclick',function(){bFs.hidden||bFs.click();});q('.pb-player__big').addEventListener('click',toggle);}
  bPlay.addEventListener('click',toggle);q('[data-back]').addEventListener('click',function(){jump(-10)});q('[data-fwd]').addEventListener('click',function(){jump(10)});
  seek.addEventListener('input',function(){drag=true;var d=v.duration||0;v.currentTime=seek.value/1000*d;seek.style.setProperty('--played',seek.value/10+'%');q('[data-cur]').textContent=pbTime(v.currentTime);});
  seek.addEventListener('change',function(){drag=false;});
  seek.parentNode.addEventListener('pointermove',function(e){var r=seek.getBoundingClientRect(),x=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));tip.hidden=!v.duration;tip.textContent=pbTime(x*(v.duration||0));tip.style.left=(e.clientX-seek.parentNode.getBoundingClientRect().left)+'px';});
  seek.parentNode.addEventListener('pointerleave',function(){tip.hidden=true;});
  bMute.addEventListener('click',function(){if(v.muted||v.volume===0){v.muted=false;if(v.volume===0)v.volume=0.6;}else v.muted=true;});
  vol.addEventListener('input',function(){setVol(vol.value/100);});
  bSpeed.addEventListener('click',function(){if(menu.matches(':popover-open'))return menu.hidePopover();menu.showPopover();var r=bSpeed.getBoundingClientRect();menu.style.left=Math.max(8,Math.min(r.right-menu.offsetWidth,innerWidth-menu.offsetWidth-8))+'px';menu.style.top=Math.max(8,r.top-menu.offsetHeight-6)+'px';(menu.querySelector('[aria-checked="true"]')||menu.firstChild).focus();});
  menu.addEventListener('click',function(e){var b=e.target.closest('[data-rate]');if(b){v.playbackRate=+b.dataset.rate;menu.hidePopover();bSpeed.focus();}});
  menu.addEventListener('keydown',function(e){var it=[].slice.call(menu.children),i=it.indexOf(document.activeElement);if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();it[(i+(e.key==='ArrowDown'?1:-1)+it.length)%it.length].focus();}});
  if(bCC){var tracks=function(){return [].filter.call(v.textTracks,function(t){return t.kind==='captions'||t.kind==='subtitles'})};
    function ccSync(){var t=tracks();bCC.hidden=!t.length;bCC.setAttribute('aria-pressed',t.some(function(x){return x.mode==='showing'}));}
    v.textTracks.addEventListener('addtrack',ccSync);v.textTracks.addEventListener('change',ccSync);ccSync();
    bCC.addEventListener('click',function(){var on=bCC.getAttribute('aria-pressed')!=='true';tracks().forEach(function(t,i){t.mode=on&&i===0?'showing':'hidden'});ccSync();});
    if(document.pictureInPictureEnabled&&!v.disablePictureInPicture){bPip.hidden=false;bPip.addEventListener('click',function(){(document.pictureInPictureElement?document.exitPictureInPicture():v.requestPictureInPicture()).catch(function(){});});}
    if(fig.requestFullscreen&&document.fullscreenEnabled!==false){bFs.hidden=false;bFs.addEventListener('click',function(){(document.fullscreenElement?document.exitFullscreen():fig.requestFullscreen()).catch(function(){bFs.hidden=true;});});
      document.addEventListener('fullscreenchange',function(){var f=document.fullscreenElement===fig;bFs.innerHTML=I(f?'fullscreen-exit':'fullscreen');bFs.setAttribute('aria-label',f?'Exit fullscreen':'Fullscreen');});}}
  fig.addEventListener('pointermove',poke);fig.addEventListener('focusin',poke);
  fig.addEventListener('keydown',function(e){var t=e.target,inRange=t.type==='range',onBtn=t.tagName==='BUTTON',k=e.key;if(e.ctrlKey||e.metaKey||e.altKey||menu.contains(t))return;
    var done=true;
    if((k===' '&&!onBtn&&!inRange)||k==='k'||k==='K')toggle();else if(k==='j'||k==='J')jump(-10);else if(k==='l'||k==='L')jump(10);
    else if((k==='ArrowLeft'||k==='ArrowRight')&&!inRange)jump(k==='ArrowLeft'?-5:5);else if((k==='ArrowUp'||k==='ArrowDown')&&!inRange)setVol(v.volume+(k==='ArrowUp'?0.1:-0.1));
    else if(k==='m'||k==='M')bMute.click();else if((k==='f'||k==='F')&&bFs&&!bFs.hidden)bFs.click();else if((k==='c'||k==='C')&&bCC&&!bCC.hidden)bCC.click();
    else if(/^[0-9]$/.test(k)&&!inRange)v.currentTime=(v.duration||0)*(+k)/10;
    else if(k==='>'||k==='<'){var i=RATES.indexOf(v.playbackRate);v.playbackRate=RATES[Math.max(0,Math.min(RATES.length-1,(i<0?2:i)+(k==='>'?1:-1)))];}
    else done=false;if(done){e.preventDefault();poke();}});
  sync();state();vstate();rstate();return fig;}
var P=[['--pop-yellow','--accent'],['--pop-mint','--ink'],['--pop-red','--pop-yellow']];
document.querySelectorAll('.ph').forEach(function(e){var c=P[+e.dataset.ph];e.setAttribute('role','img');e.setAttribute('aria-label','image placeholder');
 e.style.cssText='display:block;background:var('+c[0]+');background-image:radial-gradient(circle at 70% 60%, var('+c[1]+') 0 22%, transparent 22.5%)';});

document.querySelectorAll('[data-player]').forEach(pbPlayer);
