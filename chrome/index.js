if (location.protocol === 'chrome-devtools:') {
    console.log('Code School extension initialized');
    loadScript('codeschool.js');
}


function runTests() {
    loadScript('jquery.js');
    loadScript('tests.js');
}

/**
 * @param {string} name
 * @see http://stackoverflow.com/a/4854189/16185
 */
function loadScript(name, callback) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = chrome.extension.getURL(name);
	script.defer = true;
    (document.head || document.body || document.documentElement).appendChild(script);

    if (callback)
        script.addEventListener('load', callback, false);
}


//@ sourceURL=index.js
