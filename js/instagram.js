fetch('/api/instagram')
  .then(function (r) { return r.json(); })
  .then(function (data) {
    if (!data.data || !data.data.length) throw new Error('empty');
    var grid = document.getElementById('ig-feed-grid');
    grid.innerHTML = '';
    data.data.forEach(function (post) {
      var imgUrl = post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url;
      if (!imgUrl) return;
      var caption = post.caption ? post.caption.slice(0, 120).replace(/\n/g, ' ') : 'VertoDigital on Instagram';
      var a = document.createElement('a');
      a.href = post.permalink;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.className = 'block aspect-square rounded-xl overflow-hidden group';
      var img = document.createElement('img');
      img.src = imgUrl;
      img.alt = caption;
      img.className = 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-300';
      img.loading = 'lazy';
      a.appendChild(img);
      grid.appendChild(a);
    });
  })
  .catch(function () {
    var grid = document.getElementById('ig-feed-grid');
    if (!grid) return;
    grid.innerHTML = '<p class="col-span-3 text-center text-[14px] text-cool-gray py-8">Photos temporarily unavailable — <a href="https://www.instagram.com/vertodigitalagency/" target="_blank" rel="noopener noreferrer" class="underline hover:text-white transition-colors">visit us on Instagram</a>.</p>';
  });
