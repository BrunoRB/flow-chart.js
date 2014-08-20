var flow = (function(flow, doc, jsPlumb) {
	'use strict';

	var Cache = flow.Cache,
		debug = true;

	flow.log = function() {
		if (debug) {
			if (arguments.length === 1) {
				console.log(arguments[0]);
			}
			else if (arguments.length === 2) {
				console.log(arguments[0], arguments[1]);
			}
		}
	};

	flow.makeMenuShapesDraggable = function() {
		var menuShapes = Cache.shapeMenu.querySelectorAll('div.flow.shape');

		jsPlumb.draggable(menuShapes, {
			scope: 'dragFromMenu',
			clone: true
		});
	};

	flow.getCurrentDiagram = (function() {
		var currentDiagram;

		// avoid unnecessary DOM query with a closure cache
		return function() {
			// undefined == never setted; parentNode === null == removed from DOM
			if (currentDiagram === undefined || currentDiagram === null || currentDiagram.parentNode === null) {
				currentDiagram = Cache.diagramContainer.querySelector('div.flow.active.diagram');
			}
			return currentDiagram;
		};
	})();

	/**
	 * Creates a new diagram and append it to DOM.
	 *
	 * @param {string} diagramName
	 * @param {integer} id OPTIONAL use with caution ! you need to ensure that this is UNIQUE
	 * @return {DOM_Object} newDiagram Newly created diagram
	 */
	flow.createDiagram = function(diagramName, id) {
		var currentDiagram = flow.getCurrentDiagram();
		if (currentDiagram !== null) {
			flow.closeDiagram(currentDiagram);
		}

		// then append the new diagram
		Cache.diagramContainer.insertAdjacentHTML(
			'beforeEnd', flow.Templates.getNewDiagram(diagramName, id)
		);

		var newDiagram = flow.getCurrentDiagram();

		jsPlumb.setContainer(newDiagram); // set jsplumb container

		_makeDiagramDroppable(newDiagram); // let the user drop the shapes from menu on this new

		flow.Listeners.setupDiagramEvents(newDiagram);

		flow.UI.enableExecutionButtons();

		return newDiagram;

	};

	flow.closeDiagram = function(diagram) {
		var data = flow.getDiagramData(diagram);

		flow.storeDiagramData(data);

		flow.Util.remove(diagram);

		flow.Selection.cleanSelection();

		// @fix jsPlumb 1.6.2+. Without this the connections remain intact (no idea why)
		jsPlumb.detachEveryConnection();
	};

	flow.openLocallyStoredDiagrams = function() {
		var text = window.localStorage.getItem('flow');
		if (text !== null && text !== '') {
			flow.openDiagrams(text);
			return true;
		}
		return false;
	};

	flow.openDiagrams = function(jsonDataAsText) {
		var data = JSON.parse(jsonDataAsText),
			diagrams = data.diagrams;
		for (var key in diagrams) {
			var diagramData = diagrams[key];
			flow.storeDiagramData(diagramData);
			flow.recreateDiagramFromStoredData(diagramData.id);
		};
	};

	flow.recreateDiagramFromStoredData = function(idDiagram) {
		var diagramData = flow.getStoredDiagramData(idDiagram);

		// VERY IMPORTANT clean after retrieve or else we have a huge memory leak
		flow.cleanStoredDiagramData(idDiagram);

		var currentDiagram = flow.createDiagram(diagramData.name, idDiagram);

		var tabItem = Cache.tabMenuList.querySelector('.flow.tab.item[data-flow-target="' + idDiagram + '"]');

		if (tabItem === null) {
			flow.appendTabItemToDiagramArea(diagramData.name);
		}
		else {
			var activeTab = Cache.tabMenuList.querySelector('.flow.tab.item.active');
			if (activeTab !== null) {
				activeTab.classList.remove('active');
			}
			tabItem.classList.add('active');
		}

		this.createDiagramShapesFromArray(currentDiagram, diagramData.shapes);
	};

	flow.createDiagramShapesFromArray = function(diagram, shapesArray) {
		// first create and append the shapes
		var fragment = doc.createDocumentFragment();
		for (var i=shapesArray.length; i--; ) {
			var shapeData = shapesArray[i],
				originalShape =  Cache.shapeMenu.querySelector('div[data-flow-shape-type="' + shapeData.type + '"]'),
				clonedShape = originalShape.cloneNode(true);

			fragment.appendChild(clonedShape);

			clonedShape.style.top = shapeData.top;
			clonedShape.style.left = shapeData.left;

			clonedShape.querySelector('code').textContent = shapeData.code;

			clonedShape.setAttribute('data-flow-shape-id', shapeData.id);

			_setupShape(clonedShape);
		}
		diagram.appendChild(fragment);

		// then make the connections
		jsPlumb.setSuspendDrawing(true);

		for (var i=shapesArray.length; i--; ) {
			var shapeData = shapesArray[i],
				sShape = diagram.querySelector('[data-flow-shape-id="' + shapeData.id + '"]');

			var targetConnections = shapeData.targetConnections;
			for (var id in targetConnections) {
				var connectionData = targetConnections[id],
					tShape = diagram.querySelector('[data-flow-shape-id="' + id + '"]');
				jsPlumb.connect({
					source: sShape,
					target: tShape,
					label: connectionData.label || ''
				});
			}
		}
		jsPlumb.setSuspendDrawing(false, true);
	};

	flow.appendTabItemToDiagramArea = function(diagramName) {
		var activeTab = Cache.tabMenuList.querySelector('.flow.tab.item.active');
		if (activeTab !== null) {
			activeTab.classList.remove('active');
		}

		Cache.tabMenuList.insertAdjacentHTML(
			'beforeEnd', flow.Templates.getTabItem(flow.getCurrentDiagram().id, diagramName)
		);
	};

	/**
	 * Erase stored data from all diagrams, close the current open diagram and all the open diagram tabs
	 */
	flow.closeAllDiagrams = function() {
		flow.cleanAllDiagramsStoredData = {};

		while (Cache.tabMenuList.hasChildNodes()) {
			Cache.tabMenuList.removeChild(Cache.tabMenuList.lastChild);
		};

		var currentDiagram = flow.getCurrentDiagram();
		if (currentDiagram !== null) {
			flow.closeDiagram(currentDiagram);
		}
	};

	var _makeDiagramDroppable = function(diagram) {
		var k = jsPlumb._katavorio;
		k.droppable(diagram, {
			scope: 'dragFromMenu',
			drop:function(params) {
				var baseShape = params.drag.el,
					maxAllowedCopies = parseInt(baseShape.getAttribute('data-flow-max-copies'), 10),
					type = baseShape.getAttribute('data-flow-shape-type');

				if (maxAllowedCopies === -1 || _getAmountOfShapesInDiagram(diagram, type) < maxAllowedCopies) {
					var shapeClone = baseShape.cloneNode(true);

					shapeClone.style.left = params.e.layerX + 'px'; // TODO scroll
					shapeClone.style.top = params.e.layerY + 'px'; // TODO scroll

					diagram.appendChild(shapeClone);

					_setupShape(shapeClone);
				}
				else {
					flow.Alerts.showWarningMessage('You cannot create more shapes of this type');
				}
			}
		});
	};

	var _getAmountOfShapesInDiagram = function(diagram, shapeType) {
		return diagram.querySelectorAll('div.shape[data-flow-shape-type="' + shapeType + '"]').length;
	};

	var _setupShape = function(shape) {
		var shapeData = _getShapeData(shape);

		shape.removeAttribute('id'); // ENSURE ID is empty. jsPlumb.draggable will create a new one

		jsPlumb.draggable(shape, {
			// containment: true, // block scroll
			//filter: '.resize', // not working
			//consumeFilteredEvents: true
			start: function(params) {
				var shape = params.el;
				flow.Selection.addSelectedShape(shape);
			}
		});

		if (!shapeData.secondId) {
			shape.setAttribute('data-flow-shape-id', flow.Util.getUniqueID(shapeData.type));
		}

		if (shapeData.maxInputs > 0) {
			jsPlumb.makeTarget(shape, {
				maxConnections: shapeData.maxInputs,
				isTarget: true
			});
		}
		else if (shapeData.maxOutputs === -1) {
			jsPlumb.makeTarget(shape, {
				isTarget: true
			});
		}

		if (shapeData.maxOutputs > 0) {
			jsPlumb.makeSource(shape, {
				maxConnections: shapeData.maxOutputs,
				filter: '.connector',
				isSource: true
			});
		}
		else if (shapeData.maxOutputs === -1) {
			jsPlumb.makeSource(shape, {
				filter: '.connector',
				isSource: true
			});
		}
	};

	var _getShapeData = function(shape) {
		var codeEl = shape.querySelector('code');
		return {
			secondId: shape.getAttribute('data-flow-shape-id'), // we need a static id
			type: shape.getAttribute('data-flow-shape-type'),
			hasUserText: shape.getAttribute('data-flow-has-user-text') === 'true', // cast to boolean
			maxOutputs: parseInt(shape.getAttribute('data-flow-max-outputs'), 10),
			maxInputs: parseInt(shape.getAttribute('data-flow-max-inputs'), 10),
			maxCopies: parseInt(shape.getAttribute('data-flow-max-copies'), 10),
			value: (codeEl !== null) ? codeEl.textContent : '',
            left: shape.style.left,
            top: shape.style.top
		};
	};

	return flow;

})(flow || {}, document, jsPlumb);
