(function () {
  var btn   = document.getElementById('mobile-menu-toggle');
  var panel = document.getElementById('mobile-menu-panel');
  if (!btn || !panel) return;

  function close() {
    panel.classList.add('hidden');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Open menu');
  }

  btn.addEventListener('click', function () {
    var willOpen = panel.classList.contains('hidden');
    panel.classList.toggle('hidden');
    btn.setAttribute('aria-expanded', String(willOpen));
    btn.setAttribute('aria-label', willOpen ? 'Close menu' : 'Open menu');
  });

  panel.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', close);
  });
})();
