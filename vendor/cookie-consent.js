/**
 * IPUL Panamá - Cookie Consent + Google Analytics
 * GA only loads AFTER user explicitly consents.
 */
(function() {
    'use strict';

    var GA_ID = 'G-KQ2REW1G3Y';
    var COOKIE_NAME = 'ipul_cookie_consent';
    var COOKIE_DAYS = 365;

    function getCookie(name) {
        var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
    }

    function setCookie(name, value, days) {
        var d = new Date();
        d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = name + '=' + value + ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax';
    }

    function loadGA() {
        if (document.getElementById('ga-script')) return;
        var s = document.createElement('script');
        s.id = 'ga-script';
        s.async = true;
        s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
        document.head.appendChild(s);

        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', GA_ID, { anonymize_ip: true });
    }

    function showBanner() {
        var banner = document.createElement('div');
        banner.id = 'cookie-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-label', 'Consentimiento de cookies');
        banner.innerHTML = 
            '<div style="position:fixed;bottom:0;left:0;right:0;z-index:9999;padding:16px;background:#002855;border-top:3px solid #FFC72C;box-shadow:0 -4px 20px rgba(0,0,0,0.3)">' +
                '<div style="max-width:900px;margin:0 auto;display:flex;flex-wrap:wrap;align-items:center;gap:16px;justify-content:space-between">' +
                    '<p style="color:#e2e8f0;font-size:14px;line-height:1.5;margin:0;flex:1;min-width:280px">' +
                        'Utilizamos cookies de Google Analytics para entender cómo se usa nuestro sitio y mejorar tu experiencia. ' +
                        'No recopilamos datos personales. ' +
                        '<a href="/politica-privacidad.html" style="color:#FFC72C;text-decoration:underline">Política de Privacidad</a>' +
                    '</p>' +
                    '<div style="display:flex;gap:8px;flex-shrink:0">' +
                        '<button id="cookie-reject" style="padding:10px 20px;background:transparent;color:#94a3b8;border:1px solid #475569;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer">Rechazar</button>' +
                        '<button id="cookie-accept" style="padding:10px 20px;background:#FFC72C;color:#002855;border:none;border-radius:6px;font-size:13px;font-weight:700;cursor:pointer">Aceptar cookies</button>' +
                    '</div>' +
                '</div>' +
            '</div>';
        document.body.appendChild(banner);

        document.getElementById('cookie-accept').addEventListener('click', function() {
            setCookie(COOKIE_NAME, 'accepted', COOKIE_DAYS);
            loadGA();
            banner.remove();
        });

        document.getElementById('cookie-reject').addEventListener('click', function() {
            setCookie(COOKIE_NAME, 'rejected', COOKIE_DAYS);
            banner.remove();
        });
    }

    // Check consent state on load
    var consent = getCookie(COOKIE_NAME);
    if (consent === 'accepted') {
        loadGA();
    } else if (!consent) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', showBanner);
        } else {
            showBanner();
        }
    }
    // If 'rejected', do nothing — no GA, no banner
})();
