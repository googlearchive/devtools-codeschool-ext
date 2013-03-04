if (location.protocol === 'chrome-devtools:') (function() {

    console.log('Code School extension initialized');

    var port = chrome.extension.connect({name: "devtools"});
    port.onMessage.addListener(function(msg) {
        console.log('port', msg);
        if (msg.command == 'initialize') {
            if (!msg.url) {
                throw new Error('url is missing');
            }
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = chrome.extension.getURL('codeschool_devtools_injected.js');
            script.dataset.url = msg.url;
            (document.head || document.body || document.documentElement).appendChild(script);
        }
    });

    window.addEventListener('message', function(event) {
        console.log('message', event);
        if (event.data && event.data.command === 'emit') {
            port.postMessage(event.data);
        }
    }, false);

})();

//@ sourceURL=codeschool_devtools.js
