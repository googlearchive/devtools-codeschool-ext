var port = null;

window.addEventListener('message', function(event) {
    var data = event.data;
    if (!data.command || !data.url) {
        return;
    }

    if (data.command === 'devtools.enableUserEvents') {
        port = chrome.extension.connect({name: 'tutorial'});
        port.postMessage({
            url: data.url,
            action: 'enable'
        });
        port.onMessage.addListener(onMessageFromBackgroundPage);
    } else if (data.command === 'devtools.disableUserEvents' && port) {
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
        action: 'devtools.userEvent'
    }, '*')
}
