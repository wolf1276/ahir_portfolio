/* ============================================
   PORTFOLIO — YAML-driven renderer + enhancements
   Edit content.yaml to update the site.
   ============================================ */

(function () {
  'use strict';

  // --- SVG icon map ---
  var ICONS = {
    email: '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>',
    linkedin: '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M4.5 3A1.5 1.5 0 003 4.5v11A1.5 1.5 0 004.5 17h11a1.5 1.5 0 001.5-1.5v-11A1.5 1.5 0 0015.5 3h-11zM7 7.5V14H5V7.5h2zm-1-1.25a1 1 0 110-2 1 1 0 010 2zM15 14h-2v-3.25c0-.87-.33-1.25-1-1.25s-1.17.52-1.17 1.25V14H9V7.5h1.83v.9S11.5 7.25 12.75 7.25C14.17 7.25 15 8.17 15 10v4z"/></svg>',
    github: '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.836a9.578 9.578 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.138 18.163 20 14.418 20 10c0-5.523-4.477-10-10-10z" clip-rule="evenodd"/></svg>',
    download: '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>',
    external: '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/></svg>'
  };

  // --- Helpers ---
  function esc(str) {
    var el = document.createElement('span');
    el.textContent = str;
    return el.innerHTML;
  }

  function isExternal(url) {
    return url && !url.startsWith('mailto:');
  }

  // ===========================================
  // THEME TOGGLE
  // ===========================================
  function initThemeToggle() {
    var btn = document.getElementById('theme-toggle');
    var html = document.documentElement;

    // Load saved preference or use dark
    var saved = localStorage.getItem('theme');
    if (saved) {
      html.setAttribute('data-theme', saved);
    }

    if (!btn) return;

    btn.addEventListener('click', function () {
      var current = html.getAttribute('data-theme') || 'dark';
      var next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }

  initThemeToggle();

  // ===========================================
  // BACK TO TOP
  // ===========================================
  function initBackToTop() {
    var btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', function () {
      if (window.scrollY > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  initBackToTop();

  // ===========================================
  // FADE-IN ON SCROLL (IntersectionObserver)
  // ===========================================
  function initFadeIn() {
    var elements = document.querySelectorAll('.fade-in');
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
      // Fallback: show everything
      elements.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(function (el) { observer.observe(el); });
  }

  // ===========================================
  // RENDERERS
  // ===========================================
  function renderAbout(data) {
    var el = document.getElementById('about');
    if (!el || !data) return;

    var links = (data.links || []).map(function (l) {
      var icon = ICONS[l.icon] || '';
      var target = isExternal(l.url) ? ' target="_blank" rel="noopener"' : '';
      var dl = l.icon === 'download' ? ' download' : '';
      return '<a href="' + esc(l.url) + '"' + target + dl + '>' + icon + ' ' + esc(l.label) + '</a>';
    }).join('');

    var taglineHtml = data.tagline
      ? '<p class="about-tagline">' + esc(data.tagline) + '</p>'
      : '';

    var learningHtml = data.currently_learning
      ? '<p class="about-learning"><strong>Currently learning:</strong> ' + esc(data.currently_learning) + '</p>'
      : '';

    el.innerHTML =
      '<h1 class="about-name">' + esc(data.name) + '</h1>' +
      '<p class="about-title">' + esc(data.title) + '</p>' +
      taglineHtml +
      '<p class="about-desc">' + esc(data.summary) + '</p>' +
      learningHtml +
      '<div class="about-links">' + links + '</div>';
  }

  function renderSkills(data) {
    var el = document.getElementById('skills');
    if (!el || !data) return;

    var cards = data.map(function (s) {
      return '<div class="skill-card fade-in">' +
        '<h3 class="skill-card-title">' + esc(s.category) + '</h3>' +
        '<p class="skill-card-items">' + esc(s.items) + '</p>' +
        '</div>';
    }).join('');

    el.innerHTML =
      '<h2 class="section-title">' + 'Skills' + '</h2>' +
      '<div class="skills-grid">' + cards + '</div>';
  }

  function renderExperience(data) {
    var el = document.getElementById('experience');
    if (!el || !data) return;

    var items = data.map(function (job) {
      var bullets = (job.bullets || []).map(function (b) {
        return '<li>' + esc(b) + '</li>';
      }).join('');

      return '<div class="exp-item fade-in">' +
        '<div class="exp-header">' +
          '<span class="exp-role">' + esc(job.role) + '</span>' +
          '<span class="exp-date">' + esc(job.date) + '</span>' +
        '</div>' +
        '<p class="exp-company">' + esc(job.company) + ' · ' + esc(job.location) + '</p>' +
        '<ul class="exp-bullets">' + bullets + '</ul>' +
        '</div>';
    }).join('');

    el.innerHTML =
      '<h2 class="section-title">' + 'Experience' + '</h2>' +
      '<div class="exp-list">' + items + '</div>';
  }

  function renderProjects(data) {
    var el = document.getElementById('projects');
    if (!el || !data) return;

    var cards = data.map(function (p) {
      var tags = (p.tags || []).map(function (t) {
        return '<span class="project-tag">' + esc(t) + '</span>';
      }).join('');

      return '<div class="project-card fade-in">' +
        '<div class="project-card-header">' +
          '<h3 class="project-card-name">' + esc(p.name) + '</h3>' +
          '<a href="' + esc(p.url) + '" target="_blank" rel="noopener" class="project-card-link" aria-label="View on GitHub">' + ICONS.external + '</a>' +
        '</div>' +
        '<p class="project-card-desc">' + esc(p.description) + '</p>' +
        '<div class="project-card-tags">' + tags + '</div>' +
        '</div>';
    }).join('');

    el.innerHTML =
      '<h2 class="section-title">' + 'Projects' + '</h2>' +
      '<div class="projects-grid">' + cards + '</div>';
  }

  function renderEducation(data) {
    var el = document.getElementById('education');
    if (!el || !data) return;

    var items = data.map(function (e) {
      return '<div class="edu-item fade-in">' +
        '<span class="edu-degree">' + esc(e.degree) + '</span>' +
        '<span class="edu-year">' + esc(e.year) + '</span>' +
        '<p class="edu-detail">' + esc(e.institution) + '</p>' +
        '</div>';
    }).join('');

    el.innerHTML =
      '<h2 class="section-title">' + 'Education' + '</h2>' +
      '<div class="edu-list">' + items + '</div>';
  }

  function renderFooter(links) {
    var el = document.getElementById('footer');
    if (!el) return;

    var footerLinks = (links || []).map(function (l) {
      var icon = ICONS[l.icon] || '';
      var target = isExternal(l.url) ? ' target="_blank" rel="noopener"' : '';
      var label = l.label.indexOf('@') !== -1 ? 'Email' : l.label;
      var dl = l.icon === 'download' ? ' download' : '';
      return '<a href="' + esc(l.url) + '"' + target + dl + '>' + icon + ' ' + esc(label) + '</a>';
    }).join('');

    el.innerHTML =
      '<div class="container"><div class="footer-inner">' +
        '<div class="footer-links">' + footerLinks + '</div>' +
        '<span class="footer-copy">&copy; ' + new Date().getFullYear() + ' Anand Kore</span>' +
      '</div></div>';
  }

  // ===========================================
  // FETCH & RENDER
  // ===========================================
  fetch('content.yaml')
    .then(function (res) {
      if (!res.ok) throw new Error('Failed to load content.yaml');
      return res.text();
    })
    .then(function (text) {
      var data = jsyaml.load(text);

      renderAbout(data.about);
      renderSkills(data.skills);
      renderExperience(data.experience);
      renderProjects(data.projects);
      renderEducation(data.education);
      renderFooter(data.about ? data.about.links : []);

      // Update page title from content
      if (data.about && data.about.name && data.about.title) {
        document.title = data.about.name + ' - ' + data.about.title;
      }

      // Init features that depend on rendered content
      initFadeIn();
      initScrollTracking();
    })
    .catch(function (err) {
      console.error('Content load error:', err);
      document.querySelector('.container').innerHTML =
        '<p style="padding:80px 0;color:#f78166;">Failed to load content. Make sure content.yaml exists and the page is served via HTTP (not file://).</p>';
    });

  // ===========================================
  // MOBILE NAV TOGGLE
  // ===========================================
  var toggle = document.getElementById('nav-toggle');
  var navLinks = document.getElementById('nav-links');

  if (toggle && navLinks) {
    toggle.addEventListener('click', function () {
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('open');
      });
    });
  }

  // ===========================================
  // ACTIVE NAV UNDERLINE ON SCROLL
  // ===========================================
  function initScrollTracking() {
    var sections = document.querySelectorAll('section[id]');
    var navAnchors = document.querySelectorAll('.nav-links a');

    function setActiveLink() {
      var scrollY = window.scrollY + 80;
      var current = '';

      sections.forEach(function (section) {
        if (section.offsetTop <= scrollY) {
          current = section.getAttribute('id');
        }
      });

      navAnchors.forEach(function (a) {
        a.classList.remove('active');
        if (a.getAttribute('href') === '#' + current) {
          a.classList.add('active');
        }
      });
    }

    window.addEventListener('scroll', setActiveLink, { passive: true });
    setActiveLink();
  }
})();
