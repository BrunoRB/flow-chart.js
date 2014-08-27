
var flow = (function(flow) {
	'use strict';

	flow.Const = {};

	var Const = flow.Const;

	Const.MAX_INPUT_LENGTH = 30;

	Const.SHAPE_TYPE = {
		PROCESS: 'process',
		DISPLAY: 'display',
		DECISION: 'decision',
		MANUAL_INPUT: 'manual_input',
		CONNECTOR: 'connector',
		BEGIN: 'begin',
		END: 'end'
	};

	Const.DIAGRAM_EVENT = {
		LOADED: 'diagram_loaded'
	};

	Const.SHAPE_EVENT = {
		SELECTED: 'shape_selected',
		MOVED: 'shape_moved',
		DELETED: 'shape_deleted',
		ALTERATED: 'shape_altered',
		CREATED: 'shape_created'
	};

	Const.CONNECTION_EVENT = {
		ALTERED: 'connection_altered',
		SELECTED: 'connection_selected'
	};

	Const.CONNECTION_TYPE = {
		BOOLEAN: 'boolean',
		TEXT: 'text'
	};

	return flow;
})(flow || {});