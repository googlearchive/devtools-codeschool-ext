function emitAction(name, data) {
    console.log({
        action: name,
        date: Date.now(),
        data: data
    })
}


// check element for forced element state
(function() {

    var originalMethod = WebInspector.ElementsPanel.prototype._setPseudoClassForNodeId;

    WebInspector.ElementsPanel.prototype._setPseudoClassForNodeId = function(nodeId, pseudoClass, enable) {
        originalMethod.apply(this, arguments);

        if (!enable) {
            return;
        }

        var node = WebInspector.domAgent.nodeForId(nodeId);
        if (!node) {
            return;
        }

        var id = node.getAttribute("id");

        emitAction("forcedElementState", {
            id: id,
            state: pseudoClass
        });
    }
})();
