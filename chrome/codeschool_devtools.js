if (location.protocol === 'chrome-devtools:') (function() {

    console.log('Code School extension initialized');

    window.addEventListener('message', function(event) {
        console.log('message', event);
        if (event.data && event.data.command === 'emit') {
            chrome.extension.sendMessage(event.data);
        }
    }, false);

    var isInitialized = false;
    var port = chrome.extension.connect({name: "devtools"});
    port.onMessage.addListener(function(msg) {
        console.log('port', msg);
        if (msg.command == 'initialize') {
            if (isInitialized) {
                throw new Error('already initialized');
            }
            isInitialized = true;
            // http://stackoverflow.com/a/4854189/16185
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = chrome.extension.getURL('codeschool_devtools_injected.js');
            (document.head || document.body || document.documentElement).appendChild(script);
        }
    });

    chrome.extension.sendMessage({command: 'loaded'});

})();

//@ sourceURL=codeschool_devtools.js
