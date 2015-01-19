var flow = (function(flow, doc) {

'use strict';

var Alerts = flow.Alerts;

flow.ExecutionHandler = {

	currentNode: null,

	nextNodeDOM: null,

	cachedNodes: {},

	generateCode: function() {
		var visiteds = {};
		var code = [];

		var _traverse = function(shape) {
			var id = shape.id;
			var shapeType = shape.getAttribute('data-flow-shape-type');

			if (!(id in visiteds)) {
				visiteds[id] = true;
				var connections = jsPlumb.getConnections({source: shape}),
					reverseConnections = jsPlumb.getConnections({target: shape});

				var hasCycle = reverseConnections.length > 1 ? true : false;

				if (hasCycle && shapeType !== flow.Const.SHAPE_TYPE.DECISION
					&& shapeType !== flow.Const.SHAPE_TYPE.CONNECTOR
				) {
					code.push('do {');
				}

				switch (shapeType) {
					case flow.Const.SHAPE_TYPE.BEGIN:
						code.push('(function() {');
						_traverse(connections[0].target);
						break;

					case flow.Const.SHAPE_TYPE.END:
						code.push('})();');
						break;

					case flow.Const.SHAPE_TYPE.CONNECTOR:
						// first visit (true branch of an IF)
						// do nothing
						// the recursion will backtrack to the closest IF statement and then procede to the ELSE branch
						break;

					case flow.Const.SHAPE_TYPE.PROCESS:
						var content = _getTextContent(shape).replace('<-', '=') + ';';
						code.push(content);
						_traverse(connections[0].target);
						break;

					case flow.Const.SHAPE_TYPE.DISPLAY:
						var content = 'console.log(' + _getTextContent(shape) + ');'
						code.push(content);
						_traverse(connections[0].target);
						break;

					case flow.Const.SHAPE_TYPE.MANUAL_INPUT:
						var content = _getTextContent(shape).replace(
							/([a-zA-Z_$][0-9a-zA-Z_$]*)/, '$1 = window.prompt("Insert the value of $1");'
						);
						code.push(content);
						_traverse(connections[0].target);
						break;

					case flow.Const.SHAPE_TYPE.DECISION:
						var trueBranch = null,
							falseBranch = null;
						if (/true/i.test(connections[0].getLabel())) {
							trueBranch = connections[0].target;
							falseBranch = connections[1].target;
						}
						else {
							trueBranch = connections[1].target;
							falseBranch = connections[0].target;
						}

						var idTargetOne = connections[0].target.id,
							idTargetTwo = connections[1].target.id;
						// if it's pointing to a previously visited node, then it's a DO WHILE
						if (idTargetOne in visiteds || idTargetTwo in visiteds) {
							code.push('} while(');
							code.push(_getTextContent(shape));
							code.push(');');
							// traverse the non-visited node
							_traverse((idTargetOne in visiteds ? connections[1].target : connections[0].target))
						}
						else if (hasCycle) { // has two nodes pointing at it, so must be a WHILE loop
							code.push('while (');
							code.push(_getTextContent(shape));
							code.push(') {');

							// TODO find correct branch
							_traverse(trueBranch);
							code.push('}');
							_traverse(falseBranch);
						}
						else { // a ordinary IF
							code.push('if (');
							code.push(_getTextContent(shape));
							code.push(') {');

							_traverse(trueBranch);
							code.push('}');
							code.push('else {');
							_traverse(falseBranch);
							// closing tag at "else if == connector" below
						}

						break;

					default:
						break;
				}
			}
			// at the second visit we continue the graph traversal
			else if (shapeType === flow.Const.SHAPE_TYPE.CONNECTOR) {
				var connections = jsPlumb.getConnections({source: shape});
				code.push('}');
				_traverse(connections[0].target);
			}
		};

		var _getTextContent = function(shape) {
			return shape.querySelector('code').textContent;
		};

		_traverse(this.getBeginShape());

		var result = code.join(' ');
		console.log(result);
	},

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