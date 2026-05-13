(function () {
  var chips    = document.querySelectorAll('[data-chip]');
  var sections = document.querySelectorAll('[data-industry-section]');
  if (!chips.length || !sections.length || !window.IntersectionObserver) return;

  function setActive(id) {
    chips.forEach(function (c) {
      if (c.getAttribute('data-chip') === id) c.classList.add('chip-active');
      else c.classList.remove('chip-active');
    });
  }

  var visible    = new Set();
  var orderedIds = Array.prototype.map.call(sections, function (s) { return s.id; });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) visible.add(e.target.id);
      else visible.delete(e.target.id);
    });
    if (visible.size === 0) {
      setActive('all');
    } else {
      var topMost = orderedIds.find(function (id) { return visible.has(id); });
      setActive(topMost || 'all');
    }
  }, { rootMargin: '-160px 0px -55% 0px', threshold: 0 });

  sections.forEach(function (s) { observer.observe(s); });
})();
