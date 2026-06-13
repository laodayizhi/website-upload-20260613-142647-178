(function () {
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var heroIndex = 0;

  function setHeroSlide(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === heroIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === heroIndex);
    });
  }

  if (slides.length) {
    setHeroSlide(0);

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        setHeroSlide(index);
      });
    });

    window.setInterval(function () {
      setHeroSlide(heroIndex + 1);
    }, 5600);
  }

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';
  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('input[name="q"]'));

  searchInputs.forEach(function (input) {
    if (query) {
      input.value = query;
    }
  });

  var filterInput = document.querySelector('[data-filter-input]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var emptyState = document.querySelector('[data-empty-state]');
  var chipButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));
  var activeChip = '';

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilter() {
    if (!cards.length) {
      return;
    }

    var keyword = normalize(filterInput ? filterInput.value : query);
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-search'));
      var category = normalize(card.getAttribute('data-category'));
      var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchesChip = !activeChip || haystack.indexOf(normalize(activeChip)) !== -1 || category === normalize(activeChip);
      var show = matchesKeyword && matchesChip;

      card.style.display = show ? '' : 'none';

      if (show) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.style.display = visible ? 'none' : 'block';
    }
  }

  if (filterInput) {
    if (query) {
      filterInput.value = query;
    }

    filterInput.addEventListener('input', applyFilter);
  }

  chipButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeChip = button.getAttribute('data-filter-chip') || '';
      chipButtons.forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      applyFilter();
    });
  });

  if (cards.length) {
    applyFilter();
  }

  var detailPlay = document.querySelector('[data-detail-play]');
  var playButton = document.querySelector('[data-play-button]');

  if (detailPlay && playButton) {
    detailPlay.addEventListener('click', function () {
      playButton.click();
      var player = document.querySelector('[data-player]');
      if (player) {
        player.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }
})();

function initMoviePlayer(source) {
  var video = document.querySelector('[data-player]');
  var playButton = document.querySelector('[data-play-button]');

  if (!video || !source) {
    return;
  }

  function attachSource() {
    if (video.getAttribute('data-ready') === 'yes') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true });
      hls.loadSource(source);
      hls.attachMedia(video);
      video.hlsInstance = hls;
    } else {
      video.src = source;
    }

    video.setAttribute('data-ready', 'yes');
  }

  function startPlayback() {
    attachSource();

    var shell = video.closest('.player-shell');
    if (shell) {
      shell.classList.add('is-playing');
    }

    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  if (playButton) {
    playButton.addEventListener('click', startPlayback);
  }

  video.addEventListener('play', function () {
    var shell = video.closest('.player-shell');
    if (shell) {
      shell.classList.add('is-playing');
    }
  });

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });
}
