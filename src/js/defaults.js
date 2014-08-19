
var flow = (function(flow, jsPlumb) {

	flow.setDefaults = function() {
		_setJsPlumbDefaults();

		_uiDefaults();
	};

	var _uiDefaults = function() {
		// diagram height
		var containerStyle = flow.Cache.diagramContainer.style,
			consoleStyle = flow.Cache.consoleArea.style,
			tabMenuHeight = window.getComputedStyle(
				flow.Cache.diagramContainer.querySelector('.flow.tab.menu')
			).getPropertyValue('height'),
			windowHeight = window.innerHeight;

		containerStyle.height = windowHeight - parseInt(tabMenuHeight, 10) + 'px';

		window.onresize = function(event) {
			windowHeight = window.innerHeight;
			containerStyle.height =
				windowHeight - parseInt(tabMenuHeight, 10) - parseInt(consoleStyle.height, 10) + 'px';
		};

		//TODO manual_input and display drawings
		var shapeMenu = flow.Cache.shapeMenu,
			displaySpan = shapeMenu.querySelector('div.shape.display .shape.image'),
			displayNewImg = document.createElement('img'),
			manualInputSpan = shapeMenu.querySelector('div.shape.manual_input .shape.image'),
			manualInputNewImg = document.createElement('img');

		displayNewImg.src = 'src/img/display.gif';
		displayNewImg.className = 'shape image';
		displaySpan.parentNode.replaceChild(displayNewImg, displaySpan);

		manualInputNewImg.src = 'src/img/manual_input.png';
		manualInputNewImg.className = 'shape image';
		manualInputSpan.parentNode.replaceChild(manualInputNewImg, manualInputSpan);
	};

	var _setJsPlumbDefaults = function() {
		var jsPlumbDefaults = jsPlumb.Defaults;

		var endPointStyles = {fillStyle: 'transparent'};
		jsPlumbDefaults.EndpointStyles = [endPointStyles, endPointStyles];

		jsPlumbDefaults.Endpoints = [
			['Rectangle', {cssClass: 'source-anchor', radius: 15}],
			['Rectangle', {radius: 15}]
		];

		jsPlumbDefaults.Anchor = 'AutoDefault';

		jsPlumbDefaults.Connector = 'Bezier';
		//jsPlumbDefaults.Connector = 'StateMachine';
		//jsPlumbDefaults.Connector = 'Flowchart';
		//jsPlumbDefaults.Connector = 'Straight';

		//jsPlumbDefaults.ConnectionOverlays = [ ['Arrow', {width: 25, length: 25, location: 1}] ];

		jsPlumbDefaults.PaintStyle = {
			gradient: {
				stops: [
					[0, 'midnightblue'], [1, 'black']
				]
			},
			strokeStyle: 'black',
			lineWidth: 6
		};

		jsPlumbDefaults.ReattachConnections = false;
	};

	return flow;
})(flow || {}, jsPlumb);