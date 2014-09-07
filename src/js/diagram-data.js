
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
		var sourceConnections = jsPlumb.getConnections({target: shapeDOM}),
			targetConnections = jsPlumb.getConnections({source: shapeDOM}),
			shapeSourceConnections = {},
			shapeTargetConnections = {},
			shapeImage = shapeDOM.querySelector('.shape.image'),
			shapeCodeDOM = shapeDOM.querySelector('code'),
			shapeText = '';

		//TODO move to method
		for (var i=sourceConnections.length; i--; ) {
			var conn = sourceConnections[i],
				id = conn.source.getAttribute('data-flow-shape-id');
			shapeSourceConnections[id]  = {
				label: conn.getLabel()
			};
		}

		for (var i=targetConnections.length; i--; ) {
			var conn = targetConnections[i],
				id = conn.target.getAttribute('data-flow-shape-id');
			shapeTargetConnections[id]  = {
				label: conn.getLabel()
			};
		}
		//\\

		shapeText = shapeCodeDOM !== null ? shapeCodeDOM.textContent : shapeDOM.querySelector('input').value;

		return {
			id: shapeDOM.getAttribute('data-flow-shape-id'),
			type: shapeDOM.getAttribute('data-flow-shape-type'),
			top: shapeDOM.style.top,
			left: shapeDOM.style.left,
			code: shapeText,
			sourceConnections: shapeSourceConnections,
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

		_userStoredDiagrams.data.count = flow.Util.count; // last counter is stored in order to prevent id duplication !

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