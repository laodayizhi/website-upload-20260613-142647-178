(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');
    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('active', i === current);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('active', i === current);
        });
    }

    function nextSlide(step) {
        showSlide(current + step);
    }

    function startHero() {
        if (timer) {
            clearInterval(timer);
        }
        timer = setInterval(function () {
            nextSlide(1);
        }, 5200);
    }

    if (slides.length) {
        var prev = document.querySelector('.hero-prev');
        var next = document.querySelector('.hero-next');
        if (prev) {
            prev.addEventListener('click', function () {
                nextSlide(-1);
                startHero();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                nextSlide(1);
                startHero();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                showSlide(i);
                startHero();
            });
        });
        startHero();
    }

    var filterPanel = document.querySelector('[data-filter-panel]');
    if (filterPanel) {
        var input = filterPanel.querySelector('.filter-search');
        var year = filterPanel.querySelector('.filter-year');
        var region = filterPanel.querySelector('.filter-region');
        var type = filterPanel.querySelector('.filter-type');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-results .movie-card'));
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query && input) {
            input.value = query;
        }

        function matchCard(card) {
            var q = input ? input.value.trim().toLowerCase() : '';
            var y = year ? year.value : '';
            var r = region ? region.value : '';
            var t = type ? type.value : '';
            var haystack = [
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-category')
            ].join(' ').toLowerCase();
            var okQuery = !q || haystack.indexOf(q) !== -1;
            var okYear = !y || card.getAttribute('data-year') === y;
            var okRegion = !r || (card.getAttribute('data-region') || '').indexOf(r) !== -1;
            var okType = !t || (card.getAttribute('data-type') || '').indexOf(t) !== -1;
            return okQuery && okYear && okRegion && okType;
        }

        function applyFilter() {
            cards.forEach(function (card) {
                card.classList.toggle('hidden-card', !matchCard(card));
            });
        }

        [input, year, region, type].forEach(function (el) {
            if (el) {
                el.addEventListener('input', applyFilter);
                el.addEventListener('change', applyFilter);
            }
        });
        applyFilter();
    }
})();

function setupMoviePlayer(videoId, coverId, streamUrl) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    if (!video || !cover || !streamUrl) {
        return;
    }

    function attach() {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (!video.src) {
                video.src = streamUrl;
            }
            return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
            if (!video.hlsInstance) {
                var hls = new window.Hls({
                    maxBufferLength: 30,
                    capLevelToPlayerSize: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                video.hlsInstance = hls;
            }
            return Promise.resolve();
        }
        if (!video.src) {
            video.src = streamUrl;
        }
        return Promise.resolve();
    }

    function play() {
        attach().then(function () {
            cover.classList.add('hide');
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    cover.classList.remove('hide');
                });
            }
        });
    }

    cover.addEventListener('click', play);
    video.addEventListener('click', function () {
        if (video.paused) {
            play();
        }
    });
    video.addEventListener('play', function () {
        cover.classList.add('hide');
    });
}
