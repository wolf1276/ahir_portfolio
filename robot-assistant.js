/* ============================================
   REALISTIC QUADCOPTER DRONE ASSISTANT
   A minimal, engineering-focused drone that 
   follows the cursor across the screen.
   ============================================ */

(function () {
  'use strict';

  // ─── Configuration ─────────────────────────────
  var CONFIG = {
    easingFactor: 0.06,          // Lerp factor (inertia)
    maxTilt: 25,                 // Max tilt in degrees
    floatAmplitude: 4,           // Hover floating amplitude
    floatSpeed: 2000,            // Hover float speed (ms per cycle)
    propIdleSpeed: 0.2,          // Idle propeller spin
    propMoveSpeed: 0.05,         // Moving propeller spin speed
  };

  // ─── State ─────────────────────────────────────
  var state = {
    mouseX: window.innerWidth / 2,
    mouseY: window.innerHeight / 2,
    currentX: window.innerWidth / 2,
    currentY: window.innerHeight / 2,
    targetX: window.innerWidth / 2,
    targetY: window.innerHeight / 2,
    velocityX: 0,
    velocityY: 0,
    time: 0,
    lastTime: performance.now(),
    isEnabled: true
  };

  // ─── DOM Construction ──────────────────────────
  var droneContainer = document.createElement('div');
  droneContainer.id = 'drone-assistant';
  droneContainer.className = 'drone-assistant';
  droneContainer.setAttribute('aria-hidden', 'true');

  droneContainer.innerHTML =
    '<div class="drone-shadow"></div>' +
    '<div class="drone-body-container">' +
      '<div class="drone-tooltip" id="drone-tooltip"></div>' +
      // Arms
      '<div class="drone-arm drone-arm-fl"><div class="drone-motor"><div class="drone-prop drone-prop-cw"></div></div></div>' +
      '<div class="drone-arm drone-arm-fr"><div class="drone-motor"><div class="drone-prop drone-prop-ccw"></div></div></div>' +
      '<div class="drone-arm drone-arm-bl"><div class="drone-motor"><div class="drone-prop drone-prop-ccw"></div></div></div>' +
      '<div class="drone-arm drone-arm-br"><div class="drone-motor"><div class="drone-prop drone-prop-cw"></div></div></div>' +
      // Central Body
      '<div class="drone-core">' +
        '<div class="drone-core-top"></div>' +
        '<div class="drone-indicator"></div>' +
      '</div>' +
    '</div>';

  // Toggle Button
  var toggleBtn = document.createElement('button');
  toggleBtn.id = 'drone-toggle';
  toggleBtn.className = 'drone-toggle';
  toggleBtn.setAttribute('aria-label', 'Toggle Drone');
  toggleBtn.title = 'Toggle Drone';
  toggleBtn.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '<circle cx="12" cy="12" r="3" />' +
      '<path d="M19 5l-4 4 M5 19l4-4 M5 5l4 4 M19 19l-4-4" />' +
    '</svg>';

  // ─── Inject Styles ─────────────────────────────
  var styleSheet = document.createElement('style');
  styleSheet.textContent = getCSSStyles();
  document.head.appendChild(styleSheet);

  document.body.appendChild(droneContainer);
  document.body.appendChild(toggleBtn);

  // ─── Element References ────────────────────────
  var droneBody = droneContainer.querySelector('.drone-body-container');
  var droneShadow = droneContainer.querySelector('.drone-shadow');
  var droneTooltip = droneContainer.querySelector('.drone-tooltip');
  var props = droneContainer.querySelectorAll('.drone-prop');

  // ─── Event Listeners ──────────────────────────
  document.addEventListener('mousemove', onMouseMove, { passive: true });
  document.addEventListener('mouseover', onMouseOver, { passive: true });
  document.addEventListener('mouseout', onMouseOut, { passive: true });
  toggleBtn.addEventListener('click', toggleDrone);

  var savedPref = localStorage.getItem('drone-enabled');
  if (savedPref === 'false') {
    state.isEnabled = false;
    droneContainer.classList.add('drone-hidden');
    toggleBtn.classList.add('drone-toggle-off');
    stopProps();
  }

  requestAnimationFrame(animate);

  // ─── Handlers ──────────────────────────────────
  function onMouseMove(e) {
    state.mouseX = e.clientX;
    state.mouseY = e.clientY;
  }

  function onMouseOver(e) {
    if (!state.isEnabled) return;
    var target = e.target;
    var clickable = target.closest('a, button, [role="button"], .project-card-link');
    if (clickable) {
      showTooltip(clickable);
    }
  }

  function onMouseOut(e) {
    if (!state.isEnabled) return;
    var target = e.target;
    var clickable = target.closest('a, button, [role="button"], .project-card-link');
    if (clickable) {
      hideTooltip();
    }
  }

  function toggleDrone() {
    state.isEnabled = !state.isEnabled;
    if (state.isEnabled) {
      droneContainer.classList.remove('drone-hidden');
      toggleBtn.classList.remove('drone-toggle-off');
      localStorage.setItem('drone-enabled', 'true');
      startProps();
    } else {
      droneContainer.classList.add('drone-hidden');
      toggleBtn.classList.add('drone-toggle-off');
      localStorage.setItem('drone-enabled', 'false');
      stopProps();
    }
  }

  function stopProps() {
    props.forEach(function(p) { p.style.animationPlayState = 'paused'; });
  }
  function startProps() {
    props.forEach(function(p) { p.style.animationPlayState = 'running'; });
  }

  function showTooltip(target) {
    var msg = getContextualMessage(target);
    if (msg) {
      droneTooltip.textContent = msg;
      droneTooltip.classList.add('drone-tooltip-visible');
    }
  }

  function hideTooltip() {
    droneTooltip.classList.remove('drone-tooltip-visible');
  }

  function getContextualMessage(target) {
    var el = target.closest('a, button') || target;
    var label = (el.getAttribute('aria-label') || el.getAttribute('title') || '').toLowerCase();
    var href = (el.getAttribute('href') || '').toLowerCase();

    // Specific mapping
    if (href.indexOf('mailto:') === 0 || label.indexOf('email') !== -1) return 'Email me ✉';
    if (href.indexOf('github.com') !== -1 || label.indexOf('github') !== -1) return 'Explore my GitHub !';
    if (href.indexOf('linkedin.com') !== -1 || label.indexOf('linkedin') !== -1) return 'Let\'s Connect!';
    if (href.indexOf('twitter.com') !== -1 || label.indexOf('twitter') !== -1 || href.indexOf('x.com') !== -1) return 'Follow me on X!';

    // Default clickable hint
    return 'Click me →';
  }

  // ─── Animation Loop ────────────────────────────
  function animate(now) {
    if (!state.isEnabled) {
      state.lastTime = now;
      requestAnimationFrame(animate);
      return;
    }

    var dt = Math.min(now - state.lastTime, 50);
    state.lastTime = now;
    state.time += dt;

    // To follow the mouse specifically: offset X and Y slightly
    state.targetX = state.mouseX;
    state.targetY = state.mouseY - 30; // Float slightly above pointer

    // Lerp current position towards target
    var prevX = state.currentX;
    var prevY = state.currentY;
    
    state.currentX += (state.targetX - state.currentX) * CONFIG.easingFactor;
    state.currentY += (state.targetY - state.currentY) * CONFIG.easingFactor;

    // Velocity
    state.velocityX = state.currentX - prevX;
    state.velocityY = state.currentY - prevY;

    var speed = Math.sqrt(state.velocityX * state.velocityX + state.velocityY * state.velocityY);

    // Float sine wave
    var floatY = Math.sin(state.time / CONFIG.floatSpeed * Math.PI * 2) * CONFIG.floatAmplitude;

    // Apply prop speed based on movement
    var targetPropDur = speed > 1 ? CONFIG.propMoveSpeed : CONFIG.propIdleSpeed;
    droneContainer.style.setProperty('--prop-speed', targetPropDur + 's');

    // Pitch & Roll (Tilt)
    // Scale down velocity impact for roll/pitch so it tilts gently across screen
    var roll = Math.min(Math.max(state.velocityX * 1.5, -CONFIG.maxTilt), CONFIG.maxTilt);
    var pitch = Math.min(Math.max(state.velocityY * -1.5, -CONFIG.maxTilt), CONFIG.maxTilt);
    var yaw = roll * 0.4;

    // Apply transforms
    droneBody.style.transform = 
      'translate3d(' + state.currentX + 'px, ' + (state.currentY + floatY) + 'px, 0) ' +
      'rotateX(' + pitch + 'deg) ' +
      'rotateY(' + roll + 'deg) ' +
      'rotateZ(' + yaw + 'deg)';

    var shadowScale = 1 - (floatY / 20); 
    var shadowOpacity = 0.5 - (floatY / 30);
    
    droneShadow.style.transform = 
      'translate3d(' + state.currentX + 'px, ' + (state.currentY + 50) + 'px, 0) ' +
      'scale(' + shadowScale + ')';
    droneShadow.style.opacity = Math.max(0, Math.min(0.8, shadowOpacity));

    requestAnimationFrame(animate);
  }

  // ─── CSS Styles ────────────────────────────────
  function getCSSStyles() {
    return `
      .drone-assistant {
        position: fixed;
        top: 0;
        left: 0;
        width: 0;
        height: 0;
        z-index: 9999;
        pointer-events: none; /* Let clicks pass through to UI */
        transition: opacity 0.5s ease, transform 0.5s ease;
        --prop-speed: 0.2s;
      }

      .drone-hidden {
        opacity: 0;
        transform: scale(0.8);
      }

      .drone-body-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 0;
        height: 0;
        transform-style: preserve-3d;
      }

      /* Tooltip Bubble */
      .drone-tooltip {
        position: absolute;
        top: -65px;
        left: 0;
        transform: translateX(-50%) translateY(10px);
        background: rgba(10, 10, 10, 0.9);
        color: #fff;
        padding: 6px 12px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 500;
        opacity: 0;
        pointer-events: none;
        transition: all 0.3s ease;
        white-space: nowrap;
        border: 1px solid rgba(255,255,255,0.1);
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      }
      .drone-tooltip-visible {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }

      /* Central Body */
      .drone-core {
        position: absolute;
        top: 0;
        left: 0;
        width: 32px;
        height: 32px;
        margin: -16px 0 0 -16px;
        background: linear-gradient(135deg, #2a2a2a, #111);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.1), 0 4px 6px rgba(0, 0, 0, 0.5);
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: center;
        transform-style: preserve-3d;
      }

      .drone-core-top {
        width: 18px;
        height: 18px;
        background: #1a1a1a;
        border-radius: 4px;
        border-top: 1px solid #333;
      }

      .drone-indicator {
        position: absolute;
        width: 4px;
        height: 4px;
        background: #f59e0b;
        border-radius: 50%;
        top: 4px;
        right: 4px;
        box-shadow: 0 0 6px #f59e0b, inset 0 0 2px #fff;
        animation: indicatorPulse 2s infinite;
      }

      @keyframes indicatorPulse {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
      }

      /* Arms */
      .drone-arm {
        position: absolute;
        top: 0;
        left: 0;
        width: 4px;
        height: 44px;
        background: linear-gradient(90deg, #333, #111, #333);
        transform-origin: 50% 0;
        z-index: 5;
        border-radius: 2px;
      }

      .drone-arm-fl { transform: translate(-50%, 0) rotate(45deg); }
      .drone-arm-fr { transform: translate(-50%, 0) rotate(135deg); }
      .drone-arm-bl { transform: translate(-50%, 0) rotate(-135deg); }
      .drone-arm-br { transform: translate(-50%, 0) rotate(-45deg); }

      /* Motors */
      .drone-motor {
        position: absolute;
        bottom: -8px;
        left: 50%;
        margin-left: -7px;
        width: 14px;
        height: 14px;
        background: #0a0a0a;
        border: 2px solid #222;
        border-radius: 50%;
        box-shadow: inset 0 1px 2px rgba(255,255,255,0.2);
        z-index: 6;
      }

      /* Propellers */
      .drone-prop {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 40px;
        height: 40px;
        margin: -20px 0 0 -20px;
        border-radius: 50%;
        background: radial-gradient(circle, transparent 20%, rgba(255,255,255,0.03) 40%, rgba(255,255,255,0.08) 60%, transparent 65%);
        z-index: 7;
        pointer-events: none;
      }

      .drone-prop::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 5px;
        right: 5px;
        height: 2px;
        background: rgba(255, 255, 255, 0.4);
        margin-top: -1px;
        border-radius: 1px;
        filter: blur(1px);
      }
      .drone-prop::after {
        content: '';
        position: absolute;
        top: 5px;
        bottom: 5px;
        left: 50%;
        width: 2px;
        background: rgba(255, 255, 255, 0.4);
        margin-left: -1px;
        border-radius: 1px;
        filter: blur(1px);
      }

      .drone-prop-cw { animation: spin-cw var(--prop-speed) linear infinite; }
      .drone-prop-ccw { animation: spin-ccw var(--prop-speed) linear infinite; }

      @keyframes spin-cw {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes spin-ccw {
        0% { transform: rotate(360deg); }
        100% { transform: rotate(0deg); }
      }

      /* Soft Shadow */
      .drone-shadow {
        position: absolute;
        top: 0;
        left: 0;
        width: 60px;
        height: 30px;
        margin: -15px 0 0 -30px;
        background: radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 70%);
        border-radius: 50%;
        z-index: 1;
        filter: blur(4px);
      }

      /* Toggle Button */
      .drone-toggle {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: rgba(10, 10, 10, 0.8);
        border: 1px solid rgba(255,255,255,0.1);
        color: #eaeaea;
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 9999;
        transition: all 0.3s ease;
      }
      .drone-toggle:hover {
        background: rgba(25, 25, 25, 0.9);
        border-color: rgba(255, 255, 255, 0.2);
        transform: scale(1.05);
      }
      .drone-toggle svg {
        width: 20px;
        height: 20px;
        transition: transform 0.3s ease, opacity 0.3s ease;
      }
      .drone-toggle-off { opacity: 0.5; }
      .drone-toggle-off svg { transform: rotate(-180deg); }
      
      @media (max-width: 768px) {
        .drone-toggle { bottom: 16px; right: 16px; width: 36px; height: 36px; }
        .drone-toggle svg { width: 16px; height: 16px; }
      }
    `;
  }

})();
