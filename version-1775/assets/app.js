(function () {
    var toggle = document.querySelector('.mobile-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var heroIndex = 0;

    function showHero(index) {
        if (!slides.length) {
            return;
        }
        heroIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === heroIndex);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === heroIndex);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showHero(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showHero(heroIndex + 1);
        }, 5200);
    }

    var input = document.querySelector('.movie-search-input');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-grid .movie-card'));
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('.filter-button'));
    var activeFilter = 'all';

    function applyFilters() {
        var query = input ? input.value.trim().toLowerCase() : '';
        cards.forEach(function (card) {
            var text = (card.getAttribute('data-search') || '').toLowerCase();
            var matchesQuery = !query || text.indexOf(query) !== -1;
            var matchesFilter = activeFilter === 'all' || text.indexOf(activeFilter.toLowerCase()) !== -1;
            card.classList.toggle('is-hidden', !(matchesQuery && matchesFilter));
        });
    }

    if (input) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
            input.value = q;
        }
        input.addEventListener('input', applyFilters);
    }

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            filterButtons.forEach(function (item) {
                item.classList.remove('is-active');
            });
            button.classList.add('is-active');
            activeFilter = button.getAttribute('data-filter') || 'all';
            applyFilters();
        });
    });

    applyFilters();

    var players = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));

    players.forEach(function (shell) {
        var video = shell.querySelector('video');
        var overlay = shell.querySelector('.player-overlay');
        var stream = video ? video.getAttribute('data-stream') : '';
        var ready = false;
        var hlsInstance = null;

        function attachStream() {
            if (!video || !stream || ready) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                ready = true;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new Hls();
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
                ready = true;
                return;
            }
            video.src = stream;
            ready = true;
        }

        function playVideo() {
            attachStream();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            if (video) {
                video.controls = true;
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }
        }

        if (overlay) {
            overlay.addEventListener('click', playVideo);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (!ready) {
                    playVideo();
                }
            });
        }
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
}());
