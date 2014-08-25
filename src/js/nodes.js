
var flow = (function(flow, jsPlumb) {
	"use strict";

	flow.Nodes = {

		varTable: {},

		factory: function(node) {
			var nodeType = node.getAttribute("data-flow-shape-type");
			switch (nodeType) {
				case flow.Const.SHAPE_TYPE.PROCESS:
					return new Process(node);
					break;
				case flow.Const.SHAPE_TYPE.DISPLAY:
					return new Display(node);
					break;
				case flow.Const.SHAPE_TYPE.MANUAL_INPUT:
					return new ManualInput(node);
					break;
				case flow.Const.SHAPE_TYPE.DECISION:
					return new Decision(node);
					break;
				default:
					return new Node(node);
					break;
			}
		},

		cleanVarTable: function() {
			this.varTable = {};
		}
	};

	var Node = function(selector) {
		this.selector = selector;

		this.execute = function() {
			this.validate();

			return this.getNextNodeSelector();
		};

		this.getParsedContent = function() {

		};

		this.getNextNodeSelector = function() {
			var connections = jsPlumb.getConnections({source: this.selector});
			return (connections.length > 0) ? connections[0].target : null;
		};

		this.validate = function() {
			var connections = jsPlumb.getConnections({source: this.selector});
			if (connections.length < 1 && this.selector.getAttribute('data-flow-max-outputs') !== '0') {
				flow.UI.markFailure('Output flow not found', this.selector);
			}
		};

	};

	Node.prototype = {
		getContent: function() {
			return this.selector.querySelector('code').textContent;
		}
	};

	// PROCESS
	var Process = function(selector) {
		Node.call(this, selector);

		this.execute = function() {
			this.validate();

			try {
				eval(this.getParsedContent());
			}
			catch (e) {
				flow.log(e);
				flow.UI.markFailure('Erro de sintaxe', this.selector);
			}

			return this.getNextNodeSelector();
		};

		this.getParsedContent = function() {
			var parsedContent = this.getContent().replace("<-", "=").split(/("[^"]*")/);

			for (var i = 0, length = parsedContent.length; i < length; i++) {
				if (!(/^"[^"]*"$/.test(parsedContent[i]))) {
					parsedContent[i] = parsedContent[i].replace(/([a-zA-Z_$][0-9a-zA-Z_$]*)/g, " flow.Nodes.varTable.$1 ");
				}
				else if (parsedContent[i] === "") {
					delete parsedContent[i];
				}
			}
			return parsedContent.join(" ");
		};
	};
	Process.prototype = Object.create(Node.prototype);

	// DISPLAY
	var Display = function(selector) {
		Node.call(this, selector);

		this.execute = function() {
			this.validate();

			var parsedContent = this.getParsedContent(),
				expression = "<span style='color: teal;'>" + getExpression(parsedContent) + " -> </span>",
				evaluatedValue = getEvaluatedValue(parsedContent);

			flow.UI.appendContentToConsole(expression + evaluatedValue);

			return this.getNextNodeSelector();
		};

		var getExpression = function(content) {
			return content.replace(/flow\.Nodes\.varTable\./g, '');
		};

		var getEvaluatedValue = function(content) {
			try {
				var result = eval(content);
			}
			catch (e) {
				flow.log(e);
				flow.UI.markFailure('Syntax error', this.selector);
			}

			if (
				!Array.isArray(result) && (result === undefined || result === null ||
				(typeof result !== 'string' && isNaN(result)))
			) {
				result = 'Null';
			}

			return result;
		};

		this.getParsedContent = function() {
			var parsedContent = this.getContent().split(/("[^"]*")/);
			for (var i = 0, length = parsedContent.length; i < length; i++) {
				if (!(/^"[^"]*"$/.test(parsedContent[i]))) {
					parsedContent[i] = parsedContent[i].replace(/([a-zA-Z_$][0-9a-zA-Z_$]*)/g, " flow.Nodes.varTable.$1 ");
				}
				else if (parsedContent[i] === "") {
					delete parsedContent[i];
				}
			}
			return parsedContent.join(" ");
		};
	};
	Display.prototype = Object.create(Node.prototype);

	// MANUAL_INPUT
	var ManualInput = function(selector) {
		Node.call(this, selector);

		this.execute = function() {
			this.validate();

			try {
				eval(this.getParsedContent());

				var varName = this.getContent();
				if (flow.Util.isNumber(flow.Nodes.varTable[varName])) {
					flow.Nodes.varTable[varName] = parseFloat(flow.Nodes.varTable[varName]);
				}
			}
			catch (e) {
				flow.log(e);
				flow.UI.markFailure("Erro de sintaxe", this.selector);
			}

			return this.getNextNodeSelector();
		};

		this.getParsedContent = function() {
			return this.getContent().
				replace(/([a-zA-Z_$][0-9a-zA-Z_$]*)/, " flow.Nodes.varTable.$1 = prompt('Insira o valor de $1');");
		};
	};
	ManualInput.prototype = Object.create(Node.prototype);

	// DECISION
	var Decision = function(selector) {
		Node.call(this, selector);

		this.execute = function() {
			this.validate();

			try {
				var expressionIsTrue = eval(this.getParsedContent());
			}
			catch (e) {
				flow.log(e);
				flow.UI.markFailure("Erro de sintaxe", this.selector);
			}

			return this.getNextNodeSelector(expressionIsTrue);
		};

		this.getParsedContent = function() {
			var parsedContent = this.getContent().split(/("[^"]*")/);
			for (var i=0, len=parsedContent.length; i<len; i++) {
				if (!(/^"[^"]*"$/.test(parsedContent[i]))) {
					parsedContent[i] = parsedContent[i].replace(/([a-zA-Z_$][0-9a-zA-Z_$]*)/g, " flow.Nodes.varTable.$1 ");
				}
				else if (parsedContent[i] === "") {
					delete parsedContent[i];
				}
			}
			return parsedContent.join(" ");
		};

		this.getNextNodeSelector = function(isTrue) {
			var connections = jsPlumb.getConnections({source: this.selector});

			if (isTrue === true) {
				if (/true/i.test(connections[0].getLabel())) {
					return connections[0].target;
				}
				else {
					return connections[1].target;
				}
			}
			else if(isTrue === false){
				if (/true/i.test(connections[0].getLabel())) {
					return connections[1].target;
				}
				else {
					return connections[0].target;
				}
			}
			else {
				flow.UI.markFailure('Execution error', this.selector);
			}
		};

		this.validate = function() {
			var connections = jsPlumb.getConnections({source: this.selector});

			if (connections.length < 2) {
				flow.UI.markFailure('A decision shape needs two output flows', is.selector);
			}

			var hasTrue = false,
				hasFalse = false;
			for (var i = 0; i < connections.length; i++) {
				if (/true/i.test(connections[i].getLabel())) {
					hasTrue = true;
				}
				else if (/false/i.test(connections[i].getLabel())) {
					hasFalse = true;
				}
			}

			if (!hasTrue || !hasFalse) {
				flow.UI.markFailure(
					'It\'s necessary to have a <b>true</b> and a <b>false</b> output', this.selector
				);
			}
		};
	};
	Decision.prototype = Object.create(Node.prototype);

	return flow;
})(flow || {}, jsPlumb);