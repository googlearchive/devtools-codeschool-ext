(function() {

    var DEBUG = true;
    setupListeners();

    function setupListeners() {
        WebInspector.notifications.addEventListener(WebInspector.UserMetrics.UserAction, function(event) {
            if (!event.data.action) {
                return;
            }
            switch (event.data.action) {
                case 'forcedElementState':
                case 'fileSaved':
                case 'revertRevision':
                case 'applyOriginalContent':
                case 'togglePrettyPrint':
                case 'setBreakpoint':
                case 'openSourceLink':
                case 'networkSort':
                case 'networkRequestSelected':
                case 'networkRequestTabSelected':
                case 'heapSnapshotFilterChanged':
                    emitAction(event.data);
                    break;
                default:
                    if (DEBUG) {
                        console.warn(JSON.stringify(event.data.action) + ' is ignored. ', event.data);
                    }
                    break;
            }
        });

        WebInspector.panel('profiles').addEventListener('profile added', function(event) {
            emitAction({
                action: 'profileAdded',
                type: event.data.type
            });
        });
        WebInspector.timelineManager.addEventListener(WebInspector.TimelineManager.EventTypes.TimelineStarted, function() {
            emitAction({
                action: 'timelineStarted'
            });
        });
        WebInspector.timelineManager.addEventListener(WebInspector.TimelineManager.EventTypes.TimelineStopped, function() {
            emitAction({
                action: 'timelineStopped'
            });
        });
        WebInspector.settings.consoleHistory.addChangeListener(function(event) {
            var data = event.data;
            if (!data || !data.length)
                return;
            var lastItem = data[data.length - 1];
            emitAction({
                action: 'consoleUserInput',
                data: lastItem
            });
        });
        WebInspector.settings.pauseOnExceptionStateString.addChangeListener(function(event) {
            emitAction({
                action: 'pauseOnException',
                state: event.data
            });
        });
    }

    function emitAction(data) {
        window.postMessage({command: 'emit', data: data}, '*');
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
            function evalCallback(x, result, wasThrown) {
                if (wasThrown) {
                    console.warn(result);
                }
            }
        );
    }

})();


//@ sourceURL=codeschool.js
