/**
 * Listeners Submodule
 */
var flow = (function(flow, doc, jsPlumb) {
	'use strict';

	flow.Listeners = {};

	var Listeners = flow.Listeners,
		Cache = flow.Cache,
		Util = flow.Util;

	Listeners.setupDiagramEvents = function(diagram) {
		_shapeResizeListeners(diagram);

		_diagramToolbarEvents(diagram);
	};

	var _shapeResizeListeners = function(diagram) {
		// TODO gamb. This HAS to be changed
		Util.on(diagram, 'mouseover', function(event) {
			var target = event.target;
			if (!(target instanceof SVGElement) && target.className.indexOf('resize anchor') !== -1) {
				jsPlumb.setDraggable(target.parentNode, false);
			};
		});
		Util.on(diagram, 'mouseout', function(event) {
			var target = event.target;
			if (!(target instanceof SVGElement) && target.className.indexOf('resize anchor') !== -1) {
				jsPlumb.setDraggable(target.parentNode, true);
			};
		});
		// END gamb

		_shapeResize(diagram);
	};

	var _shapeResize = function(diagram) {
		var mouseDownTarget,
			initiated = false,
			lastX,
			lastY;
		diagram.addEventListener('mousedown', function(event) {
			var target = event.target;
			if (!(target instanceof SVGElement) && target.className.indexOf('resize anchor') !== -1) {
				mouseDownTarget = target;
				diagram.addEventListener('mousemove', _onMouseMove);
			}
		});

		var _onMouseMove = function(event) {
			var layerX = event.screenX,
				layerY = event.screenY;

			if (initiated === true) {
				var diff,
					shape = mouseDownTarget.parentNode,
					img =  mouseDownTarget.parentNode.querySelector('.shape.image'),
					shapeLeftDistance = parseInt(shape.style.left, 10),
					shapeTopDistance = parseInt(shape.style.top, 10);

				if (!img.style.width) {
					img.style.width = window.getComputedStyle(img).getPropertyValue('width');
				}
				if (!img.style.height) {
					img.style.height = window.getComputedStyle(img).getPropertyValue('height');
				}

				var imgWidth = parseInt(img.style.width, 10),
					imgHeight = parseInt(img.style.height, 10),
					targetClassList = mouseDownTarget.classList;

				if (lastX > layerX) {
					diff = lastX - layerX;
					if (targetClassList.contains('left')) {
						shape.style.left = shapeLeftDistance - diff + 'px';
						img.style.width = imgWidth + diff + 'px';
					}
					else {
						img.style.width = imgWidth - diff + 'px';
					}
				}
				else if (lastX < layerX) {
					diff = layerX - lastX;
					if (targetClassList.contains('left')) {
						shape.style.left = shapeLeftDistance + diff + 'px';
						img.style.width = imgWidth - diff + 'px';
					}
					else {
						img.style.width = imgWidth + diff + 'px';
					}
				}

				if (layerY > lastY) {
					diff = layerY - lastY;

					if (targetClassList.contains('bottom')) {
						img.style.height = imgHeight + diff + 'px';
					}
					else {
						shape.style.top = shapeTopDistance + diff + 'px';
						img.style.height = imgHeight - diff + 'px';
					}
				}
				else if (layerY < lastY) {
					diff = lastY - layerY;

					if (targetClassList.contains('bottom')) {
						img.style.height = imgHeight - diff + 'px';
					}
					else {
						shape.style.top = shapeTopDistance - diff + 'px';
						img.style.height = imgHeight + diff + 'px';
					}
				}

				jsPlumb.repaint(mouseDownTarget.parentNode);
			}
			initiated = true;
			lastX = layerX;
			lastY = layerY;
		};

		Util.on(diagram, 'mouseup', function(event) {
			this.removeEventListener('mousemove', _onMouseMove, false);
			initiated = false;
		});
	};

	var _diagramToolbarEvents = function(diagram) {
		Util.on(diagram, 'change', '.flow.diagram.toolbar input[type="radio"]', function(event) {
			var targetName = this.name;

			if (targetName === 'connector-style') {
				jsPlumb.Defaults.Connector = this.value;
			}
			else if (targetName === 'connector-type') {
				var type = this.value;

				jsPlumb.Defaults.ConnectionOverlays = flow.getConnectionOverlayByType(type);

				flow.currentConnectorType = type;
			}
		});
	};

	return flow;
})(flow || {}, document, jsPlumb);
