/**
 * Alerts Submodule
 */
var flow = (function(flow, doc) {
	'use strict';

	flow.Alerts = {};

	var Alerts = flow.Alerts,
		_messageBox = null,
		_timer = null;

	Alerts.showInfoMessage = function(message) {
		_showMessage(message, 'info');
	};

	Alerts.showWarningMessage = function(message) {
		_showMessage(message, 'warning');
	};

	Alerts.showErrorMessage = function(message) {
		_showMessage(message, 'error');
	};

	Alerts.showSuccessMessage = function(message) {
		_showMessage(message, 'success');
	};

	Alerts.confirm = function(message) {
		return window.confirm(message);
	};

	var _showMessage = function(message, type) {
		var fractions = [0, 0.80, 0.82, 0.84, 0.86, 0.88, 0.9];

		window.clearInterval(_timer); // clear previous timers

		if (_messageBox === null || _messageBox.parentNode === null) {
			_messageBox = doc.getElementById('alert-messages');
		}
		_messageBox.setAttribute('data-flow-message-type', type);
		_messageBox.innerHTML = '<span>' + message + '</span>';
		_messageBox.style.opacity = 1;

		_timer = setInterval(function() {
			if (_messageBox.style.opacity > 0) {
				_messageBox.style.opacity = fractions.pop();
			}
			else {
				window.clearTimeout(_timer);
			}
		}, 500);
	};

	return flow;
})(flow || {}, document);