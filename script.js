/* ============================================
   PORTFOLIO - YAML-driven renderer + enhancements
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
    preview: '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/></svg>',
    external: '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/></svg>',
    medium: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42s-3.39-2.88-3.39-6.42 1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42zm2.94 0c0 3.17-.53 5.75-1.19 5.75s-1.19-2.58-1.19-5.75.53-5.75 1.19-5.75 1.19 2.58 1.19 5.75z"/></svg>',
    hashnode: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.65 10.4a3.27 3.27 0 000 4.62l6.32 6.33a3.27 3.27 0 004.62 0l6.33-6.33a3.27 3.27 0 000-4.62L13.6 4.07a3.27 3.27 0 00-4.63 0L2.65 10.4zm8.56-1.47a3.1 3.1 0 110 6.19 3.1 3.1 0 010-6.19z"/></svg>',
    dev: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.42 10.05c-.18-.16-.46-.23-.84-.23H6v4.36h.58c.37 0 .67-.08.84-.23.2-.17.31-.48.31-.95v-2c0-.5-.11-.81-.31-.95zm13.37-7.13H3.2A2.13 2.13 0 001 5.04v13.92c0 1.17.96 2.12 2.21 2.12h17.58c1.25 0 2.21-.95 2.21-2.12V5.04c0-1.17-.96-2.12-2.21-2.12zM8.89 14.32c-.38.42-.93.63-1.62.63H5.12V9.05h2.17c.69 0 1.23.2 1.6.63.34.39.52.94.52 1.65v1.34c0 .71-.18 1.26-.52 1.65zm4.46-.36c0 .7-.28 1.3-.84 1.82-.25.23-.59.35-1.02.35-.42 0-.77-.12-1.03-.36l-.07-.08V16h-1.41V9.05h1.41v.61a1.57 1.57 0 011.1-.44c.43 0 .77.12 1.02.36.56.51.84 1.12.84 1.82v2.56zm5.18-1.15h-1.67v1.67h-.88v-1.67h-1.66v-.88h1.66v-1.67h.88v1.67h1.67v.88z"/></svg>',
    twitter: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.933zm-1.292 19.49h2.039L6.486 3.24H4.298l13.311 17.403z"/></svg>'
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
      var delay = 0;
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          setTimeout(function() {
            entry.target.classList.add('visible');
          }, delay);
          delay += 100;
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(function (el) { observer.observe(el); });
  }

  // ===========================================
  // RENDERERS
  // ===========================================
  function renderHero(data) {
    var el = document.getElementById('hero');
    if (!el || !data) return;

    var links = (data.links || []).map(function (l) {
      var icon = ICONS[l.icon] || '';
      var hasLabel = !l.icon_only;
      var className = l.icon_only ? 'about-link-icon' : 'about-link-btn';
      var labelHtml = hasLabel ? '<span>' + esc(l.label) + '</span>' : '';
      
      var attr = ' class="' + className + '"';
      if (l.icon_only) attr += ' aria-label="' + esc(l.label) + '" title="' + esc(l.label) + '"';

      if (l.icon === 'preview') {
        return '<button type="button"  class="' + className + ' resume-preview-btn" data-url="' + esc(l.url) + '">' + icon + labelHtml + '</button>';
      }
      var target = isExternal(l.url) ? ' target="_blank" rel="noopener"' : '';
      var dl = l.icon === 'download' ? ' download' : '';
      return '<a href="' + esc(l.url) + '"' + attr + target + dl + '>' + icon + labelHtml + '</a>';
    }).join('');

    var taglineHtml = data.tagline
      ? '<p class="about-tagline">' + esc(data.tagline) + '</p>'
      : '';

    var learningHtml = data.currently_learning
      ? '<p class="about-learning"><strong>Currently learning:</strong> ' + esc(data.currently_learning) + '</p>'
      : '';

    el.innerHTML =
      '<div class="about-flex">' +
        '<div class="about-text">' +
          '<h1 class="about-name animate-item">' + esc(data.name) + '</h1>' +
          '<p class="about-title animate-item">' + esc(data.title) + '</p>' +
          (taglineHtml ? taglineHtml.replace('class="', 'class="animate-item ') : '') +
          '<p class="about-desc animate-item">' + esc(data.summary) + '</p>' +
          (learningHtml ? learningHtml.replace('class="', 'class="animate-item ') : '') +
          '<div class="about-links animate-item">' + links + '</div>' +
        '</div>' +
        '<div class="about-image animate-item">' +
          '<img src="' + (data.image || 'favicon.png') + '" alt="' + esc(data.name) + '">' +
        '</div>' +
      '</div>';
  }

  function renderAboutMe(data) {
    var el = document.getElementById('about');
    if (!el || !data) return;

    var skillsHtml = '<div class="about-me-skills">';
    if (data.skills_icons) {
      data.skills_icons.forEach(function(skill) {
        var styleAttr = skill.color ? ' style="--glow-color: ' + esc(skill.color) + ';"' : '';
        skillsHtml += '<div class="skill-icon-wrapper" aria-label="' + esc(skill.name) + '" title="' + esc(skill.name) + '"' + styleAttr + '>' +
          '<img src="' + esc(skill.icon) + '" alt="' + esc(skill.name) + '" class="skill-icon-img" />' +
          '<div class="skill-tooltip">' + esc(skill.name) + '</div>' +
        '</div>';
      });
    }
    skillsHtml += '</div>';

    el.innerHTML = 
      '<div class="about-me-container">' +
        '<div class="about-me-header">' +
          '<h2 class="section-title">About</h2>' +
          '<h3 class="about-me-subtitle">Me</h3>' +
        '</div>' +
        '<div class="about-me-split">' +
          '<div class="about-me-left fade-in visible">' +
            '<img src="' + esc(data.image) + '" alt="' + esc(data.name) + '" class="about-me-profile-img" />' +
          '</div>' +
          '<div class="about-me-right fade-in visible">' +
            '<h2 class="about-me-name">' + esc(data.name) + '</h2>' +
            '<p class="about-me-intro">' + data.intro.replace(/\n\n/g, '</p><p class="about-me-intro">') + '</p>' +
            skillsHtml +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function renderExperience(data) {
    var el = document.getElementById('experience');
    if (!el || !data) return;

    var items = data.map(function (job, index) {
      var tags = (job.technologies || []).map(function (t) {
        return '<span class="exp-focus-tag">' + esc(t) + '</span>';
      }).join('');

      return '<div class="exp-focus-item" data-index="' + index + '">' +
          '<div class="exp-focus-content">' +
            '<h3 class="exp-focus-role">' + esc(job.role) + '</h3>' +
            '<p class="exp-focus-company">' + esc(job.company) + '</p>' +
            '<p class="exp-focus-desc">' + esc(job.description || '') + '</p>' +
            (tags ? '<div class="exp-focus-tags">' + tags + '</div>' : '') +
            '<span class="exp-focus-date">' + esc(job.date) + '</span>' +
            '<div class="exp-focus-accent"></div>' +
          '</div>' +
        '</div>';
    }).join('');

    el.innerHTML =
      '<div class="exp-section-header">' +
        '<h2 class="section-title">Experience</h2>' +
      '</div>' +
      '<div class="exp-focus-container">' + items + '</div>';

    // Intersection Observer for Focus Flow
    if ('IntersectionObserver' in window) {
      var observerOptions = {
        root: null,
        rootMargin: '-20% 0% -20% 0%', // Trigger when item is in the central 60% of viewport
        threshold: 0.5
      };

      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          } else {
            entry.target.classList.remove('active');
          }
        });
      }, observerOptions);

      var focusItems = el.querySelectorAll('.exp-focus-item');
      focusItems.forEach(function(item) {
        observer.observe(item);
      });
    }
  }

  function renderProjects(data) {
    var el = document.getElementById('projects');
    if (!el || !data) return;

    var cards = data.map(function (p) {
      var tags = (p.tags || []).map(function (t) {
        return '<span class="project-tag-pill">' + esc(t) + '</span>';
      }).join('');

      var imageSrc = p.image || '/favicon.png'; // Fallback if no image

      return '<div class="project-premium-card fade-in visible">' +
        '<div class="project-card-image-wrapper">' +
          '<img src="' + esc(imageSrc) + '" alt="' + esc(p.name) + '" class="project-card-image" />' +
          '<div class="project-card-overlay">' +
            '<a href="' + esc(p.url) + '" target="_blank" rel="noopener" class="project-view-btn">View Project</a>' +
          '</div>' +
        '</div>' +
        '<div class="project-card-content">' +
          '<h3 class="project-card-title">' + esc(p.name) + '</h3>' +
          '<p class="project-card-desc">' + esc(p.description) + '</p>' +
          '<div class="project-card-tags">' + tags + '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    el.innerHTML =
      '<div class="exp-section-header">' +
        '<h2 class="section-title">Projects</h2>' +
      '</div>' +
      '<div class="projects-premium-grid">' + cards + '</div>';
  }

  function renderAchievements(data) {
    var el = document.getElementById('achievements');
    if (!el || !data) return;

    var items = data.map(function (a, index) {
      // Alternate left/right for tree branches
      var sideClass = index % 2 === 0 ? 'achieve-left' : 'achieve-right';
      
      return '<div class="achieve-node-wrapper fade-in ' + sideClass + '">' +
        '<div class="achieve-branch"></div>' +
        '<div class="achieve-node">' +
          '<div class="achieve-node-core"></div>' +
          '<div class="achieve-node-glow"></div>' +
        '</div>' +
        '<div class="achieve-content">' +
          '<div class="achieve-year">' + esc(a.year) + '</div>' +
          '<h3 class="achieve-title">' + esc(a.title) + '</h3>' +
          '<div class="achieve-position">' + esc(a.position) + '</div>' +
          '<p class="achieve-desc">' + esc(a.description) + '</p>' +
        '</div>' +
      '</div>';
    }).join('');

    el.innerHTML =
      '<h2 class="section-title">My Journey</h2>' +
      '<div class="achievements-tree">' +
        '<div class="achievements-spine"></div>' +
        items +
      '</div>';
  }

  function renderEducation(data) {
    var el = document.getElementById('education');
    if (!el || !data) return;

    var eduIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="edu-icon-svg"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>';

    var items = data.map(function (e) {
      var iconHtml = e.icon 
        ? '<img src="' + e.icon + '" alt="' + esc(e.institution) + '" class="edu-icon-img" />'
        : eduIcon;

      return '<div class="edu-premium-card fade-in visible">' +
          '<div class="edu-card-left">' +
            '<div class="edu-card-icon">' + iconHtml + '</div>' +
            '<div class="edu-card-info">' +
              '<h3 class="edu-degree">' + esc(e.degree) + '</h3>' +
              '<p class="edu-institution">' + esc(e.institution) + '</p>' +
            '</div>' +
          '</div>' +
          '<div class="edu-card-right">' +
            '<span class="edu-year">' + esc(e.year) + '</span>' +
          '</div>' +
      '</div>';
    }).join('');

    el.innerHTML =
      '<div class="exp-section-header">' +
        '<h2 class="section-title">Education</h2>' +
      '</div>' +
      '<div class="edu-premium-list">' + items + '</div>';
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
      '<span class="footer-copy">&copy; ' + new Date().getFullYear() + ' Ahir Sarkar</span>' +
      '</div></div>';
  }

  // ===========================================
  // BLOG RENDERER
  // ===========================================
  function formatBlogDate(dateStr) {
    var d = new Date(dateStr);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }

  function renderBlog(data) {
    var el = document.getElementById('blog-content');
    if (!el || !data || !data.length) {
      if (el) {
        el.innerHTML =
          '<div class="blog-header">' +
          '<h1 class="section-title">Blog</h1>' +
          '</div>' +
          '<p class="blog-empty">No posts yet — check back soon.</p>';
      }
      return;
    }

    // Sort by date descending (newest first)
    var sorted = data.slice().sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    });

    var entries = sorted.map(function (post) {
      var platformIcon = ICONS[post.platform] || '';
      var platformLabel = post.platform ? post.platform.charAt(0).toUpperCase() + post.platform.slice(1) : 'Blog';

      var tags = (post.tags || []).map(function (t) {
        return '<span class="project-tag">' + esc(t) + '</span>';
      }).join('');

      var dateFormatted = post.date ? formatBlogDate(post.date) : '';

      return '<article class="blog-entry fade-in">' +
        '<div class="blog-entry-meta">' +
          '<span class="blog-date">' + esc(dateFormatted) + '</span>' +
          '<span class="blog-platform">' + platformIcon + ' ' + esc(platformLabel) + '</span>' +
        '</div>' +
        '<div class="blog-entry-content">' +
          '<h2 class="blog-title">' + esc(post.title) + '</h2>' +
          '<p class="blog-summary">' + esc(post.summary) + '</p>' +
          (tags ? '<div class="blog-entry-tags">' + tags + '</div>' : '') +
        '</div>' +
        '<a href="' + esc(post.url) + '" target="_blank" rel="noopener" class="blog-entry-link" aria-label="Read article">' + ICONS.external + '</a>' +
      '</article>';
    }).join('');

    el.innerHTML =
      '<div class="blog-header">' +
      '<h1 class="section-title">Blog</h1>' +
      '<p class="blog-subtitle">Thoughts on DevOps, infrastructure, and the tools I build.</p>' +
      '</div>' +
      '<div class="blog-list">' + entries + '</div>';
  }


  // ===========================================
  // GITHUB LIVE CHART RENDERER
  // ===========================================
  function renderGitHubStats(username) {
    var el = document.getElementById('github-stats');
    if (!el || !username) return;

    // Initial structure matching the requested format
    el.innerHTML = 
      '<div class="container">' +
        '<div class="gh-chart-wrapper">' +
          '<div class="gh-chart-header">' +
            '<h2 class="gh-chart-title">GitHub Activity</h2>' +
            '<p class="gh-chart-subtitle">' + username + "'s coding journey over the past year</p>" +
            '<p class="gh-chart-total" id="gh-total-count">Loading activity...</p>' +
          '</div>' +
          '<div class="gh-grid-container" id="gh-grid-container">' +
            '<div class="stats-loading">Fetching live contribution data...</div>' +
          '</div>' +
          '<div class="gh-chart-footer">' +
            '<span>Less</span>' +
            '<div class="gh-legend">' +
              '<div class="gh-square" data-level="NONE"></div>' +
              '<div class="gh-square" data-level="FIRST_QUARTILE"></div>' +
              '<div class="gh-square" data-level="SECOND_QUARTILE"></div>' +
              '<div class="gh-square" data-level="THIRD_QUARTILE"></div>' +
              '<div class="gh-square" data-level="FOURTH_QUARTILE"></div>' +
            '</div>' +
            '<span>More</span>' +
          '</div>' +
        '</div>' +
      '</div>';

    fetch('https://github-contributions-api.deno.dev/' + username + '.json')
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (!data || !data.contributions) throw new Error('Invalid data');

        // Update Total count in the header
        var totalEl = document.getElementById('gh-total-count');
        if (totalEl) {
          totalEl.innerHTML = 'Total: <strong>' + (data.totalContributions || 0) + '</strong> contributions';
        }

        // Build HTML for Month Labels
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var monthRowHtml = '<div class="gh-month-labels" style="display:flex; gap:4px; margin-bottom:8px; height:15px;">';
        var lastMonth = -1;

        // Build HTML for the contribution grid
        var gridHtml = '<div class="gh-grid">';
        data.contributions.forEach(function(week, wIndex) {
          // Month Label Logic
          var firstDay = week.find(function(d){ return d; });
          if (firstDay) {
            var m = new Date(firstDay.date).getMonth();
            if (m !== lastMonth) {
              monthRowHtml += '<div style="font-family:var(--font-mono); font-size:10px; color:var(--muted); min-width:30px;">' + months[m] + '</div>';
              lastMonth = m;
            } else {
              monthRowHtml += '<div style="min-width:12px;"></div>'; // Spacer
            }
          }

          gridHtml += '<div class="gh-column">';
          week.forEach(function(day) {
            if (!day) return;
            gridHtml += 
              '<div class="gh-square" ' +
              'data-level="' + day.contributionLevel + '" ' +
              'data-date="' + day.date + '" ' +
              'title="' + day.contributionCount + ' contributions on ' + day.date + '">' +
              '</div>';
          });
          gridHtml += '</div>';
        });
        gridHtml += '</div>';
        monthRowHtml += '</div>';

        var container = document.getElementById('gh-grid-container');
        if (container) {
          container.innerHTML = monthRowHtml + gridHtml;
        }
      })
      .catch(function(err) {
        console.error('GitHub Chart error:', err);
        var container = document.getElementById('gh-grid-container');
        if (container) {
          container.innerHTML = '<div class="stats-error">Failed to load live activity data.</div>';
        }
      });
  }

  // ===========================================
  // RANDOM QUOTE RENDERER
  // ===========================================
  function renderQuote() {
    var el = document.getElementById('quote-section');
    if (!el) return;

    // Robust list of high-quality dev quotes
    var localQuotes = [
      { content: "Consistency beats motivation every single time.", author: "Gen-Z Wisdom" },
      { content: "The best way to predict the future is to invent it.", author: "Alan Kay" },
      { content: "First, solve the problem. Then, write the code.", author: "John Johnson" },
      { content: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
      { content: "Code is like humor. When you have to explain it, it’s bad.", author: "Cory House" },
      { content: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
      { content: "Make it work, make it right, make it fast.", author: "Kent Beck" },
      { content: "Before software can be reusable it first has to be usable.", author: "Ralph Johnson" },
      { content: "Fix the cause, not just the symptom.", author: "Steve Maguire" },
      { content: "Clean code always looks like it was written by someone who cares.", author: "Robert C. Martin" }
    ];

    // Primary: DummyJSON (Reliable), Fallback: Randomized local list
    fetch('https://dummyjson.com/quotes/random?t=' + Date.now())
      .then(function(res) { 
        if (!res.ok) throw new Error();
        return res.json(); 
      })
      .then(function(data) {
        // DummyJSON returns { quote, author }
        displayQuote(data.quote, data.author);
      })
      .catch(function() {
        // Pick a truly random quote from the local list
        var randomPick = localQuotes[Math.floor(Math.random() * localQuotes.length)];
        displayQuote(randomPick.content, randomPick.author);
      });

    function displayQuote(content, author) {
      el.innerHTML = 
        '<div class="container">' +
          '<div class="quote-card fade-in">' +
            '<div class="quote-icon">&ldquo;</div>' +
            '<p class="quote-text">"' + content + '"</p>' +
            '<div class="quote-author-wrapper">' +
              '<span class="quote-author">&mdash; ' + (author || 'Gen-Z Wisdom') + '</span>' +
            '</div>' +
          '</div>' +
        '</div>';
      
      setTimeout(function() {
        var card = el.querySelector('.fade-in');
        if (card) card.classList.add('visible');
      }, 100);
    }
  }

  // ===========================================
  // FETCH & RENDER
  // ===========================================
  // Detect which page we're on
  var isBlogPage = document.body.getAttribute('data-page') === 'blog';

  fetch('content.yaml')
    .then(function (res) {
      if (!res.ok) throw new Error('Failed to load content.yaml');
      return res.text();
    })
    .then(function (text) {
      var data = jsyaml.load(text);

      if (isBlogPage) {
        // Blog page: only render blog + footer
        renderBlog(data.blogs);
        renderFooter(data.about ? data.about.links : []);
      } else {
        // Main page: render all sections in specific order
        renderHero(data.about);
        renderExperience(data.experience);
        renderEducation(data.education);
        renderProjects(data.projects);
        renderAboutMe(data.about_me);
        renderGitHubStats(data.about.github_username);
        renderAchievements(data.achievements);
        renderQuote();
        renderFooter(data.about ? data.about.links : []);

        // Update page title from content
        if (data.about && data.about.name && data.about.title) {
          document.title = data.about.name + ' - ' + data.about.title;
        }

        initScrollTracking();
        initResumePreview();
      }

      // Init features that depend on rendered content (both pages)
      initFadeIn();
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

  // ===========================================
  // RESUME PREVIEW MODAL
  // ===========================================
  function initResumePreview() {
    var btn = document.querySelector('.resume-preview-btn');
    if (!btn) return;

    btn.addEventListener('click', function () {
      openResumeModal(btn.getAttribute('data-url'));
    });
  }

  function openResumeModal(url) {
    // Create modal if it doesn't exist yet
    var modal = document.getElementById('resume-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'resume-modal';
      modal.className = 'resume-modal';
      modal.innerHTML =
        '<div class="resume-modal-content">' +
        '<button class="resume-modal-close" aria-label="Close preview">&times;</button>' +
        '<embed src="' + url + '" type="application/pdf">' +
        '</div>';
      document.body.appendChild(modal);

      // Close on overlay click
      modal.addEventListener('click', function (e) {
        if (e.target === modal) closeResumeModal();
      });

      // Close button
      modal.querySelector('.resume-modal-close').addEventListener('click', closeResumeModal);

      // Escape key
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeResumeModal();
      });
    }

    // Force reflow before adding class for transition
    void modal.offsetWidth;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeResumeModal() {
    var modal = document.getElementById('resume-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
})();
