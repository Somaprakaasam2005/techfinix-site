// script.js — small interactions: countdown, mobile menu, lightbox, back-to-top, simple form handler
document.addEventListener('DOMContentLoaded', function () {
  // Countdown to March 10, 2025 09:00:00
  const countdownEl = document.getElementById('countdown');
  const target = new Date('2025-03-10T09:00:00');

  function updateCountdown() {
    const now = new Date();
    const diff = target - now;
    if (diff <= 0) {
      countdownEl.textContent = 'Event is live or completed';
      clearInterval(cdInterval);
      return;
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);
    countdownEl.textContent = `${days}d ${hours}h ${mins}m ${secs}s`;
  }
  const cdInterval = setInterval(updateCountdown, 1000);
  updateCountdown();

  // Mobile menu (basic toggle)
  const mobileBtn = document.getElementById('mobileMenuBtn');
  if (mobileBtn) {
    mobileBtn.addEventListener('click', () => {
      alert('Mobile menu - for this scaffold, navigation links are in the header on larger screens.');
    });
  }

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
