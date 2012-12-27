window.addEventListener('message', function(event) {
    // We only accept messages from ourselves
    if (event.source != window)
        return;

    if (!event.data || !event.data.command)
        return;

    if (event.data.command === 'codeschool.enable') {
        chrome.extension.sendMessage({action: 'enable'});
    } else if (event.data.command === 'codeschool.disable') {
        chrome.extension.sendMessage({action: 'disable'});
    }
}, false);

