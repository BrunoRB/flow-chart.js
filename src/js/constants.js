
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
		LOADED: 'loaded'
	};

	Const.SHAPE_EVENT = {
		SELECTED: 'selected',
		MOVED: 'moved',
		DELETED: 'deleted',
		ALTERATED: 'altered',
		CREATED: 'created'
	};

	Const.CONNECTION_EVENT = {
		ALTERED: 'altered',
		SELECTED: 'selected'
	};

	Const.CONNECTION_TYPE = {
		BOOLEAN: 'boolean',
		TEXT: 'text'
	};

	return flow;
})(flow || {});