window.addEventListener('message', function(event) {
    // We only accept messages from ourselves
    if (event.source != window)
        return;

    var data = event.data;
    if (!data.command || !data.url) {
        return;
    }

    var port = null;
    if (data.command === 'codeschool.enable') {
        port = chrome.extension.connect({name: 'tutorial'});
        port.postMessage({
            url: data.url,
            action: 'enable'
        });
        port.onMessage.addListener(onMessageFromBackgroundPage);
    } else if (data.command === 'codeschool.disable' && port) {
        port.postMessage({
            url: data.url,
            action: 'disable'
        });
        port.disconnect();
        port = null;
    }
}, false);


function onMessageFromBackgroundPage(msg) {
    window.postMessage({
        msg: msg,
        action: 'devtools.event'
    }, '*')
}
