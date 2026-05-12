(function () {
  var API = '/api/submit';

  function post(payload) {
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

  // ── Newsletter forms (all pages, footer) ──────────────────────────────────
  document.querySelectorAll('[data-form="newsletter"]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email  = val(form, 'email');
      var btn    = form.querySelector('button[type="submit"]');
      var parent = form.parentElement;
      var success = parent && parent.querySelector('[data-form-success="newsletter"]');
      if (!email) return;
      var orig = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Subscribing…';
      post({ form_type: 'newsletter', email: email })
        .then(function () {
          form.classList.add('hidden');
          if (success) success.classList.remove('hidden');
        })
        .catch(function () {
          btn.disabled = false;
          btn.textContent = orig;
        });
    });
  });

  // ── Mini contact form (index.html) ────────────────────────────────────────
  var miniForm = document.querySelector('[data-form="contact-mini"]');
  if (miniForm) {
    var miniSuccess = document.getElementById('contact-success');
    miniForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = miniForm.querySelector('button[type="submit"]');
      var payload = {
        form_type: 'contact_mini',
        name:      val(miniForm, 'name'),
        email:     val(miniForm, 'email'),
        title:     val(miniForm, 'title'),
        company:   val(miniForm, 'company'),
        message:   val(miniForm, 'message'),
        _hp:       val(miniForm, '_hp'),
      };
      if (!payload.email) return;
      var orig = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Sending…';
      post(payload)
        .then(function () {
          miniForm.classList.add('hidden');
          if (miniSuccess) miniSuccess.classList.remove('hidden');
        })
        .catch(function () {
          btn.disabled = false;
          btn.textContent = orig;
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
      var payload = {
        form_type: 'contact_full',
        name:      val(fullForm, 'name'),
        email:     val(fullForm, 'email'),
        company:   val(fullForm, 'company'),
        role:      val(fullForm, 'role'),
        problem:   val(fullForm, 'problem'),
        _hp:       val(fullForm, '_hp'),
      };
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
