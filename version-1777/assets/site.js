(function() {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileMenu = document.querySelector('.mobile-menu');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function() {
            var expanded = menuButton.getAttribute('aria-expanded') === 'true';
            menuButton.setAttribute('aria-expanded', String(!expanded));
            mobileMenu.hidden = expanded;
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeHero = 0;

    function showHero(index) {
        if (!slides.length) {
            return;
        }
        activeHero = (index + slides.length) % slides.length;
        slides.forEach(function(slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeHero);
        });
        dots.forEach(function(dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeHero);
        });
    }

    dots.forEach(function(dot) {
        dot.addEventListener('click', function() {
            showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function() {
            showHero(activeHero + 1);
        }, 5600);
    }

    var filterList = document.querySelector('[data-filter-list]');
    var filterInput = document.querySelector('[data-filter-input]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var typeFilter = document.querySelector('[data-type-filter]');
    var emptyState = document.querySelector('[data-empty-state]');

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
        if (!filterList) {
            return;
        }
        var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));
        var query = normalize(filterInput && filterInput.value);
        var year = normalize(yearFilter && yearFilter.value);
        var type = normalize(typeFilter && typeFilter.value);
        var visibleCount = 0;

        cards.forEach(function(card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre')
            ].join(' '));
            var yearOk = !year || normalize(card.getAttribute('data-year')) === year;
            var typeOk = !type || normalize(card.getAttribute('data-type')).indexOf(type) !== -1;
            var queryOk = !query || haystack.indexOf(query) !== -1;
            var visible = yearOk && typeOk && queryOk;
            card.hidden = !visible;
            if (visible) {
                visibleCount += 1;
            }
        });

        if (emptyState) {
            emptyState.hidden = visibleCount !== 0;
        }
    }

    [filterInput, yearFilter, typeFilter].forEach(function(control) {
        if (control) {
            control.addEventListener('input', applyFilters);
            control.addEventListener('change', applyFilters);
        }
    });

    applyFilters();

    var searchForm = document.querySelector('[data-search-form]');
    var searchInput = document.querySelector('[data-search-input]');
    var searchResults = document.querySelector('[data-search-results]');
    var searchStatus = document.querySelector('[data-search-status]');

    function createResultCard(movie) {
        var tagHtml = movie.tags.slice(0, 4).map(function(tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return [
            '<article class="movie-card">',
            '    <a class="movie-poster" href="' + escapeHtml(movie.url) + '" aria-label="观看' + escapeHtml(movie.title) + '">',
            '        <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '    </a>',
            '    <div class="movie-card-body">',
            '        <div class="movie-meta-line">',
            '            <span>' + escapeHtml(movie.year) + '</span>',
            '            <span>' + escapeHtml(movie.region) + '</span>',
            '            <span>' + escapeHtml(movie.type) + '</span>',
            '        </div>',
            '        <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
            '        <p>' + escapeHtml(movie.oneLine) + '</p>',
            '        <div class="tag-row">' + tagHtml + '</div>',
            '    </div>',
            '</article>'
        ].join('
');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function runSearch(query) {
        if (!searchResults || !window.MOVIE_SEARCH_DATA) {
            return;
        }
        var normalizedQuery = normalize(query);
        searchInput.value = query;
        if (!normalizedQuery) {
            searchResults.innerHTML = '';
            searchStatus.textContent = '请输入关键词开始搜索。';
            return;
        }
        var terms = normalizedQuery.split(/\s+/).filter(Boolean);
        var matches = window.MOVIE_SEARCH_DATA.filter(function(movie) {
            var haystack = normalize([
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.tags.join(' '),
                movie.oneLine,
                movie.summary
            ].join(' '));
            return terms.every(function(term) {
                return haystack.indexOf(term) !== -1;
            });
        }).slice(0, 120);

        searchStatus.textContent = '找到 ' + matches.length + ' 条匹配结果，最多显示前 120 条。';
        searchResults.innerHTML = matches.map(createResultCard).join('
');
    }

    if (searchForm && searchInput) {
        searchForm.addEventListener('submit', function(event) {
            event.preventDefault();
            runSearch(searchInput.value);
        });
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        if (query) {
            runSearch(query);
        }
    }
})();
