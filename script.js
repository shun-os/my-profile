(function () {
  var sidebar = document.getElementById('sidebar');
  var hamburger = document.getElementById('hamburger');
  var overlay = document.getElementById('overlay');
  var navItems = document.querySelectorAll('.nav-item');
  var sections = document.querySelectorAll('.section, .hero');

  function openMenu() {
    sidebar.classList.add('open');
    hamburger.classList.add('open');
    overlay.classList.add('visible');
  }

  function closeMenu() {
    sidebar.classList.remove('open');
    hamburger.classList.remove('open');
    overlay.classList.remove('visible');
  }

  if (hamburger) {
    hamburger.addEventListener('click', function () {
      if (sidebar.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (overlay) {
    overlay.addEventListener('click', closeMenu);
  }

  navItems.forEach(function (item) {
    item.addEventListener('click', closeMenu);
  });

  // Highlight the nav item matching the section in view
  if ('IntersectionObserver' in window && sections.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.getAttribute('id');
          if (!id) return;
          navItems.forEach(function (item) {
            var match = item.getAttribute('href') === '#' + id;
            item.classList.toggle('active', match);
          });
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );

    sections.forEach(function (section) {
      if (section.id) observer.observe(section);
    });
  }
})();