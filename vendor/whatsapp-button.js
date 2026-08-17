/**
 * IPUL Panamá - WhatsApp Floating Button
 * Shows a warm, inviting floating button that opens WhatsApp
 * with a pre-filled message for spiritual connection.
 */
(function() {
    'use strict';

    var PHONE = '50767967816';
    var MSG_ES = 'Hola, vi en la página de IPUL Panamá que pueden hablarme de Dios. Me gustaría saber más.';
    var MSG_EN = 'Hi, I saw on the IPUL Panama website that you can tell me about God. I would like to know more.';
    var WHATSAPP_URL_ES = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(MSG_ES);
    var WHATSAPP_URL_EN = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(MSG_EN);

    var isEnglish = document.documentElement.lang === 'en';
    var url = isEnglish ? WHATSAPP_URL_EN : WHATSAPP_URL_ES;

    var LABEL_TEXT = isEnglish 
        ? "Need someone to talk to?" 
        : "¿Necesitas hablar con alguien?";
    var CTA_TEXT = isEnglish
        ? "We're here for you"
        : "Estamos aquí para ti";

    function createButton() {
        // Container
        var container = document.createElement('div');
        container.id = 'whatsapp-float';
        container.setAttribute('role', 'complementary');
        container.setAttribute('aria-label', isEnglish ? 'Contact us on WhatsApp' : 'Contáctanos por WhatsApp');

        // Styles
        var style = document.createElement('style');
        style.textContent = [
            '#whatsapp-float { position: fixed; bottom: 24px; right: 24px; z-index: 9990; font-family: Inter, sans-serif; }',
            '#whatsapp-float .wpp-bubble { position: absolute; bottom: 72px; right: 0; background: #fff; border-radius: 16px; padding: 16px 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.15); max-width: 240px; opacity: 0; transform: translateY(10px) scale(0.95); transition: all 0.3s cubic-bezier(0.4,0,0.2,1); pointer-events: none; border: 1px solid #e2e8f0; }',
            '#whatsapp-float .wpp-bubble.show { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }',
            '#whatsapp-float .wpp-bubble::after { content: ""; position: absolute; bottom: -8px; right: 24px; width: 16px; height: 16px; background: #fff; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; transform: rotate(45deg); }',
            '#whatsapp-float .wpp-bubble-title { font-size: 13px; font-weight: 700; color: #002855; margin-bottom: 4px; line-height: 1.3; }',
            '#whatsapp-float .wpp-bubble-text { font-size: 12px; color: #64748b; line-height: 1.4; }',
            '#whatsapp-float .wpp-btn { width: 60px; height: 60px; border-radius: 50%; background: #25D366; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(37,211,102,0.4); transition: transform 0.2s, box-shadow 0.2s; position: relative; }',
            '#whatsapp-float .wpp-btn:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(37,211,102,0.5); }',
            '#whatsapp-float .wpp-btn:active { transform: scale(0.95); }',
            '#whatsapp-float .wpp-btn svg { width: 32px; height: 32px; fill: #fff; }',
            '#whatsapp-float .wpp-pulse { position: absolute; inset: -4px; border-radius: 50%; border: 2px solid #25D366; animation: wpp-ping 2s cubic-bezier(0,0,0.2,1) infinite; }',
            '@keyframes wpp-ping { 0% { opacity: 0.8; transform: scale(1); } 100% { opacity: 0; transform: scale(1.5); } }',
            '#whatsapp-float .wpp-close { position: absolute; top: -6px; right: -6px; width: 20px; height: 20px; border-radius: 50%; background: #f1f5f9; border: 1px solid #e2e8f0; font-size: 11px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #64748b; transition: background 0.2s; }',
            '#whatsapp-float .wpp-close:hover { background: #e2e8f0; }',
            '@media (max-width: 640px) { #whatsapp-float { bottom: 16px; right: 16px; } #whatsapp-float .wpp-bubble { max-width: 200px; right: -8px; } }'
        ].join('\n');
        document.head.appendChild(style);

        // WhatsApp SVG icon
        var whatsappSVG = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';

        container.innerHTML = [
            '<div class="wpp-bubble" id="wpp-bubble">',
            '  <button class="wpp-close" id="wpp-bubble-close" aria-label="' + (isEnglish ? 'Close' : 'Cerrar') + '">&times;</button>',
            '  <div class="wpp-bubble-title">' + LABEL_TEXT + '</div>',
            '  <div class="wpp-bubble-text">' + CTA_TEXT + '</div>',
            '</div>',
            '<a href="' + url + '" target="_blank" rel="noopener noreferrer" class="wpp-btn" aria-label="WhatsApp" title="' + (isEnglish ? 'Chat with us' : 'Escríbenos') + '">',
            '  <span class="wpp-pulse"></span>',
            '  ' + whatsappSVG,
            '</a>'
        ].join('\n');

        document.body.appendChild(container);

        // Show bubble after 4 seconds
        var bubble = document.getElementById('wpp-bubble');
        var closeBtn = document.getElementById('wpp-bubble-close');
        var STORAGE_KEY = 'ipul_wpp_bubble_closed';

        // Don't show bubble if user already closed it this session
        if (!sessionStorage.getItem(STORAGE_KEY)) {
            setTimeout(function() {
                bubble.classList.add('show');
            }, 4000);

            // Auto-hide after 12 seconds
            setTimeout(function() {
                bubble.classList.remove('show');
            }, 16000);
        }

        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            bubble.classList.remove('show');
            sessionStorage.setItem(STORAGE_KEY, '1');
        });
    }

    // Init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createButton);
    } else {
        createButton();
    }
})();
