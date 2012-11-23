WebInspector.notifications.addEventListener(WebInspector.UserMetrics.UserAction, function(event) {
    emitAction(event.data);
});


WebInspector.notifications.addEventListener(WebInspector.Events.InspectorLoaded, function() {
    WebInspector.timelineManager.addEventListener(WebInspector.TimelineManager.EventTypes.TimelineStarted, function() {
        emitAction({
            action: 'timelineSnapshot'
        });
    });

    WebInspector.settings.pauseOnExceptionStateString.addChangeListener(function(event) {
        emitAction({
            action: 'pauseOnException',
            state: event.data
        });
    });

    WebInspector.panel('profiles').addEventListener('profile added', function(event) {
        emitAction({
            action: 'profileAdded',
            type: event.data.type
        });
    });
});


function emitAction(data) {
    console.log(data);
    window.postMessage(data, 'chrome-devtools://devtools');
}


//@ sourceURL=codeschool.js
