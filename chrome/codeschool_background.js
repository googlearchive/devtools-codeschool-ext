chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    console.log(request, sender);
    if (request.action === 'enable') {
        console.log('enabled!');
        chrome.extension.onConnect.addListener(function(port) {
            port.postMessage({command: 'initialize'});
            port.onMessage.addListener(function(msg) {
                console.log('msg', msg);
            });
        });
    }

    if (request.command === 'emit') {
        console.log('emit', request.data);
        // Send it to Code School receiver page
    }
});
