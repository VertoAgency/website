/* VertoDigital — shared site footer
 * Include with: <script src="/components/footer.js"></script>
 * The script replaces itself with the full <footer> element.
 */
(function () {
  'use strict';

  var SCRIPT = document.currentScript;

  /* ─────────────────────────────────── CSS ─────────────────────────────────── */
  var CSS = `
    .footer-client-logo { filter: brightness(0) invert(1); opacity: 0.45; transition: opacity 200ms ease; display: block; height: 20px; width: auto; max-width: 110px; object-fit: contain; }
    .footer-client-logo:hover { opacity: 0.75; }
    .footer-logo-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); justify-items: center; align-items: center; gap: 1.75rem 2.5rem; max-width: 320px; margin: 0 auto; }
    @media (min-width: 768px) { .footer-logo-grid { grid-template-columns: repeat(6, minmax(0, 1fr)); max-width: none; gap: 1rem 3rem; } }
    .footer-manifesto { font-family: 'Geist', sans-serif; font-weight: 500; font-size: clamp(2rem, 5.5vw, 4.25rem); line-height: 1.05; letter-spacing: -0.025em; }
    .footer-g2-badge { transition: color 180ms ease; }
    .footer-g2-badge:hover { color: #ffffff; }
    .footer-g2-badge:hover svg.g2-arrow { transform: translate(2px, -2px); }
    .footer-g2-badge .g2-arrow { transition: transform 200ms ease; }
    /* Mobile layout: Services spans the left column, Industries + Company
       stack on the right, Newsletter is full-width below. Explicit CSS
       (not Tailwind row-span/col-span utilities) so it applies to the
       JS-injected markup without depending on the CDN's runtime scan. */
    @media (max-width: 1023px) {
      .vf-services   { grid-row: span 2 / span 2; }
      .vf-newsletter {
        grid-column: span 2 / span 2;
        margin-top: 2.5rem;
      }
    }
  `;

  /* ─────────────────────────────────── HTML ─────────────────────────────────── */
  var HTML = `
<footer class="bg-navy overflow-hidden">

      <!-- ── Band 1: Manifesto ────────────────────────────────────────── -->
      <div class="container-brand pt-20 pb-16 lg:pt-28 lg:pb-20 text-center">
        <h2 class="footer-manifesto text-white max-w-4xl mx-auto">
          Pipeline-Driven Digital Marketing.
        </h2>
        <p class="text-cool-gray text-base lg:text-lg mt-5 max-w-xl mx-auto leading-relaxed">
          For B2B technology companies. Trusted by US and Europe CMOs.
        </p>
        <!-- G2 trust badge -->
        <a href="https://www.g2.com/products/vertodigital/reviews" target="_blank" rel="noopener noreferrer"
          class="footer-g2-badge inline-flex items-center gap-3 mt-10 text-cool-gray" aria-label="4.9 on G2">
          <span class="flex gap-0.5" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#E1F77E"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#E1F77E"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#E1F77E"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#E1F77E"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#E1F77E"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          </span>
          <span class="text-white text-sm font-medium">4.9 on G2</span>
          <svg class="g2-arrow" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>
        </a>
      </div><!-- /band 1 -->

      <!-- ── Band 2: Client logos strip ───────────────────────────────── -->
      <div class="border-t border-white/10">
        <div class="container-brand py-10">
          <p class="text-cool-gray text-[11px] font-mono uppercase tracking-[0.18em] mb-6 text-center">Trusted by teams at</p>
          <div class="footer-logo-grid">
            <img src="/images/logos/cloudflare-logo.png"      alt="Cloudflare"      loading="lazy" width="60" height="20" class="footer-client-logo">
            <img src="/images/logos/neo4j-logo.png"           alt="Neo4j"           loading="lazy" width="53" height="20" class="footer-client-logo">
            <img src="/images/logos/cribl-logo.png"           alt="Cribl"           loading="lazy" width="70" height="28" class="footer-client-logo" style="height:28px">
            <img src="/images/logos/snaplogic-logo.webp"      alt="SnapLogic"       loading="lazy" width="76" height="20" class="footer-client-logo">
            <img src="/images/logos/smartrecruiters-logo.png" alt="SmartRecruiters" loading="lazy" width="83" height="26" class="footer-client-logo" style="height:26px">
            <img src="/images/logos/payhawk-logo.png"         alt="Payhawk"         loading="lazy" width="88" height="20" class="footer-client-logo">
          </div>
        </div>
      </div><!-- /band 2 -->

      <!-- ── Band 3: Site map ───────────────────────────────────────── -->
      <div class="border-t border-white/10">
        <div class="container-brand py-12">
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">

            <!-- Services -->
            <div class="vf-services">
              <p class="text-brand-light text-[11px] font-mono font-medium uppercase tracking-[0.18em] mb-5">Services</p>
              <ul class="space-y-3 text-sm mb-6">
                <li><a href="/services" class="text-white hover:text-brand-blue transition-colors">All Services</a></li>
              </ul>

              <p class="text-brand-light text-[9px] font-mono uppercase tracking-[0.18em] mb-2">Inbound</p>
              <ul class="space-y-2 text-sm mb-6">
                <li><a href="/services/b2b-inbound-pipeline-growth-and-demand-generation" class="text-white hover:text-brand-blue transition-colors">Inbound Pipeline Growth</a></li>
                <li class="pl-3"><a href="/services/inbound/b2b-and-saas-linkedin-advertising" class="text-cool-gray hover:text-white transition-colors text-xs">LinkedIn Paid Social</a></li>
                <li class="pl-3"><a href="/services/inbound/b2b-and-saas-paid-search"          class="text-cool-gray hover:text-white transition-colors text-xs">Paid Search</a></li>
                <li class="pl-3"><a href="/services/inbound/b2b-seo-and-aeo"          class="text-cool-gray hover:text-white transition-colors text-xs">SEO &amp; AEO</a></li>
              </ul>

              <p class="text-brand-light text-[9px] font-mono uppercase tracking-[0.18em] mb-2">Outbound</p>
              <ul class="space-y-2 text-sm mb-6">
                <li><a href="/services/b2b-outbound-pipeline-growth-and-demand-generation" class="text-white hover:text-brand-blue transition-colors">Outbound Pipeline Growth</a></li>
                <li class="pl-3"><a href="/services/outbound/account-based-marketing"  class="text-cool-gray hover:text-white transition-colors text-xs">Account-Based ABM</a></li>
                <li class="pl-3"><a href="/services/outbound/contact-based-marketing"  class="text-cool-gray hover:text-white transition-colors text-xs">Contact-Based ABM</a></li>
                <li class="pl-3"><a href="/services/outbound/persona-based-marketing"  class="text-cool-gray hover:text-white transition-colors text-xs">Persona-Based ABM</a></li>
              </ul>

              <ul class="space-y-3 text-sm">
                <li><a href="/services/b2b-pipeline-intelligence-and-marketing-attribution" class="text-white hover:text-brand-blue transition-colors">Pipeline Intelligence</a></li>
                <li><a href="/assessment"                     class="text-white hover:text-brand-blue transition-colors">Free Pipeline Assessment</a></li>
              </ul>
            </div>

            <!-- Industries -->
            <div>
              <p class="text-brand-light text-[11px] font-mono font-medium uppercase tracking-[0.18em] mb-5">Industries</p>
              <ul class="space-y-3 text-sm">
                <li><a href="/industries/cybersecurity-marketing"                        class="text-white hover:text-brand-blue transition-colors">Cybersecurity</a></li>
                <li><a href="/industries/data-platforms-and-ai-infrastructure-marketing" class="text-white hover:text-brand-blue transition-colors">Data Platforms &amp; AI</a></li>
                <li><a href="/industries/fintech-and-financial-services-marketing"       class="text-white hover:text-brand-blue transition-colors">Fintech &amp; Financial</a></li>
              </ul>
            </div>

            <!-- Company -->
            <div>
              <p class="text-brand-light text-[11px] font-mono font-medium uppercase tracking-[0.18em] mb-5">Company</p>
              <ul class="space-y-3 text-sm">
                <li><a href="/about"        class="text-white hover:text-brand-blue transition-colors">About</a></li>
                <li><a href="/case-studies" class="text-white hover:text-brand-blue transition-colors">Results</a></li>
                <li><a href="/jobs"      class="text-white hover:text-brand-blue transition-colors">Jobs</a></li>
                <li><a href="/contact"      class="text-white hover:text-brand-blue transition-colors">Contact</a></li>
              </ul>
            </div>

            <!-- Newsletter -->
            <div class="vf-newsletter">
              <p class="text-brand-light text-[11px] font-mono font-medium uppercase tracking-[0.18em] mb-2">Newsletter</p>
              <p class="text-cool-gray text-xs mb-4 leading-relaxed">Once a week. Practical B2B marketing tips — from the team that does it.</p>
              <form id="newsletter-form" data-form="newsletter" class="space-y-2">
                <input type="email" name="email" autocomplete="email" required
                  aria-label="Email address"
                  placeholder="work@email.com"
                  class="w-full bg-white/5 border border-white/15 text-white placeholder:text-cool-gray text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-brand-light transition-colors" />
                <button type="submit"
                  class="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors">
                  Subscribe
                </button>
              </form>
              <p id="newsletter-success" data-form-success="newsletter" class="hidden text-sm text-cool-gray mt-2">You're in — first issue lands next week.</p>
            </div>

          </div>
        </div>
      </div><!-- /band 3 -->

      <!-- ── Band 4: Meta strip ───────────────────────────────────────── -->
      <div class="border-t border-white/10">
        <div class="container-brand py-6">
          <div class="flex flex-col sm:flex-row justify-between items-center gap-5">

            <!-- Logo + Socials -->
            <div class="flex items-center gap-5">
              <a href="/" aria-label="VertoDigital home">
                <img src="/images/logos/vertodigital-logo-light.svg" alt="VertoDigital" width="97" height="28" class="h-7 w-auto" loading="lazy" />
              </a>
              <div class="flex gap-4">
                <a href="https://www.linkedin.com/company/vertodigital" target="_blank" rel="noopener noreferrer"
                  class="text-cool-gray hover:text-white transition-colors" aria-label="LinkedIn">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.852 3.37-1.852 3.601 0 4.267 2.37 4.267 5.455v6.288zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="https://www.youtube.com/@vertodigital" target="_blank" rel="noopener noreferrer"
                  class="text-cool-gray hover:text-white transition-colors" aria-label="YouTube">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
                <a href="https://www.instagram.com/vertodigitalagency/" target="_blank" rel="noopener noreferrer"
                  class="text-cool-gray hover:text-white transition-colors" aria-label="Instagram">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="https://github.com/VertoAgency" target="_blank" rel="noopener noreferrer"
                  class="text-cool-gray hover:text-white transition-colors" aria-label="GitHub">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                </a>
              </div>
            </div>

            <!-- Locations + copyright -->
            <div class="flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-1 text-xs text-cool-gray">
              <span>🇧🇬 Sofia · Ruse · Blagoevgrad</span>
              <span style="opacity:0.3" aria-hidden="true">·</span>
              <span>🇺🇸 Boston</span>
              <span style="opacity:0.3" aria-hidden="true">·</span>
              <span>© 2026 VertoDigital</span>
            </div>

            <!-- Legal links -->
            <div class="flex gap-5 text-xs">
              <a href="/privacy"          class="text-white hover:text-brand-blue transition-colors">Privacy</a>
              <a href="/terms"            class="text-white hover:text-brand-blue transition-colors">Terms</a>
              <a href="/privacy#cookies"  class="text-white hover:text-brand-blue transition-colors">Cookies</a>
            </div>

          </div>
        </div>
      </div><!-- /band 4 -->

    </footer>`;

  /* ─────────────────────────────────── Inject ───────────────────────────────── */
  if (!document.getElementById('vf-styles')) {
    var styleEl = document.createElement('style');
    styleEl.id = 'vf-styles';
    styleEl.textContent = CSS;
    document.head.appendChild(styleEl);
  }

  var tmp = document.createElement('div');
  tmp.innerHTML = HTML.trim();
  var footerEl = tmp.firstElementChild;
  var footerMount = document.getElementById('verto-footer-mount');
  if (footerMount) {
    footerMount.replaceWith(footerEl);
  } else if (SCRIPT && SCRIPT.parentNode) {
    SCRIPT.parentNode.replaceChild(footerEl, SCRIPT);
  } else {
    document.body.append(footerEl);
  }

})();
