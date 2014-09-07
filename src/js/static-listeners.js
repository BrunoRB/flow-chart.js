/**
 * Static listeners, called just once
 */
var flow = (function(flow, doc, jsPlumb) {
	'use strict';

	flow.StaticListeners = {};

	var StaticListeners = flow.StaticListeners,
		Cache = flow.Cache,
		Util = flow.Util;

	StaticListeners._createDiagramClick = function() {
		Util.on(Cache.toolbarContainer, 'click', '#create-new-flowchart', function(event) {
			event.preventDefault();

			// target.href comes with domain url
			var diagramName = 'New diagram';

			flow.createDiagram(diagramName);

			flow.appendTabItemToDiagramArea(diagramName);

		});
	};

	StaticListeners._openDiagramsClick = function() {
		var uploadInput = doc.getElementById('temp-upload');

		Util.on(Cache.toolbarContainer, 'click', 'ul.flow.toolbar.list.open.diagram li a', function(event) {
				event.preventDefault();
				var result = flow.Alerts.confirm(
					'This will close all your diagrams WITHOUT saving. Want to proceed?'
				);

				if (result) {
					_routeOpen.call(this);
				}
		});

		uploadInput.addEventListener('change', function(event) {
			var selectedFile = uploadInput.files[0],
				reader = new FileReader();

			reader.onload = function() {
				var text = reader.result;
				flow.openDiagrams(text);
			};

			reader.readAsText(selectedFile);
		}, false);

		var _routeOpen = function() {
			flow.closeAllDiagrams();

			var openAs = this.getAttribute('href'); // this.href comes with domain url

			switch (openAs) {
				case 'json-file':
					Util.trigger('click', uploadInput);
					break;
				case 'local-storage':
					var opened = flow.openLocallyStoredDiagrams();
					if (!opened) {
						flow.Alerts.showErrorMessage('No diagrams found in the browser');
					}
					break;
				default:
					var message = 'Open ' + openAs + ' option doesn\'t exist';
					flow.Alerts.showErrorMessage(message);
					throw message;
			};
		};
	};

	StaticListeners._saveDiagramsClick = function() {
		var selector = 'ul.flow.toolbar.list.save.diagram li a:not(.ignore):not(.click)';
		// TODO: the files or data being saed with te name 'flow', wich generate conflicts between diferent
		// sets of diagrams
		Util.on(Cache.toolbarContainer, 'click', selector, function(event) {
			event.preventDefault();

			var storedDataFromAllDiagrams = flow.getStoredDataFromAllDiagrams(),
				count = 1,
				diagrams = storedDataFromAllDiagrams.diagrams;
			for (var index in diagrams) {
				diagrams[index].id = diagrams[index].id + '-' + count++;
			}

			var saveAs = this.getAttribute('href'), // this.href comes with domain url
				stringifiedDiagramsData = JSON.stringify(storedDataFromAllDiagrams);

			switch (saveAs) {
				case 'json-file':
					// TODO refactor: move to a specific func (where?)
					// TODO maybe improve the code? not sure if create a temp <a> and delete it is the best option
					var parent = this.parentNode,
						str = window.btoa(unescape(encodeURIComponent(stringifiedDiagramsData))),
						jsonHREF = 'data:text/octet-stream;base64,' + str;

					parent.insertAdjacentHTML(
						'beforeEnd',
						'<a id="temp-link" class="ignore click" href="' + jsonHREF + '" download="flow.json"></a>'
					);

					var tempLinkDOM = parent.querySelector('#temp-link');

					tempLinkDOM.click();

					parent.removeChild(tempLinkDOM);

					break;
				case 'local-storage':
					window.localStorage.setItem('flow', stringifiedDiagramsData);
					break;
				default:
					var message = 'Save ' + saveAs + ' option doesn\'t exist';
					flow.Alerts.showErrorMessage(message);
					throw message;
			}

			flow.Alerts.showSuccessMessage('Successfully saved');
		});
	};

	StaticListeners._tabCloseDiagramClick = function() {
		Util.on(Cache.diagramContainer, 'click', '.flow.tab.close', function() {
			if (flow.Alerts.confirm('You really want to delete this flowchart?')) {
				var idTarget = this.getAttribute('data-flow-target'),
					diagram = doc.getElementById(idTarget);
				if (diagram !== null) {
					flow.closeDiagram(diagram);
				}

				flow.cleanStoredDiagramData(idTarget);

				Util.remove(this.parentNode);
			}
		});
	};

	StaticListeners._tabOpenDiagramClick = function() {
		Util.on(Cache.diagramContainer, 'click', 'a.flow.tab.link', function() {
			var idTarget = this.getAttribute('data-flow-target');
			if (doc.getElementById(idTarget) === null) {
				var diagram = flow.getCurrentDiagram();

				if (diagram !== null) {
					flow.closeDiagram(diagram);
				}

				flow.recreateDiagramFromStoredData(idTarget);
			}
		});
	};

	StaticListeners._tabOpenDiagramDoubleClick = function() {
		Util.on(Cache.diagramContainer, 'dblclick', 'a.flow.tab.link', function() {
			var parent = this.parentNode,
				oldName = this.textContent,
				linkClone = this.cloneNode(), // @TODO this may not work on IE (even on 10)
				alreadyTriggered = false, // flag to avoid keyup and blur simultaneous trigger
				newInput = null;

			parent.removeChild(this);

			parent.insertAdjacentHTML(
				'beforeEnd', '<input id="flow-temp-change-name" type="text" value="' + oldName + '" />'
			);
			newInput = parent.querySelector('#flow-temp-change-name');
			newInput.focus();

			newInput.addEventListener('keyup', function(event) {
				if (alreadyTriggered === false && event.keyCode === 13) {
					alreadyTriggered = true;
					_changeDiagramName(newInput, linkClone, oldName);
				}
			});

			newInput.addEventListener('blur', function(event) {
				if (alreadyTriggered === false) {
					alreadyTriggered = true;
					_changeDiagramName(newInput, linkClone, oldName);
				}
			});
		});

		var _changeDiagramName = function(inputField, linkClone, oldName) {
			var newName = inputField.value,
				parent = inputField.parentNode,
				field = null;

			parent.removeChild(inputField);
			field = parent.appendChild(linkClone);

			if (newName.length > 3) {
				field.textContent = newName;

				if (parent.classList.contains('active')) { // parent == .flow.tab.item
					var diagram = flow.getCurrentDiagram();
					diagram.setAttribute('data-flow-name', newName);
					diagram.setAttribute('title', newName);
				}
			}
			else {
				field.textContent = oldName;
				flow.Alerts.showWarningMessage('Diagram names must contain at least 4 characters');
			}

			(function refreshSpan() {
				var span = parent.querySelector('span');
				span.style.display = 'none';
				span.offsetHeight;
				span.style.display = 'block';
			})();
		};
	};

	StaticListeners._consoleToggleButtonClick = function() {
		var interval = null;
		Cache.consoleToggle.addEventListener('click', function(event) {
			var consoleArea = Cache.consoleArea;

			window.clearInterval(interval);

			if (!consoleArea.style.height) {
				consoleArea.style.height = window.getComputedStyle(consoleArea).getPropertyValue('height');
			}

			if (consoleArea.classList.contains('hidden')) {
				interval = setInterval(function() {
					var height = parseInt(consoleArea.style.height, 10);
					if (height > 0) {
						consoleArea.style.height = height - 15 + 'px';
					}
					else {
						window.clearInterval(interval);
					}
				}, 20);
			}
			else {
				interval = setInterval(function() {
					var height = parseInt(consoleArea.style.height, 10);
					if (height < 200) {
						consoleArea.style.height = height + 15 + 'px';
					}
					else {
						window.clearInterval(interval);
					}
				}, 20);
			}

			consoleArea.classList.toggle('hidden');
		});
	};

	StaticListeners._activeFlowchartClick = function() {
		Util.on(Cache.diagramContainer, 'click', '.diagram.active', function(event) {
			flow.UI.unmarkAllShapes();
			if (event.target.classList.contains('diagram')) {
				flow.Selection.unselectElements();
			}
        });
    };

	StaticListeners._activeFlowchartKeyUp = function() {
        var that = this;
        Util.on(Cache.diagramContainer, 'keyup', '.diagram.active', function(event) {
            var flowchart = this,
				targetNodeName = event.target.nodeName.toLowerCase(),
				isDel = event.keyCode === 46;

            if (isDel && targetNodeName !== 'input') {
                flow.Selection.deleteSelectedItems();
				flowchart.focus(); // after a deletion the flowchart loses focus
            }
            else if (event.keyCode === 90 && event.ctrlKey) {
                flow.Alerts.showInfoMessage('Sorry, this feature is not implemented yet.');
				flow.State.revert(); /// TODO
            }
            else if (event.keyCode === 89 && event.ctrlKey) {
                flow.Alerts.showInfoMessage('Sorry, this feature is not implemented yet.');
                //flow.State.undoRevert(flowchart);
            }
        });
    };

	StaticListeners._shapeClick = function() {
		Util.on(Cache.diagramContainer, 'click', '.diagram.active div.shape', function(event) {
			// the drag event is triggering with a click, but this can change flow.Selection.addSelectedShape(this);
		});
	};

	StaticListeners._shapeDoubleClicked = function() {
		Util.on(Cache.diagramContainer, 'dblclick', '.active.diagram div.shape', function(event) {
            if (this.getAttribute('data-flow-has-user-text') === 'true') {
                flow.UI.openShapeInput(this);
            }
            else {
                flow.Alerts.showErrorMessage('This shape cannnot contain user input');
            }
        });
    };

	StaticListeners._executionButtonsClick = function() {
		Util.on(Cache.consoleExecute, 'click', function(event) {
			flow.ExecutionHandler.triggertExecution();
		});

		Util.on(Cache.consoleDebugStart, 'click', function(event) {
			flow.UI.enableDebugNextButton();
			flow.UI.enableDebugStopButton();
			flow.ExecutionHandler.triggerDebug();
		});

		Util.on(Cache.consoleDebugNext, 'click', function(event) {
			flow.ExecutionHandler.executeNext();
		});

		Util.on(Cache.consoleDebugStop, 'click', function(event) {
			flow.ExecutionHandler.stopDebug();
		});
	};

	StaticListeners._refreshConsoleClick = function() {
		Util.on(Cache.consoleExhibitionClean, 'click', function(event) {
			flow.UI.cleanConsoleContent();
		});
	};

	StaticListeners._shapeAltered = function() {
		var ev = flow.Const.SHAPE_EVENT.ALTERATED;
		Util.on(Cache.diagramContainer, ev, 'div.shape', function(event) {
			var shape = event.target;
			flow.State.pushShapeAlteration(shape);
		});
	};

	(function _beforeDropConnection() {
        jsPlumb.bind('beforeDrop', function(info) {
            var source = doc.getElementById(info.sourceId),
				target = doc.getElementById(info.targetId);

            var reverseConn = jsPlumb.getConnections({source: target, target: source}), // conns provenient from target
				conn = jsPlumb.getConnections({source: source, target: target}), // conns provenient from source
				sourceType = source.getAttribute('data-flow-shape-type'),
				targetType = target.getAttribute('data-flow-shape-type');

			if (source === target) { // recursive conn, prohibited. TODO this CAN happen on some elements, how to allow?
                flow.Alerts.showWarningMessage('Recursive connection isn\'t allowed');
                return false;
            }
            else if (reverseConn.length > 0) { // A-B B-A conn, prohibited TODO any reason to allow this?
                flow.Alerts.showWarningMessage('Elements already connected');
                return false;
            }
            else if (conn.length > 0) {
                flow.Alerts.showWarningMessage('Duplicate connections aren\'t allowed');
                return false;
            }
            else {
                return true;
            }
        });
    })();

    (function _connectionClick() {
        var clickedConnectionStyle = {
            gradient: {stops: [[0, "#D95C5C"], [1, "white"]]}, strokeStyle: "#D95C5C"
        };

        jsPlumb.bind('click', function(connection) {
			var previouslySelected = flow.Selection.getSelectedItem(),
				isAlreadySelected = previouslySelected && previouslySelected.type === 'connection' &&
					(previouslySelected.from === connection.sourceId && previouslySelected.to === connection.targetId);

			if (!isAlreadySelected) {
				connection.setPaintStyle(clickedConnectionStyle);
				flow.Selection.addSelectedConnection(connection.sourceId, connection.targetId);
			}
        });
    })();

	(function _connectionDblClick() {
        jsPlumb.bind('dblclick', function(connection) {
			var connectionType = connection.source.getAttribute('data-flow-connection-type');
            if (connectionType === flow.Const.CONNECTION_TYPE.BOOLEAN) {
                flow.UI.openBooleanConnection(connection);
            }
            else {
                flow.UI.openTextConnection(connection);
            }
        });
    })();

	return flow;
})(flow || {}, document, jsPlumb);
