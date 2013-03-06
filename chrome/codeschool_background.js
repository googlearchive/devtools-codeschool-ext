var isEnabled = false;
var url = '';
var devToolsPort = null;
var tutorialPort = null;

chrome.extension.onConnect.addListener(function(port) {
    if (port.name === 'tutorial') {
        tutorialPort = port;
        port.onMessage.addListener(function(msg) {
            if (msg.action === 'enable') {
                isEnabled = true;
                url = msg.url;
                if (devToolsPort) {
                    initialize();
                }
            } else if (msg.action === 'disable') {
                isEnabled = false;
                url = '';
                port.disconnect();
            }
        })
    }

    if (port.name === 'devtools') {
        console.info('DevTools port opened %d', port.portId_);
        // FIXME: portId_ is different for every new instance of DevTools. This might cause a memory leak.
        devToolsPort = port;
        if (isEnabled) {
            initialize();
        }

        port.onMessage.addListener(function(msg) {
            if (!tutorialPort) {
                throw new Error('tutorialPort hasn\'t been open');
            }
            if (!msg.data) {
                throw new Error('"data" property is missing');
            }
            tutorialPort.postMessage(msg.data);
        });
    }
});


function initialize() {
    devToolsPort.postMessage({
        command: 'initialize',
        url: url
    });
}


(function onInstall() {
    var details = chrome.app.getDetails();
    var content_scripts = details.content_scripts;
    content_scripts.forEach(function(script) {
        script.matches.forEach(function(match) {
            if (match === '<all_urls>') {
                match = 'chrome-devtools://devtools/';
            }
            chrome.tabs.query({url: match}, function(tabs) {
                console.log('tabs', tabs);
                tabs.forEach(function(tab) {
                    script.js.forEach(function(jsFile) {
                        chrome.tabs.executeScript(tab.id, {file: jsFile}, function() {
                            console.log('executed', match, jsFile);
                        });
                    });
                });
            });
        });
    });
})();
