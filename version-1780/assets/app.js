(function () {
    "use strict";

    var hlsLibraryUrl = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
    var hlsLibraryPromise = null;

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function loadHlsLibrary() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }

        if (hlsLibraryPromise) {
            return hlsLibraryPromise;
        }

        hlsLibraryPromise = new Promise(function (resolve, reject) {
            var script = document.createElement("script");
            script.src = hlsLibraryUrl;
            script.async = true;
            script.onload = function () {
                if (window.Hls) {
                    resolve(window.Hls);
                } else {
                    reject(new Error("HLS library loaded without exposing Hls."));
                }
            };
            script.onerror = function () {
                reject(new Error("HLS library failed to load."));
            };
            document.head.appendChild(script);
        });

        return hlsLibraryPromise;
    }

    function initMobileMenu() {
        var button = document.querySelector("[data-mobile-menu-button]");
        var panel = document.querySelector("[data-mobile-panel]");

        if (!button || !panel) {
            return;
        }

        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");

        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function activate(index) {
            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                activate(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                activate(index);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                activate(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                activate(current + 1);
                start();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        activate(0);
        start();
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));

        panels.forEach(function (panel) {
            var input = panel.querySelector("[data-filter-input]");
            var selects = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-select]"));
            var count = panel.querySelector("[data-filter-count]");
            var container = panel.parentElement;
            var cards = Array.prototype.slice.call(container.querySelectorAll(".searchable-card"));
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q") || "";

            if (input && initialQuery) {
                input.value = initialQuery;
            }

            function applyFilter() {
                var query = normalize(input ? input.value : "");
                var filters = {};

                selects.forEach(function (select) {
                    filters[select.getAttribute("data-filter-select")] = normalize(select.value);
                });

                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-genre"),
                        card.textContent
                    ].join(" "));

                    var matchesQuery = !query || haystack.indexOf(query) !== -1;
                    var matchesFilters = Object.keys(filters).every(function (key) {
                        return !filters[key] || normalize(card.getAttribute("data-" + key)) === filters[key];
                    });
                    var show = matchesQuery && matchesFilters;

                    card.classList.toggle("is-hidden", !show);

                    if (show) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = String(visible);
                }
            }

            if (input) {
                input.addEventListener("input", applyFilter);
            }

            selects.forEach(function (select) {
                select.addEventListener("change", applyFilter);
            });

            applyFilter();
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll(".movie-player"));

        players.forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector("[data-player-play]");
            var status = player.querySelector("[data-player-status]");
            var primarySource = player.getAttribute("data-hls") || "";
            var fallbacks = (player.getAttribute("data-fallback-hls") || "")
                .split("|")
                .filter(Boolean);
            var sources = [primarySource].concat(fallbacks).filter(function (source, index, array) {
                return source && array.indexOf(source) === index;
            });
            var currentSourceIndex = 0;
            var hlsInstance = null;
            var initialized = false;

            if (!video || !button || sources.length === 0) {
                return;
            }

            function setStatus(message) {
                if (status) {
                    status.textContent = message;
                }
            }

            function attachSource(source) {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    initialized = true;
                    setStatus("片源已加载");
                    return Promise.resolve();
                }

                return loadHlsLibrary().then(function (Hls) {
                    if (!Hls.isSupported()) {
                        throw new Error("当前浏览器不支持 HLS 播放。");
                    }

                    hlsInstance = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });

                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                        initialized = true;
                        setStatus("片源已加载");
                    });
                    hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            if (currentSourceIndex < sources.length - 1) {
                                currentSourceIndex += 1;
                                setStatus("正在切换备用片源");
                                attachSource(sources[currentSourceIndex]);
                            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                                setStatus("媒体异常，正在尝试恢复");
                                hlsInstance.recoverMediaError();
                            } else {
                                setStatus("播放失败，请刷新页面后重试");
                            }
                        }
                    });
                });
            }

            function play() {
                setStatus("正在加载片源");
                var promise = initialized ? Promise.resolve() : attachSource(sources[currentSourceIndex]);

                promise.then(function () {
                    video.controls = true;
                    return video.play();
                }).then(function () {
                    player.classList.add("is-playing");
                }).catch(function () {
                    setStatus("点击播放器控制条继续播放");
                    video.controls = true;
                });
            }

            button.addEventListener("click", play);
            video.addEventListener("play", function () {
                player.classList.add("is-playing");
            });
            video.addEventListener("pause", function () {
                if (video.currentTime === 0 || video.ended) {
                    player.classList.remove("is-playing");
                }
            });
        });
    }

    function initPlayerScrollLinks() {
        var links = Array.prototype.slice.call(document.querySelectorAll("[data-scroll-player]"));

        links.forEach(function (link) {
            link.addEventListener("click", function (event) {
                event.preventDefault();
                var player = document.querySelector(".movie-player");
                if (player) {
                    player.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            });
        });
    }

    ready(function () {
        initMobileMenu();
        initHero();
        initFilters();
        initPlayers();
        initPlayerScrollLinks();
    });
})();
