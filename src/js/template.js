/**
 * Submodule Templates
 */
var flow = (function(flow) {
	'use strict';

	flow.Templates = {};

	var Templates = flow.Templates;

	Templates.diagramToolbar = '<div class="flow diagram toolbar">' +
		'<input id="style-Bezier" type="radio" name="connector-style" value="Bezier" checked>' +
		'<label for="style-Bezier" class="fa fa-level-down" title="Bezier connector"></label>' +
		'<input id="style-StateMachine" type="radio" name="connector-style" value="StateMachine">' +
		'<label for="style-StateMachine" class="fa fa-level-down" title="StateMachine connector"></label>' +
		'<input id="style-Flowchart" type="radio" name="connector-style" value="Flowchart">' +
		'<label for="style-Flowchart" class="fa fa-level-down" title="Flowchart connector"></label>' +
		'<input id="style-Straight" type="radio" name="connector-style" value="Straight">' +
		'<label for="style-Straight" class="fa fa-level-down" title="Straight connector"></label>' +
		'<hr>' +
		'<input id="type-simple" type="radio" name="connector-type" value="simple">' +
		'<label for="type-simple" class="fa fa-minus" title="simple"></label>' +
		'<input id="type-unidirectionalArrow" type="radio" name="connector-type" value="unidirectionalArrow">' +
		'<label for="type-unidirectionalArrow" class="fa fa-long-arrow-right" title="unidirectionalArrow"></label>' +
		'<input id="type-bidirectionalArrow" type="radio" name="connector-type" value="bidirectionalArrow">' +
		'<label for="type-bidirectionalArrow" class="fa fa-arrows-h" title="bidirectionalArrow"></label>' +
	'</div>';

	Templates.getShapeInnerInput = function(text) {
		return '<input type="text" value="' + text + '" />';
	};

	Templates.getShapeInnerCode = function(text) {
		return '<code>' + text + '</code>';
	};

	Templates.getConnectionLabel = function(content) {
		return '<span class="flow connection label">' + content + '</span>';
	};

	Templates.getNewDiagram = function(diagramName, id) {
		if (id === undefined) {
			id = flow.Util.getUniqueID(diagramName);
		}

		return '<div id="' + id + '" class="flow active diagram" title="' + diagramName + '" ' +
			'data-flow-name="' + diagramName + '" tabindex="-1">' + Templates.diagramToolbar +
		'</div>';
	};

	Templates.getTabItem = function(idDiagram, diagramName) {
		return '<li class="flow active tab item" data-flow-target="' + idDiagram + '">' +
			'<a class="flow tab link" href="#" data-flow-target="' + idDiagram + '" title="Open this diagram">'
				+ diagramName +
			'</a>' +
			'<span class="flow tab close" data-flow-target="' + idDiagram + '" title="Close this diagram">' +
				' x' +
			'</span>' +
		'</li>';
	};

	Templates.getPaginatedDiagramItem = function(idDiagram, diagramName) {
		return '<li class="flow pagination item">' +
			'<a class="flow pagination link" href="#" data-flow-target="' + idDiagram + '" >' +
				diagramName +
			'</a>' +
		'</li>';
	};

	Templates.getConnectionEmptyInput = function(id) {
        return '<input id="' + id + '" type="text" class="connector-text" ' +
            ' maxlength="' + flow.Const.MAX_INPUT_LENGTH + '" />';
    };

	Templates.getConnectionFilledInput = function(id, text, top, left) {
        return "<input id='" + id + "' type='text' value='" + text + "' class='connection label overlay' " +
            "style='top:" + top + "; left:" + left + ";' maxlength='" + flow.Const.MAX_INPUT_LENGTH + "' />";
    };

    Templates.getConnectionPlainText = function(id, text, top, left) {
        return "<p id='" + id + "' class='connection label overlay' style='top:" + top + "; left:" + left + ";' >" +
            text +
        "</p>";
    };

    Templates.getConnectionSelect = function(id, top, left) {
        return "<select id='" + id + "' class='connection label overlay' style='top:" + top + "; left:" + left + ";'>" +
            "<option value=''></option>" +
            "<option value='true'>true</option>" +
            "<option value='false'>false</option>" +
        "</select>";
    };

    Templates.getConnectionSelectWithTrueSelected = function(id, top, left) {
        return "<select id='" + id + "' class='connection label overlay' style='top:" + top + "; left:" + left + ";'>" +
            "<option value=''></option>" +
            "<option value='true' selected>true</option>" +
            "<option value='false'>false</option>" +
        "</select>";
    };

    Templates.getConnectionSelectWithFalseSelected = function(id, top, left) {
        return "<select id='" + id + "' class='connection label overlay' style='top:" + top + "; left:" + left + ";'>" +
            "<option value=''></option>" +
            "<option value='true'>true</option>" +
            "<option value='false' selected>false</option>" +
        "</select>";
    };

	return flow;
})(flow || {});
