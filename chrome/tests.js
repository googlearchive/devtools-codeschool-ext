Syn.autoDelay = true;


Element.prototype.trigger = function(eventName, options) {
    if (!options) {
        options = {};
    }
    if (eventName === 'click' || eventName == 'mousedown') {
        var event = document.createEvent("MouseEvents");
        event.initMouseEvent(eventName, true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    } else if (eventName === 'keypress') {
        event = document.createEvent("MouseEvents");
        event.initKeyEvent('keypress', true, true, null, false, false, false, false, 9, 13);
    } else if (eventName === 'textInput') {
        event = document.createEvent('TextEvent');
        event.initTextEvent(
            eventName,
            options.bubbles || false,
            options.cancelable || true,
            options.view || null,
            options.data || '\n',
            0
        );
    } else {
        event = document.createEvent('HTMLEvents');
        event.initEvent(eventName, true, false);
    }
    this.dispatchEvent(event);
};

Element.prototype.triggerKey = function(options) {
    var event = document.createEvent("KeyboardEvent");
    if (!options) {
        options = {};
    }
    event.initKeyboardEvent(
            options.type || 'keypress',
            options.bubbles || false,
            options.cancelable || true,
            options.view || null,
            options.ctrlKey || false,
            options.altKey || false,
            options.shiftKey || false,
            options.metaKey || false,
            options.keyCode || 0,
            options.charCode || 0);
    return this.dispatchEvent(event);
};

Element.prototype.type = function() {
    // TODO
};

function diffObjects(a, b) {
    var changed = [];
    var deleted = Object.keys(a).filter(function(key) {
        if (b.hasOwnProperty(key)) {
            if (a[key] != b[key]) {
                changed.push(key);
            }
            return false;
        } else {
            return true;
        }
    });

    var added = Object.keys(b).filter(function(key) {
        return !a.hasOwnProperty(key);
    });

    return {
        deleted: deleted,
        added: added,
        changed: changed
    };
}


function deepEqual(a, b) {
    if (a === b) {
        return true;
    }

    if (typeof a !== 'object' && typeof b !== 'object') {
        return false;
    }

    var aKeys = Object.keys(a);
    var bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) {
        return false;
    }

    for (var i = 0; i < aKeys.length; i++) {
        var key = aKeys[i];
        if (a[key] !== b[key]) {
            return false;
        }
    }

    return true;
}


var actual = null;
function emitAction(data) {
    actual = data;
}
window.emitAction = emitAction;


function expectSoon(expected) {
    wait(function() {
        expect(expected);
    });
}

function expect(expected) {
    var isOk = deepEqual(expected, actual);
    if (isOk) {
        console.log('PASS', expected.action);
    } else {
        console.warn('FAIL', expected, actual);
    }

    /*
    var diff = diffObjects(expected, actual);
    var out = [];
    if (diff.deleted.length) {
        out.push('Missing keys: ' + diff.deleted.join(', '))
    }
    if (diff.added.length) {
        out.push('Added keys: ' + diff.added.join(', '))
    }
    if (diff.changed.length) {
        var changed = 'Changed:\n';
        for (var i = 0; i < diff.changed.length; i++) {
            var key = diff.changed[i];
            changed += diff.changed[i] + ' Expected: ' + JSON.stringify(expected[key]) + ' Actual: ' + JSON.stringify(actual[key]) + '\n';
        }
        out.push(changed);
    }
    var result = out.join('');
    if (result) {
        console.warn(result);
    } else {
        console.log('Pass');
    }
    */
}


function equal(actual, expected, message) {
    if (actual == expected) {
        if (message) {
            console.log('PASS', message);
        } else {
            console.log('PASS');
        }
    } else {
        if (message) {
            console.warn('FAIL', actual, expected, message);
        } else {
            console.warn('FAIL', actual, expected);
        }
    }
}


//TODO: Use Syn.then doesn't work. Figure out why
function wait(callback) {
    setTimeout(callback, 500);
}


function openElementsPanel(callback) {
    document.querySelector('#toolbar .toolbar-item.elements').trigger('click');
    setTimeout(callback, 500);
}


function openProfilesPanel(callback) {
    document.querySelector('#toolbar .toolbar-item.profiles').trigger('click');
    setTimeout(callback, 500);
}


function testProfileAdded() {
    Syn.click('#toolbar .toolbar-item.profiles')
        .click('[name="profile-type"]')
        .click('.control-profiling')
        .click(function() {
            expectSoon({
                action: 'profileAdded',
                type: 'CPU'
            })
        });
}


function testHeapSnapshot() {
    Syn.click('#toolbar .toolbar-item.profiles')
        .click('.profile-launcher-view-tree-item')
        .click('[name="profile-type"]:eq(2)')
        .click('.control-profiling', function() {
            expectSoon({
                action: 'profileAdded',
                type: 'HEAP'
            });
        })
        .click('.profile-launcher-view-tree-item')
        .click('.control-profiling')
        .click('.heap-snapshot-sidebar-tree-item')
        .click('select.status-bar-item:last', function() {
            var select = $('select.status-bar-item:last');
            select[0].selectedIndex = 2;
            select[0].trigger('change');
            //select.trigger('change');
            // jQuery's trigger does not work for some reason
            expectSoon({action: "heapSnapshotFilterChanged", label: "Objects allocated between Snapshots 1 and 2"} );
        });
}


function testTimelineSnapshot() {
    Syn.click('#toolbar .toolbar-item.timeline')
        .click('.record-profile-status-bar-item')
        .click(function() {
            expectSoon({
                action: 'timelineSnapshot'
            })
        });
}


function testForceState() {
    $('.pane-title-button.element-state').trigger('click').then(function() {
        $('.styles-element-state-pane input[type="checkbox"]').trigger('click').then(function() {
            expect({
                action: "forcedElementState",
                selector: "body",
                enabled: true,
                state: "active"
            });
        });
    });
}

function query(selector) {
    return document.querySelector(selector);
}


function queryAll(selector) {
    return document.querySelectorAll(selector);
}


function testClickResouceLinkandTogglePrettyPrint() {
    openElementsPanel(function() {
        query('.webkit-html-tag').trigger('mousedown');
        wait(function() {
            query('.webkit-html-resource-link').trigger('click');
            expect({
                action: 'openSourceLink',
                url: 'file:///Users/nv/Code/devtools-codeschool-ext/test/test.css',
                lineNumber: 0
            });
            wait(function() {
                query('.scripts-toggle-pretty-print-status-bar-item').trigger('click');
                expect({
                    action: "togglePrettyPrint",
                    enabled: true,
                    url: "file:///Users/nv/Code/devtools-codeschool-ext/test/test.css"
                });
                wait(function() {
                    query('.webkit-css-selector').textContent = 'HTML';
                    wait(function() {
                        // Save
                        Syn.click(query('.text-editor-contents .webkit-line-content'));
                        wait(function() {
                            query('.text-editor-contents > .inner-container').trigger('textInput', {
                                data: '\n'
                            });
                            wait(function() {
                                expect({
                                    action: 'fileSaved',
                                    url: 'file:///Users/nv/Code/devtools-codeschool-ext/test/test.css'
                                });
                                query('.text-editor-contents > .inner-container').trigger('contextmenu');
                                wait(function() {
                                    Syn.click($('.soft-context-menu-item').filter(function(i) {
                                        return this.textContent.indexOf('Local modifications...') !== -1;
                                    }));
                                    wait(function() {
                                        Syn.click(query('.revision-history-drawer > ol > .parent:not(.expanded)'));
                                        wait(function() {
                                            Syn.click(query('.revision-history-link.revision-history-link-row'));
                                            wait(function() {
                                                expect({
                                                    action: "applyOriginalContent",
                                                    url: "file:///Users/nv/Code/devtools-codeschool-ext/test/test.css"
                                                });
                                                wait(function() {
                                                    Syn.click($('.revision-history-link').filter(function() {
                                                        return /revert/i.test(this.textContent);
                                                    }));
                                                    wait(function() {
                                                        expect({
                                                            action: "revertRevision",
                                                            url: "file:///Users/nv/Code/devtools-codeschool-ext/test/test.css"
                                                        });
                                                    })
                                                });
                                            })
                                        });
                                    });
                                });
                            })
                        });
                    });
                });
            });
        });
    });
}

function testPauseOnException() {
    $('#toolbar .toolbar-item.scripts').click();
    wait(function() {
        $('.scripts-pause-on-exceptions-status-bar-item').click();
        wait(function() {
            equal(actual.action, 'pauseOnException')
        })
    })
}


function testNetwork() {
    $('#toolbar .toolbar-item.network').click();
    wait(function() {
        runtimeEval('location.reload()');
        setTimeout(function() {
            Syn.click(query('.method-column.sortable')).click(query('.name-column.sortable'));
            wait(function() {
                expect({
                    action: "networkSort",
                    column: "name",
                    sortOrder: "ascending"
                });
                Syn.click(query('.network-item div[title]'));
                wait(function() {
                    expect({
                        action: "networkRequestSelected",
                        url: "file:///Users/nv/Code/devtools-codeschool-ext/test/index.html"
                    });
                    Syn.click(query('#tab-preview'));
                    wait(function() {
                        Syn.click(query('#tab-headers'));
                        wait(function() {
                            expect({
                                action: "networkRequestTabSelected",
                                tab: "headers",
                                url: "file:///Users/nv/Code/devtools-codeschool-ext/test/index.html"
                            });
                        });
                    });
                });
            });
        }, 2000);
    });
}