window.addEventListener('load', function () {
  var wrapper = document.querySelector('.gcal-btn-wrapper');
  if (!wrapper) return;
  calendar.schedulingButton.load({
    url: 'https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ11ig1R_TbA3jkzDP4mvKoF5q8o_ZQ_6g6tprTMZQAz8a0NxdywBRU7vXbeuc6846sNXX3oqhs-?gv=true',
    color: '#0099FF',
    label: 'Book a call',
    target: wrapper,
  });
});
