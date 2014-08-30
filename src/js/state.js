
var flow = (function(flow) {
	'use strict';

	var Util = flow.Util,
		_revert = [],
		_undoRevert = [];

	flow.State = {
		cleanState: function() {
			_revert = [];
			_undoRevert = [];
		},

		pushShapeAlteration: function(shape) {
			var obj = {};
			obj[flow.Const.SHAPE_EVENT.ALTERATED] = flow.getShapeData(shape);
			_revert.push(obj);
		},

		pushShapeDeletion: function(shape) {
			var obj = {};
			obj[Const.SHAPE_EVENT.DELETED] = Util.extend(
				flow.getShapeData(shape),
				{connectionsTargets: this._getShapeTargetsOfShapeConnections(shape)},
				{connectionsSources: this._getShapeSourcesOfShapeConnections(shape)}
			);

			_revert.push(obj);
		},

		pushShapeCreated: function($shape) {
			var _revert = _revert;

			var idFlowchart = $shape.parent().attr("data-flow-id");
			var obj = {};
			obj[idFlowchart] = {};
			obj[idFlowchart][this.SHAPE_CREADTED] = flow.ShapeHandler.getShapeData($shape);

			_revert.push(obj);
		},

		_getShapeTargetsOfShapeConnections: function(shape) {
			var connections = jsPlumb.getConnections({source: shape});
			var targets = [];
			for (var i = 0; i < connections.length; i++) {
				targets.push({
					id: connections[i].target.getAttribute("data-flow-id"),
					label: $(connections[i].getLabel()).text() // TODO
				});
			}
			return targets;
		},

		_getShapeSourcesOfShapeConnections: function(shape) {
			var connections = jsPlumb.getConnections({target: shape});
			var sources = [];
			for (var i = 0; i < connections.length; i++) {
				sources.push({
					id: connections[i].source.getAttribute("data-flow-id"),
					label: $(connections[i].getLabel()).text() // TODO
				});
			}
			return sources;
		},

		pushConnectionAlteration: function (connections) {
			var idFlowchart = connections.idFlowchart;
			var _revert = {};
			_revert[idFlowchart] = {};
			_revert[idFlowchart][this.CONNECTION_ALTERATION] = connections;
			_revert.push(_revert);
		},

		revert: function(flowchart) {
			var last = _revert.pop();

			if (last !== undefined) {
				this._routeReversion(last);
			}
		},

		undoRevert: function(flowchart) {
			var idFlowchart = flowchart.getAttribute("data-flow-id");

			var last = _undoRevert.pop();

			if (last !== undefined) {
				this._routeReversion(last);
			}
		},

		_routeReversion: function(last) {
			if (last[flow.Const.SHAPE_EVENT.ALTERATED]) {
				var shapeData = last[flow.Const.SHAPE_EVENT.ALTERATED];
				this._revertShapeState(shapeData);
			}
			else if (last[this.SHAPE_DELETION]) {
				_revertShapeState(last[this.SHAPE_DELETION]);
			}
			else if (last[this.SHAPE_CREADTED]) {
				_revertShapeCreation(last[this.SHAPE_CREADTED]);
			}
			else if (last[this.CONNECTION_ALTERATION]) {
				_revertConnectionAlteration(last[this.CONNECTION_ALTERATION]);
			}
		},

		_revertShapeState: function(shapeData) {
			var shape = flow.findShapeById(shapeData.id);

			if (shape !== null) {
				this._revertShapeAlteration(shape, shapeData);
			}
			else {
				this._revertShapeDeletion(shapeData);
			}
		},

		_revertShapeCreation: function(data) {
			var shapeHandler = flow.ShapeHandler;

			var $shape = shapeHandler.findShapeById(data.id);

			shapeHandler.ajaxDelete($shape[0]);
			$shape.remove();
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

			//TODO
			//this._remakeConnections(shape, data.connectionsTargets, data.connectionsSources);
		},

		_remakeConnections: function($shape, targetsData, sourcesData) {
			var shapeHandler = flow.ShapeHandler;

			var $flowchart = $shape.parent();

			var targetsLength = targetsData.length;
			if (targetsLength > 0) {
				for (var i = 0; i < targetsLength; i++) {
					var targetData = targetsData[i];
					var $target = shapeHandler.findShapeById(targetData.id);
					var connection = jsPlumb.connect({source: $shape, target: $target});
					shapeHandler.setConnectionLabel(connection, targetData.label, $flowchart);
					shapeHandler.ajaxSetConnection($shape[0], $target[0], targetData.label);
				}
			}

			var sourcesLength = sourcesData.length;
			if (sourcesLength > 0) {
				for (var i = 0; i < sourcesLength; i++) {
					var sourceData = sourcesData[i];
					var $source = shapeHandler.findShapeById(sourceData.id);
					var connection = jsPlumb.connect({source: $source, target: $shape});
					shapeHandler.setConnectionLabel(connection, sourceData.label, $flowchart);
					shapeHandler.ajaxSetConnection($source[0], $shape[0], sourceData.label);
				}
			}
		},

		_revertConnectionState: function(data) {
			var shapeHandler = flow.ShapeHandler;

			var $source = shapeHandler.findShapeById(data.sourceId);
			var $target = shapeHandler.findShapeById(data.targetId);
			var value = (data.value !== "") ? data.value : "";

			var connection = jsPlumb.connect({source: $source, target: $target});

			var $flowchart = $source.parent();

			shapeHandler.setConnectionLabel(connection, value, $source.parent(), $flowchart);

			shapeHandler.ajaxSetConnection(connection.source, connection.target, value);
		},

		_revertConnectionAlteration: function(data) {
			var created = data.createdConnectionInfo;
			var deleted = data.deletedConnectionInfo;

			if (created !== undefined) {
				flow.ShapeHandler.deleteConnection(created.source, created.target);
			}

			if (deleted !== undefined) {
				jsPlumb.connect({source: deleted.source, target: deleted.target});
				flow.ShapeHandler.ajaxSetConnection(deleted.source, deleted.target, deleted.value);
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
})(flow || {});