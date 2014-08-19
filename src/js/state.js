"use strict";

var flow = (function(flow) {
	'use strict';

	var Const = flow.Const,
		Util = flow.Util,
		_revert = [],
		_undoRevert = [];

	flow.State = {
		cleanState: function() {
			this._revert = [];
			this._undoRevert = [];
		},

		pushShapeAlteration: function(shape) {
			var obj = {};
			obj[Const.SHAPE_EVENT.ALTERATED] = flow.getShapeData(shape);

			this._revert.push(obj);
		},

		pushShapeDeletion: function(shape) {
			var obj = {};
			obj[Const.SHAPE_EVENT.DELETED] = Util.extend(
				flow.getShapeData(shape),
				{connectionsTargets: this._getShapeTargetsOfShapeConnections(shape)},
				{connectionsSources: this._getShapeSourcesOfShapeConnections(shape)}
			);

			this._revert.push(obj);
		},

		pushShapeCreated: function($shape) {
			var _revert = this._revert;

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
			this._revert.push(_revert);
		},

		revert: function(flowchart) {;
			var idFlowchart = flowchart.getAttribute("data-flow-id");

			var last = this._revert.pop();

			if (last !== undefined && last[idFlowchart] !== undefined) {
				this._routeReversion(last[idFlowchart]);
			}
		},

		undoRevert: function(flowchart) {
			var idFlowchart = flowchart.getAttribute("data-flow-id");

			var last = this._undoRevert.pop();

			if (last !== undefined && last[idFlowchart] !== undefined) {
				this._routeReversion(last[idFlowchart]);
			}
		},

		_routeReversion: function(lastFromFlowchart) {
			if (lastFromFlowchart[this.SHAPE_ALTERATION]) {
				var shapeData = lastFromFlowchart[this.SHAPE_ALTERATION];
				this._revertShapeState(shapeData);
			}
			else if (lastFromFlowchart[this.SHAPE_DELETION]) {
				this._revertShapeState(lastFromFlowchart[this.SHAPE_DELETION]);
			}
			else if (lastFromFlowchart[this.SHAPE_CREADTED]) {
				this._revertShapeCreation(lastFromFlowchart[this.SHAPE_CREADTED]);
			}
			else if (lastFromFlowchart[this.CONNECTION_ALTERATION]) {
				this._revertConnectionAlteration(lastFromFlowchart[this.CONNECTION_ALTERATION]);
			}
		},

		_revertShapeState: function(data) {
			var $shape = flow.ShapeHandler.findShapeById(data.id);

			if ($shape.length > 0) {
				this._revertShapeAlteration($shape, data);
			}
			else {
				this._revertShapeDeletion($shape, data);
			}

			$shape.focus();
		},

		_revertShapeCreation: function(data) {
			var shapeHandler = flow.ShapeHandler;

			var $shape = shapeHandler.findShapeById(data.id);

			shapeHandler.ajaxDelete($shape[0]);
			$shape.remove();
		},

		_revertShapeAlteration: function($shape, data) {
			this._setShapeProperties($shape, data);
			jsPlumb.repaint($shape);
			flow.ShapeHandler.ajaxSave($shape[0]);
		},

		_revertShapeDeletion: function($shape, data) {
			var shapeHandler = flow.ShapeHandler;

			$shape = shapeHandler.getShapeCloneByName(data.shapeDefinitionName);
			this._setShapeProperties($shape, data);
			$shape = new flow.Shape($shape);
			shapeHandler.ajaxRecreate(data);

			flow.FlowchartHandler.getActiveFlowchart$().append($shape);

			this._remakeConnections($shape, data.connectionsTargets, data.connectionsSources);
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

		_setShapeProperties: function($shape, data) {
			$shape.css({
				top: data.top + "px",
				left: data.left + "px"
			});
			$shape.attr("data-flow-id", data.id);
			$shape.find("code").text(data.value);
		}
	};

	return flow;
})(flow || {});