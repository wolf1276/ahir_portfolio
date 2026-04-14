/* ============================================
   FLOATING ROBOT ASSISTANT
   A minimal, futuristic AI companion that follows
   the user's cursor with lifelike behavior.
   ============================================ */

(function () {
  'use strict';

  // ─── Configuration ─────────────────────────────
  var CONFIG = {
    size: 48,                    // Robot body size in px
    easingFactor: 0.08,          // Lower = smoother/slower follow (0.01–0.2)
    tiltMultiplier: 0.4,         // How much the robot tilts toward movement
    maxTilt: 25,                 // Max tilt angle in degrees
    floatAmplitude: 4,           // Idle float height in px
    floatSpeed: 2000,            // Idle float cycle duration in ms
    blinkInterval: [2000, 5000], // Random blink interval range in ms
    idleTimeout: 800,            // ms of no movement before entering idle
    tooltipMessages: {
      email:    'Email me ✉',
      github:   'Follow me!',
      linkedin: 'Connect!',
      twitter:  'Follow me!',
      preview:  'Read me 📄',
      download: 'Download me ⬇',
      link:     ['Click this →', 'Let\'s go!', 'Nice choice'],
      button:   ['Press me!', 'Go ahead!', 'Try this!']
    },
    sectionReactions: {
      about:       'happy',
      skills:      'excited',
      experience:  'focused',
      education:   'curious',
      projects:    'excited',
      'github-stats': 'focused'
    }
  };

  // ─── State ─────────────────────────────────────
  var state = {
    mouseX: window.innerWidth / 2,
    mouseY: window.innerHeight / 2,
    robotX: window.innerWidth / 2,
    robotY: window.innerHeight / 2,
    prevRobotX: 0,
    prevRobotY: 0,
    velocityX: 0,
    velocityY: 0,
    isMoving: false,
    isIdle: true,
    isEnabled: true,
    isBlinking: false,
    expression: 'idle',    // idle | happy | curious | excited | focused
    hoveringClickable: false,
    idleTimer: null,
    blinkTimer: null,
    animFrame: null,
    tooltipVisible: false,
    currentSection: null
  };

  // ─── DOM Construction ──────────────────────────
  // Main robot container
  var robot = document.createElement('div');
  robot.id = 'robot-assistant';
  robot.className = 'robot-assistant';
  robot.setAttribute('aria-hidden', 'true');

  // Robot body (the main shape)
  robot.innerHTML =
    '<div class="robot-body">' +
      '<div class="robot-antenna">' +
        '<div class="robot-antenna-orb"></div>' +
      '</div>' +
      '<div class="robot-head">' +
        '<div class="robot-visor">' +
          '<div class="robot-eye robot-eye-left"></div>' +
          '<div class="robot-eye robot-eye-right"></div>' +
        '</div>' +
        '<div class="robot-mouth"></div>' +
      '</div>' +
      '<div class="robot-glow"></div>' +
    '</div>' +
    '<div class="robot-tooltip" id="robot-tooltip"></div>';

  // Toggle button
  var toggleBtn = document.createElement('button');
  toggleBtn.id = 'robot-toggle';
  toggleBtn.className = 'robot-toggle';
  toggleBtn.setAttribute('aria-label', 'Toggle robot assistant');
  toggleBtn.title = 'Toggle AI Assistant';
  toggleBtn.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '<rect x="4" y="4" width="16" height="12" rx="2"/>' +
      '<circle cx="9" cy="10" r="1.5" fill="currentColor"/>' +
      '<circle cx="15" cy="10" r="1.5" fill="currentColor"/>' +
      '<line x1="12" y1="16" x2="12" y2="20"/>' +
      '<line x1="8" y1="20" x2="16" y2="20"/>' +
    '</svg>';

  // ─── Inject Styles ─────────────────────────────
  var styleSheet = document.createElement('style');
  styleSheet.textContent = getCSSStyles();
  document.head.appendChild(styleSheet);

  // ─── Append to DOM ─────────────────────────────
  document.body.appendChild(robot);
  document.body.appendChild(toggleBtn);

  // ─── Element References ────────────────────────
  var eyeLeft  = robot.querySelector('.robot-eye-left');
  var eyeRight = robot.querySelector('.robot-eye-right');
  var mouth    = robot.querySelector('.robot-mouth');
  var glow     = robot.querySelector('.robot-glow');
  var tooltip  = robot.querySelector('.robot-tooltip');
  var antennaOrb = robot.querySelector('.robot-antenna-orb');
  var body     = robot.querySelector('.robot-body');

  // ─── Event Listeners ──────────────────────────
  document.addEventListener('mousemove', onMouseMove, { passive: true });
  document.addEventListener('mouseover', onMouseOver, { passive: true });
  document.addEventListener('mouseout', onMouseOut, { passive: true });
  toggleBtn.addEventListener('click', toggleRobot);

  // Load saved preference
  var savedPref = localStorage.getItem('robot-enabled');
  if (savedPref === 'false') {
    state.isEnabled = false;
    robot.classList.add('robot-hidden');
    toggleBtn.classList.add('robot-toggle-off');
  }

  // Start the animation loop
  scheduleNextBlink();
  animate();

  // ─── Mouse Move Handler ───────────────────────
  function onMouseMove(e) {
    state.mouseX = e.clientX;
    state.mouseY = e.clientY;

    if (!state.isEnabled) return;

    // Reset idle timer
    state.isMoving = true;
    state.isIdle = false;
    robot.classList.remove('robot-idle');

    clearTimeout(state.idleTimer);
    state.idleTimer = setTimeout(function () {
      state.isMoving = false;
      state.isIdle = true;
      robot.classList.add('robot-idle');
    }, CONFIG.idleTimeout);
  }

  // ─── Hover Detection ──────────────────────────
  function onMouseOver(e) {
    if (!state.isEnabled) return;
    var target = e.target;

    // Check if hovering a clickable element
    var clickable = target.closest('a, button, [role="button"], .project-card-link, .about-link-icon, .about-link-btn');
    if (clickable) {
      state.hoveringClickable = true;
      setExpression('happy');
      showTooltip(clickable);
      robot.classList.add('robot-clickable-hover');
      return;
    }

    // Check which section we're in
    var section = target.closest('section[id]');
    if (section) {
      var sectionId = section.getAttribute('id');
      if (sectionId !== state.currentSection) {
        state.currentSection = sectionId;
        var reaction = CONFIG.sectionReactions[sectionId] || 'idle';
        setExpression(reaction);
      }
    }
  }

  function onMouseOut(e) {
    if (!state.isEnabled) return;
    var target = e.target;
    var clickable = target.closest('a, button, [role="button"], .project-card-link, .about-link-icon, .about-link-btn');
    if (clickable) {
      state.hoveringClickable = false;
      hideTooltip();
      robot.classList.remove('robot-clickable-hover');
      // Revert to section expression or idle
      var section = document.elementFromPoint(state.mouseX, state.mouseY);
      if (section) {
        var sec = section.closest('section[id]');
        if (sec) {
          var reaction = CONFIG.sectionReactions[sec.getAttribute('id')] || 'idle';
          setExpression(reaction);
          return;
        }
      }
      setExpression('idle');
    }
  }

  // ─── Toggle Robot ─────────────────────────────
  function toggleRobot() {
    state.isEnabled = !state.isEnabled;
    if (state.isEnabled) {
      robot.classList.remove('robot-hidden');
      toggleBtn.classList.remove('robot-toggle-off');
      localStorage.setItem('robot-enabled', 'true');
    } else {
      robot.classList.add('robot-hidden');
      toggleBtn.classList.add('robot-toggle-off');
      hideTooltip();
      localStorage.setItem('robot-enabled', 'false');
    }
  }

  // ─── Expressions ──────────────────────────────
  function setExpression(expr) {
    if (state.expression === expr) return;
    state.expression = expr;

    // Remove all expression classes
    robot.className = robot.className.replace(/\brobot-expr-\w+/g, '').trim();
    robot.classList.add('robot-expr-' + expr);
  }

  // ─── Tooltip ──────────────────────────────────
  function showTooltip(target) {
    var msg = getContextualMessage(target);
    tooltip.textContent = msg;
    tooltip.classList.add('robot-tooltip-visible');
    state.tooltipVisible = true;
  }

  // Determine the right message based on the hovered element
  function getContextualMessage(target) {
    var el = target.closest('a, button') || target;

    // Check aria-label or title for icon-only links (email, github, etc.)
    var label = (el.getAttribute('aria-label') || el.getAttribute('title') || '').toLowerCase();
    // Check href for mailto links
    var href = (el.getAttribute('href') || '').toLowerCase();

    // Match specific link types
    if (href.indexOf('mailto:') === 0 || label.indexOf('email') !== -1)
      return CONFIG.tooltipMessages.email;
    if (label.indexOf('github') !== -1 || href.indexOf('github.com') !== -1)
      return CONFIG.tooltipMessages.github;
    if (label.indexOf('linkedin') !== -1 || href.indexOf('linkedin.com') !== -1)
      return CONFIG.tooltipMessages.linkedin;
    if (label.indexOf('twitter') !== -1 || label.indexOf('x.com') !== -1 || href.indexOf('x.com') !== -1)
      return CONFIG.tooltipMessages.twitter;
    if (el.classList.contains('resume-preview-btn') || label.indexOf('resume') !== -1 || label.indexOf('preview') !== -1)
      return CONFIG.tooltipMessages.preview;
    if (el.hasAttribute('download') || href.indexOf('.pdf') !== -1)
      return CONFIG.tooltipMessages.download;

    // Fallback: random from generic pool
    var isLink = el.tagName === 'A';
    var pool = isLink ? CONFIG.tooltipMessages.link : CONFIG.tooltipMessages.button;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function hideTooltip() {
    tooltip.classList.remove('robot-tooltip-visible');
    state.tooltipVisible = false;
  }

  // ─── Blinking ─────────────────────────────────
  function scheduleNextBlink() {
    var min = CONFIG.blinkInterval[0];
    var max = CONFIG.blinkInterval[1];
    var delay = min + Math.random() * (max - min);

    state.blinkTimer = setTimeout(function () {
      if (state.isEnabled && !state.isBlinking) {
        doBlink();
      }
      scheduleNextBlink();
    }, delay);
  }

  function doBlink() {
    state.isBlinking = true;
    robot.classList.add('robot-blink');
    setTimeout(function () {
      robot.classList.remove('robot-blink');
      state.isBlinking = false;
    }, 150);
  }

  // ─── Animation Loop ───────────────────────────
  function animate() {
    if (state.isEnabled) {
      // Smooth easing toward the cursor
      var dx = state.mouseX - state.robotX;
      var dy = state.mouseY - state.robotY;

      state.robotX += dx * CONFIG.easingFactor;
      state.robotY += dy * CONFIG.easingFactor;

      // Calculate velocity for tilt
      state.velocityX = state.robotX - state.prevRobotX;
      state.velocityY = state.robotY - state.prevRobotY;
      state.prevRobotX = state.robotX;
      state.prevRobotY = state.robotY;

      // Tilt based on horizontal movement direction
      var tilt = clamp(
        state.velocityX * CONFIG.tiltMultiplier,
        -CONFIG.maxTilt,
        CONFIG.maxTilt
      );

      // Position the robot (offset so it doesn't sit right on the cursor)
      var offsetX = 30;
      var offsetY = -20;
      var posX = state.robotX + offsetX;
      var posY = state.robotY + offsetY;

      robot.style.transform =
        'translate(' + posX + 'px, ' + posY + 'px) rotate(' + tilt + 'deg)';

      // ─── Eye Tracking ───────────────────────
      // Eyes follow the cursor relative to robot position
      var eyeOffsetX = clamp((state.mouseX - posX) * 0.03, -3, 3);
      var eyeOffsetY = clamp((state.mouseY - posY) * 0.03, -2, 2);

      var eyeTransform = 'translate(' + eyeOffsetX + 'px, ' + eyeOffsetY + 'px)';
      eyeLeft.style.transform = eyeTransform;
      eyeRight.style.transform = eyeTransform;

      // ─── Glow intensity based on speed ──────
      var speed = Math.sqrt(
        state.velocityX * state.velocityX +
        state.velocityY * state.velocityY
      );
      var glowOpacity = clamp(0.3 + speed * 0.03, 0.3, 0.8);
      glow.style.opacity = glowOpacity;

      // ─── Antenna pulse when moving fast ─────
      var antennaScale = clamp(1 + speed * 0.01, 1, 1.5);
      antennaOrb.style.transform = 'scale(' + antennaScale + ')';
    }

    state.animFrame = requestAnimationFrame(animate);
  }

  // ─── Utilities ────────────────────────────────
  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  // ─── CSS Styles ───────────────────────────────
  function getCSSStyles() {
    return '' +
    /* ── Robot Container ─────────────────────── */
    '.robot-assistant {' +
      'position: fixed;' +
      'top: 0;' +
      'left: 0;' +
      'z-index: 9999;' +
      'pointer-events: none;' +
      'will-change: transform;' +
      'transition: opacity 0.4s ease;' +
      'opacity: 1;' +
    '}' +

    '.robot-assistant.robot-hidden {' +
      'opacity: 0;' +
      'pointer-events: none !important;' +
    '}' +

    /* ── Robot Body Structure ─────────────────── */
    '.robot-body {' +
      'position: relative;' +
      'width: ' + CONFIG.size + 'px;' +
      'height: ' + (CONFIG.size + 8) + 'px;' +
      'filter: drop-shadow(0 4px 12px rgba(0, 200, 255, 0.25));' +
      'transition: filter 0.3s ease;' +
    '}' +

    /* ── Antenna ──────────────────────────────── */
    '.robot-antenna {' +
      'position: absolute;' +
      'top: -10px;' +
      'left: 50%;' +
      'transform: translateX(-50%);' +
      'width: 2px;' +
      'height: 10px;' +
      'background: linear-gradient(to top, #4facfe, transparent);' +
    '}' +

    '.robot-antenna-orb {' +
      'position: absolute;' +
      'top: -4px;' +
      'left: 50%;' +
      'transform: translateX(-50%);' +
      'width: 6px;' +
      'height: 6px;' +
      'border-radius: 50%;' +
      'background: #00e5ff;' +
      'box-shadow: 0 0 8px #00e5ff, 0 0 16px rgba(0, 229, 255, 0.4);' +
      'transition: transform 0.2s ease, box-shadow 0.2s ease;' +
    '}' +

    /* ── Head ─────────────────────────────────── */
    '.robot-head {' +
      'position: relative;' +
      'width: 100%;' +
      'height: ' + (CONFIG.size - 4) + 'px;' +
      'background: linear-gradient(145deg, #1a2332, #0d1520);' +
      'border-radius: 12px 12px 8px 8px;' +
      'border: 1.5px solid rgba(79, 172, 254, 0.3);' +
      'overflow: hidden;' +
      'display: flex;' +
      'flex-direction: column;' +
      'align-items: center;' +
      'justify-content: center;' +
      'gap: 4px;' +
    '}' +

    /* Theme-aware head colors */
    '[data-theme="light"] .robot-head {' +
      'background: linear-gradient(145deg, #e8eef5, #d0d8e3);' +
      'border-color: rgba(79, 172, 254, 0.4);' +
    '}' +

    /* ── Visor (eye container) ────────────────── */
    '.robot-visor {' +
      'display: flex;' +
      'gap: 8px;' +
      'align-items: center;' +
      'justify-content: center;' +
      'padding: 2px 0;' +
    '}' +

    /* ── Eyes ─────────────────────────────────── */
    '.robot-eye {' +
      'width: 8px;' +
      'height: 8px;' +
      'border-radius: 50%;' +
      'background: #00e5ff;' +
      'box-shadow: 0 0 6px #00e5ff, 0 0 12px rgba(0, 229, 255, 0.3);' +
      'transition: all 0.15s ease;' +
      'will-change: transform;' +
    '}' +

    /* ── Blink animation ─────────────────────── */
    '.robot-blink .robot-eye {' +
      'height: 2px !important;' +
      'border-radius: 4px !important;' +
      'opacity: 0.6;' +
    '}' +

    /* ── Mouth ────────────────────────────────── */
    '.robot-mouth {' +
      'width: 12px;' +
      'height: 2px;' +
      'background: rgba(0, 229, 255, 0.4);' +
      'border-radius: 4px;' +
      'transition: all 0.3s ease;' +
    '}' +

    /* ── Glow effect ──────────────────────────── */
    '.robot-glow {' +
      'position: absolute;' +
      'bottom: -6px;' +
      'left: 50%;' +
      'transform: translateX(-50%);' +
      'width: 30px;' +
      'height: 8px;' +
      'background: radial-gradient(ellipse, rgba(0, 229, 255, 0.3), transparent);' +
      'border-radius: 50%;' +
      'pointer-events: none;' +
      'transition: opacity 0.2s ease;' +
    '}' +

    /* ── EXPRESSION STATES ────────────────────── */

    /* Happy: wide eyes, smile */
    '.robot-expr-happy .robot-eye {' +
      'width: 10px;' +
      'height: 10px;' +
      'background: #4facfe;' +
      'box-shadow: 0 0 8px #4facfe, 0 0 16px rgba(79, 172, 254, 0.4);' +
    '}' +

    '.robot-expr-happy .robot-mouth {' +
      'width: 14px;' +
      'height: 4px;' +
      'border-radius: 0 0 8px 8px;' +
      'background: rgba(79, 172, 254, 0.6);' +
    '}' +

    /* Curious: uneven eyes, tilted */
    '.robot-expr-curious .robot-eye-left {' +
      'width: 10px;' +
      'height: 10px;' +
    '}' +

    '.robot-expr-curious .robot-eye-right {' +
      'width: 7px;' +
      'height: 7px;' +
    '}' +

    '.robot-expr-curious .robot-mouth {' +
      'width: 6px;' +
      'height: 6px;' +
      'border-radius: 50%;' +
      'background: rgba(0, 229, 255, 0.3);' +
    '}' +

    /* Excited: bright eyes, pulse */
    '.robot-expr-excited .robot-eye {' +
      'width: 10px;' +
      'height: 10px;' +
      'background: #ccff00;' +
      'box-shadow: 0 0 10px #ccff00, 0 0 20px rgba(204, 255, 0, 0.4);' +
      'animation: robot-pulse 0.6s ease-in-out infinite alternate;' +
    '}' +

    '.robot-expr-excited .robot-antenna-orb {' +
      'background: #ccff00;' +
      'box-shadow: 0 0 10px #ccff00, 0 0 20px rgba(204, 255, 0, 0.5);' +
    '}' +

    '.robot-expr-excited .robot-mouth {' +
      'width: 16px;' +
      'height: 4px;' +
      'border-radius: 0 0 10px 10px;' +
      'background: rgba(204, 255, 0, 0.5);' +
    '}' +

    /* Focused: narrow eyes, thin mouth */
    '.robot-expr-focused .robot-eye {' +
      'width: 10px;' +
      'height: 4px;' +
      'border-radius: 6px;' +
      'background: #ff6b6b;' +
      'box-shadow: 0 0 6px #ff6b6b, 0 0 12px rgba(255, 107, 107, 0.3);' +
    '}' +

    '.robot-expr-focused .robot-mouth {' +
      'width: 8px;' +
      'height: 1px;' +
    '}' +

    /* ── Clickable hover reaction ─────────────── */
    '.robot-clickable-hover .robot-body {' +
      'filter: drop-shadow(0 4px 16px rgba(79, 172, 254, 0.5));' +
      'transform: scale(1.1);' +
      'transition: transform 0.2s ease, filter 0.2s ease;' +
    '}' +

    /* ── Idle float animation ─────────────────── */
    '.robot-idle .robot-body {' +
      'animation: robot-float ' + CONFIG.floatSpeed + 'ms ease-in-out infinite;' +
    '}' +

    /* ── Tooltip ──────────────────────────────── */
    '.robot-tooltip {' +
      'position: absolute;' +
      'top: -32px;' +
      'left: 50%;' +
      'transform: translateX(-50%) translateY(4px);' +
      'background: rgba(13, 21, 32, 0.9);' +
      'color: #00e5ff;' +
      'font-family: "JetBrains Mono", monospace;' +
      'font-size: 10px;' +
      'letter-spacing: 0.5px;' +
      'padding: 4px 10px;' +
      'border-radius: 6px;' +
      'border: 1px solid rgba(0, 229, 255, 0.2);' +
      'white-space: nowrap;' +
      'pointer-events: none;' +
      'opacity: 0;' +
      'transition: opacity 0.2s ease, transform 0.2s ease;' +
    '}' +

    '[data-theme="light"] .robot-tooltip {' +
      'background: rgba(240, 245, 250, 0.95);' +
      'color: #0077cc;' +
      'border-color: rgba(0, 119, 204, 0.3);' +
    '}' +

    '.robot-tooltip-visible {' +
      'opacity: 1;' +
      'transform: translateX(-50%) translateY(0);' +
    '}' +

    /* ── Toggle Button ───────────────────────── */
    '.robot-toggle {' +
      'position: fixed;' +
      'bottom: 20px;' +
      'right: 20px;' +
      'z-index: 10000;' +
      'width: 40px;' +
      'height: 40px;' +
      'border-radius: 50%;' +
      'border: 1px solid rgba(0, 229, 255, 0.3);' +
      'background: rgba(13, 21, 32, 0.8);' +
      'backdrop-filter: blur(8px);' +
      '-webkit-backdrop-filter: blur(8px);' +
      'color: #00e5ff;' +
      'cursor: pointer;' +
      'display: flex;' +
      'align-items: center;' +
      'justify-content: center;' +
      'transition: all 0.3s ease;' +
      'padding: 0;' +
    '}' +

    '[data-theme="light"] .robot-toggle {' +
      'background: rgba(240, 245, 250, 0.9);' +
      'border-color: rgba(0, 119, 204, 0.3);' +
      'color: #0077cc;' +
    '}' +

    '.robot-toggle svg {' +
      'width: 20px;' +
      'height: 20px;' +
    '}' +

    '.robot-toggle:hover {' +
      'transform: scale(1.1);' +
      'border-color: #00e5ff;' +
      'box-shadow: 0 0 16px rgba(0, 229, 255, 0.3);' +
    '}' +

    '[data-theme="light"] .robot-toggle:hover {' +
      'border-color: #0077cc;' +
      'box-shadow: 0 0 16px rgba(0, 119, 204, 0.3);' +
    '}' +

    '.robot-toggle-off {' +
      'opacity: 0.5;' +
    '}' +

    '.robot-toggle-off:hover {' +
      'opacity: 1;' +
    '}' +

    /* ── Keyframes ────────────────────────────── */
    '@keyframes robot-float {' +
      '0%, 100% { transform: translateY(0); }' +
      '50% { transform: translateY(-' + CONFIG.floatAmplitude + 'px); }' +
    '}' +

    '@keyframes robot-pulse {' +
      '0% { opacity: 0.7; }' +
      '100% { opacity: 1; }' +
    '}' +

    /* ── Hide on small screens ── */
    '@media (max-width: 768px) {' +
      '.robot-assistant { display: none !important; }' +
      '.robot-toggle { display: none !important; }' +
    '}';
  }

})();
