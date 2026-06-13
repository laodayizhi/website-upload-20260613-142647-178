(function () {
    var mobileButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (mobileButton && mobilePanel) {
        mobileButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
            document.body.classList.toggle('menu-open', mobilePanel.classList.contains('is-open'));
        });
    }

    document.querySelectorAll('[data-header-search]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var value = input ? input.value.trim() : '';
            var target = 'search.html';
            if (value) {
                target += '?q=' + encodeURIComponent(value);
            }
            window.location.href = target;
        });
    });

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupFilters(scope) {
        var form = scope.querySelector('[data-filter-form]');
        var list = scope.querySelector('[data-card-list]');
        var empty = scope.querySelector('[data-empty-state]');
        if (!form || !list) {
            return;
        }

        var queryInput = form.querySelector('[data-filter-query]');
        var typeSelect = form.querySelector('[data-filter-type]');
        var regionSelect = form.querySelector('[data-filter-region]');
        var yearSelect = form.querySelector('[data-filter-year]');
        var categorySelect = form.querySelector('[data-filter-category]');
        var clearButton = form.querySelector('[data-filter-clear]');
        var urlParams = new URLSearchParams(window.location.search);
        var queryFromUrl = urlParams.get('q');

        if (queryInput && queryFromUrl) {
            queryInput.value = queryFromUrl;
        }

        function matches(card) {
            var query = normalize(queryInput && queryInput.value);
            var type = normalize(typeSelect && typeSelect.value);
            var region = normalize(regionSelect && regionSelect.value);
            var year = normalize(yearSelect && yearSelect.value);
            var category = normalize(categorySelect && categorySelect.value);
            var searchText = normalize(card.getAttribute('data-search'));
            var cardType = normalize(card.getAttribute('data-type'));
            var cardRegion = normalize(card.getAttribute('data-region'));
            var cardYear = normalize(card.getAttribute('data-year'));
            var cardCategory = normalize(card.getAttribute('data-category'));

            if (query && searchText.indexOf(query) === -1) {
                return false;
            }
            if (type && cardType.indexOf(type) === -1) {
                return false;
            }
            if (region && cardRegion.indexOf(region) === -1) {
                return false;
            }
            if (year && cardYear !== year) {
                return false;
            }
            if (category && cardCategory !== category) {
                return false;
            }
            return true;
        }

        function applyFilters() {
            var visible = 0;
            list.querySelectorAll('.movie-card').forEach(function (card) {
                var ok = matches(card);
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        form.addEventListener('input', applyFilters);
        form.addEventListener('change', applyFilters);
        if (clearButton) {
            clearButton.addEventListener('click', function () {
                form.querySelectorAll('input, select').forEach(function (field) {
                    field.value = '';
                });
                applyFilters();
            });
        }
        applyFilters();
    }

    setupFilters(document);

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var previous = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        if (!slides.length) {
            return;
        }

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                restart();
            });
        });

        if (previous) {
            previous.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        restart();
    });

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play-button]');
        if (!video) {
            return;
        }

        function setSource() {
            if (video.getAttribute('data-ready') === 'true') {
                return;
            }
            var source = video.getAttribute('data-src');
            if (!source) {
                return;
            }
            var isHls = source.indexOf('.m3u8') !== -1;
            if (isHls && window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                video._hlsInstance = hls;
            } else {
                video.src = source;
            }
            video.setAttribute('data-ready', 'true');
        }

        function playVideo() {
            setSource();
            if (button) {
                button.classList.add('is-hidden');
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    if (button) {
                        button.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                playVideo();
            });
        }

        player.addEventListener('click', function (event) {
            if (event.target === video) {
                return;
            }
            playVideo();
        });

        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('is-hidden');
            }
        });
    });
})();
