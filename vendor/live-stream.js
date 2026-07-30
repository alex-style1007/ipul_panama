/**
 * IPUL Panamá - YouTube Live Stream Detector
 * Automatically shows a floating "EN VIVO" badge when the channel is streaming.
 * Clicking opens a modal with the live embed.
 * Channel: UC354PShjntO12bFYBdkphdg (@IPULPANAMA)
 */
(function() {
    'use strict';

    var CHANNEL_ID = 'UC354PShjntO12bFYBdkphdg';
    var CHECK_INTERVAL = 60000; // Check every 60 seconds
    var EMBED_URL = 'https://www.youtube.com/embed/live_stream?channel=' + CHANNEL_ID + '&autoplay=1';

    function createBadge() {
        if (document.getElementById('live-badge')) return;

        var badge = document.createElement('button');
        badge.id = 'live-badge';
        badge.setAttribute('aria-label', 'Ver transmisión en vivo');
        badge.innerHTML = 
            '<span style="display:inline-block;width:8px;height:8px;background:#ef4444;border-radius:50%;animation:pulse-live 1.5s infinite;margin-right:8px"></span>' +
            '<span style="font-weight:700;font-size:13px;letter-spacing:0.5px">EN VIVO</span>';
        badge.style.cssText = 'position:fixed;top:24px;right:24px;z-index:9999;background:#fff;color:#dc2626;border:2px solid #dc2626;border-radius:50px;padding:10px 18px;display:flex;align-items:center;cursor:pointer;box-shadow:0 4px 20px rgba(220,38,38,0.3);transition:transform 0.2s,box-shadow 0.2s;font-family:Inter,sans-serif';

        badge.addEventListener('mouseenter', function() {
            badge.style.transform = 'scale(1.05)';
            badge.style.boxShadow = '0 6px 30px rgba(220,38,38,0.4)';
        });
        badge.addEventListener('mouseleave', function() {
            badge.style.transform = 'scale(1)';
            badge.style.boxShadow = '0 4px 20px rgba(220,38,38,0.3)';
        });
        badge.addEventListener('click', openModal);

        // Pulse animation
        var style = document.createElement('style');
        style.textContent = '@keyframes pulse-live{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.8)}}';
        document.head.appendChild(style);

        document.body.appendChild(badge);
    }

    function removeBadge() {
        var badge = document.getElementById('live-badge');
        if (badge) badge.remove();
    }

    function openModal() {
        if (document.getElementById('live-modal')) return;

        var overlay = document.createElement('div');
        overlay.id = 'live-modal';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px)';

        overlay.innerHTML = 
            '<div style="position:relative;width:100%;max-width:900px;aspect-ratio:16/9;background:#000;border-radius:12px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.5)">' +
                '<iframe src="' + EMBED_URL + '" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen></iframe>' +
                '<button id="close-live-modal" style="position:absolute;top:12px;right:12px;width:36px;height:36px;background:rgba(0,0,0,0.7);color:#fff;border:none;border-radius:50%;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:10" aria-label="Cerrar">&times;</button>' +
            '</div>';

        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        document.getElementById('close-live-modal').addEventListener('click', closeModal);
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) closeModal();
        });
        document.addEventListener('keydown', escHandler);
    }

    function closeModal() {
        var modal = document.getElementById('live-modal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
            document.removeEventListener('keydown', escHandler);
        }
    }

    function escHandler(e) {
        if (e.key === 'Escape') closeModal();
    }

    function checkIfLive() {
        // Use a hidden iframe to check if the channel is live
        // The live_stream embed returns a playable video if live, error if not
        var testFrame = document.createElement('iframe');
        testFrame.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;top:-9999px';
        testFrame.src = 'https://www.youtube.com/embed/live_stream?channel=' + CHANNEL_ID;
        
        document.body.appendChild(testFrame);

        // YouTube embed posts a message or we can check via fetch
        // Alternative: fetch the channel page and look for "isLiveBroadcast"
        fetch('https://www.youtube.com/channel/' + CHANNEL_ID + '/live', { mode: 'no-cors' })
            .then(function() {
                // no-cors doesn't give us content, fallback to showing badge
                // We'll use the oembed API instead
                testFrame.remove();
                checkViaOembed();
            })
            .catch(function() {
                testFrame.remove();
                checkViaOembed();
            });
    }

    function checkViaOembed() {
        var liveUrl = 'https://www.youtube.com/channel/' + CHANNEL_ID + '/live';
        
        fetch('https://www.youtube.com/oembed?url=' + encodeURIComponent(liveUrl) + '&format=json')
            .then(function(r) {
                if (r.ok) {
                    return r.json();
                }
                throw new Error('not live');
            })
            .then(function(data) {
                // If oembed returns data, channel has a live/upcoming video
                if (data && data.title) {
                    createBadge();
                } else {
                    removeBadge();
                }
            })
            .catch(function() {
                removeBadge();
            });
    }

    // Initial check on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            checkViaOembed();
            setInterval(checkViaOembed, CHECK_INTERVAL);
        });
    } else {
        checkViaOembed();
        setInterval(checkViaOembed, CHECK_INTERVAL);
    }
})();
