var urlsSet = {};

chrome.extension.onMessage.addListener(function(request, sender) {
    console.log(request.url, request.action);

    if (request.action === 'enable') {
        console.log('enabled!');
        urlsSet[request.url] = true;
        chrome.extension.onConnect.addListener(function(port) {
            port.postMessage({
                command: 'initialize',
                urlsSet: urlsSet
            });
            port.onMessage.addListener(function(msg) {
                console.log('msg', msg);
            });
        });
    } else if (request.action === 'disable') {
        console.log('disabled');
        urlsSet[request.url] = null;
    }

    if (request.command === 'emit') {
        if (urlsSet[request.url]) {
            console.log('emit', request.data);
            // Send it to Code School receiver page
        }
    }
});
