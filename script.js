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

  // GitHub contribution graph
  var graphEl = document.getElementById('contrib-graph');
  var totalEl = document.getElementById('contrib-total');
  var GITHUB_USER = 'shun-os';

  if (graphEl && totalEl) {
    fetch('https://github-contributions-api.jogruber.de/v4/' + GITHUB_USER + '?y=last')
      .then(function (res) {
        if (!res.ok) throw new Error('fetch failed');
        return res.json();
      })
      .then(function (data) {
        var days = data.contributions || [];
        if (!days.length) throw new Error('no data');

        var offset = new Date(days[0].date).getDay();
        var html = '';
        for (var i = 0; i < offset; i++) {
          html += '<i style="visibility:hidden"></i>';
        }
        days.forEach(function (d) {
          html += '<i data-level="' + d.level + '" title="' + d.date + ': ' + d.count + ' contributions"></i>';
        });
        graphEl.innerHTML = html;

        var total = days.reduce(function (sum, d) { return sum + d.count; }, 0);
        totalEl.textContent = total.toLocaleString() + ' contributions in the last year';
      })
      .catch(function () {
        totalEl.textContent = '@' + GITHUB_USER;
        graphEl.innerHTML = '<img src="https://ghchart.rshah.org/3fb950/' + GITHUB_USER + '" alt="GitHub contributions" style="width:100%;border-radius:4px;">';
      });
  }
  // Contact form (Netlify Forms via fetch)
  var form = document.getElementById('contact-form');
  var statusEl = document.getElementById('contact-status');

  if (form && statusEl) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('.term-submit');
      btn.disabled = true;
      statusEl.className = 'term-status';
      statusEl.textContent = 'sending...';

      var body = new URLSearchParams(new FormData(form)).toString();
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body
      })
        .then(function (res) {
          if (!res.ok) throw new Error('failed');
          form.reset();
          statusEl.className = 'term-status ok';
          statusEl.textContent = '✔ exit 0 — 送信しました。ありがとうございます!';
        })
        .catch(function () {
          statusEl.className = 'term-status err';
          statusEl.textContent = '✖ exit 1 — 送信に失敗しました。時間をおいてお試しください。';
        })
        .then(function () { btn.disabled = false; });
    });
  }
})();