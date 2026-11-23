document.querySelectorAll('[data-demo-load]').forEach(function(d){var real=d.querySelector('[data-demo-real]'),skel=d.querySelector('[data-demo-skel]'),st=d.querySelector('[data-demo-status]'),btn=d.querySelector('[data-demo-reload]'),t;
  function load(){clearTimeout(t);real.hidden=true;skel.hidden=false;st.hidden=false;btn.disabled=true;t=setTimeout(function(){real.hidden=false;skel.hidden=true;st.hidden=true;btn.disabled=false;},2200);}
  btn.addEventListener('click',load);real.hidden=true;var io=new IntersectionObserver(function(e){if(e[0].isIntersecting){io.disconnect();load();}},{threshold:0.5});io.observe(d);
});
