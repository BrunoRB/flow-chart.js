
var flow = (function(flow, jsPlumb) {
	'use strict';

	flow.State = {};

	var State = flow.State,
		_revert = [],
		_undoRevert = [];

	State.cleanState = function() {
		_revert = [];
		_undoRevert = [];
	};

	State.cleanRedoState = function() {
		_undoRevert = [];
	};

	State.pushShapeAlteration = function(shape, extraData) {
		var shapeData = flow.getShapeData(shape);
		shapeData.isNew = extraData === 'created';
		_revert.push(shapeData);
	};

	State.undo = function() {
		var last = _revert.pop();
		if (last !== undefined) {
			var shape = flow.findShapeById(last.id),
				data = null;

			if (shape) {
				data = flow.getShapeData(shape);
			}
			else {
				data = flow.Util.clone(last);
				data.isNew = true;
			}

			_undoRevert.push(data);

			_revertShapeState(last);
		}
	};

	State.redo = function() {
		var last = _undoRevert.pop();
		if (last !== undefined) {
			_revertShapeState(last);
		}
	};

	var _revertShapeState = function(shapeData) {
		var shape = flow.findShapeById(shapeData.id),
			flowchart = null;

		if (shapeData.isNew === true) { // shape created, this undo action is going to delete it
			flowchart = shape.parentNode;
			_revertShapeCreation(shape);
			flowchart.focus(); // focus so we cant continue to revert
		}
		else if (shape !== null) {
			_revertShapeAlteration(shape, shapeData);
			_remakeConnections(shape, shapeData.sourceConnections, shapeData.targetConnections);
		}
		else {
			shape = _revertShapeDeletion(shapeData);
			_remakeConnections(shape, shapeData.sourceConnections, shapeData.targetConnections);
		}
	};

	var _revertShapeCreation = function(shape) {
		if (shape.classList.contains('selected')) { // if this shape is selected right now
			flow.Selection.unselectShapes(); // then unselect before delete
		}
		jsPlumb.detachAllConnections(shape);
		flow.Util.remove(shape);
	};

	var _revertShapeAlteration = function(shape, shapeData) {
		_setShapeProperties(shape, shapeData);
		jsPlumb.repaint(shape);
	};

	var _revertShapeDeletion = function(shapeData) {
		var shape = flow.getShapeCloneByType(shapeData.type),
			flowchart = flow.getCurrentDiagram();

		flowchart.appendChild(shape);

		_setShapeProperties(shape, shapeData);

		flow.makeShapeDraggable(shape, shapeData);

		return shape;
	};

	var _remakeConnections = function(shape, sourceConnections, targetConnections) {
		var flowchart = shape.parentNode;

		// detach connections
		var currentSourceConns = jsPlumb.getConnections({source: shape});
		for (var i=currentSourceConns.length; i--; ) {
			var conn = currentSourceConns[i],
				connFlowId = conn.source.getAttribute('data-flow-id');
			if (!(connFlowId in sourceConnections)) {
				jsPlumb.detach(conn);
			}
		}
		// end detach

		// remake connections
		for (var id in sourceConnections) {
			var label = sourceConnections[id].label,
				source = flowchart.querySelector('div.shape[data-flow-shape-id="' + id + '"]'),
				connExists = jsPlumb.getConnections({source: source, target: shape}).length > 0;
			if (!connExists) {
				jsPlumb.connect({source: source, target: shape, label: label});
			}
		}

		for (var id in targetConnections) {
			var label = targetConnections[id].label,
				target = flowchart.querySelector('div.shape[data-flow-shape-id="' + id + '"]');
				connExists = jsPlumb.getConnections({source: shape, target: target}).length > 0;
			if (!connExists) {
				jsPlumb.connect({source: shape, target: target, label: label});
			}
		}
		//end remake
	};

	var _setShapeProperties = function(shape, shapeData) {
		if (shapeData.width || shapeData.height) {
			var innerImage = shape.querySelector('.shape.image');
			innerImage.style.width = shapeData.width;
			innerImage.style.height = shapeData.height;
		}

		if (shapeData.code) {
			shape.querySelector('code').textContent = shapeData.code;
		}

		shape.style.top = shapeData.top;
		shape.style.left = shapeData.left;
		shape.setAttribute('data-flow-shape-id', shapeData.id);

		shape.focus();
	};

	return flow;
})(flow || {}, jsPlumb);