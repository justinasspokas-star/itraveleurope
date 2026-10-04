(()=> {
  const GA_ID = 'G-KC7TXSDRE7';
  let gaLoaded = false;

  const analyticsAllowed = () => {
    try {
      return localStorage.getItem('ite-cookie') === 'all';
    } catch (e) {
      return false;
    }
  };

  const loadAnalytics = () => {
    if (gaLoaded || !analyticsAllowed()) return;
    gaLoaded = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };

    const tag = document.createElement('script');
    tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
    document.head.appendChild(tag);

    window.gtag('js', new Date());
    window.gtag('config', GA_ID, {
      send_page_view: true
    });
  };

  const track = (eventName, params = {}) => {
    if (!analyticsAllowed()) return;
    loadAnalytics();
    if (window.gtag) {
      window.gtag('event', eventName, {
        ...params,
        transport_type: 'beacon'
      });
    }
  };

  if (analyticsAllowed()) loadAnalytics();

  const navButton = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  if (navButton && nav) {
    navButton.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      navButton.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open');
      navButton.setAttribute('aria-expanded', 'false');
    }));
  }

  const today = new Date();
  today.setHours(0,0,0,0);
  const iso = today.toISOString().slice(0,10);
  document.querySelectorAll('input[type=date]').forEach(i => i.min = iso);

  document.querySelectorAll('[data-compare-form]').forEach(form => {
    const depart = form.querySelector('[name=depart]');
    const back = form.querySelector('[name=return]');

    depart?.addEventListener('change', () => {
      if (back) {
        back.min = depart.value || iso;
        if (back.value && back.value < depart.value) back.value = '';
      }
    });

    form.addEventListener('submit', e => {
      let valid = true;
      form.querySelectorAll('[required]').forEach(field => {
        field.classList.remove('invalid');
        if (!field.value) {
          valid = false;
          field.classList.add('invalid');
        }
      });

      if (depart?.value && back?.value && back.value < depart.value) {
        valid = false;
        back.classList.add('invalid');
      }

      if (!valid) {
        e.preventDefault();
        form.querySelector('.invalid')?.focus();
        return;
      }

      const origin = form.querySelector('[name=origin]')?.value || '';
      const destination = form.querySelector('[name=destination]')?.value || '';
      const ageBand = form.querySelector('[name=age]')?.value || '';

      track('compare_travel_insurance', {
        origin,
        destination,
        age_band: ageBand,
        page_path: location.pathname
      });
    });
  });

  document.addEventListener('click', e => {
    const link = e.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href') || '';
    const label = (link.textContent || '').trim().toLowerCase();

    if (
      label.includes('compare travel insurance') ||
      href === '/#start' ||
      href === '#start' ||
      href === '/#compare-travel-insurance' ||
      href === '#compare-travel-insurance'
    ) {
      track('compare_cta_click', {
        link_text: (link.textContent || '').trim().slice(0,100),
        page_path: location.pathname
      });
    }
  });

  const summary = document.querySelector('#trip-summary');
  if (summary) {
    const q = new URLSearchParams(location.search);
    const origin = q.get('origin');
    const dest = q.get('destination');
    const depart = q.get('depart');
    const back = q.get('return');
    const age = q.get('age');
    const dnames = {
      spain:'Spain',italy:'Italy',france:'France',germany:'Germany',greece:'Greece',
      portugal:'Portugal',switzerland:'Switzerland','united-kingdom':'the United Kingdom',
      multiple:'multiple European countries'
    };
    const onames = {usa:'the United States',canada:'Canada',uk:'the United Kingdom',india:'India'};
    if (dnames[dest] && depart && back && age) {
      const f = d => new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric'})
        .format(new Date(d+'T12:00:00'));
      summary.textContent = `Resident of ${onames[origin]||'your home country'} · ${dnames[dest]} · ${f(depart)} to ${f(back)} · oldest traveler ${age.toLowerCase()}.`;
    }
  }

  const guidance = document.querySelector('#route-guidance');
  if (guidance) {
    const q = new URLSearchParams(location.search);
    const origin = q.get('origin');
    const dest = q.get('destination');

    if (origin === 'india' && dest === 'united-kingdom') {
      guidance.innerHTML = '<strong>Different visa system:</strong> the United Kingdom is not in the Schengen Area. Use UK visa and insurance requirements for this trip.';
    } else if (origin === 'india') {
      guidance.innerHTML = '<strong>Schengen visa route:</strong> verify at least €30,000 of qualifying medical cover, Schengen-wide validity, repatriation cover and the full required period against the consulate checklist.';
    } else if (origin === 'usa') {
      guidance.innerHTML = '<strong>USA route:</strong> compare overseas medical and evacuation protection carefully. Original Medicare generally has very limited coverage outside the U.S.; confirm your own health plan before relying on it.';
    } else if (origin === 'canada') {
      guidance.innerHTML = '<strong>Canada route:</strong> confirm what your provincial or territorial health plan and any workplace or credit-card benefits cover outside Canada before buying additional protection.';
    } else if (origin === 'uk') {
      guidance.innerHTML = '<strong>UK route:</strong> GHIC or an eligible EHIC can help with medically necessary state healthcare in covered countries, but compare travel insurance separately for repatriation, cancellation, baggage, delays and other gaps.';
    }
  }

  const isHomePage = location.pathname === '/' || location.pathname === '/index.html';
  if (!isHomePage) {
    const floatingCompare = document.createElement('a');
    floatingCompare.className = 'mobile-compare-float';
    floatingCompare.href = '/#compare-travel-insurance';
    floatingCompare.textContent = 'Compare travel insurance';
    floatingCompare.setAttribute('aria-label','Compare travel insurance');
    document.body.appendChild(floatingCompare);

    const updateFloatingCompare = () => {
      floatingCompare.classList.toggle('show', window.scrollY > 120);
    };
    updateFloatingCompare();
    window.addEventListener('scroll', updateFloatingCompare, {passive:true});
  }

  const banner = document.querySelector('.cookie-banner');
  try {
    const savedChoice = localStorage.getItem('ite-cookie');

    if (banner && !savedChoice) {
      banner.hidden = false;
      document.body.classList.add('cookie-open');
    }

    document.querySelectorAll('[data-cookie]').forEach(b => b.addEventListener('click', () => {
      const choice = b.dataset.cookie;
      localStorage.setItem('ite-cookie', choice);

      if (choice === 'all') {
        loadAnalytics();
        track('analytics_consent_granted', { page_path: location.pathname });
      }

      if (banner) banner.hidden = true;
      document.body.classList.remove('cookie-open');
    }));
  } catch (e) {
    if (banner) banner.hidden = true;
    document.body.classList.remove('cookie-open');
  }
})();