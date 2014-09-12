/**
 * Util Submodule
 */
var flow = (function(flow, doc, jsPlumbUtil) {
	'use strict';

	flow.Util = {};


	var Util = flow.Util,
		mottle = new Mottle();

	Util.count = 1;

	Util.getUniqueID = function(str) {
		str = str.replace(/\s/g, '');
		return str + '-' + (Util.count++);
	};

	Util.isEmptyObject = function(obj) {
		return Object.keys(obj).length === 0;
	};

	/**
	 * @deprecated use trigger instead
	 */
	Util.triggerEvent = function(eventType, element) {
		var event = new Event(eventType, {
			view: window,
			bubbles: true,
			cancelable: true
		});

		return element.dispatchEvent(event);
	};

	Util.trigger = function(eventType, element, extra) {
		mottle.trigger(element, eventType, undefined, extra);
		return this;
	};

	Util.on = function() {
		if (arguments.length === 3) {
			mottle.on(arguments[0], arguments[1], arguments[2]);
		}
		else if (arguments.length === 4) {
			this.elementAddDelegatedEvent(arguments[0], arguments[1], arguments[2], arguments[3]);
			//mottle.on(arguments[0], arguments[1], arguments[2], arguments[3]);
		}
		else {
			console.log('called On method with wrong number of arguments');
		}
		return this;
	};

	Util.extend = function(child, parent) {
		return jsPlumbUtil.extend(child, parent);
	};

	/**
	 * @deprecated use "on" instead
	 */
	Util.elementAddDelegatedEvent = function(element, event, selector, callback) {
		var that = this;

		element.addEventListener(event, function(event) {
			var target = event.target,
				isTrueTarget = true;
			while (!that.elementMatches(target, selector)) {
				if (!target || target.isEqualNode(element)) {
					isTrueTarget = false;
					break;
				}
				target = target.parentNode;
			}

			if (isTrueTarget) {
				callback.call(target, event);
			}
		}, false);
	};

	Util.remove = function(element) {
		mottle.remove(element);
		return this;
	};

	Util.isFunction = function(element) {
		return jsPlumbUtil.isFunction(element);
	};

	 /**
     * Call all functions of a given object (just parameter-less funcs)
     */
    Util.invokeAllFunctions = function(obj) {
        Object.getOwnPropertyNames(obj).forEach(function(propertieName) {
            if (typeof obj[propertieName] === "function") {
                obj[propertieName]();
            }
        });
    };

	Util.elementMatches = function(element, selector) {
		var matches = doc.body.matchesSelector || doc.body.webkitMatchesSelector
			|| doc.body.mozMatchesSelector || doc.body.msMatchesSelector
			|| doc.body.webkitMatchesSelector || doc.body.matchesSelector;
		return element && matches.call(element, selector);
	};

	Util.isNumber = function(el) {
		return !window.isNaN(el);
	};

	return flow;
})(flow || {}, document, jsPlumbUtil);