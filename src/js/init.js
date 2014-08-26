jsPlumb.ready(function() {
	'use strict';

	flow.Cache.setCache();

	flow.setDefaults();

	flow.makeMenuShapesDraggable();

	flow.Util.invokeAllFunctions(flow.StaticListeners);

	var opened = flow.openLocallyStoredDiagrams();
	if (opened) {
		flow.Alerts.showSuccessMessage('Diagrams found in the browser automatically open');
	}
});
