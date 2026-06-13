(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('image-hidden');
    });
  });

  var hero = document.querySelector('[data-hero-carousel]');

  if (hero) {
    var slides = Array.from(hero.querySelectorAll('.hero-slide'));
    var dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    var previous = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    restart();
  }

  var filterList = document.querySelector('[data-filter-list]');
  var filterInput = document.querySelector('[data-filter-input]');
  var filterType = document.querySelector('[data-filter-type]');
  var filterCount = document.querySelector('[data-filter-count]');

  if (filterList && filterInput) {
    var cards = Array.from(filterList.querySelectorAll('.movie-card'));

    function applyFilter() {
      var keyword = filterInput.value.trim().toLowerCase();
      var selectedType = filterType ? filterType.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var typeMatched = !selectedType || card.getAttribute('data-type') === selectedType;
        var keywordMatched = !keyword || text.indexOf(keyword) !== -1;
        var matched = typeMatched && keywordMatched;

        card.hidden = !matched;

        if (matched) {
          visible += 1;
        }
      });

      if (filterCount) {
        filterCount.textContent = '共 ' + visible + ' 部';
      }
    }

    filterInput.addEventListener('input', applyFilter);

    if (filterType) {
      filterType.addEventListener('change', applyFilter);
    }
  }

  var playerBox = document.querySelector('[data-player]');

  if (playerBox) {
    var video = playerBox.querySelector('video');
    var start = playerBox.querySelector('.watch-start');
    var stream = video ? video.getAttribute('data-stream') : '';
    var prepared = false;
    var playerEngine = null;

    function attachStream() {
      if (!video || !stream || prepared) {
        return;
      }

      prepared = true;

      if (/\.m3u8(\?|$)/i.test(stream)) {
        if (window.Hls && window.Hls.isSupported()) {
          playerEngine = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          playerEngine.loadSource(stream);
          playerEngine.attachMedia(video);
        } else {
          video.src = stream;
        }
      } else {
        video.src = stream;
      }
    }

    function playVideo() {
      attachStream();
      playerBox.classList.add('is-playing');

      if (video) {
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      }
    }

    if (start) {
      start.addEventListener('click', playVideo);
    }

    playerBox.addEventListener('click', function (event) {
      if (event.target === start) {
        return;
      }

      if (video && video.paused) {
        playVideo();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (playerEngine && typeof playerEngine.destroy === 'function') {
        playerEngine.destroy();
      }
    });
  }

  var searchInput = document.querySelector('[data-global-search]');
  var searchButton = document.querySelector('[data-global-search-button]');
  var searchResults = document.querySelector('[data-search-results]');
  var searchCount = document.querySelector('[data-search-count]');
  var searchTitle = document.querySelector('[data-search-title]');

  if (searchInput && searchResults && Array.isArray(window.SEARCH_INDEX)) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    searchInput.value = initial;

    function cardHtml(item) {
      return [
        '<a class="movie-card" href="' + item.url + '">',
        '  <span class="poster">',
        '    <img src="./' + item.poster + '.jpg" alt="' + escapeHtml(item.title) + '" loading="lazy" onerror="this.classList.add(\'image-hidden\')">',
        '    <span class="year-badge">' + item.year + '</span>',
        '    <span class="play-hover">▶</span>',
        '  </span>',
        '  <span class="card-info">',
        '    <span class="card-channel">' + escapeHtml(item.channel) + '</span>',
        '    <strong>' + escapeHtml(item.title) + '</strong>',
        '    <span>' + escapeHtml(item.genre) + '</span>',
        '  </span>',
        '</a>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function performSearch() {
      var keyword = searchInput.value.trim().toLowerCase();
      var matched = window.SEARCH_INDEX.filter(function (item) {
        if (!keyword) {
          return true;
        }

        return item.searchText.indexOf(keyword) !== -1;
      }).slice(0, 120);

      searchResults.innerHTML = matched.map(cardHtml).join('');

      if (searchCount) {
        searchCount.textContent = '显示 ' + matched.length + ' 部';
      }

      if (searchTitle) {
        searchTitle.textContent = keyword ? '“' + searchInput.value.trim() + '”的搜索结果' : '推荐影片';
      }
    }

    searchInput.addEventListener('input', performSearch);

    if (searchButton) {
      searchButton.addEventListener('click', performSearch);
    }

    performSearch();
  }
})();
