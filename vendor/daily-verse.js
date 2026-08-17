/**
 * IPUL Panamá - Daily Verse / Versículo del Día
 * Primary: bible-api.com (RVR1960)
 * Fallback: local versiculos.json (curated, Proverbios/Salmos/Juan)
 */
(function() {
    'use strict';

    // Config
    var API_URL = 'https://bible-api.com/';
    var TIMEOUT_MS = 4000;
    var CACHE_KEY = 'ipul_daily_verse';
    var CACHE_DATE_KEY = 'ipul_daily_verse_date';

    // Curated verse references for the API (safe, doctrinally aligned)
    var SAFE_REFS_ES = [
        'Salmos 23:1-3', 'Salmos 91:1-2', 'Salmos 27:1', 'Salmos 46:1',
        'Salmos 119:105', 'Salmos 37:4-5', 'Salmos 34:8', 'Salmos 121:1-2',
        'Salmos 51:10', 'Salmos 103:1-3', 'Proverbios 3:5-6', 'Proverbios 16:3',
        'Proverbios 18:10', 'Proverbios 22:6', 'Proverbios 15:1',
        'Juan 3:16', 'Juan 14:6', 'Juan 14:27', 'Juan 8:12',
        'Juan 10:10', 'Juan 11:25', 'Juan 15:5', 'Juan 16:33',
        'Isaías 41:10', 'Jeremías 29:11', 'Filipenses 4:13',
        'Romanos 8:28', 'Mateo 11:28', 'Mateo 6:33', '1 Pedro 5:7'
    ];

    var SAFE_REFS_EN = [
        'Psalms 23:1-3', 'Psalms 91:1-2', 'Psalms 27:1', 'Psalms 46:1',
        'Psalms 119:105', 'Psalms 37:4-5', 'Psalms 34:8', 'Psalms 121:1-2',
        'Psalms 51:10', 'Psalms 103:1-3', 'Proverbs 3:5-6', 'Proverbs 16:3',
        'Proverbs 18:10', 'Proverbs 22:6', 'Proverbs 15:1',
        'John 3:16', 'John 14:6', 'John 14:27', 'John 8:12',
        'John 10:10', 'John 11:25', 'John 15:5', 'John 16:33',
        'Isaiah 41:10', 'Jeremiah 29:11', 'Philippians 4:13',
        'Romans 8:28', 'Matthew 11:28', 'Matthew 6:33', '1 Peter 5:7'
    ];

    var SAFE_REFS = isEnglish ? SAFE_REFS_EN : SAFE_REFS_ES;

    var isEnglish = document.documentElement.lang === 'en';

    function getToday() {
        return new Date().toISOString().split('T')[0];
    }

    function getDayIndex() {
        var now = new Date();
        var start = new Date(now.getFullYear(), 0, 0);
        var diff = now - start;
        var oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }

    function getCachedVerse() {
        try {
            var cachedDate = localStorage.getItem(CACHE_DATE_KEY);
            if (cachedDate === getToday()) {
                var cached = localStorage.getItem(CACHE_KEY);
                if (cached) return JSON.parse(cached);
            }
        } catch(e) {}
        return null;
    }

    function cacheVerse(verse) {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(verse));
            localStorage.setItem(CACHE_DATE_KEY, getToday());
        } catch(e) {}
    }

    function sanitizeText(text) {
        // Security: strip any HTML tags, scripts, and limit length
        if (!text || typeof text !== 'string') return '';
        text = text.replace(/<[^>]*>/g, '');
        text = text.replace(/[<>"'&]/g, function(c) {
            return {'<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','&':'&amp;'}[c];
        });
        // Limit to 500 chars max
        if (text.length > 500) text = text.substring(0, 500) + '...';
        return text.trim();
    }

    function sanitizeRef(ref) {
        if (!ref || typeof ref !== 'string') return '';
        // Only allow alphanumeric, spaces, colons, dashes, periods
        return ref.replace(/[^a-zA-ZáéíóúñÁÉÍÓÚÑ0-9\s:\-\.]/g, '').substring(0, 50);
    }

    function renderVerse(verse) {
        var container = document.getElementById('daily-verse-content');
        if (!container) return;

        container.innerHTML =
            '<p class="text-lg md:text-xl text-gray-700 italic leading-relaxed mb-4">"' +
            sanitizeText(verse.text) + '"</p>' +
            '<p class="text-sm font-bold text-ipul-blue">' +
            sanitizeRef(verse.ref) +
            (verse.ver ? ' <span class="text-gray-400 font-normal">(' + sanitizeText(verse.ver) + ')</span>' : '') +
            '</p>';
    }

    function loadFromAPI() {
        // API only supports English translations (KJV/WEB)
        // For Spanish, go directly to local fallback
        if (!isEnglish) {
            return Promise.reject(new Error('Spanish not supported by API'));
        }

        return new Promise(function(resolve, reject) {
            var dayIdx = getDayIndex();
            var ref = SAFE_REFS[dayIdx % SAFE_REFS.length];
            var url = API_URL + encodeURIComponent(ref) + '?translation=kjv';

            var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
            var timeoutId = setTimeout(function() {
                if (controller) controller.abort();
                reject(new Error('timeout'));
            }, TIMEOUT_MS);

            var fetchOptions = { method: 'GET' };
            if (controller) fetchOptions.signal = controller.signal;

            fetch(url, fetchOptions)
                .then(function(res) {
                    clearTimeout(timeoutId);
                    if (!res.ok) throw new Error('API error: ' + res.status);
                    return res.json();
                })
                .then(function(data) {
                    // Validate response structure
                    if (!data || !data.text || !data.reference) {
                        throw new Error('Invalid API response');
                    }
                    // Security: validate text doesn't contain unexpected content
                    if (data.text.length > 1000 || data.reference.length > 100) {
                        throw new Error('Response too large');
                    }
                    resolve({
                        text: data.text.replace(/\n/g, ' ').trim(),
                        ref: data.reference,
                        ver: 'KJV'
                    });
                })
                .catch(function(err) {
                    clearTimeout(timeoutId);
                    reject(err);
                });
        });
    }

    function loadFallback(basePath) {
        var fallbackFile = isEnglish ? '/vendor/versiculos-en.json' : '/vendor/versiculos.json';
        return fetch(basePath + fallbackFile)
            .then(function(res) { return res.json(); })
            .then(function(verses) {
                if (!Array.isArray(verses) || verses.length === 0) {
                    throw new Error('Invalid fallback');
                }
                var dayIdx = getDayIndex();
                return verses[dayIdx % verses.length];
            });
    }

    function init() {
        var container = document.getElementById('daily-verse-content');
        if (!container) return;

        // Determine base path for fallback JSON
        var scripts = document.getElementsByTagName('script');
        var basePath = '';
        for (var i = 0; i < scripts.length; i++) {
            if (scripts[i].src && scripts[i].src.indexOf('daily-verse.js') !== -1) {
                basePath = scripts[i].src.replace(/vendor\/daily-verse\.js.*$/, '').replace(/\/$/, '');
                break;
            }
        }

        // Check cache first
        var cached = getCachedVerse();
        if (cached) {
            renderVerse(cached);
            return;
        }

        // Try API, fallback to local
        loadFromAPI()
            .then(function(verse) {
                cacheVerse(verse);
                renderVerse(verse);
            })
            .catch(function() {
                // Fallback to local JSON
                loadFallback(basePath)
                    .then(function(verse) {
                        cacheVerse(verse);
                        renderVerse(verse);
                    })
                    .catch(function() {
                        // Ultimate fallback
                        var ultimateFallback = isEnglish
                            ? { text: 'Trust in the Lord with all your heart, and do not lean on your own understanding.', ref: 'Proverbs 3:5', ver: 'KJV' }
                            : { text: 'Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia.', ref: 'Proverbios 3:5', ver: 'RVR1960' };
                        renderVerse(ultimateFallback);
                    });
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
