window.addEventListener('message', function(event) {
    // We only accept messages from ourselves
    if (event.source != window)
        return;

    if (!event.data || !event.data.action)
        return;

    if (event.data.action === 'codeschool.enable') {
        chrome.extension.sendMessage({action: 'enable'});
    } else if (event.data.action === 'codeschool.disable') {
        chrome.extension.sendMessage({action: 'disable'});
    }
}, false);

