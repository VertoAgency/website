fetch('/api/instagram')
  .then(function (r) { return r.json(); })
  .then(function (data) {
    if (!data.data || !data.data.length) return;
    var grid = document.getElementById('ig-feed-grid');
    grid.innerHTML = '';
    data.data.forEach(function (post) {
      var imgUrl = post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url;
      if (!imgUrl) return;
      var a = document.createElement('a');
      a.href = post.permalink;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.className = 'block aspect-square rounded-xl overflow-hidden group';
      var img = document.createElement('img');
      img.src = imgUrl;
      img.alt = 'VertoDigital on Instagram';
      img.className = 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-300';
      img.loading = 'lazy';
      a.appendChild(img);
      grid.appendChild(a);
    });
  })
  .catch(function (e) { console.warn('Instagram feed:', e); });
