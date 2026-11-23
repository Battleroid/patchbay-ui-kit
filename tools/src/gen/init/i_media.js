var P=[['--pop-yellow','--accent'],['--pop-mint','--ink'],['--pop-red','--pop-yellow']];
document.querySelectorAll('.ph').forEach(function(e){var c=P[+e.dataset.ph];e.setAttribute('role','img');e.setAttribute('aria-label','image placeholder');
 e.style.cssText='display:block;background:var('+c[0]+');background-image:radial-gradient(circle at 70% 60%, var('+c[1]+') 0 22%, transparent 22.5%)';});
