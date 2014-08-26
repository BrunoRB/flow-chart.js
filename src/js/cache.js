
var flow = (function(flow, doc) {
	'use strict';

	flow.Cache = {

		setCache: function() {
			var Cache = flow.Cache;

			Cache.shapeMenu = doc.getElementById('shape-menu');

			Cache.diagramContainer = doc.getElementById('right-area');

			Cache.toolbarContainer = doc.getElementById('toolbar-container');

			Cache.tabMenuList = Cache.diagramContainer.querySelector('.flow.tab.list');

			Cache.consoleArea = doc.getElementById('console-area');

			Cache.consoleToggle = Cache.consoleArea.querySelector('.console.toggle.button');

			Cache.consoleExecute = Cache.consoleArea.querySelector('.console.execution.buttons .execute');

			Cache.consoleDebugStart = Cache.consoleArea.querySelector('.console.execution.buttons .debug.start');

			Cache.consoleDebugStop = Cache.consoleArea.querySelector('.console.execution.buttons .debug.stop');

			Cache.consoleDebugNext = Cache.consoleArea.querySelector('.console.execution.buttons .debug.next');

			Cache.consoleExhibition = Cache.consoleArea.querySelector('.console.exhibition');

			Cache.consoleExhibitionClean = Cache.consoleArea.querySelector('.clean');

			Cache.consoleExhibitionContent = Cache.consoleExhibition.querySelector('.content');
		}

	};

	return flow;
})(flow || {}, document);