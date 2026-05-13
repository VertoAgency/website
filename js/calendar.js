(function () {
  window.addEventListener('DOMContentLoaded', function () {
    var wrapper = document.querySelector('.gcal-btn-wrapper');
    if (!wrapper) return;
    var a = document.createElement('a');
    a.href = 'https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ11ig1R_TbA3jkzDP4mvKoF5q8o_ZQ_6g6tprTMZQAz8a0NxdywBRU7vXbeuc6846sNXX3oqhs-?gv=true';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.className = 'gcal-btn-link';
    a.setAttribute('aria-label', 'Book a call — opens Google Calendar');
    wrapper.appendChild(a);
  });
})();
