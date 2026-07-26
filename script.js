// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// Mobile hamburger
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Close mobile nav on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// Contact form submit (Formspree)
async function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const successBox = document.getElementById('form-success');

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form)
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const errorMessage = (data.errors || []).map(err => err.message).join(', ');
      throw new Error(errorMessage || 'Unable to send the message.');
    }

    successBox.textContent = 'Thanks! Your request has been sent.';
    successBox.style.display = 'block';
    form.reset();
  } catch (error) {
    console.error('Form submit failed:', error);
    successBox.textContent = 'Unable to send the message right now. Please call or email directly.';
    successBox.style.display = 'block';
  }

  setTimeout(() => {
    successBox.style.display = 'none';
    successBox.textContent = "Thanks! We'll be in touch shortly.";
  }, 5000);
}

// Gallery lightbox / album viewer
const lightbox = document.getElementById('lightbox');
if (lightbox) {
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  const lightboxCounter = document.getElementById('lightbox-counter');

  let currentAlbum = [];
  let currentIndex = 0;
  let currentAlt = '';

  const renderLightbox = () => {
    lightboxImg.src = currentAlbum[currentIndex];
    lightboxImg.alt = currentAlt;
    const hasMultiple = currentAlbum.length > 1;
    lightboxPrev.style.display = hasMultiple ? 'flex' : 'none';
    lightboxNext.style.display = hasMultiple ? 'flex' : 'none';
    lightboxCounter.textContent = hasMultiple ? `${currentIndex + 1} / ${currentAlbum.length}` : '';
  };

  const openLightbox = (album, alt, startIndex = 0) => {
    currentAlbum = album;
    currentAlt = alt;
    currentIndex = startIndex;
    renderLightbox();
    lightbox.classList.add('open');
  };

  document.querySelectorAll('.gallery-item').forEach(item => {
    const album = item.dataset.album.split(',').map(src => src.trim()).filter(Boolean);
    const alt = item.querySelector('img').alt;

    item.querySelector('img').addEventListener('click', () => openLightbox(album, alt, 0));

    const seeAlbumBtn = item.querySelector('.see-album');
    if (seeAlbumBtn) {
      seeAlbumBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openLightbox(album, alt, 0);
      });
    }
  });

  const closeLightbox = () => lightbox.classList.remove('open');
  const showPrev = () => {
    currentIndex = (currentIndex - 1 + currentAlbum.length) % currentAlbum.length;
    renderLightbox();
  };
  const showNext = () => {
    currentIndex = (currentIndex + 1) % currentAlbum.length;
    renderLightbox();
  };

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });
  lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  });
}

// Scroll-reveal cards
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.service-card, .point, .info-item, .gallery-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});
