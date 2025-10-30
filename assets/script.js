// script.js — small interactions: countdown, mobile menu, lightbox, back-to-top, simple form handler
document.addEventListener('DOMContentLoaded', function () {
  // Countdown to event (Nov 07, 2025 09:00 local)
  const countdownEl = document.getElementById('countdown');
  const target = new Date('2025-11-07T09:00:00');

  // Helper: render pill markup if not already present
  function ensurePills(container) {
    if (!container) return null;
    if (container.querySelector('.countdown-pills')) return container.querySelector('.countdown-pills');
    const wrap = document.createElement('div');
    wrap.className = 'countdown-pills';
    const units = [
      { key: 'days', label: 'Days' },
      { key: 'hours', label: 'Hrs' },
      { key: 'mins', label: 'Mins' },
      { key: 'secs', label: 'Secs' }
    ];
    units.forEach((u, i) => {
      const pill = document.createElement('div');
      pill.className = 'pill';
      pill.setAttribute('data-order', String(i+1));
      pill.setAttribute('data-key', u.key);
      pill.innerHTML = `<span class="value">--</span><span class="label">${u.label}</span>`;
      wrap.appendChild(pill);
    });
    container.innerHTML = ''; // replace any previous text
    container.appendChild(wrap);
    return wrap;
  }

  function updateCountdown() {
    const now = new Date();
    const diff = target - now;
    if (diff <= 0) {
      const finished = 'Event is live or completed';
      if (countdownEl) {
        countdownEl.textContent = finished;
        countdownEl.classList.add('finished');
      }
      clearInterval(cdInterval);
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    // render pills and update each unit; add a pop animation when the value changes
    const wrap = ensurePills(countdownEl);
    if (wrap) {
      const updates = { days, hours, mins, secs };
      Object.keys(updates).forEach((k) => {
        const pill = wrap.querySelector(`.pill[data-key="${k}"]`);
        if (!pill) return;
        const valEl = pill.querySelector('.value');
        const newVal = k === 'days' ? String(updates[k]) : String(updates[k]).padStart(2, '0');
        if (valEl.textContent !== newVal) {
          valEl.textContent = newVal;
          // animate pop
          pill.classList.remove('pop');
          // force reflow
          // eslint-disable-next-line no-unused-expressions
          pill.offsetWidth;
          pill.classList.add('pop');
          setTimeout(() => pill.classList.remove('pop'), 380);
        }
      });
    }
  }
  const cdInterval = setInterval(updateCountdown, 1000);
  updateCountdown();

  // Mobile menu (toggle overlay)
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const mobileNav = document.getElementById('mobileNav');
  const mobileNavClose = document.getElementById('mobileNavClose');
  function openMobileNav() {
    if (!mobileNav) return;
    mobileNav.classList.remove('hidden');
    mobileNav.setAttribute('aria-hidden', 'false');
    mobileBtn.setAttribute('aria-expanded', 'true');
    // trap focus to close button for simplicity
    setTimeout(() => mobileNavClose && mobileNavClose.focus(), 50);
  }
  function closeMobileNav() {
    if (!mobileNav) return;
    mobileNav.classList.add('hidden');
    mobileNav.setAttribute('aria-hidden', 'true');
    mobileBtn.setAttribute('aria-expanded', 'false');
    mobileBtn && mobileBtn.focus();
  }
  if (mobileBtn) {
    mobileBtn.setAttribute('aria-controls', 'mobileNav');
    mobileBtn.setAttribute('aria-expanded', 'false');
    mobileBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openMobileNav();
    });
  }
  if (mobileNavClose) mobileNavClose.addEventListener('click', closeMobileNav);
  // close when clicking backdrop links or pressing Escape
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMobileNav(); });
  document.querySelectorAll('#mobileNav a').forEach(a => a.addEventListener('click', () => closeMobileNav()));

  // Back to top
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) backToTop.classList.remove('hidden'); else backToTop.classList.add('hidden');
  });
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Gallery lightbox
  const lightbox = document.getElementById('lightbox');
  const lbImage = document.getElementById('lbImage');
  const lbClose = document.getElementById('lbClose');
  document.querySelectorAll('#gallery a').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const src = a.getAttribute('data-img');
      lbImage.src = src;
      lightbox.classList.remove('hidden');
      lightbox.classList.add('flex');
    });
  });
  lbClose.addEventListener('click', () => { lightbox.classList.add('hidden'); lightbox.classList.remove('flex'); });
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) { lightbox.classList.add('hidden'); lightbox.classList.remove('flex'); }
  });

  // Form submit handler — POST to serverless endpoint (Netlify Functions) if available
  const form = document.getElementById('regForm');
  const formMsg = document.getElementById('formMsg');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      formMsg.classList.add('hidden');

      // If a Google Form endpoint is configured via data-google-form, submit there using a hidden iframe
      const googleUrl = form.dataset.googleForm && form.dataset.googleForm.trim();
      if (googleUrl) {
        // Create a unique iframe to target the form submission and avoid navigation
        const iframeName = 'gf_iframe_' + Date.now();
        const iframe = document.createElement('iframe');
        iframe.name = iframeName;
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        // Build a plain HTML form that posts to Google Forms (avoids CORS issues)
        const gf = document.createElement('form');
        gf.action = googleUrl;
        gf.method = 'POST';
        gf.target = iframeName;
        gf.acceptCharset = 'UTF-8';

        // Collect inputs from the page that have data-google-entry attributes
        const inputs = form.querySelectorAll('[data-google-entry]');
        inputs.forEach((inp) => {
          const entryName = inp.dataset.googleEntry;
          if (!entryName) return;
          const value = inp.value || '';
          const hidden = document.createElement('input');
          hidden.type = 'hidden';
          hidden.name = entryName; // e.g. entry.123456789
          hidden.value = value;
          gf.appendChild(hidden);
        });

        // Optionally copy over a timestamp or other meta fields
        const timestamp = document.createElement('input');
        timestamp.type = 'hidden';
        timestamp.name = 'timestamp';
        timestamp.value = new Date().toISOString();
        gf.appendChild(timestamp);

        document.body.appendChild(gf);

        // Disable submit button while submitting
        const btn = form.querySelector('button[type="submit"]');
        if (btn) { btn.disabled = true; btn.classList.add('opacity-60'); }

        // Submit to Google Forms via hidden iframe (no CORS). Also POST to the serverless endpoint in parallel.
        gf.submit();

        // Prepare data for serverless POST
        const endpoint = form.dataset.endpoint || '/.netlify/functions/register';
        const data = {};
        new FormData(form).forEach((v, k) => data[k] = v);

        let serverOk = false;
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          serverOk = res.ok;
        } catch (err) {
          console.error('Server POST failed:', err);
          serverOk = false;
        }

        // After a brief delay (to allow Google Form submission), show combined result to user
        setTimeout(() => {
          if (btn) { btn.disabled = false; btn.classList.remove('opacity-60'); }
          if (serverOk) {
            formMsg.textContent = 'Thank you — your registration was sent.';
            formMsg.classList.remove('text-red-600');
            formMsg.classList.add('text-green-700');
            try { form.reset(); } catch (err) { /* ignore */ }
          } else {
            formMsg.textContent = 'Registration sent to Google Forms. Server-side submission failed (saved locally?).';
            formMsg.classList.remove('text-green-700');
            formMsg.classList.add('text-yellow-600');
          }
          formMsg.classList.remove('hidden');
          // remove temporary elements
          try { document.body.removeChild(gf); } catch (e) { }
          try { document.body.removeChild(iframe); } catch (e) { }
        }, 1200);

        return;
      }

      // Fallback: original serverless POST behavior
      const endpoint = form.dataset.endpoint || '/.netlify/functions/register';
      const data = {};
      new FormData(form).forEach((v, k) => data[k] = v);

      try {
        // optimistic UI: disable submit
        const btn = form.querySelector('button[type="submit"]');
        if (btn) { btn.disabled = true; btn.classList.add('opacity-60'); }

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (!res.ok) throw new Error('Network response was not ok');

        const json = await res.json().catch(() => ({}));
        formMsg.textContent = json.message || 'Thank you — your registration was received.';
        formMsg.classList.remove('hidden');
        formMsg.classList.remove('text-red-600');
        formMsg.classList.add('text-green-700');
        form.reset();
      } catch (err) {
        formMsg.textContent = 'Submission failed. Please try again or contact the organisers.';
        formMsg.classList.remove('hidden');
        formMsg.classList.remove('text-green-700');
        formMsg.classList.add('text-red-600');
        console.error('Form submit error:', err);
      } finally {
        const btn = form.querySelector('button[type="submit"]');
        if (btn) { btn.disabled = false; btn.classList.remove('opacity-60'); }
      }
    });
  }

  // Enhanced event card interactions: whole-card click/keyboard, ARIA, and simple focus trap while flipped
  const focusableSelector = 'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';

  function setFlipped(article, flipped) {
    if (flipped) {
      article.classList.add('is-flipped');
      article.setAttribute('aria-expanded', 'true');
      article.setAttribute('aria-pressed', 'true');
      // move focus to first focusable element inside the back face
      const backFace = article.querySelector('.card-back');
      // ensure back face is scrolled to top so content appears from the first line
      if (backFace) {
        try { backFace.scrollTop = 0; } catch (err) { /* ignore */ }
      }
      const focusable = backFace ? backFace.querySelectorAll(focusableSelector) : null;
      if (focusable && focusable.length) focusable[0].focus();
      // add trapping flag
      article._trapFocus = true;
    } else {
      article.classList.remove('is-flipped');
      article.setAttribute('aria-expanded', 'false');
      article.setAttribute('aria-pressed', 'false');
      article._trapFocus = false;
      // return focus to the article for discoverability
      article.focus();
    }
  }

  function toggleFlipped(article) {
    setFlipped(article, !article.classList.contains('is-flipped'));
  }

  document.querySelectorAll('.event-card').forEach(article => {
    // click on the whole card toggles flip unless an interactive child was clicked
    article.addEventListener('click', (e) => {
      const interactive = e.target.closest('a, button, input, textarea, select, .detailsBtn, .backBtn');
      if (interactive) return; // let the element's own handler run
      toggleFlipped(article);
    });

    // keyboard activation (Enter / Space) when focused
    article.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleFlipped(article);
      }
      // close on Escape
      if (e.key === 'Escape' || e.key === 'Esc') {
        if (article.classList.contains('is-flipped')) setFlipped(article, false);
      }
      // simple tab trapping while flipped
      if (e.key === 'Tab' && article._trapFocus) {
        const focusable = article.querySelectorAll(focusableSelector);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    });
  });

  // detailsBtn still toggles but we coordinate ARIA via setFlipped
  document.querySelectorAll('.detailsBtn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const article = btn.closest('.event-card');
      if (!article) return;
      toggleFlipped(article);
    });
  });

  // Back buttons on flipped cards: close and restore focus
  document.addEventListener('click', (e) => {
    const back = e.target.closest('.backBtn');
    if (back) {
      e.preventDefault();
      const article = back.closest('.event-card');
      if (article) setFlipped(article, false);
    }
  });
});
