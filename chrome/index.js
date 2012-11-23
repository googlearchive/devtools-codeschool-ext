if (location.protocol === 'chrome-devtools:') (function(){

    console.log('Code School extension initialized');

    window.addEventListener('message', function(event) {
        if (event.origin !== 'chrome-devtools://devtools') {
            return;
        }

        // TODO: send to background page
    }, false);

    // http://stackoverflow.com/a/4854189/16185
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = chrome.extension.getURL('codeschool.js');
    (document.head || document.body || document.documentElement).appendChild(script);

})();

//@ sourceURL=index.js
