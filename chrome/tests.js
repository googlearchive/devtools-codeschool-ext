Element.prototype.trigger = function(eventName) {
    if (eventName === 'click') {
        var event = document.createEvent("MouseEvents");
        event.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    }
    return this.dispatchEvent(event);
};


function expect() {
    window.addEventListener('message', function onMessage(event) {
        console.log('It works', event.data);
        window.removeEventListener(event.type, onMessage, false);
    }, false);
}


function testForceState() {
    document.querySelector('#toolbar .toolbar-item.elements').trigger('click');
    setTimeout(function() {
        document.querySelector('.pane-title-button.element-state').trigger('click');
        setTimeout(function() {
            expect();
            document.querySelector('.styles-element-state-pane input[type="checkbox"]').trigger('click');
        }, 500);
    }, 500);
}
