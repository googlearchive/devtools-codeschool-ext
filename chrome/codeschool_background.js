var isEnabled = false;
var url = '';
var devToolsPort = null;

chrome.extension.onConnect.addListener(function(port) {
    if (port.name === 'tutorial') {
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
        if (isEnabled)
            initialize();
    }
});


function initialize() {
    devToolsPort.postMessage({
        command: 'initialize',
        url: url
    });
}
