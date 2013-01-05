var DEBUG = true;

var pagesDict = {};

chrome.extension.onMessage.addListener(function(request, sender) {
    if (request.action === 'enable') {
        console.log('enabled!');
        pagesDict[request.url] = true;
        chrome.extension.onConnect.addListener(function(port) {
            port.postMessage({command: 'initialize'});
            port.onMessage.addListener(function(msg) {
                console.log('msg', msg);
            });
        });
    } else if (request.action === 'disable') {
        console.log('disabled');
        pagesDict[request.url] = null;
    }

    if (request.command === 'emit') {
        if (pagesDict[request.url] || DEBUG) {
            console.log('emit', request.data);
            // Send it to Code School receiver page
        }
    }
});
