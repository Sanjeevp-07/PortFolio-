import './styles.css';

// Config & Frame settings
const TOTAL_FRAMES = 240;
const FRAME_FOLDER = `${import.meta.env.BASE_URL}ezgif-52a536baca025bf6-jpg`;
const LERP_EASE = 0.15; // Controls scroll inertia smoothness

// Elements
const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');
const loaderOverlay = document.getElementById('loader');
const loaderText = document.getElementById('loader-text');
const loaderBar = document.getElementById('loader-bar');

// State
const images = [];
let loadedCount = 0;
let targetFrame = 0;
let currentFrame = 0;
let lastDrawnFrame = -1;
let isFirstFrameRendered = false;

// Helper: Format frame numbers (e.g., 0 -> "001")
function getFramePath(index) {
  const frameNumber = String(index + 1).padStart(3, '0');
  return `${FRAME_FOLDER}/ezgif-frame-${frameNumber}.jpg`;
}

// Canvas sizing setup with HiDPI support
function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.scale(dpr, dpr);
  renderFrame(Math.round(currentFrame), true);
}

// Draw frame centered with "contain" aspect ratio
function renderFrame(index, force = false) {
  const frameIndex = Math.max(0, Math.min(TOTAL_FRAMES - 1, index));
  if (frameIndex === lastDrawnFrame && !force) return;

  const img = images[frameIndex];
  if (!img || !img.complete || img.naturalWidth === 0) return;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const imgWidth = img.naturalWidth;
  const imgHeight = img.naturalHeight;

  // Contain aspect ratio calculation
  const imgRatio = imgWidth / imgHeight;
  const viewportRatio = viewportWidth / viewportHeight;

  let drawWidth, drawHeight, drawX, drawY;

  if (viewportRatio > imgRatio) {
    drawHeight = viewportHeight;
    drawWidth = viewportHeight * imgRatio;
  } else {
    drawWidth = viewportWidth;
    drawHeight = viewportWidth / imgRatio;
  }

  drawX = (viewportWidth - drawWidth) / 2;
  drawY = (viewportHeight - drawHeight) / 2;

  // Clear canvas
  ctx.fillStyle = '#050507';
  ctx.fillRect(0, 0, viewportWidth, viewportHeight);

  // Draw image frame
  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  lastDrawnFrame = frameIndex;
}

// Scroll position target calculation based on page scroll
function updateScrollTarget() {
  const scrollHeight = Math.max(
    document.documentElement.scrollHeight,
    document.body.scrollHeight
  );
  const maxScroll = Math.max(1, scrollHeight - window.innerHeight);
  const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;

  const scrollProgress = Math.max(0, Math.min(1, scrollTop / maxScroll));
  targetFrame = scrollProgress * (TOTAL_FRAMES - 1);
}

// RAF Lerp Animation Loop for ultra-smooth scrolling
function animate() {
  const diff = targetFrame - currentFrame;

  if (Math.abs(diff) > 0.001) {
    currentFrame += diff * LERP_EASE;
  } else {
    currentFrame = targetFrame;
  }

  renderFrame(Math.round(currentFrame));
  requestAnimationFrame(animate);
}

// Preload all 240 frames into memory
function preloadFrames() {
  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const img = new Image();
    img.src = getFramePath(i);

    img.onload = () => {
      loadedCount++;
      const progress = Math.floor((loadedCount / TOTAL_FRAMES) * 100);

      // Update loader UI
      if (loaderText) loaderText.textContent = `Loading ${progress}%`;
      if (loaderBar) loaderBar.style.width = `${progress}%`;

      // Render frame 0 immediately when loaded
      if (i === 0 && !isFirstFrameRendered) {
        isFirstFrameRendered = true;
        renderFrame(0, true);
      }

      // Once all frames are loaded
      if (loadedCount === TOTAL_FRAMES) {
        setTimeout(() => {
          if (loaderOverlay) loaderOverlay.classList.add('hidden');
        }, 200);
      }
    };

    img.onerror = () => {
      console.warn(`Failed to load frame: ${getFramePath(i)}`);
      loadedCount++;
    };

    images.push(img);
  }
}

// Keyboard navigation support
function handleKeyDown(e) {
  const scrollAmount = window.innerHeight * 0.5;
  if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
    window.scrollBy({ top: scrollAmount, behavior: 'smooth' });
  } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
    window.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
  } else if (e.key === 'Home') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (e.key === 'End') {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }
}

// Contact Form Handler with FormSubmit AJAX Endpoint
function setupContactForm() {
  const form = document.getElementById('contact-form');
  const statusMsg = document.getElementById('contact-status');
  const submitBtn = document.getElementById('contact-btn');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!submitBtn || !statusMsg) return;

    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    statusMsg.style.display = 'block';
    statusMsg.style.color = 'rgba(255, 255, 255, 0.7)';
    statusMsg.textContent = 'Sending message...';

    const formData = new FormData(form);
    formData.append('_captcha', 'false');
    formData.append('_subject', `New Portfolio Message from ${formData.get('email')}`);

    try {
      const response = await fetch('https://formsubmit.co/ajax/sanjeev1803t@gmail.com', {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData
      });

      if (response.ok) {
        statusMsg.style.color = '#4EFEAE';
        statusMsg.textContent = '✓ Message sent! Check your inbox.';
        form.reset();
      } else {
        statusMsg.style.color = '#FF3B30';
        statusMsg.textContent = '✕ Failed to send message. Please try again.';
      }
    } catch (error) {
      console.error('Contact form submit error:', error);
      statusMsg.style.color = '#FF3B30';
      statusMsg.textContent = '✕ Connection error. Please try again later.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });
}

// Clean URL Navigation Handler (Removes # hashes from browser URL bar)
function setupCleanNavigation() {
  // 1. Clean initial hash if present on load
  if (window.location.hash) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }

  // 2. Intercept click events on all internal anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const targetHash = anchor.getAttribute('href');

      if (targetHash === '#' || targetHash === '#home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const targetElement = document.querySelector(targetHash);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      }

      // Keep URL clean in address bar without #
      history.replaceState(null, '', window.location.pathname + window.location.search);
    });
  });

  // 3. Keep URL clean on hash change events
  window.addEventListener('hashchange', () => {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  });
}

// Initialize
function init() {
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('scroll', updateScrollTarget, { passive: true });
  document.addEventListener('scroll', updateScrollTarget, { passive: true });
  window.addEventListener('wheel', updateScrollTarget, { passive: true });
  window.addEventListener('keydown', handleKeyDown);

  resizeCanvas();
  updateScrollTarget();
  preloadFrames();
  setupContactForm();
  setupCleanNavigation();
  requestAnimationFrame(animate);
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
