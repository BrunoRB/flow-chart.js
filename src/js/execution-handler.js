var flow = (function(flow, doc) {
	'use strict';

	var Alerts = flow.Alerts;

	flow.ExecutionHandler = {

		currentNode: null,

		nextNodeDOM: null,

		cachedNodes: {},

		cleanAttributesValues: function() {
			flow.Nodes.cleanVarTable();
			this.cachedNodes = {};
			this.currentNode = null;
			this.nextNodeDOM = null;
		},

		triggertExecution: function() {
			this.cleanAttributesValues();
			flow.Selection.unselectElements();
			flow.UI.unmarkAllShapes();

			var beginShape = this.getBeginShape();
			if (beginShape !== null) {
				this.currentNode = flow.Nodes.factory(beginShape);
				this.nextNodeDOM = this.currentNode.execute();
				this.executeAll();
			}
			else {
				Alerts.showErrorMessage('Element begin not found');
				return false;
			}
		},

		executeAll: function() {
			while(this.nextNodeDOM !== null) {
				this.setCurrentNode();
				this.nextNodeDOM = this.currentNode.execute();
			}
			flow.UI.markShapeAsExecuted(this.currentNode.selector);
			flow.UI.enableExecutionButtons();
			Alerts.showSuccessMessage('Execution complete');
		},

		triggerDebug: function() {
			this.cleanAttributesValues();
			flow.UI.unmarkAllShapes();

			var beginShape = this.getBeginShape();
			if (beginShape !== null) {
				Alerts.showInfoMessage('Debug initiated');
				this.currentNode = flow.Nodes.factory(beginShape);
				this.nextNodeDOM = this.currentNode.execute();
				flow.UI.markShapeAsExecuted(this.currentNode.selector);
				flow.UI.disableExecuteButton();
				return true;
			}
			else {
				Alerts.showErrorMessage('Element begin not found');
				return false;
			}
		},

		executeNext: function() {
			flow.UI.unmarkShapeAsExecuted(this.currentNode.selector);
			this.setCurrentNode();
			this.nextNodeDOM = this.currentNode.execute();
			flow.UI.markShapeAsExecuted(this.currentNode.selector);
			if (this.nextNodeDOM === null) {
				Alerts.showSuccessMessage('Execution complete');
				flow.UI.disableDebugButtons();
				flow.UI.enableExecuteButton();
			}
		},

		stopDebug: function() {
			Alerts.showSuccessMessage('Debug canceled');
			flow.UI.disableDebugButtons();
			flow.UI.enableExecuteButton();
			flow.UI.unmarkAllShapes();
		},

		setCurrentNode: function() {
			if (this.nextNodeDOM === null) {
				return;
			}

			var nextNodeId = this.nextNodeDOM.id;
			if (this.cachedNodes.hasOwnProperty(nextNodeId)) {
				this.currentNode = this.cachedNodes[nextNodeId];
			}
			else {
				this.currentNode = flow.Nodes.factory(this.nextNodeDOM);
				this.cachedNodes[nextNodeId] = this.currentNode;
			}
		},

		getBeginShape: function() {
			return flow.getCurrentDiagram().querySelector('div.shape[data-flow-shape-type="begin"]');
		},

		getDebugNextNode: function() {
			var $next = this.currentNode.getNextNodeSelector$;
			if ($next !== null) {
				return $next;
			}
			Alerts.showErrorMessage('End of the algorithm');
			throw 'End of the algorithm';
		}
	};


	return flow;
})(flow, document);