Element.prototype.trigger = function(eventName) {
    if (eventName === 'click') {
        var event = document.createEvent("MouseEvents");
        event.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    } else if (eventName === 'keypress') {
        var event = document.createEvent("MouseEvents");
        event.initKeyEvent('keypress', true, true, null, false, false, false, false, 9, 13);
    }
    return this.dispatchEvent(event);
};

Element.prototype.triggerKey = function(options) {
    var event = document.createEvent("KeyboardEvent");
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

function $(query) {
    return document.querySelector(query);
}

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
    openProfilesPanel(function() {
        $('.control-profiling').trigger('click');
        wait(function() {
            $('.control-profiling').trigger('click');
            wait(function() {
                expect({
                    action: 'profileAdded',
                    type: 'CPU'
                })
            })
        });
    });
}


function testTimelineSnapshot() {
    document.querySelector('#toolbar .toolbar-item.timeline').trigger('click');
    wait(function() {
        document.querySelector('.record-profile-status-bar-item').trigger('click');
        wait(function() {
            document.querySelector('.record-profile-status-bar-item').trigger('click');
            wait(function() {
                expect({
                    action: 'timelineSnapshot'
                })
            });
        });
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

//    openElementsPanel(function() {
//        document.querySelector('.pane-title-button.element-state').trigger('click');
//        setTimeout(function() {
//            document.querySelector('.styles-element-state-pane input[type="checkbox"]').trigger('click');
//            setTimeout(function() {
//
//            }, 500);

//            expect({
//                action: "forcedElementState",
//                selector: "body",
//                enabled: true,
//                state: "active"
//            });
//        }, 500);
//    });
}

//testForceState();

function testClickResouceLink() {
    openElementsPanel(function() {
        $('.webkit-html-tag').trigger('click');
        setTimeout(function() {
            $('.webkit-html-resource-link').trigger('click');
            expect({
                action: 'sourceLinkClick',
                url: 'file:///Users/nv/Code/devtools-codeschool-ext/test/test.css',
                lineNumber: undefined
            });
        }, 500);
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
