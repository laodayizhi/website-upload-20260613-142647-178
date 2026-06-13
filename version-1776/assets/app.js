(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var shell = document.querySelector("[data-hero-slider]");
    if (!shell) {
      return;
    }
    var slides = Array.prototype.slice.call(shell.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(shell.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function setupFilters() {
    var bars = Array.prototype.slice.call(document.querySelectorAll("[data-filter-bar]"));
    bars.forEach(function (bar) {
      var keyword = bar.querySelector("[data-filter-keyword]");
      var year = bar.querySelector("[data-filter-year]");
      var type = bar.querySelector("[data-filter-type]");
      var list = document.querySelector("[data-filter-list]");
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll(".filter-card"));
      function apply() {
        var q = keyword ? keyword.value.trim().toLowerCase() : "";
        var y = year ? year.value : "";
        var t = type ? type.value : "";
        cards.forEach(function (card) {
          var okText = !q || (card.getAttribute("data-text") || "").indexOf(q) !== -1;
          var okYear = !y || card.getAttribute("data-year") === y;
          var okType = !t || card.getAttribute("data-type") === t;
          card.classList.toggle("is-hidden", !(okText && okYear && okType));
        });
      }
      [keyword, year, type].forEach(function (input) {
        if (input) {
          input.addEventListener("input", apply);
          input.addEventListener("change", apply);
        }
      });
    });
  }

  function cardHtml(item) {
    return [
      '<article class="movie-card filter-card">',
      '<a href="' + item.link + '" class="card-link">',
      '<div class="poster-wrap">',
      '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '" loading="lazy">',
      '<span class="duration-pill">' + item.duration + '</span>',
      '<span class="hover-play">▶</span>',
      '</div>',
      '<div class="card-body">',
      '<h3>' + item.title + '</h3>',
      '<p>' + item.oneLine + '</p>',
      '<div class="card-meta">',
      '<span>' + item.category + '</span>',
      '<span>' + item.year + '</span>',
      '<span>' + item.score + '</span>',
      '</div>',
      '</div>',
      '</a>',
      '</article>'
    ].join('');
  }

  function setupSearch() {
    var results = document.getElementById("searchResults");
    var input = document.getElementById("searchInput");
    if (!results || !input || !window.SEARCH_DATA) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = (params.get("q") || "").trim();
    if (q) {
      input.value = q;
    }
    function render(value) {
      var term = value.trim().toLowerCase();
      var title = document.getElementById("searchTitle");
      var intro = document.getElementById("searchIntro");
      if (!term) {
        return;
      }
      var matched = window.SEARCH_DATA.filter(function (item) {
        return item.text.indexOf(term) !== -1;
      }).slice(0, 80);
      if (title) {
        title.textContent = "搜索结果";
      }
      if (intro) {
        intro.textContent = matched.length ? "以下影片与关键词相关。" : "暂未匹配到相关影片。";
      }
      results.innerHTML = matched.map(cardHtml).join("");
    }
    render(q);
  }

  window.initPlayer = function (videoId, buttonId, mediaUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !mediaUrl) {
      return;
    }
    var attached = false;
    function attach() {
      if (attached) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = mediaUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(mediaUrl);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = mediaUrl;
      }
      attached = true;
    }
    function start() {
      attach();
      var shell = video.closest(".video-shell");
      if (shell) {
        shell.classList.add("is-playing");
      }
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }
    button.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearch();
  });
})();
