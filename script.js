/* ==========================================================================
   QUANTUM FIELD BACKGROUND (Canvas Physics Simulator)
   ========================================================================== */

const canvas = document.getElementById('quantum-field');
const ctx = canvas.getContext('2d');

let particlesArray = [];
let mouse = {
  x: null,
  y: null,
  radius: 120, // Interaction range
  clickedX: null,
  clickedY: null,
  waveRadius: 0,
  isWaveActive: false
};

// Physics state options
let gravityMode = false; // Normal mode = subtle force field, Zero-gravity mode = floating upwards

// Adjust canvas sizing
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initQuantumField();
}
window.addEventListener('resize', resizeCanvas);

// Track Mouse Movement for Canvas Interaction
window.addEventListener('mousemove', (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});

// Remove interaction when mouse leaves screen
window.addEventListener('mouseout', () => {
  mouse.x = null;
  mouse.y = null;
});

// Click creates a Wave Collapse shockwave
window.addEventListener('click', (event) => {
  if (event.target.tagName === 'BUTTON' || event.target.tagName === 'A' || event.target.closest('a') || event.target.closest('button')) {
    return; // Don't trigger on link/button clicks
  }
  mouse.clickedX = event.clientX;
  mouse.clickedY = event.clientY;
  mouse.waveRadius = 0;
  mouse.isWaveActive = true;
});

// Particle Definition
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 2 + 1.5;
    
    // Base coordinates to return to
    this.baseX = this.x;
    this.baseY = this.y;
    
    // Speeds for brownian-like thermal movements
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    
    this.density = (Math.random() * 30) + 10;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(102, 252, 241, 0.7)'; // Accent cyan particle
    ctx.fill();
  }

  update() {
    if (gravityMode) {
      // Float upwards zero-gravity mode
      this.y -= (this.size * 0.2 + 0.1);
      // Small horizontal drift
      this.x += Math.sin(this.y / 30 + this.density) * 0.1;
      
      // Screen wrap
      if (this.y < -10) {
        this.y = canvas.height + 10;
        this.x = Math.random() * canvas.width;
      }
    } else {
      // Brownian drift + return to base position (subtle restoration force)
      this.x += this.vx;
      this.y += this.vy;
      
      // Drag back to base coordinates
      let dxBase = this.baseX - this.x;
      let dyBase = this.baseY - this.y;
      this.x += dxBase * 0.02;
      this.y += dyBase * 0.02;
    }

    // Mouse Repulsion
    if (mouse.x !== null && mouse.y !== null) {
      let dx = this.x - mouse.x;
      let dy = this.y - mouse.y;
      let distance = Math.hypot(dx, dy);
      if (distance < mouse.radius) {
        let force = (mouse.radius - distance) / mouse.radius;
        let directionX = dx / distance;
        let directionY = dy / distance;
        
        // Push away based on force and density
        this.x += directionX * force * 5;
        this.y += directionY * force * 5;
      }
    }

    // Shockwave Propagation
    if (mouse.isWaveActive) {
      let dxWave = this.x - mouse.clickedX;
      let dyWave = this.y - mouse.clickedY;
      let distanceWave = Math.hypot(dxWave, dyWave);
      
      // If particle is close to the shockwave front
      if (Math.abs(distanceWave - mouse.waveRadius) < 15) {
        let force = 10;
        if (distanceWave > 0) {
          this.x += (dxWave / distanceWave) * force;
          this.y += (dyWave / distanceWave) * force;
        }
      }
    }
  }
}

// Initialize Quantum Particle Field
function initQuantumField() {
  particlesArray = [];
  // Number of particles proportional to screen area
  let numberOfParticles = Math.floor((canvas.width * canvas.height) / 9000);
  numberOfParticles = Math.min(Math.max(numberOfParticles, 60), 180);
  
  for (let i = 0; i < numberOfParticles; i++) {
    let x = Math.random() * canvas.width;
    let y = Math.random() * canvas.height;
    particlesArray.push(new Particle(x, y));
  }
}

// Render connection lines
function drawConnections() {
  for (let a = 0; a < particlesArray.length; a++) {
    for (let b = a + 1; b < particlesArray.length; b++) {
      let dx = particlesArray[a].x - particlesArray[b].x;
      let dy = particlesArray[a].y - particlesArray[b].y;
      let distance = Math.hypot(dx, dy);
      
      if (distance < 90) {
        // Opacity gets lower as distance gets higher
        let opacity = 1 - (distance / 90);
        ctx.strokeStyle = `rgba(102, 252, 241, ${opacity * 0.13})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
        ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
        ctx.stroke();
      }
    }
  }
}

// Main Animation Loop
function animateQuantumField() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Propagate shockwave
  if (mouse.isWaveActive) {
    mouse.waveRadius += 6;
    if (mouse.waveRadius > 250) {
      mouse.isWaveActive = false;
    }
  }

  // Update and draw particles
  for (let i = 0; i < particlesArray.length; i++) {
    particlesArray[i].update();
    particlesArray[i].draw();
  }
  
  drawConnections();
  requestAnimationFrame(animateQuantumField);
}

// Start simulation
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
initQuantumField();
animateQuantumField();

/* ==========================================================================
   CUSTOM CURSOR (with Inertia)
   ========================================================================== */

const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

let cursorX = 0, cursorY = 0; // Target coordinates
let currentX = 0, currentY = 0; // Current inertia coordinates

window.addEventListener('mousemove', (e) => {
  cursorX = e.clientX;
  cursorY = e.clientY;
  document.body.classList.add('cursor-active');
});

// Smoothing loop for cursor outline
function updateCursor() {
  // Lerp: current = current + (target - current) * speed
  currentX += (cursorX - currentX) * 0.15;
  currentY += (cursorY - currentY) * 0.15;
  
  cursorDot.style.left = `${cursorX}px`;
  cursorDot.style.top = `${cursorY}px`;
  
  cursorOutline.style.left = `${currentX}px`;
  cursorOutline.style.top = `${currentY}px`;
  
  requestAnimationFrame(updateCursor);
}
requestAnimationFrame(updateCursor);

// Scale cursor on hover links, buttons, and inputs
const interactiveElements = document.querySelectorAll('a, button, input, textarea, .easter-egg-trigger');
interactiveElements.forEach(el => {
  el.addEventListener('mouseenter', () => {
    document.body.classList.add('cursor-hovering');
  });
  el.addEventListener('mouseleave', () => {
    document.body.classList.add('cursor-hovering');
    document.body.classList.remove('cursor-hovering');
  });
});

/* ==========================================================================
   SKILLS CARD LIGHTING GRADIENT (Radial tracking)
   ========================================================================== */

const cards = document.querySelectorAll('.skill-row');
cards.forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    card.style.setProperty('--x', `${x}px`);
    card.style.setProperty('--y', `${y}px`);
  });
});

/* ==========================================================================
   SCROLL SPY & REVEAL ON SCROLL
   ========================================================================== */

// 1. Intersection Observer for Scroll Reveals
const revealElements = document.querySelectorAll('.timeline-item, .project-block');

const revealCallback = (entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      
      // Once timeline is revealed, adjust progress bar heights
      if (entry.target.classList.contains('timeline-item')) {
        updateTimelineProgress();
      }
    }
  });
};

const revealObserver = new IntersectionObserver(revealCallback, {
  root: null,
  threshold: 0.15,
  rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

// 2. Adjust timeline line progress depending on active nodes
function updateTimelineProgress() {
  const activeItems = document.querySelectorAll('.timeline-item.active');
  const totalItems = document.querySelectorAll('.timeline-item');
  const progressPercent = ((activeItems.length - 1) / (totalItems.length - 1)) * 100;
  
  const progressBar = document.querySelector('.timeline-progress');
  if (progressBar) {
    progressBar.style.height = `${Math.max(0, progressPercent)}%`;
  }
}

// 3. Navigation Highlight Spy
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

const navSpyCallback = (entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  });
};

const navSpyObserver = new IntersectionObserver(navSpyCallback, {
  root: null,
  threshold: 0.35
});

sections.forEach(sec => navSpyObserver.observe(sec));

/* ==========================================================================
   EASTER EGG: QUANTUM GRAVITY COLLAPSE
   ========================================================================== */

const hBarTrigger = document.getElementById('h-bar-trigger');
const usernameInput = document.getElementById('usr-name');

function toggleZeroGravity() {
  gravityMode = !gravityMode;
  document.body.classList.toggle('zero-gravity');
  
  if (gravityMode) {
    hBarTrigger.innerHTML = 'gravity = collapsed // reset';
    initQuantumField();
  } else {
    hBarTrigger.innerHTML = 'h&#773; = 1.054 &times; 10<sup>-34</sup> J s';
    initQuantumField();
  }
}

// Trigger via footer link
hBarTrigger.addEventListener('click', (e) => {
  e.preventDefault();
  toggleZeroGravity();
});

// Trigger easter egg via typing 'gravity' in terminal input
usernameInput.addEventListener('input', (e) => {
  if (e.target.value.toLowerCase().trim() === 'gravity') {
    toggleZeroGravity();
    e.target.value = ''; // Reset input
    
    // Simulate terminal response
    const statusEl = document.getElementById('transmit-status');
    statusEl.innerHTML = '[!] Gravity field collapsed. System floating.';
    statusEl.className = 'transmit-status success';
    setTimeout(() => {
      statusEl.innerHTML = '';
    }, 4000);
  }
});

/* ==========================================================================
   FORM HANDLING & TERMINAL SIMULATION
   ========================================================================== */

const contactForm = document.getElementById('contact-form');
const statusMsg = document.getElementById('transmit-status');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  statusMsg.innerHTML = 'encrypting package...';
  statusMsg.className = 'transmit-status sending';
  
  const name = document.getElementById('usr-name').value;
  const email = document.getElementById('usr-email').value;
  const msg = document.getElementById('usr-msg').value;

  // Simulate server / transmission network lag
  setTimeout(() => {
    statusMsg.innerHTML = 'STATUS: 200 OK // Message Entangled!';
    statusMsg.className = 'transmit-status success';
    
    // Clear forms
    contactForm.reset();
    
    // Terminate status message after 5 seconds
    setTimeout(() => {
      statusMsg.innerHTML = '';
    }, 5000);
  }, 1800);
});
