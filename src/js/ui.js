
var flow = (function(flow, doc) {
	"use strict";

flow.UI = {

    appendContentToConsole: function(text) {
        flow.Cache.consoleExhibitionContent.insertAdjacentHTML('beforeEnd', "<code>" + text + "</code><br>");
		flow.Cache.consoleExhibition.scrollTop = flow.Cache.consoleExhibition.scrollHeight;
    },

    cleanConsoleContent: function() {
        flow.Cache.consoleExhibitionContent.textContent = '';
    },

    enableExecutionButtons: function() {
        this.disableExecutionButtons();
        this.enableExecuteButton();
        this.enableDebugButton();
    },

    disableExecutionButtons: function() {
        this.disableExecuteButton();
        this.disableDebugButton();
        this.disableDebugNextButton();
        this.disableDebugStopButton();
    },

    disableDebugButtons: function() {
        this.disableDebugNextButton();
        this.disableDebugStopButton();
        this.enableDebugButton();
    },

    enableDebugNextButton: function() {
        flow.Cache.consoleDebugNext.removeAttribute('disabled');
    },

    disableDebugNextButton: function() {
        flow.Cache.consoleDebugNext.setAttribute('disabled', 'disabled');
    },

    enableExecuteButton: function() {
        flow.Cache.consoleExecute.removeAttribute('disabled');
    },

    disableExecuteButton: function() {
        flow.Cache.consoleExecute.setAttribute('disabled', 'disabled');
    },

    enableDebugStopButton: function() {
        flow.Cache.consoleDebugStop.removeAttribute('disabled');
    },

    disableDebugStopButton: function() {
        flow.Cache.consoleDebugStop.setAttribute('disabled', 'disabled');
    },

    enableDebugButton: function() {
        flow.Cache.consoleDebugStart.removeAttribute('disabled');
    },

    disableDebugButton: function() {
        flow.Cache.consoleDebugStart.setAttribute('disabled', 'disabled');
    },

    openHelp: function() {
        flow.Cache.$helpTab.addClass("active");
        document.getElementById("help-content").style.display = "block";
    },

    closeHelp: function() {
        flow.Cache.$helpTab.removeClass("active");
        document.getElementById("help-content").style.display = "none";
    },

    openTextConnection: function(connection) {
        var idConnLabel = this.getConnectionHtmlId(connection),
			currentLable = connection.getLabel();

        if (currentLable === null || currentLable === '') { // case there's no label yet
            connection.setLabel(
                flow.Templates.getConnectionEmptyInput(idConnLabel)
            );
        }
        else { // here we alredy have a label
            var existantLabel = doc.getElementById(idConnLabel),
				oldText = existantLabel.textContent;

            connection.setLabel(
                flow.Templates.getConnectionFilledInput(
                    idConnLabel, oldText, existantLabel.style.top, existantLabel.style.left
                )
            );
        }

        this.blurOnConnectionInput(connection, oldText);
    },

    blurOnConnectionInput: function(connection) {
        var that = this,
			inputField = doc.getElementById(this.getConnectionHtmlId(connection));

        inputField.select();

        inputField.focus();

        flow.Util.on(inputField, 'blur', function() {
            that.setNewValueOfConnection(connection, this);
        });
    },

    openBooleanConnection: function(connection) {
        var idConnection = this.getConnectionHtmlId(connection),
			labelField = doc.getElementById(idConnection);

        if (labelField !== null && /true/i.test(labelField.textContent)) {
            connection.setLabel(
                flow.Templates.getConnectionSelectWithTrueSelected(
                    idConnection,
                    labelField.style.top,
                    labelField.style.left
                )
            );
        }
        else if (labelField !== null && /false/i.test(labelField.textContent)) {
            connection.setLabel(
                flow.Templates.getConnectionSelectWithFalseSelected(
                    idConnection,
                    labelField.style.top,
                    labelField.style.left
                )
            );
        }
        else if (labelField !== null) {
            connection.setLabel(flow.Templates.getConnectionSelect(idConnection));
        }
        else {
            connection.setLabel(flow.Templates.getConnectionSelect(idConnection));
        }

        this.clickOrBlurOnConnectionSelect(connection);
    },

    clickOrBlurOnConnectionSelect: function(connection) {
        var that = this,
			selectField = doc.getElementById(this.getConnectionHtmlId(connection));

        selectField.focus();

        flow.Util.on(selectField, 'blur', function() { // TODO on change
            that.setNewValueOfConnection(connection, this);
        });
    },

    getConnectionHtmlId: function(connection) {
        return connection.sourceId + "_" + connection.targetId;
    },

    setNewValueOfConnection: function(connection, field) {
        var labelId = field.id,
			newText = field.value,
			labelField = null;

        connection.setLabel(
            flow.Templates.getConnectionPlainText(
                labelId, newText, field.style.top, field.style.left
            )
        );

//      TODO, the element can be dragged, but it moves away from the cursor
//      labelField = doc.getElementById(labelId);
//		jsPlumb.draggable(labelField, {
//            opacity: 0.8
//        });
    },

    openShapeInput: function(shape) {
        var codeEl = null,
			oldText = null,
			inputEl = null;

		codeEl = shape.querySelector('code');
		oldText = codeEl.textContent;

        codeEl.outerHTML = flow.Templates.getShapeInnerInput(oldText);

        inputEl = shape.querySelector('input');

        inputEl.focus(); // set focus here so he can alredy start typing
        inputEl.select();

        // back to "code"
		var triggered = false;
        flow.Util.on(inputEl, 'blur', function(event) {
			if (!triggered) {
				triggered = true;
				_removeInputFocus.call(this, event);
			}
		});
		flow.Util.on(inputEl, 'keyup', function(event) {
			if (event.keyCode === 13 && !triggered) {
				triggered = true;
				_removeInputFocus.call(this, event);
			}
        });

		var _removeInputFocus = function(event) {
            this.outerHTML = flow.Templates.getShapeInnerCode(this.value); //Hidden again
		};
    },

	markShapeAsSelected: function(shape) {
		shape.classList.add('selected');
        shape.focus();
    },

    unmarkShapeAsSelected: function(shape) {
		shape.classList.remove('selected');
    },

	unmarkAllShapes: function() {
		var shapes = flow.getCurrentDiagram().querySelectorAll('div.shape.executed, div.shape.invalid');
		for (var i=shapes.length; i--; ) {
			var shape = shapes[i];
			shape.classList.remove('invalid');
			shape.classList.remove('executed');
		}
	},

	markShapeAsExecuted: function(shape) {
		shape.classList.add('executed');
        shape.focus();
    },

    unmarkShapeAsExecuted: function(shape) {
		shape.classList.remove('executed');
    },

    markShapeAsInvalid: function(shape) {
		shape.classList.add('invalid');
        shape.focus();
    },

    unmarkShapeAsInvalid: function(shape) {
		shape.classList.remove('invalid');
    },

    markFailure: function(message, shape) {
        if (shape !== undefined) {
            this.markShapeAsInvalid(shape);
        }
        flow.Alerts.showErrorMessage(message);

        this.enableExecutionButtons();

        throw message;
    }
};

	return flow;
})(flow || {}, document);