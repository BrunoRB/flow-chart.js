
var flow = (function(flow, doc, jsPlumb) {
	'use strict';

	var _userStoredDiagrams = {
		diagrams: {}, // diagrams data
		data: {} // global data
	}; // data structure with all the user diagrams (ecxcept the open one)

	/**
	 * @param {DOM Object} shapeDOM
	 * @returns {Object} the Shape Data (id, classes, top, targetsIds...)
	 */
	flow.getShapeData = function(shapeDOM) {
		var connections = jsPlumb.getConnections({source: shapeDOM}),
			shapeTargetConnections = {},
			shapeImage = shapeDOM.querySelector('.shape.image');

		for (var i=connections.length; i--; ) {
			var conn = connections[i];

			var id = conn.target.getAttribute('data-flow-shape-id');
			shapeTargetConnections[id]  = {
				label: conn.getLabel()
			};
		}

		return {
			id: shapeDOM.getAttribute('data-flow-shape-id'),
			type: shapeDOM.getAttribute('data-flow-shape-type'),
			top: shapeDOM.style.top,
			left: shapeDOM.style.left,
			code: shapeDOM.querySelector('code').textContent,
			targetConnections: shapeTargetConnections,
			width: shapeImage.style.width || null,
			height: shapeImage.style.height || null
		};
	};

	flow.getDiagramData = function(diagramDOM) {
		var shapesArray = [],
			shapes = diagramDOM.querySelectorAll('div.flow.shape');

		for (var i=shapes.length; i--; ) {
			var shapeData = flow.getShapeData(shapes[i]);
			shapesArray.push(shapeData);
		}

		return {
			id: diagramDOM.id,
			name: diagramDOM.getAttribute('data-flow-name'),
			shapes: shapesArray
		};
	};

	flow.storeDiagramData = function(diagramData) {
		_userStoredDiagrams.diagrams[diagramData.id] = {
			id: diagramData.id,
			name: diagramData.name,
			shapes: diagramData.shapes
		};
	};

	flow.getStoredDiagramData = function(idDiagram) {
		if (idDiagram in _userStoredDiagrams.diagrams) {
			return _userStoredDiagrams.diagrams[idDiagram];
		}
		else {
			throw 'Diagram ' + idDiagram + ' data not found';
		}
	};

	/**
	 * Including current diagram (if exists)
	 */
	flow.getStoredDataFromAllDiagrams = function() {
		var current = flow.getCurrentDiagram();
		if (current !== null) {
			_userStoredDiagrams.diagrams[current.id] = flow.getDiagramData(current); // add currentDiagram data
		}

		return _userStoredDiagrams;
	};

	flow.cleanStoredDiagramData = function(idDiagram) {
		if (idDiagram in _userStoredDiagrams.diagrams) {
			delete _userStoredDiagrams.diagrams[idDiagram];
		}
		else {
			throw 'Diagram ' + idDiagram + ' data not found';
		}
	};

	flow.cleanAllDiagramsStoredData = function() {
		_userStoredDiagrams = {
			diagrams: {}, // diagrams data
			data: {} // global data
		};
	};

	return flow;

})(flow || {}, document, jsPlumb);