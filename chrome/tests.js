Element.prototype.trigger = function(eventName) {
    if (eventName === 'click') {
        var event = document.createEvent("MouseEvents");
        event.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    }
    return this.dispatchEvent(event);
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


var actual = null;
function emitAction(data) {
    actual = data;
}
window.emitAction = emitAction;


function expect(expected) {
    console.log(actual, expected);
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
    console.log(out.join(''));
}


function testForceState() {
    document.querySelector('#toolbar .toolbar-item.elements').trigger('click');
    setTimeout(function() {
        document.querySelector('.pane-title-button.element-state').trigger('click');
        setTimeout(function() {
            document.querySelector('.styles-element-state-pane input[type="checkbox"]').trigger('click');
            expect({
                action: "forcedElementState",
                selector: "body",
                enabled: true,
                state: "active"
            });
        }, 500);
    }, 500);
}

testForceState();
