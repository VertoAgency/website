(function () {
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-track]');
    if (!el) return;
    window.dataLayer = window.dataLayer || [];
    var payload = { event: el.getAttribute('data-track') };
    if (el.dataset.case)     payload.case_slug   = el.dataset.case;
    if (el.dataset.industry) payload.industry    = el.dataset.industry;
    if (el.dataset.service)  payload.service     = el.dataset.service;
    if (el.dataset.source)   payload.cta_source  = el.dataset.source;
    window.dataLayer.push(payload);
  }, true);
})();
