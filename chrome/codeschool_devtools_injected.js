(function() {

    var DEBUG = true;

    checkInspectedPage();

    function checkInspectedPage() {
        var scripts = document.scripts;
        for (var i = scripts.length; i--;) {
            var script = scripts[i];
            if (script.src && script.src.endsWith('codeschool_devtools_injected.js')) {
                var url = script.dataset.url;
                if (url === WebInspector.inspectedPageURL) {
                    setupListeners();
                } else {
                    console.warn('None of DevTools instances inspect Code School page');
                }
                break;
            }
        }
    }

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


        // Force to load ProfilesPanel.js
        var profiles = WebInspector.panel('profiles');

        var cpuProfileType_buttonClicked = WebInspector.CPUProfileType.prototype.buttonClicked;
        if (cpuProfileType_buttonClicked) {
            WebInspector.CPUProfileType.prototype.buttonClicked = function() {
                if (this._recording) {
                    emitAction({
                        action: 'profileAdded',
                        type: 'CPU'
                    });
                }
                return cpuProfileType_buttonClicked.apply(this, arguments);
            }
        } else {
            console.warn('WebInspector.CPUProfileType.prototype.buttonClicked is missing');
        }

        var heapSnapshotProfileType_buttonClicked = WebInspector.HeapSnapshotProfileType.prototype.buttonClicked;
        if (heapSnapshotProfileType_buttonClicked) {
            WebInspector.HeapSnapshotProfileType.prototype.buttonClicked = function(profilesPanel) {
                emitAction({
                    action: 'profileAdded',
                    type: 'HEAP'
                });
                return heapSnapshotProfileType_buttonClicked.apply(this, arguments);
            }
        } else {
            console.warn('WebInspector.HeapSnapshotProfileType.prototype.buttonClicked is missing');
        }

        // Works in dev and canary, but not in stable (25.0.1364.172)
        /*
        var ProfilesPanel_setRecordingProfile = WebInspector.ProfilesPanel.prototype.setRecordingProfile;
        if (ProfilesPanel_setRecordingProfile) {
            WebInspector.ProfilesPanel.prototype.setRecordingProfile = function(profileType, isProfiling) {
                ProfilesPanel_setRecordingProfile.apply(this, arguments);
                if (profileType === 'HEAP' || isProfiling === false) {
                    emitAction({
                        action: 'profileAdded',
                        type: profileType
                    });
                }
            }
        } else {
            console.warn('WebInspector.ProfilesPanel.prototype.setRecordingProfile is missing');
        }
        */

        var HeapSnapshotView_onSelectedViewChanged = WebInspector.HeapSnapshotView.prototype._onSelectedViewChanged;
        if (HeapSnapshotView_onSelectedViewChanged) {
            WebInspector.HeapSnapshotView.prototype._onSelectedViewChanged = function(event) {
                HeapSnapshotView_onSelectedViewChanged.apply(this, arguments);

                    var target = event.target;
                    var label = target[target.selectedIndex].label;
                    emitAction({
                        action: 'heapSnapshotViewChange',
                        label: label
                    });
            };
        } else {
            console.warn('WebInspector.HeapSnapshotView.prototype._onSelectedViewChanged is missing');
        }


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
