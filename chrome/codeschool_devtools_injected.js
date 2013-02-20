(function() {

    var DEBUG = true;

    setupListeners();

    function setupListeners() {
        WebInspector.notifications.addEventListener(WebInspector.UserMetrics.UserAction, function(event) {
            var data = event.data;
            switch (data.action) {
                case 'forcedElementState':
                    emitAction(data, ['enabled', 'selector', 'state']);
                    break;

                case 'fileSaved':
                case 'revertRevision':
                case 'applyOriginalContent':
                case 'networkRequestSelected':
                    emitAction(data, ['url']);
                    break;

                case 'openSourceLink':
                    emitAction(data, ['url', 'lineNumber']);
                    break;

                case 'togglePrettyPrint':
                    emitAction(data, ['url', 'enabled']);
                    break;

                case 'setBreakpoint':
                    emitAction(data, ['url', 'line', 'enabled']);
                    break;

                case 'networkSort':
                    emitAction(data, ['column', 'sortOrder']);
                    break;

                case 'networkRequestTabSelected':
                    emitAction(data, ['url', 'tab']);
                    break;

                case 'heapSnapshotFilterChanged':
                    emitAction(data, ['label']);
                    break;

                default:
                    if (DEBUG) {
                        console.warn(JSON.stringify(data.action) + ' is ignored. ', data);
                    }
                    break;
            }
        });

        WebInspector.panel('profiles').addEventListener('profile added', function(event) {
            emitAction({
                action: 'profileAdded',
                type: event.data.type
            });

            if (event.data.type === 'HEAP') {
                var profiles = event.target._profiles;
                if (profiles.length === 0) {
                    return;
                }
                var lastProfile = profiles[profiles.length - 1];
                var view = lastProfile.view();
                var viewSelectElement = view.viewSelectElement;
                viewSelectElement.addEventListener('change', function(event) {
                    var target = event.target;
                    var label = target[target.selectedIndex].label;
                    emitAction({
                        action: 'heapSnapshotViewChange',
                        label: label
                    })
                });
            }
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

    function emitAction(data, allowedProperties) {
        if (!allowedProperties) {
            var object = data;
        } else {
            object = {action: data.action};
            for (var i = 0; i < allowedProperties.length; i++) {
                var key = allowedProperties[i];
                object[key] = data[key];
            }
        }
        window.postMessage({
            command: 'emit',
            url: WebInspector.inspectedPageURL,
            data: object
        }, '*');
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


//@ sourceURL=codeschool_devtools_injected.js
