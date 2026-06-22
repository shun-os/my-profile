// ── Hamburger menu ──
const hamburger = document.getElementById('hamburger');
const sidebar   = document.getElementById('sidebar');
const overlay   = document.getElementById('overlay');

function openSidebar() {
  sidebar.classList.add('open');
  overlay.classList.add('active');
  hamburger.classList.add('open');
  hamburger.setAttribute('aria-label', 'メニューを閉じる');
}

function closeSidebar() {
  sidebar.classList.remove('open');
  overlay.classList.remove('active');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-label', 'メニューを開く');
}

hamburger.addEventListener('click', () => {
  sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
});

overlay.addEventListener('click', closeSidebar);

// Close sidebar when a nav link is tapped on mobile
sidebar.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    if (window.innerWidth <= 768) closeSidebar();
  });
});

// ── Scroll spy ──
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('[id]');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navItems.forEach(n => {
        n.classList.toggle('active', n.getAttribute('href') === '#' + e.target.id);
      });
    }
  });
}, { threshold: 0.3 });

sections.forEach(s => observer.observe(s));
