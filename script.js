/* ============================================
   GALERÍA FAMILIAR - JavaScript
   Animaciones, Lightbox, Música & Interactividad
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // ---- Mobile Navigation ----
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  // Close mobile menu when clicking a link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });

  // ---- Navbar Scroll Effect ----
  const navbar = document.getElementById('navbar');
  const scrollTop = document.getElementById('scrollTop');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Navbar glass effect
    if (scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Scroll to top button
    if (scrollY > 500) {
      scrollTop.classList.add('visible');
    } else {
      scrollTop.classList.remove('visible');
    }
  });

  scrollTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ---- Scroll Reveal Animations ----
  const animatedElements = document.querySelectorAll('[data-animate]');

  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Stagger animation for cards in the same grid
        const parent = entry.target.parentElement;
        const siblings = parent.querySelectorAll('[data-animate]');
        let delay = 0;

        if (siblings.length > 1) {
          const siblingIndex = Array.from(siblings).indexOf(entry.target);
          delay = siblingIndex * 150;
        }

        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);

        scrollObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animatedElements.forEach(el => {
    scrollObserver.observe(el);
  });

  // ---- Lightbox System ----
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxDesc = document.getElementById('lightboxDesc');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const lightboxCounter = document.getElementById('lightboxCounter');

  const lightboxCards = document.querySelectorAll('[data-lightbox]');
  let currentLightboxIndex = 0;

  // Collect ALL photos (featured + gallery)
  const allPhotos = [];

  // Collect featured photos
  document.querySelectorAll('.featured-photo').forEach(fp => {
    const img = fp.querySelector('img');
    const caption = fp.querySelector('.featured-caption');
    allPhotos.push({
      src: img.src,
      title: caption ? caption.querySelector('h3').textContent : '',
      desc: caption ? caption.querySelector('p').textContent : '',
      element: fp
    });
  });

  // Collect gallery photos
  lightboxCards.forEach(card => {
    const img = card.querySelector('img');
    allPhotos.push({
      src: img.src,
      title: card.dataset.title || '',
      desc: card.dataset.desc || '',
      element: card
    });
  });

  function openLightbox(index) {
    currentLightboxIndex = index;
    updateLightbox();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function updateLightbox() {
    const photo = allPhotos[currentLightboxIndex];
    lightboxImg.src = photo.src;
    lightboxImg.alt = photo.title;
    lightboxTitle.textContent = photo.title;
    lightboxDesc.textContent = photo.desc;

    // Update counter
    if (lightboxCounter) {
      lightboxCounter.textContent = `${currentLightboxIndex + 1} / ${allPhotos.length}`;
    }

    // Animate image entrance
    lightboxImg.style.opacity = '0';
    lightboxImg.style.transform = 'scale(0.9)';
    requestAnimationFrame(() => {
      lightboxImg.style.transition = 'all 0.3s ease';
      lightboxImg.style.opacity = '1';
      lightboxImg.style.transform = 'scale(1)';
    });
  }

  function nextPhoto() {
    currentLightboxIndex = (currentLightboxIndex + 1) % allPhotos.length;
    updateLightbox();
  }

  function prevPhoto() {
    currentLightboxIndex = (currentLightboxIndex - 1 + allPhotos.length) % allPhotos.length;
    updateLightbox();
  }

  // Click handlers for opening lightbox
  allPhotos.forEach((photo, index) => {
    photo.element.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openLightbox(index);
    });
    // Add cursor pointer style
    photo.element.style.cursor = 'pointer';
  });

  lightboxClose.addEventListener('click', (e) => {
    e.stopPropagation();
    closeLightbox();
  });
  lightboxNext.addEventListener('click', (e) => {
    e.stopPropagation();
    nextPhoto();
  });
  lightboxPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    prevPhoto();
  });

  // Close on background click
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;

    switch (e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowRight':
        nextPhoto();
        break;
      case 'ArrowLeft':
        prevPhoto();
        break;
    }
  });

  // Touch/swipe support for lightbox
  let touchStartX = 0;
  let touchEndX = 0;

  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        nextPhoto(); // Swipe left -> next
      } else {
        prevPhoto(); // Swipe right -> prev
      }
    }
  }

  // ---- Pinch to Zoom in Lightbox ----
  let initialPinchDistance = 0;
  let currentScale = 1;

  lightboxImg.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      initialPinchDistance = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
    }
  }, { passive: true });

  lightboxImg.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
      const currentDistance = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      const scale = currentDistance / initialPinchDistance;
      currentScale = Math.min(Math.max(scale, 0.5), 3);
      lightboxImg.style.transform = `scale(${currentScale})`;
    }
  }, { passive: true });

  lightboxImg.addEventListener('touchend', () => {
    if (currentScale !== 1) {
      lightboxImg.style.transition = 'transform 0.3s ease';
      lightboxImg.style.transform = 'scale(1)';
      currentScale = 1;
      setTimeout(() => {
        lightboxImg.style.transition = '';
      }, 300);
    }
  }, { passive: true });

  // Double tap to zoom
  let lastTap = 0;
  lightboxImg.addEventListener('touchend', (e) => {
    const currentTime = Date.now();
    const tapLength = currentTime - lastTap;
    if (tapLength < 300 && tapLength > 0) {
      e.preventDefault();
      if (currentScale === 1) {
        currentScale = 2;
        lightboxImg.style.transition = 'transform 0.3s ease';
        lightboxImg.style.transform = 'scale(2)';
      } else {
        currentScale = 1;
        lightboxImg.style.transition = 'transform 0.3s ease';
        lightboxImg.style.transform = 'scale(1)';
      }
      setTimeout(() => {
        lightboxImg.style.transition = '';
      }, 300);
    }
    lastTap = currentTime;
  });

  // ---- Background Music Player ----
  const musicPlayer = document.getElementById('musicPlayer');
  const musicToggle = document.getElementById('musicToggle');
  const musicIcon = document.getElementById('musicIcon');
  const musicLabel = document.getElementById('musicLabel');
  const bgMusic = document.getElementById('bgMusic');
  let musicPlaying = false;

  if (bgMusic && musicToggle) {
    // Set initial volume (35% is pleasant and matches original settings)
    bgMusic.volume = 0.35;

    // Show music button as ready
    musicToggle.classList.add('ready');

    musicToggle.addEventListener('click', () => {
      if (musicPlaying) {
        bgMusic.pause();
        musicPlaying = false;
        musicToggle.classList.remove('playing');
        if (musicPlayer) musicPlayer.classList.remove('playing');
        musicIcon.textContent = '🎵';
        musicLabel.textContent = 'Música';
      } else {
        bgMusic.play()
          .then(() => {
            musicPlaying = true;
            musicToggle.classList.add('playing');
            if (musicPlayer) musicPlayer.classList.add('playing');
            musicIcon.textContent = '🎶';
            musicLabel.textContent = 'Pausar';
          })
          .catch(err => {
            console.error('Error al reproducir música:', err);
          });
      }
    });
  }

  // ---- Smooth Parallax Effect on Hero ----
  const hero = document.querySelector('.hero');
  const heroContent = document.querySelector('.hero-content');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const heroHeight = hero.offsetHeight;

    if (scrollY < heroHeight) {
      const parallaxValue = scrollY * 0.3;
      const opacityValue = 1 - (scrollY / heroHeight) * 0.6;
      heroContent.style.transform = `translateY(${parallaxValue}px)`;
      heroContent.style.opacity = opacityValue;
    }
  });

  // ---- Dynamic Heart Particles on Click ----
  document.addEventListener('click', (e) => {
    // Only create hearts outside of interactive elements
    if (e.target.closest('a, button, .photo-card, .featured-photo, .lightbox, .nav-links, .music-player')) return;

    createClickHeart(e.clientX, e.clientY);
  });

  function createClickHeart(x, y) {
    const hearts = ['💕', '💗', '🩷', '🤍', '✨'];
    const count = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < count; i++) {
      const heart = document.createElement('span');
      heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
      heart.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        font-size: ${12 + Math.random() * 16}px;
        pointer-events: none;
        z-index: 9999;
        animation: clickHeart ${0.8 + Math.random() * 0.6}s ease-out forwards;
        --dx: ${(Math.random() - 0.5) * 100}px;
        --dy: ${-50 - Math.random() * 80}px;
      `;
      document.body.appendChild(heart);

      setTimeout(() => heart.remove(), 1500);
    }
  }

  // Add click heart animation CSS
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes clickHeart {
      0% {
        opacity: 1;
        transform: translate(0, 0) scale(0.5) rotate(0deg);
      }
      100% {
        opacity: 0;
        transform: translate(var(--dx), var(--dy)) scale(1.2) rotate(${Math.random() > 0.5 ? '' : '-'}45deg);
      }
    }
  `;
  document.head.appendChild(styleSheet);

  // ---- Active Navigation Link Highlight ----
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + 200;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.querySelectorAll('a').forEach(link => {
          link.classList.remove('active-link');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active-link');
          }
        });
      }
    });
  });

  // Add active link styles
  const activeLinkStyle = document.createElement('style');
  activeLinkStyle.textContent = `
    .nav-links a.active-link {
      color: var(--color-rose-deep) !important;
    }
    .nav-links a.active-link::after {
      width: 100% !important;
    }
  `;
  document.head.appendChild(activeLinkStyle);

  // ---- Greeting Based on Time ----
  const heroBadge = document.querySelector('.hero-badge');
  const hour = new Date().getHours();
  let greeting = '';

  if (hour >= 5 && hour < 12) {
    greeting = '🌅 ¡Menos días! Con mucho amor para ti';
  } else if (hour >= 12 && hour < 18) {
    greeting = '☀️ ¡Buenas tardes! Con mucho amor para ti';
  } else {
    greeting = '🌙 ¡Buenas noches! Con mucho amor para ti';
  }

  if (heroBadge) {
    heroBadge.textContent = greeting;
  }

  // ---- Cursor Trail Effect (subtle) ----
  let lastTrailTime = 0;

  document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastTrailTime < 80) return;
    lastTrailTime = now;

    const trail = document.createElement('div');
    trail.style.cssText = `
      position: fixed;
      left: ${e.clientX}px;
      top: ${e.clientY}px;
      width: 6px;
      height: 6px;
      background: radial-gradient(circle, var(--color-rose-soft), transparent);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9998;
      opacity: 0.4;
      transition: all 0.8s ease-out;
    `;
    document.body.appendChild(trail);

    requestAnimationFrame(() => {
      trail.style.opacity = '0';
      trail.style.transform = 'scale(3)';
    });

    setTimeout(() => trail.remove(), 800);
  });

  console.log('%c💕 Hecho con amor para la familia 💕', 
    'font-size: 16px; color: #E8A0BF; font-family: cursive; padding: 10px;');
});
