if (location.protocol === 'chrome-devtools:') (function(){

    console.log('Code School extension initialized');

    // http://stackoverflow.com/a/4854189/16185
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = chrome.extension.getURL('codeschool.js');
    (document.head || document.body || document.documentElement).appendChild(script);

    window.addEventListener('message', function(event) {
        if (event.data && event.data.from === 'devtools') {
            chrome.extension.sendMessage(event.data);
        }
    }, false);

})();

//@ sourceURL=index.js
