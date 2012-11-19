/**
 * @param {string} name
 * @param {Object=} data
 */
function emitAction(name, data) {
    console.log({
        action: name,
        date: Date.now(),
        data: data || null
    })
}


var _callbacks = {};

(function monkeypatchImportScript() {
    var originalImportScript = window.importScript;

    /**
     * @param {string} scriptName
     */
    window.importScript = function(scriptName) {
        if (_importedScripts[scriptName]) {
            return;
        }

        originalImportScript.apply(this, arguments);

        if (_callbacks[scriptName]) {
            _callbacks[scriptName].forEach(function(callback) {
                callback();
            })
        }
    }
})();


runAfter('WebInspector.ElementsPanel.prototype._setPseudoClassForNodeId', ['ElementsPanel.js'], function _setPseudoClassForNodeId(nodeId, pseudoClass, enable) {
    if (!enable)
        return;

    var node = WebInspector.domAgent.nodeForId(nodeId);
    if (!node)
        return;

    var id = node.getAttribute("id");
    emitAction("forcedElementState", {
        id: id,
        state: pseudoClass
    });
});


runAfter('WebInspector.UISourceCode.prototype.commitWorkingCopy', ['UISourceCode.js'], function() {
    emitAction('fileSaved', {url: this.url});
});


runAfter('WebInspector.ProfilerDispatcher.prototype.addProfileHeader', ['ProfilesPanel.js'], function addProfileHeader(profile) {
    switch (profile.typeId) {
        case 'CPU':
            emitAction('cpuProfile');
            break;
        case 'HEAP':
            emitAction('heapSnapshot');
            break;
    }
});


runAfter('WebInspector.TimelineModel.prototype.startRecord', ['TimelineModel.js'], function() {
    emitAction('timelineSnapshot');
});


runAfter('WebInspector.HeapSnapshotView', ['HeapSnapshotView.js'], function() {
    var select = this.filterSelectElement;
    var index = select.selectedIndex;
    if (index > 1) {
        // "Objects allocated between A and B" items come after the 2nd one.
        // Doing something like label.indexOf("Objects allocated between") is a bad idea since UI messages could be not in English.
        emitAction('heapSnapshotBetween', {
            label: select[index].label
        });
    }
});


runAfter('WebInspector.ScriptsPanel.prototype._toggleFormatSource', ['ScriptsPanel.js'], function() {
    emitAction('prettyPrint', {
        enabled: this._toggleFormatSourceButton.toggled,
        url: this._editorContainer.currentFile().url
    });
});


runAfter('WebInspector.ScriptsPanel.prototype._togglePauseOnExceptions', ['ScriptsPanel.js'], function() {
    if (typeof this._pauseOnExceptionButton.state !== 'string') {
        throw new Error('WebInspector.ScriptsPanel#_pauseOnExceptionButton.state must be a string');
    }
    emitAction('pauseOnException', {
        state: this._pauseOnExceptionButton.state
    })
});


/**
 * @param {string} methodPath
 * @param {Array.<string>} dependentFiles
 * @param {Function} hook
 */
function runAfter(methodPath, dependentFiles, hook) {

    function callback() {
        var matched = methodPath.match(/(.+?).([^.]+)$/);
        var base = resolvePath(matched[1]).data;
        var lastKey = matched[2];

        var originalMethod = base[lastKey];
        base[lastKey] = function monkeyPatched() {
            originalMethod.apply(this, arguments);
            hook.apply(this, arguments);
        };
    }

    if (isPathDefined(methodPath)) {
        callback();
    } else {
        // File that have a method isn’t yet loaded
        var loadedFilesCount = 0;
        for (var i = 0; i < dependentFiles.length; i++) {
            var fileName = dependentFiles[i];
            if (_importedScripts[fileName]) {
                loadedFilesCount++;
            } else {
                if (!_callbacks[fileName]) {
                    _callbacks[fileName] = [];
                }
                _callbacks[fileName].push(callback);
            }
        }

        if (loadedFilesCount === dependentFiles.length) {
            throw new Error(JSON.stringify(methodPath) + ' is not present in ' + JSON.stringify(dependentFiles));
        }
    }
}


/**
 * @param {string} path
 * @return {Object|null}
 */
function resolvePath(path) {
    var obj = window;
    var keys = path.split('.');
    var key = '';
    while (key = keys.shift()) {
        if (obj.hasOwnProperty(key)) {
            obj = obj[key];
        } else {
            console.debug(obj, JSON.stringify(key) + ' is not present');
            return null;
        }
    }
    return {data: obj};
}


/**
 * @param {string} path such as 'WebInspector.ElementsPanel.prototype._setPseudoClassForNodeId'
 * @return {boolean}
 */
function isPathDefined(path) {
    return !!resolvePath(path);
}
