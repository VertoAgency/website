document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('a.js-email').forEach(function (a) {
    var email = a.dataset.u + '@' + a.dataset.d;
    a.href = 'mailto:' + email + (a.dataset.s ? '?subject=' + encodeURIComponent(a.dataset.s) : '');
    var span = a.querySelector('.email-text');
    if (span) span.textContent = email;
  });
});
