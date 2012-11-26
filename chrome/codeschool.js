function emitAction(data) {
    console.log(data);
    data.date = Date.now();
    var code = 'window.devToolsCallback(' + JSON.stringify(data) + ')';
    runtimeEval(code);
}

/**
 * eval in web page context, e.g. CodeSchool page
 * @param {string} expression
 */
function runtimeEval(expression) {
    // https://developers.google.com/chrome-developer-tools/docs/protocol/1.0/runtime#command-evaluate
    RuntimeAgent.evaluate(
            expression,
            /*objectGroup*/ '',
            /*includeCommandLineAPI*/ false,
            /*doNotPauseOnExceptionsAndMuteConsole*/ false,
            undefined,
            /*returnByValue*/ false,
            /*generatePreview*/ false,
            function evalCallback(result, meta, wasThrown) {
                if (wasThrown) {
                    console.warn(result);
                }
            });
}


WebInspector.notifications.addEventListener(WebInspector.UserMetrics.UserAction, function(event) {
    emitAction(event.data);
});


WebInspector.panel('profiles').addEventListener('profile added', function(event) {
    emitAction({
        action: 'profileAdded',
        type: event.data.type
    });
});


var inspectorLoadedHandlers = [];

function listenTimeline() {
    WebInspector.timelineManager.addEventListener(WebInspector.TimelineManager.EventTypes.TimelineStarted, function() {
        emitAction({
            action: 'timelineSnapshot'
        });
    });
}

if (WebInspector.timelineManager) {
    listenTimeline();
} else {
    inspectorLoadedHandlers.push(listenTimeline);
}


function listenSettings() {
    WebInspector.settings.pauseOnExceptionStateString.addChangeListener(function(event) {
        emitAction({
            action: 'pauseOnException',
            state: event.data
        });
    });
}

if (WebInspector.settings && WebInspector.settings.pauseOnExceptionStateString) {
    listenSettings();
} else {
    inspectorLoadedHandlers.push(listenTimeline);
}


inspectorLoadedHandlers.forEach(function(handler) {
    WebInspector.notifications.addEventListener(WebInspector.Events.InspectorLoaded, handler);
});


//@ sourceURL=codeschool.js
