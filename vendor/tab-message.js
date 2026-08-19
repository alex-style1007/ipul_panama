/**
 * IPUL Panamá - Tab Visibility Message
 * Shows a warm message in the browser tab when the user switches away.
 */
(function() {
    'use strict';

    var originalTitle = document.title;
    var isEnglish = document.documentElement.lang === 'en';

    var messages = isEnglish
        ? ['🙏 We are waiting for you...', '✝️ God loves you', '📖 Come back, there is a verse for you']
        : ['🙏 Te esperamos...', '✝️ Dios te ama', '📖 Vuelve, hay un versículo para ti'];

    var currentIndex = 0;
    var intervalId = null;

    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            document.title = messages[0];
            currentIndex = 0;
            intervalId = setInterval(function() {
                currentIndex = (currentIndex + 1) % messages.length;
                document.title = messages[currentIndex];
            }, 3000);
        } else {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
            document.title = originalTitle;
        }
    });
})();
