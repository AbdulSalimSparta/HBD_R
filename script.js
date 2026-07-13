/* -------------------------------------------------------------
 * PREMIUM LUXURY BIRTHDAY WEBSITE INTERACTIVE ENGINE
 * Handcrafted in Vanilla ES6 JavaScript for 60 FPS Performance
 * Contains: Canvas Sakura Particle Engine, Web Audio Synth,
 * Spring Physics Ribbon Solver, and 3D Envelope Controllers
 * ------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  
  // ===========================================================
  // 1. STATE & ELEMENTS GLOBAL REPOSITORY
  // ===========================================================
  const state = {
    audioEnabled: false,
    audioInitialized: false,
    curtainsOpened: false,
    ribbonPulled: false,
    letterOpened: false,
    letterExpanded: false,
    name: 'Reshma'
  };

  const DOM = {
    loadingScreen: document.getElementById('loading-screen'),
    catScreen: document.getElementById('cat-screen'),
    catWrapper: document.querySelector('.cat-wrapper'),
    catBubble: document.getElementById('cat-bubble'),
    vectorCat: document.getElementById('vector-cat'),
    ribbonContainer: document.getElementById('ribbon-container'),
    ribbonPath: document.getElementById('ribbon-path'),
    ribbonHandle: document.getElementById('ribbon-handle'),
    curtainOverlay: document.getElementById('curtain-overlay'),
    mainContent: document.getElementById('main-content'),
    audioToggle: document.getElementById('audio-toggle'),
    audioIconPlaying: document.querySelector('.audio-icon.playing'),
    audioIconMuted: document.querySelector('.audio-icon.muted'),
    birthdayName: document.getElementById('birthday-name'),
    waxSeal: document.getElementById('wax-seal'),
    envelopeContainer: document.getElementById('envelope-container'),
    letterSheet: document.getElementById('letter-sheet'),
    petalsCanvas: document.getElementById('petals-canvas'),
    envelopeStatusMessage: document.querySelector('.envelope-status-message')
  };

  // Ensure elements exist
  if (!DOM.loadingScreen) return;

  // ===========================================================
  // 2. LUXURY AUDIO ENGINE (WEB AUDIO API PROCEDURAL SYNTH)
  // ===========================================================
  let audioCtx = null;
  let synthTimer = null;
  let backgroundTrack = null; // HTML5 Audio if assets/music.mp3 exists

  // Major Pentatonic frequencies for chimes (C Major Pentatonic)
  const PENTATONIC_SCALE = [
    261.63, // C4
    293.66, // D4
    329.63, // E4
    392.00, // G4
    440.00, // A4
    523.25, // C5
    587.33, // D5
    659.25, // E5
    783.99, // G5
    880.00  // A5
  ];

  function initAudioContext() {
    if (state.audioInitialized) return;
    state.audioInitialized = true;
    
    // Create background audio element
    backgroundTrack = new Audio();
    backgroundTrack.src = 'assets/music.mp3';
    backgroundTrack.loop = true;
    backgroundTrack.volume = 0.45;
    
    // Play directly (bypasses AudioContext CORS restrictions on local files)
    backgroundTrack.play().then(() => {
      console.log('Premium background track playing successfully.');
    }).catch(err => {
      console.log('Failed to play MP3 directly (might be missing or blocked). Initializing procedural synth fallback.', err);
      // Fallback: Initialize AudioContext and run chimes
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
        if (state.audioEnabled) {
          startProceduralSynth();
        }
      }
    });
  }

  // Play a single procedural chime with high quality delay & feedback
  function playProceduralChime(frequency) {
    if (!audioCtx || audioCtx.state === 'suspended') return;

    // Synth Structure: Oscillator -> Gain (Envelope) -> Delay (Echo) -> Filter -> Destination
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    
    // Delay circuit for luxury spacey reverberation
    const delay = audioCtx.createDelay(1.0);
    const feedback = audioCtx.createGain();
    
    // Set delay time and feedback amount
    delay.delayTime.value = 0.4; 
    feedback.gain.value = 0.45;

    // Configure Oscillator (Sine/Triangle mix for pure bell tone)
    osc.type = Math.random() > 0.5 ? 'sine' : 'triangle';
    osc.frequency.value = frequency;

    // Filter settings (warm up the sound)
    filter.type = 'lowpass';
    filter.frequency.value = 1800;

    // Routing
    osc.connect(gainNode);
    gainNode.connect(filter);
    
    // Wire up delay feedback loop
    filter.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    
    // Connect both dry and wet signal to speakers
    filter.connect(audioCtx.destination);
    delay.connect(audioCtx.destination);

    // Chime ADSR Envelope
    const now = audioCtx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    // Instant attack for crystal chime strike
    gainNode.gain.linearRampToValueAtTime(0.22, now + 0.015);
    // Decay into echo
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 3.0);

    osc.start(now);
    osc.stop(now + 3.2);
  }

  // Scheduler to trigger chimes in a dreamy arpeggio pattern
  function startProceduralSynth() {
    clearTimeout(synthTimer);
    let tick = 0;
    
    function scheduleNextChime() {
      if (!state.audioEnabled) return;
      
      // Chime notes arpeggiating randomly
      const noteChance = Math.random();
      if (noteChance > 0.3) {
        const randomNote = PENTATONIC_SCALE[Math.floor(Math.random() * PENTATONIC_SCALE.length)];
        playProceduralChime(randomNote);
      }
      
      // Random intervals between 800ms and 2400ms to keep it natural and ambient
      const nextTime = 800 + Math.random() * 1600;
      synthTimer = setTimeout(scheduleNextChime, nextTime);
    }
    
    scheduleNextChime();
  }

  function toggleAudio() {
    if (!state.audioInitialized) {
      initAudioContext();
    }
    
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (state.audioEnabled) {
      // Mute
      state.audioEnabled = false;
      if (backgroundTrack) backgroundTrack.pause();
      clearTimeout(synthTimer);
      DOM.audioIconPlaying.classList.add('hidden');
      DOM.audioIconMuted.classList.remove('hidden');
    } else {
      // Unmute
      state.audioEnabled = true;
      if (backgroundTrack) {
        backgroundTrack.play().then(() => {
          // Success playing MP3 directly, clear any scheduled fallback synth chimes
          clearTimeout(synthTimer);
        }).catch(err => {
          // If play fails, fallback to synth chimes
          console.log('Unmute MP3 failed, running fallback procedural synth.', err);
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (!audioCtx && AudioContextClass) {
            audioCtx = new AudioContextClass();
          }
          startProceduralSynth();
        });
      } else {
        startProceduralSynth();
      }
      DOM.audioIconPlaying.classList.remove('hidden');
      DOM.audioIconMuted.classList.add('hidden');
    }
  }

  // Audio Toggle Click
  DOM.audioToggle.addEventListener('click', toggleAudio);

  // ===========================================================
  // 3. CANVAS PETALS (SAKURA) & PARTICLES SIMULATION
  // ===========================================================
  const canvasCtx = DOM.petalsCanvas.getContext('2d');
  let animationFrameId = null;
  const particles = [];
  const mouse = { x: -1000, y: -1000, active: false };
  const particleCount = window.innerWidth < 500 ? 35 : 65;

  function resizeCanvas() {
    DOM.petalsCanvas.width = window.innerWidth;
    DOM.petalsCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Petal {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * DOM.petalsCanvas.width;
      this.y = initial ? Math.random() * DOM.petalsCanvas.height : -20;
      this.size = 6 + Math.random() * 10;
      this.speedX = -1 + Math.random() * 2;
      this.speedY = 1 + Math.random() * 1.5;
      this.opacity = 0.4 + Math.random() * 0.5;
      
      // Cherry Blossom Rotation Variables (gives 3D tumbling appearance)
      this.angle = Math.random() * 360;
      this.spinSpeed = -0.02 + Math.random() * 0.04;
      this.flip = Math.random() * Math.PI;
      this.flipSpeed = 0.01 + Math.random() * 0.02;
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX + Math.sin(this.y / 30) * 0.3; // Gentle wind swing
      this.angle += this.spinSpeed;
      this.flip += this.flipSpeed;

      // Mouse repulsion: push petals away from cursor
      if (mouse.active) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const distance = Math.hypot(dx, dy);
        
        if (distance < 140) {
          const force = (140 - distance) / 140;
          const angle = Math.atan2(dy, dx);
          this.x += Math.cos(angle) * force * 5;
          this.y += Math.sin(angle) * force * 5;
        }
      }

      // Recycle if screen exited
      if (this.y > DOM.petalsCanvas.height + 20 || this.x < -20 || this.x > DOM.petalsCanvas.width + 20) {
        this.reset(false);
      }
    }

    draw() {
      canvasCtx.save();
      canvasCtx.translate(this.x, this.y);
      canvasCtx.rotate(this.angle);
      canvasCtx.scale(Math.sin(this.flip), 1);
      
      // Draw Cherry Blossom Petal Path
      canvasCtx.beginPath();
      canvasCtx.moveTo(0, 0);
      // Premium Rose/Pink Sakura petal gradient
      const grad = canvasCtx.createLinearGradient(0, -this.size, 0, this.size);
      grad.addColorStop(0, 'rgba(255, 183, 197, ' + this.opacity + ')');
      grad.addColorStop(0.5, 'rgba(255, 143, 171, ' + (this.opacity * 0.8) + ')');
      grad.addColorStop(1, 'rgba(214, 51, 132, ' + (this.opacity * 0.4) + ')');
      canvasCtx.fillStyle = grad;

      // Draw curved tear-drop leaf shape
      canvasCtx.bezierCurveTo(-this.size/2, -this.size/2, -this.size/2, this.size/2, 0, this.size);
      canvasCtx.bezierCurveTo(this.size/2, this.size/2, this.size/2, -this.size/2, 0, 0);
      canvasCtx.fill();
      canvasCtx.restore();
    }
  }

  function startParticleEngine() {
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Petal());
    }
    
    function animateParticles() {
      canvasCtx.clearRect(0, 0, DOM.petalsCanvas.width, DOM.petalsCanvas.height);
      
      particles.forEach(petal => {
        petal.update();
        petal.draw();
      });
      
      animationFrameId = requestAnimationFrame(animateParticles);
    }
    
    animateParticles();
  }

  // Capture Mouse Interactions
  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  // Touch Support for mobile
  window.addEventListener('touchmove', e => {
    if (e.touches.length > 0) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
      mouse.active = true;
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    mouse.active = false;
  });

  // ===========================================================
  // 4. HOOKE'S LAW PHYSICS RIBBON SOLVER
  // ===========================================================
  const ribbonPhysics = {
    yBase: 250,        // Natural resting length of ribbon SVG path
    yCurrent: 250,     // Current physical extension
    yTarget: 250,      // Position user is aiming for
    velocity: 0,
    k: 0.12,           // Spring stiffness
    c: 0.08,           // Damping friction
    isDragging: false,
    dragStartY: 0,
    dragStartVal: 0,
    triggerDistance: 380 // Length past which curtains trigger
  };

  function updateRibbonPath(yVal) {
    // Generate curved Bezier lines for high-quality rope feeling
    DOM.ribbonPath.setAttribute('d', `M 50 0 L 50 ${yVal - 30} Q 50 ${yVal} 50 ${yVal}`);
    DOM.ribbonHandle.style.bottom = `${600 - yVal}px`;
  }

  function startRibbonPhysicsLoop() {
    function solvePhysics() {
      if (state.ribbonPulled) return; // Physics terminates once pulled

      if (!ribbonPhysics.isDragging) {
        // Calculate Spring Force: F = -k * x
        const displacement = ribbonPhysics.yCurrent - ribbonPhysics.yBase;
        const springForce = -ribbonPhysics.k * displacement;
        
        // Acceleration = Force (mass = 1)
        ribbonPhysics.velocity += springForce;
        
        // Apply friction/damping: v = v * (1 - c)
        ribbonPhysics.velocity *= (1 - ribbonPhysics.c);
        
        // Update Position
        ribbonPhysics.yCurrent += ribbonPhysics.velocity;
        
        updateRibbonPath(ribbonPhysics.yCurrent);
      }
      
      requestAnimationFrame(solvePhysics);
    }
    solvePhysics();
  }

  function onPointerDown(e) {
    if (state.ribbonPulled) return;
    
    ribbonPhysics.isDragging = true;
    ribbonPhysics.dragStartY = e.clientY;
    ribbonPhysics.dragStartVal = ribbonPhysics.yCurrent;
    
    DOM.ribbonHandle.setPointerCapture(e.pointerId);
    
    // Initialize Audio Context on interaction
    if (!state.audioInitialized) {
      initAudioContext();
    }
  }

  function onPointerMove(e) {
    if (!ribbonPhysics.isDragging || state.ribbonPulled) return;

    const deltaY = e.clientY - ribbonPhysics.dragStartY;
    
    // Stretch with resistive logarithmic scaling to make it feel expensive/heavy
    let rawTarget = ribbonPhysics.dragStartVal + deltaY;
    if (rawTarget < 0) rawTarget = 0;
    
    if (rawTarget > ribbonPhysics.yBase) {
      // Heavy pull scaling
      const overshoot = rawTarget - ribbonPhysics.yBase;
      ribbonPhysics.yCurrent = ribbonPhysics.yBase + Math.pow(overshoot, 0.88);
    } else {
      ribbonPhysics.yCurrent = rawTarget;
    }

    updateRibbonPath(ribbonPhysics.yCurrent);

    // Check Trigger
    if (ribbonPhysics.yCurrent >= ribbonPhysics.triggerDistance) {
      triggerCurtainReveal();
    }
  }

  function onPointerUp() {
    ribbonPhysics.isDragging = false;
  }

  DOM.ribbonHandle.addEventListener('pointerdown', onPointerDown);
  DOM.ribbonHandle.addEventListener('pointermove', onPointerMove);
  DOM.ribbonHandle.addEventListener('pointerup', onPointerUp);
  DOM.ribbonHandle.addEventListener('pointercancel', onPointerUp);

  // ===========================================================
  // 5. CINEMATIC CURTAIN REVEAL CONTROLLER
  // ===========================================================
  function triggerCurtainReveal() {
    state.ribbonPulled = true;
    ribbonPhysics.isDragging = false;

    // Pull down ribbon completely in a fast snap animation
    DOM.ribbonHandle.style.transition = 'bottom 0.4s cubic-bezier(0.19, 1, 0.22, 1)';
    DOM.ribbonPath.style.transition = 'stroke-dashoffset 0.4s';
    
    // Snapping the ribbon handle down off screen
    DOM.ribbonHandle.style.bottom = '-100px';
    DOM.ribbonPath.setAttribute('d', 'M 50 0 L 50 600');

    // Speech bubble hides
    DOM.catBubble.classList.remove('visible');

    // Trigger Velvet Curtains Open slowly
    setTimeout(() => {
      DOM.curtainOverlay.classList.add('curtains-open');
      
      // Auto enable sound upon curtain opening if not done already
      if (!state.audioEnabled) {
        toggleAudio();
      }

      // Hide cat welcome screen completely, launch main app sections
      setTimeout(() => {
        DOM.catScreen.classList.remove('active');
        DOM.mainContent.classList.remove('hidden');
        
        // Fade in main elements
        setTimeout(() => {
          DOM.mainContent.classList.add('visible');
          startParticleEngine(); // Petals start falling now
          initScrollObserver();
        }, 100);

      }, 1500);

    }, 350);
  }

  // ===========================================================
  // 6. STAGE 5: 3D ENVELOPE & LETTER ANIMATOR
  // ===========================================================
  DOM.waxSeal.addEventListener('click', () => {
    if (state.letterOpened) return;
    state.letterOpened = true;

    // 1. Break the seal & open the envelope flap
    DOM.envelopeContainer.classList.add('open');
    DOM.envelopeStatusMessage.textContent = 'Envelope opened. Scroll down to pull and read the letter.';

    // 2. Animate and unfold typewriter text inside letter sheet
    setTimeout(() => {
      runTypewriterEffect();
    }, 1800);
  });

  // Typewriter effect controller
  function runTypewriterEffect() {
    const typewriterNode = document.querySelector('.typewriter-target');
    if (!typewriterNode) return;
    
    const textToType = typewriterNode.textContent;
    typewriterNode.textContent = '';
    typewriterNode.style.visibility = 'visible';
    
    let index = 0;
    function type() {
      if (index < textToType.length) {
        typewriterNode.textContent += textToType.charAt(index);
        index++;
        setTimeout(type, 18 + Math.random() * 20); // Natural fluid variance
      }
    }
    type();
  }

  // ===========================================================
  // 7. MOTION PARALLAX SYSTEM (APPLE STYLE)
  // ===========================================================
  window.addEventListener('mousemove', e => {
    if (!state.ribbonPulled) return;

    const xVal = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
    const yVal = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);

    // Apply gentle shifts to elements carrying the parallax class
    document.querySelectorAll('.parallax-element').forEach(el => {
      const speed = parseFloat(el.getAttribute('data-speed')) || 0.1;
      const xTranslate = xVal * speed * 100;
      const yTranslate = yVal * speed * 100;
      el.style.transform = `translate3d(${xTranslate}px, ${yTranslate}px, 0)`;
    });
  });

  // ===========================================================
  // 8. SCROLL OBSERVER (INTERSECTION OBSERVER)
  // ===========================================================
  function initScrollObserver() {
    const observerOptions = {
      root: null,
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          
          // Trigger special action for letter expansion when envelope section enters fully
          if (entry.target.id === 'envelope-section' && state.letterOpened && !state.letterExpanded) {
            state.letterExpanded = true;
            DOM.envelopeContainer.classList.add('letter-expanded');
          }
        }
      });
    }, observerOptions);

    document.querySelectorAll('.reveal-on-scroll').forEach(el => {
      observer.observe(el);
    });

    // Special observer to monitor the envelope section uniquely
    const envelopeSection = document.getElementById('envelope-section');
    if (envelopeSection) {
      observer.observe(envelopeSection);
    }
  }

  // ===========================================================
  // 9. RECIPIENT NAME (STATIC BY CODE ONLY)
  // ===========================================================
  // Runtime in-place name editing is disabled.

  // ===========================================================
  // 10. TIMED INTRO CONTROLLER (STAGE 1 -> STAGE 2)
  // ===========================================================
  // Cat blinking cycle
  setInterval(() => {
    const eyes = document.querySelectorAll('.cat-eye');
    eyes.forEach(eye => eye.classList.add('blink'));
    setTimeout(() => {
      eyes.forEach(eye => eye.classList.remove('blink'));
    }, 150);
  }, 4000);

  setTimeout(() => {
    // Transition loading screen to cat screen
    DOM.loadingScreen.classList.remove('active');
    
    setTimeout(() => {
      DOM.catScreen.classList.add('active');
      
      // Cat walks in from left side into center
      setTimeout(() => {
        DOM.catWrapper.classList.add('centered');
        
        // Show speech bubble once cat is centered
        setTimeout(() => {
          DOM.catBubble.classList.add('visible');
          // Start Ribbon Physics Solver Loop
          startRibbonPhysicsLoop();
        }, 1500);

      }, 500);

    }, 300);

  }, 2200);

});
