(function () {
  var API = '/api/submit';

  // Persist UTMs from the landing URL into sessionStorage so they survive
  // navigation to other pages before the form is submitted.
  (function () {
    var p = new URLSearchParams(window.location.search);
    ['utm_source', 'utm_medium', 'utm_campaign'].forEach(function (k) {
      if (p.get(k)) sessionStorage.setItem(k, p.get(k));
    });
  })();

  function utmFields() {
    return {
      utm_source:   sessionStorage.getItem('utm_source')   || '',
      utm_medium:   sessionStorage.getItem('utm_medium')   || '',
      utm_campaign: sessionStorage.getItem('utm_campaign') || '',
      referrer:     document.referrer || '',
    };
  }

  function post(payload) {
    // Local dev — CF Functions don't run on a plain static server
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      console.log('[DEV] Form submission (not sent):', payload);
      return Promise.resolve({ success: true });
    }
    return fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(function (r) {
      return r.json().then(function (d) {
        if (!r.ok || !d.success) throw new Error(d.message || 'Submission failed');
        return d;
      });
    });
  }

  function val(form, name) {
    var el = form.querySelector('[name="' + name + '"]');
    return el ? el.value.trim() : '';
  }

  function requireField(form, name) {
    var el = form.querySelector('[name="' + name + '"]');
    if (!el || el.value.trim()) return false;
    el.style.borderColor = 'rgb(239,68,68)';
    el.style.boxShadow = '0 0 0 2px rgba(239,68,68,0.25)';
    el.focus();
    el.addEventListener('input', function () {
      el.style.borderColor = '';
      el.style.boxShadow = '';
    }, { once: true });
    return true;
  }

  // ── Newsletter forms (all pages, footer) ──────────────────────────────────
  // Event delegation handles forms injected after DOMContentLoaded (e.g. footer.js)
  document.addEventListener('submit', function (e) {
    var form = e.target.closest('[data-form="newsletter"]');
    if (!form) return;
    e.preventDefault();
    var email  = val(form, 'email');
    var btn    = form.querySelector('button[type="submit"]');
    var parent = form.parentElement;
    var success = parent && parent.querySelector('[data-form-success="newsletter"]');
    if (!email) return;
    var orig = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Subscribing…';
    post(Object.assign({ form_type: 'newsletter', email: email }, utmFields()))
      .then(function () {
        form.classList.add('hidden');
        if (success) success.classList.remove('hidden');
      })
      .catch(function () {
        btn.disabled = false;
        btn.textContent = orig;
      });
  });

  // ── Mini contact form (index.html) ────────────────────────────────────────
  var miniForm = document.querySelector('[data-form="contact-mini"]');
  if (miniForm) {
    var miniSuccess = document.getElementById('contact-success');
    var miniError   = document.getElementById('contact-mini-error');
    miniForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = miniForm.querySelector('button[type="submit"]');
      if (!btn) return;
      var payload = Object.assign({
        form_type: 'contact_mini',
        name:      val(miniForm, 'name'),
        email:     val(miniForm, 'email'),
        title:     val(miniForm, 'title'),
        company:   val(miniForm, 'company'),
        message:   val(miniForm, 'message'),
        _hp:       val(miniForm, '_hp'),
      }, utmFields());
      if (requireField(miniForm, 'name'))    return;
      if (requireField(miniForm, 'email'))   return;
      if (requireField(miniForm, 'message')) return;
      if (miniError) miniError.classList.add('hidden');
      var orig = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Sending…';
      post(payload)
        .then(function () {
          miniForm.classList.add('hidden');
          var intro = document.getElementById('contact-form-intro');
          if (intro) intro.classList.add('hidden');
          if (miniSuccess) miniSuccess.classList.remove('hidden');
        })
        .catch(function () {
          btn.disabled = false;
          btn.textContent = orig;
          if (miniError) miniError.classList.remove('hidden');
        });
    });
  }

  // ── Full contact form (contact.html) ──────────────────────────────────────
  var fullForm = document.querySelector('[data-form="contact-full"]');
  if (fullForm) {
    var fullWrapper = document.getElementById('contact-form-wrapper');
    var fullSuccess = document.getElementById('contact-success');
    var fullError   = document.getElementById('contact-error');
    fullForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!fullForm.checkValidity()) { fullForm.reportValidity(); return; }
      var btn = fullForm.querySelector('button[type="submit"]');
      var payload = Object.assign({
        form_type: 'contact_full',
        name:      val(fullForm, 'name'),
        email:     val(fullForm, 'email'),
        company:   val(fullForm, 'company'),
        role:      val(fullForm, 'role'),
        problem:   val(fullForm, 'problem'),
        _hp:       val(fullForm, '_hp'),
      }, utmFields());
      if (!payload.email) return;
      var orig = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Sending…';
      post(payload)
        .then(function () {
          if (fullWrapper) fullWrapper.classList.add('hidden');
          if (fullSuccess) {
            fullSuccess.classList.remove('hidden');
            fullSuccess.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        })
        .catch(function () {
          btn.disabled = false;
          btn.textContent = orig;
          if (fullError) fullError.classList.remove('hidden');
        });
    });
  }
})();
