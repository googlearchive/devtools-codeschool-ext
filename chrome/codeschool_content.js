window.addEventListener('message', function(event) {
    // We only accept messages from ourselves
    if (event.source != window)
        return;

    var data = event.data;
    if (!data.command || !data.url) {
        return;
    }

    if (data.command === 'codeschool.enable') {
        chrome.extension.sendMessage({
            url: data.url,
            action: 'enable'
        });
    } else if (data.command === 'codeschool.disable') {
        chrome.extension.sendMessage({
            url: data.url,
            action: 'disable'
        });
    }
}, false);
