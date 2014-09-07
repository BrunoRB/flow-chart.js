/**
 * Selection Submodule
 */
var flow = (function(flow, doc, jsPlumb) {
	'use strict';

	flow.Selection = {};

	var Selection = flow.Selection,
		_selectedElement = null;

	Selection.addSelectedShape = function(shape) {
		this.unselectElements();

		_selectedElement = {
			type: 'shape',
			id: shape.id
		};

		flow.UI.markShapeAsSelected(shape);
	};

	Selection.addSelectedConnection = function(sourceId, targetId) {
		this.unselectElements();

		_selectedElement = {
			type: 'connection',
			from: sourceId,
			to: targetId
		};
	};

	Selection.deleteSelectedItems = function() {
		if (_selectedElement) {
			if (_selectedElement.type === 'shape') {
				var shape = doc.getElementById(_selectedElement.id);
				flow.Util.trigger(flow.Const.SHAPE_EVENT.ALTERATED, shape);
				jsPlumb.detachAllConnections(shape);
				flow.Util.remove(shape);
			}
			else {
				var shapeSource = doc.getElementById(_selectedElement.from),
					conn = jsPlumb.getConnections({
						source: _selectedElement.from,
						target: _selectedElement.to
					})[0];

				flow.Util.trigger(flow.Const.SHAPE_EVENT.ALTERATED, shapeSource);

				jsPlumb.detach(conn);
			}

			_selectedElement = null;
		}
	};

	Selection.getSelectedItem = function() {
		return _selectedElement;
	};

	Selection.unselectShapes = function() {
		if (_selectedElement && _selectedElement.type === 'shape') {
			flow.UI.unmarkShapeAsSelected(
				doc.getElementById(_selectedElement.id)
			);
			_selectedElement = null;
		}
	};

	Selection.unselectConnections = function() {
		if (_selectedElement && _selectedElement.type === 'connection') {
			var conn = jsPlumb.getConnections({
				source: _selectedElement.from,
				target: _selectedElement.to
			})[0];

			conn.setPaintStyle(jsPlumb.Defaults.PaintStyle);
			_selectedElement = null;
		}
	};

	Selection.unselectElements = function() {
		this.unselectShapes();
		this.unselectConnections();
		_selectedElement = null;
		flow.UI.unmarkAllShapes();
	};

	Selection.cleanSelection = function() {
		_selectedElement = null;
	};

	return flow;
})(flow || {}, document, jsPlumb);