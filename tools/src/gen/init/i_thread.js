document.querySelectorAll('time[data-ago]').forEach(function(t){t.setAttribute('datetime',new Date(Date.now()-t.dataset.ago*1000).toISOString());});
document.querySelectorAll('[data-avatar]').forEach(pbAvatar);document.querySelectorAll('[data-thread]').forEach(pbThread);pbRelTime(document);
