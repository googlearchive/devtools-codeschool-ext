var pagesDict = {};


chrome.extension.onMessage.addListener(function(request, sender) {
    console.log(request, sender);
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
        console.log('emit', request.data);
        if (pagesDict[request.url]) {
            // Send it to Code School receiver page
        }
    }
});
