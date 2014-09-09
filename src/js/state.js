
var flow = (function(flow, jsPlumb) {
	'use strict';

	var _revert = [],
		_undoRevert = [];

	flow.State = {
		cleanState: function() {
			_revert = [];
			_undoRevert = [];
		},

		pushShapeAlteration: function(shape, extraData) {
			var shapeData = flow.getShapeData(shape);
			shapeData.isNew = extraData === 'created';
			_revert.push(shapeData);
		},

		undo: function() {
			var last = _revert.pop();

			if (last !== undefined) {
				this._revertShapeState(last);
			}
		},

		undoRevert: function(flowchart) {
			var last = _undoRevert.pop();

			if (last !== undefined) {
				this._routeReversion(last);
			}
		},

		_revertShapeState: function(shapeData) {
			var shape = flow.findShapeById(shapeData.id),
				flowchart = null;

			if (shapeData.isNew === true) { // shape created, this undo action is going to delete it
				flowchart = shape.parentNode;
				this._revertShapeCreation(shape);
				flowchart.focus(); // focus so we cant continue to revert
			}
			else if (shape !== null) {
				this._revertShapeAlteration(shape, shapeData);
				this._remakeConnections(shape, shapeData.sourceConnections, shapeData.targetConnections);
			}
			else {
				shape = this._revertShapeDeletion(shapeData);
				this._remakeConnections(shape, shapeData.sourceConnections, shapeData.targetConnections);
			}
		},

		_revertShapeCreation: function(shape) {
			if (shape.classList.contains('selected')) { // if this shape is selected right now
				flow.Selection.unselectShapes(); // then unselect before delete
			}
			jsPlumb.detachAllConnections(shape);
			flow.Util.remove(shape);
		},

		_revertShapeAlteration: function(shape, shapeData) {
			this._setShapeProperties(shape, shapeData);
			jsPlumb.repaint(shape);
		},

		_revertShapeDeletion: function(shapeData) {
			var shape = flow.getShapeCloneByType(shapeData.type),
				flowchart = flow.getCurrentDiagram();

			flowchart.appendChild(shape);

			this._setShapeProperties(shape, shapeData);

			flow.makeShapeDraggable(shape, shapeData);

			return shape;
		},

		_remakeConnections: function(shape, sourceConnections, targetConnections) {
			var flowchart = shape.parentNode;

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
		},

		_setShapeProperties: function(shape, shapeData) {
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
		}
	};

	return flow;
})(flow || {}, jsPlumb);