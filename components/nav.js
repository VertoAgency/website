/* VertoDigital — shared main navigation
 * Include with: <script src="/components/nav.js"></script>
 * The script replaces itself with the full <nav> element.
 */
(function () {
  'use strict';

  var SCRIPT = document.currentScript;

  /* ─────────────────────────────────── CSS ─────────────────────────────────── */
  var CSS = `
    html { scroll-padding-top: 72px; }

    .vn {
      position: sticky;
      top: 0;
      z-index: 50;
      width: 100%;
      background: rgba(255,255,255,0.92);
      -webkit-backdrop-filter: blur(20px);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(6,0,38,0.08);
      transition: box-shadow 250ms ease;
    }
    .vn.vn-scrolled { box-shadow: 0 1px 18px rgba(6,0,38,0.07); }

    .vn-inner {
      max-width: 1440px;
      margin: 0 auto;
      padding: 0 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
    }
    @media (min-width: 768px)  { .vn-inner { padding: 0 48px; } }
    @media (min-width: 1280px) { .vn-inner { padding: 0 80px; } }

    /* ── Logo ── */
    .vn-logo { display: flex; align-items: center; flex-shrink: 0; text-decoration: none; }
    .vn-logo img { height: 44px; width: auto; display: block; }

    /* ── Desktop links ── */
    .vn-links {
      display: none;
      align-items: center;
      gap: 2px;
      flex: 1;
      justify-content: center;
      margin: 0 16px;
    }
    @media (min-width: 1024px) { .vn-links { display: flex; } }

    .vn-link {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding: 6px 11px;
      font-size: 14px;
      font-weight: 500;
      font-family: inherit;
      color: rgba(6,0,38,0.65);
      border-radius: 7px;
      text-decoration: none;
      background: none;
      border: none;
      cursor: pointer;
      white-space: nowrap;
      transition: color 140ms ease, background-color 140ms ease;
      line-height: 1.4;
    }
    .vn-link:hover { color: #060026; background: rgba(6,0,38,0.04); }
    .vn-link.vn-active { color: #0099FF; }
    .vn-link.vn-active:hover { color: #0077cc; background: rgba(0,153,255,0.05); }

    .vn-chevron {
      width: 13px; height: 13px;
      flex-shrink: 0;
      opacity: 0.45;
      transition: transform 200ms ease, opacity 150ms ease;
    }
    .vn-item.vn-open > .vn-link .vn-chevron { transform: rotate(180deg); opacity: 0.75; }

    /* ── Dropdown ── */
    .vn-item { position: relative; }

    .vn-drop {
      position: absolute;
      top: 100%;
      left: 50%;
      padding-top: 10px;
      transform: translateX(-50%) translateY(-8px);
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition: opacity 170ms ease, transform 170ms ease, visibility 0s 170ms;
      z-index: 200;
    }
    .vn-item.vn-open > .vn-drop {
      opacity: 1;
      visibility: visible;
      transform: translateX(-50%) translateY(0);
      pointer-events: auto;
      transition: opacity 170ms ease, transform 170ms ease;
    }

    /* Industries: right-align since it's toward the right side of the nav */
    .vn-item[data-item="industries"] > .vn-drop {
      left: auto;
      right: 0;
      transform: translateX(0) translateY(-8px);
    }
    .vn-item[data-item="industries"].vn-open > .vn-drop {
      transform: translateX(0) translateY(0);
    }

    .vn-drop-inner {
      background: #fff;
      border-radius: 14px;
      box-shadow: 0 4px 32px rgba(6,0,38,0.10), 0 0 0 1px rgba(6,0,38,0.05);
      padding: 6px;
      min-width: 220px;
      overflow: hidden;
    }

    .vn-drop-hub {
      display: block;
      padding: 9px 12px;
      font-size: 13.5px;
      font-weight: 600;
      color: #060026;
      text-decoration: none;
      border-radius: 8px;
      white-space: nowrap;
      transition: background 140ms ease;
    }
    .vn-drop-hub:hover { background: rgba(6,0,38,0.04); color: #060026; }

    .vn-drop-div {
      height: 1px;
      background: rgba(6,0,38,0.07);
      margin: 4px 6px;
    }

    .vn-drop-link {
      display: block;
      padding: 8px 12px;
      font-size: 13.5px;
      font-weight: 500;
      color: #2a2452;
      text-decoration: none;
      border-radius: 8px;
      white-space: nowrap;
      transition: color 140ms ease, background 140ms ease;
    }
    .vn-drop-link:hover { color: #060026; background: rgba(0,153,255,0.06); }

    .vn-drop-cta {
      display: block;
      padding: 9px 12px;
      font-size: 12.5px;
      font-weight: 500;
      color: #0099FF;
      text-decoration: none;
      border-radius: 8px;
      white-space: nowrap;
      transition: background 140ms ease;
    }
    .vn-drop-cta:hover { background: rgba(0,153,255,0.07); color: #0077cc; }

    /* ── Right side ── */
    .vn-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

    /* ── CTA button ── */
    .vn-cta {
      display: none;
      align-items: center;
      gap: 7px;
      padding: 8px 18px;
      background: #E1F77E;
      color: #060026;
      font-size: 13.5px;
      font-weight: 500;
      font-family: inherit;
      border-radius: 9px;
      text-decoration: none;
      border: none;
      cursor: pointer;
      white-space: nowrap;
      transition: background-color 200ms ease;
    }
    @media (min-width: 1024px) { .vn-cta { display: inline-flex; } }
    .vn-cta:hover { background: #d4eb6c; }

    .vn-cta-arrow { width: 15px; height: 15px; flex-shrink: 0; }
    .vn-cta-stem {
      stroke-dasharray: 14;
      stroke-dashoffset: 14;
      transition: stroke-dashoffset 200ms ease;
    }
    .vn-cta:hover .vn-cta-stem { stroke-dashoffset: 0; }

    /* ── Mobile toggle ── */
    .vn-toggle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: none;
      border: none;
      cursor: pointer;
      color: #060026;
      transition: background-color 140ms ease;
    }
    @media (min-width: 1024px) { .vn-toggle { display: none; } }
    .vn-toggle:hover { background: rgba(6,0,38,0.05); }

    /* Hamburger → X morph */
    .vn-ham {
      position: relative;
      width: 22px; height: 22px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .vn-ham-lines {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
    }
    .vn-ham-line {
      display: block;
      height: 2px;
      width: 100%;
      background-color: currentColor;
      border-radius: 2px;
      transition: transform 280ms cubic-bezier(0.22,1,0.36,1), opacity 200ms ease;
      transform-origin: center;
    }
    .vn-toggle[aria-expanded="true"] .vn-ham-line:first-child  { transform: translateY(7px) rotate(45deg); }
    .vn-toggle[aria-expanded="true"] .vn-ham-line:nth-child(2) { opacity: 0; transform: scaleX(0); }
    .vn-toggle[aria-expanded="true"] .vn-ham-line:last-child   { transform: translateY(-7px) rotate(-45deg); }

    /* ── Mobile panel ── */
    .vn-mob {
      overflow: hidden;
      max-height: 0;
      opacity: 0;
      transition: max-height 300ms cubic-bezier(0.22,1,0.36,1), opacity 220ms ease;
      border-top: 1px solid transparent;
      transition-property: max-height, opacity, border-color;
      transition-duration: 300ms, 220ms, 220ms;
      transition-timing-function: cubic-bezier(0.22,1,0.36,1), ease, ease;
    }
    .vn-mob.vn-open {
      max-height: 82vh;
      opacity: 1;
      overflow-y: auto;
      border-top-color: rgba(6,0,38,0.08);
    }

    .vn-mob-inner {
      padding: 4px 24px 24px;
      display: flex;
      flex-direction: column;
    }
    @media (min-width: 768px) { .vn-mob-inner { padding: 4px 48px 24px; } }

    /* Mobile direct link */
    .vn-mob-link {
      display: flex;
      align-items: center;
      min-height: 48px;
      font-size: 15px;
      font-weight: 500;
      color: #060026;
      text-decoration: none;
      border-bottom: 1px solid rgba(6,0,38,0.06);
      transition: color 140ms ease;
    }
    .vn-mob-link:hover { color: #0099FF; }
    .vn-mob-link.vn-active { color: #0099FF; }

    /* Mobile accordion */
    .vn-mob-acc { border-bottom: 1px solid rgba(6,0,38,0.06); }

    .vn-mob-acc-btn {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      min-height: 48px;
      padding: 0;
      font-size: 15px;
      font-weight: 500;
      color: #060026;
      background: none;
      border: none;
      cursor: pointer;
      font-family: inherit;
      text-align: left;
      transition: color 140ms ease;
    }
    .vn-mob-acc-btn:hover { color: #0099FF; }
    .vn-mob-acc.vn-open .vn-mob-acc-btn { color: #0099FF; }

    .vn-mob-acc-chevron {
      width: 16px; height: 16px;
      opacity: 0.45;
      flex-shrink: 0;
      transition: transform 220ms ease;
    }
    .vn-mob-acc.vn-open .vn-mob-acc-chevron { transform: rotate(180deg); opacity: 0.75; }

    .vn-mob-acc-body {
      max-height: 0;
      overflow: hidden;
      transition: max-height 260ms cubic-bezier(0.22,1,0.36,1);
    }
    .vn-mob-acc.vn-open .vn-mob-acc-body { max-height: 440px; }

    .vn-mob-acc-inner {
      padding: 0 0 14px 12px;
      border-left: 2px solid rgba(0,153,255,0.2);
      margin-left: 2px;
    }

    .vn-mob-acc-hub {
      display: flex;
      align-items: center;
      min-height: 42px;
      padding: 2px 8px;
      font-size: 14px;
      font-weight: 600;
      color: #060026;
      text-decoration: none;
      border-radius: 6px;
      transition: color 140ms ease, background 140ms ease;
    }
    .vn-mob-acc-hub:hover { color: #0099FF; background: rgba(0,153,255,0.05); }

    .vn-mob-acc-label {
      display: block;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: rgba(0,153,255,0.7);
      padding: 10px 8px 3px;
    }

    .vn-mob-acc-link {
      display: flex;
      align-items: center;
      min-height: 42px;
      padding: 2px 8px;
      font-size: 14px;
      font-weight: 500;
      color: #2a2452;
      text-decoration: none;
      border-radius: 6px;
      transition: color 140ms ease, background 140ms ease;
    }
    .vn-mob-acc-link:hover { color: #060026; background: rgba(0,153,255,0.06); }

    .vn-mob-acc-cta {
      display: flex;
      align-items: center;
      min-height: 40px;
      padding: 2px 8px;
      font-size: 13px;
      font-weight: 500;
      color: #0099FF;
      text-decoration: none;
      border-radius: 6px;
      margin-top: 2px;
      transition: background 140ms ease;
    }
    .vn-mob-acc-cta:hover { background: rgba(0,153,255,0.07); color: #0077cc; }

    /* Mobile CTA button */
    .vn-mob-cta {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 18px;
      padding: 14px 24px;
      background: #E1F77E;
      color: #060026;
      font-size: 15px;
      font-weight: 500;
      font-family: inherit;
      border-radius: 10px;
      text-decoration: none;
      border: none;
      cursor: pointer;
      transition: background-color 200ms ease;
    }
    .vn-mob-cta:hover { background: #d4eb6c; }
  `;

  /* ─────────────────────────────────── SVG helpers ──────────────────────────── */
  var CHV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

  /* ─────────────────────────────────── HTML ─────────────────────────────────── */
  var HTML = `
<nav class="vn" id="vn" role="navigation" aria-label="Main navigation">
  <div class="vn-inner">

    <a href="/" class="vn-logo" aria-label="VertoDigital home">
      <img src="/images/logos/vertodigital-logo-dark.svg" alt="VertoDigital" width="140" height="36" />
    </a>

    <!-- Desktop links -->
    <div class="vn-links">

      <!-- Inbound -->
      <div class="vn-item" data-item="inbound">
        <button class="vn-link" aria-expanded="false" aria-haspopup="true" aria-controls="vn-drop-inbound">
          Inbound <span class="vn-chevron">${CHV}</span>
        </button>
        <div class="vn-drop" id="vn-drop-inbound">
          <div class="vn-drop-inner">
            <a href="/services/inbound-pipeline-growth" class="vn-drop-hub">Inbound Pipeline Growth &rarr;</a>
            <div class="vn-drop-div"></div>
            <a href="/services/inbound/linkedin-paid-social" class="vn-drop-link">LinkedIn Paid Social</a>
            <a href="/services/inbound/paid-search"          class="vn-drop-link">Paid Search</a>
            <a href="/services/inbound/seo-and-aeo"          class="vn-drop-link">SEO &amp; AEO</a>
            <div class="vn-drop-div"></div>
            <a href="/assessment" class="vn-drop-cta">&#10022; Free Pipeline Assessment &rarr;</a>
          </div>
        </div>
      </div>

      <!-- Outbound -->
      <div class="vn-item" data-item="outbound">
        <button class="vn-link" aria-expanded="false" aria-haspopup="true" aria-controls="vn-drop-outbound">
          Outbound <span class="vn-chevron">${CHV}</span>
        </button>
        <div class="vn-drop" id="vn-drop-outbound">
          <div class="vn-drop-inner">
            <a href="/services/outbound-pipeline-growth" class="vn-drop-hub">Outbound Pipeline Growth &rarr;</a>
            <div class="vn-drop-div"></div>
            <a href="/services/outbound/account-based-abm"  class="vn-drop-link">Account-based ABM</a>
            <a href="/services/outbound/persona-based-abm"  class="vn-drop-link">Persona-based ABM</a>
            <a href="/services/outbound/contact-based-abm"  class="vn-drop-link">Contact-based ABM</a>
            <div class="vn-drop-div"></div>
            <a href="/assessment" class="vn-drop-cta">&#10022; Free Pipeline Assessment &rarr;</a>
          </div>
        </div>
      </div>

      <!-- Intelligence (direct link) -->
      <a href="/services/pipeline-intelligence" class="vn-link" data-item="intelligence">Intelligence</a>

      <!-- Industries -->
      <div class="vn-item" data-item="industries">
        <button class="vn-link" aria-expanded="false" aria-haspopup="true" aria-controls="vn-drop-industries">
          Industries <span class="vn-chevron">${CHV}</span>
        </button>
        <div class="vn-drop" id="vn-drop-industries">
          <div class="vn-drop-inner" style="min-width:260px">
            <a href="/industries/cybersecurity"                        class="vn-drop-link">Cybersecurity</a>
            <a href="/industries/data-platforms-and-ai-infrastructure" class="vn-drop-link">Data Platforms &amp; AI Infrastructure</a>
            <a href="/industries/fintech-and-financial-services"       class="vn-drop-link">Fintech &amp; Financial Services</a>
          </div>
        </div>
      </div>

      <!-- Results -->
      <a href="/case-studies" class="vn-link" data-item="results">Results</a>

      <!-- Careers -->
      <a href="/careers" class="vn-link" data-item="careers">Careers</a>

    </div>

    <!-- Right: CTA + mobile toggle -->
    <div class="vn-right">
      <a href="/contact" class="vn-cta">
        Let&#8217;s Talk
        <svg class="vn-cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path class="vn-cta-stem" d="M19 12H5"/><path d="m12 5 7 7-7 7"/>
        </svg>
      </a>
      <button class="vn-toggle" id="vn-toggle" aria-expanded="false" aria-controls="vn-mob" aria-label="Open menu">
        <span class="vn-ham" aria-hidden="true">
          <span class="vn-ham-lines">
            <span class="vn-ham-line"></span>
            <span class="vn-ham-line"></span>
            <span class="vn-ham-line"></span>
          </span>
        </span>
      </button>
    </div>
  </div>

  <!-- Mobile panel -->
  <div class="vn-mob" id="vn-mob">
    <div class="vn-mob-inner">

      <!-- Inbound accordion -->
      <div class="vn-mob-acc" data-item="inbound">
        <button class="vn-mob-acc-btn" aria-expanded="false">
          Inbound <span class="vn-mob-acc-chevron">${CHV}</span>
        </button>
        <div class="vn-mob-acc-body">
          <div class="vn-mob-acc-inner">
            <a href="/services/inbound-pipeline-growth" class="vn-mob-acc-hub">Inbound Pipeline Growth</a>
            <span class="vn-mob-acc-label">Channels</span>
            <a href="/services/inbound/linkedin-paid-social" class="vn-mob-acc-link">LinkedIn Paid Social</a>
            <a href="/services/inbound/paid-search"          class="vn-mob-acc-link">Paid Search</a>
            <a href="/services/inbound/seo-and-aeo"          class="vn-mob-acc-link">SEO &amp; AEO</a>
            <a href="/assessment" class="vn-mob-acc-cta">&#10022; Free Pipeline Assessment &rarr;</a>
          </div>
        </div>
      </div>

      <!-- Outbound accordion -->
      <div class="vn-mob-acc" data-item="outbound">
        <button class="vn-mob-acc-btn" aria-expanded="false">
          Outbound <span class="vn-mob-acc-chevron">${CHV}</span>
        </button>
        <div class="vn-mob-acc-body">
          <div class="vn-mob-acc-inner">
            <a href="/services/outbound-pipeline-growth" class="vn-mob-acc-hub">Outbound Pipeline Growth</a>
            <span class="vn-mob-acc-label">Approaches</span>
            <a href="/services/outbound/account-based-abm"  class="vn-mob-acc-link">Account-based ABM</a>
            <a href="/services/outbound/persona-based-abm"  class="vn-mob-acc-link">Persona-based ABM</a>
            <a href="/services/outbound/contact-based-abm"  class="vn-mob-acc-link">Contact-based ABM</a>
            <a href="/assessment" class="vn-mob-acc-cta">&#10022; Free Pipeline Assessment &rarr;</a>
          </div>
        </div>
      </div>

      <!-- Intelligence -->
      <a href="/services/pipeline-intelligence" class="vn-mob-link" data-item="intelligence">Intelligence</a>

      <!-- Industries accordion -->
      <div class="vn-mob-acc" data-item="industries">
        <button class="vn-mob-acc-btn" aria-expanded="false">
          Industries <span class="vn-mob-acc-chevron">${CHV}</span>
        </button>
        <div class="vn-mob-acc-body">
          <div class="vn-mob-acc-inner">
            <a href="/industries/cybersecurity"                        class="vn-mob-acc-link">Cybersecurity</a>
            <a href="/industries/data-platforms-and-ai-infrastructure" class="vn-mob-acc-link">Data Platforms &amp; AI Infrastructure</a>
            <a href="/industries/fintech-and-financial-services"       class="vn-mob-acc-link">Fintech &amp; Financial Services</a>
          </div>
        </div>
      </div>

      <!-- Results -->
      <a href="/case-studies" class="vn-mob-link" data-item="results">Results</a>

      <!-- Careers -->
      <a href="/careers" class="vn-mob-link" data-item="careers">Careers</a>

      <!-- Let's Talk CTA -->
      <a href="/contact" class="vn-mob-cta">
        Let&#8217;s Talk
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 5 7 7-7 7"/></svg>
      </a>

    </div>
  </div>
</nav>`;

  /* ─────────────────────────────────── Inject ───────────────────────────────── */
  var styleEl = document.createElement('style');
  styleEl.id = 'vn-styles';
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);

  var tmp = document.createElement('div');
  tmp.innerHTML = HTML.trim();
  var navEl = tmp.firstElementChild;
  SCRIPT.parentNode.replaceChild(navEl, SCRIPT);

  /* ─────────────────────────────────── Init ─────────────────────────────────── */
  var nav = document.getElementById('vn');
  if (!nav) return;

  /* 1 · Scroll shadow */
  window.addEventListener('scroll', function () {
    nav.classList.toggle('vn-scrolled', window.scrollY > 4);
  }, { passive: true });

  /* 2 · Desktop dropdowns */
  var items = nav.querySelectorAll('.vn-item[data-item]');
  var isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  function closeAll(except) {
    items.forEach(function (item) {
      if (item === except) return;
      item.classList.remove('vn-open');
      var btn = item.querySelector('[aria-expanded]');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  }

  items.forEach(function (item) {
    var trigger = item.querySelector('.vn-link[aria-haspopup]');
    if (!trigger) return;

    item.addEventListener('mouseenter', function () {
      if (!isFinePointer.matches) return;
      closeAll(item);
      item.classList.add('vn-open');
      trigger.setAttribute('aria-expanded', 'true');
    });
    item.addEventListener('mouseleave', function () {
      if (!isFinePointer.matches) return;
      item.classList.remove('vn-open');
      trigger.setAttribute('aria-expanded', 'false');
    });
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = item.classList.contains('vn-open');
      closeAll();
      if (!isOpen) {
        item.classList.add('vn-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  document.addEventListener('click', function (e) {
    if (!nav.contains(e.target)) closeAll();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeAll(); closeMob(); }
  });

  /* 3 · Mobile toggle */
  var mobToggle = document.getElementById('vn-toggle');
  var mobPanel  = document.getElementById('vn-mob');

  function closeMob() {
    if (!mobToggle || !mobPanel) return;
    mobToggle.setAttribute('aria-expanded', 'false');
    mobPanel.classList.remove('vn-open');
  }

  if (mobToggle && mobPanel) {
    mobToggle.addEventListener('click', function () {
      var open = mobToggle.getAttribute('aria-expanded') === 'true';
      if (open) {
        closeMob();
      } else {
        mobToggle.setAttribute('aria-expanded', 'true');
        mobPanel.classList.add('vn-open');
        closeAll();
      }
    });
  }

  /* 4 · Mobile accordion */
  nav.querySelectorAll('.vn-mob-acc').forEach(function (acc) {
    var btn = acc.querySelector('.vn-mob-acc-btn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var isOpen = acc.classList.contains('vn-open');
      nav.querySelectorAll('.vn-mob-acc').forEach(function (a) {
        a.classList.remove('vn-open');
        var b = a.querySelector('.vn-mob-acc-btn');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        acc.classList.add('vn-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* 5 · Active link highlighting */
  var path = window.location.pathname.replace(/\/+$/, '') || '/';
  var ACTIVE_RULES = [
    { item: 'inbound',      test: function (p) { return p.startsWith('/services/inbound'); } },
    { item: 'outbound',     test: function (p) { return p.startsWith('/services/outbound'); } },
    { item: 'intelligence', test: function (p) { return p === '/services/pipeline-intelligence'; } },
    { item: 'industries',   test: function (p) { return p.startsWith('/industries'); } },
    { item: 'results',      test: function (p) { return p.startsWith('/case-studies'); } },
    { item: 'careers',      test: function (p) { return p.startsWith('/careers'); } },
  ];

  ACTIVE_RULES.forEach(function (rule) {
    if (!rule.test(path)) return;
    // Desktop
    var desktopEl = nav.querySelector('.vn-links [data-item="' + rule.item + '"]');
    if (desktopEl) {
      var lnk = desktopEl.classList.contains('vn-link')
        ? desktopEl
        : desktopEl.querySelector('.vn-link');
      if (lnk) lnk.classList.add('vn-active');
    }
    // Mobile
    var mobEl = nav.querySelector('.vn-mob [data-item="' + rule.item + '"]');
    if (mobEl) {
      var mobLnk = mobEl.classList.contains('vn-mob-link')
        ? mobEl
        : mobEl.querySelector('.vn-mob-acc-btn');
      if (mobLnk) mobLnk.classList.add('vn-active');
    }
  });

})();
