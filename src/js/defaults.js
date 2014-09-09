
var flow = (function(flow, jsPlumb) {

	flow.setDefaults = function() {
		_setJsPlumbDefaults();

		_uiDefaults();

		_examples();
	};

	var _uiDefaults = function() {
		// diagram height
		var containerStyle = flow.Cache.diagramContainer.style,
			tabMenuHeight = window.getComputedStyle(
				flow.Cache.diagramContainer.querySelector('.flow.tab.menu')
			).getPropertyValue('height'),
			windowHeight = window.innerHeight;

		containerStyle.height = windowHeight - parseInt(tabMenuHeight, 10) + 'px';

		window.onresize = function(event) {
			windowHeight = window.innerHeight;
			containerStyle.height =
				windowHeight - parseInt(tabMenuHeight, 10) + 'px';
		};

		//TODO manual_input and display drawings
		var shapeMenu = flow.Cache.shapeMenu,
			displaySpan = shapeMenu.querySelector('div.shape.display .shape.image'),
			displayNewImg = document.createElement('img'),
			manualInputSpan = shapeMenu.querySelector('div.shape.manual_input .shape.image'),
			manualInputNewImg = document.createElement('img');

		displayNewImg.src = '../src/img/display.gif';
		displayNewImg.className = 'shape image';
		displaySpan.parentNode.replaceChild(displayNewImg, displaySpan);

		manualInputNewImg.src = '../src/img/manual_input.png';
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

		jsPlumb.Defaults.ConnectionOverlays = [
			['Arrow', {width: 25, length: 25, location: 1}]
		];

		jsPlumbDefaults.ReattachConnections = true;
	};

	var _examples = function() {
		var decisionExample = JSON.stringify({"diagrams":{"Newdiagram-1-1-1-4-4-4-1-1-2-3-2-1":{"id":"Newdiagram-1-1-1-4-4-4-1-1-2-3-2-1-1","name":"Example 3: decision","shapes":[{"id":"process-8","type":"process","top":"57px","left":"186px","code":"x = 10","sourceConnections":{"begin-2":{"label":null}},"targetConnections":{"decision-3":{"label":null}},"width":null,"height":null},{"id":"end-7","type":"end","top":"227px","left":"1087px","code":"","sourceConnections":{"connector-6":{"label":null}},"targetConnections":{},"width":null,"height":null},{"id":"connector-6","type":"connector","top":"318px","left":"816px","code":"","sourceConnections":{"display-5":{"label":null},"display-4":{"label":null}},"targetConnections":{"end-7":{"label":null}},"width":null,"height":null},{"id":"display-5","type":"display","top":"337px","left":"400px","code":"\"not\"","sourceConnections":{"decision-3":{"label":"<p id='jsPlumb_1_9_jsPlumb_1_11' class='connection label overlay' style='top:;left:;' >false</p>"}},"targetConnections":{"connector-6":{"label":null}},"width":null,"height":null},{"id":"display-4","type":"display","top":"66px","left":"791px","code":"\"x is 10\"","sourceConnections":{"decision-3":{"label":"<p id='jsPlumb_1_9_jsPlumb_1_10' class='connection label overlay' style='top:;left:;' >true</p>"}},"targetConnections":{"connector-6":{"label":null}},"width":null,"height":null},{"id":"decision-3","type":"decision","top":"104px","left":"467px","code":"x == 10","sourceConnections":{"process-8":{"label":null}},"targetConnections":{"display-5":{"label":"<p id='jsPlumb_1_9_jsPlumb_1_11' class='connection label overlay' style='top:;left:;' >false</p>"},"display-4":{"label":"<p id='jsPlumb_1_9_jsPlumb_1_10' class='connection label overlay' style='top:;left:;' >true</p>"}},"width":null,"height":null},{"id":"begin-2","type":"begin","top":"225px","left":"69px","code":"","sourceConnections":{},"targetConnections":{"process-8":{"label":null}},"width":null,"height":null}]},"Newdiagram-27-2-3-2":{"id":"Newdiagram-27-2-3-2-2","name":"Example 2: User input","shapes":[{"id":"end-31","type":"end","top":"684px","left":"1914px","code":"","sourceConnections":{"display-30":{"label":null}},"targetConnections":{},"width":null,"height":null},{"id":"display-30","type":"display","top":"695px","left":"1701px","code":"someVar","sourceConnections":{"manual_input-29":{"label":null}},"targetConnections":{"end-31":{"label":null}},"width":null,"height":null},{"id":"manual_input-29","type":"manual_input","top":"680px","left":"1419px","code":"someVar","sourceConnections":{"begin-28":{"label":null}},"targetConnections":{"display-30":{"label":null}},"width":null,"height":null},{"id":"begin-28","type":"begin","top":"542px","left":"1293px","code":"","sourceConnections":{},"targetConnections":{"manual_input-29":{"label":null}},"width":null,"height":null}]},"Newdiagram-20-2-1-1-1-3":{"id":"Newdiagram-20-2-1-1-1-3-3","name":"Example 1: Hello World","shapes":[{"id":"end-26","type":"end","top":"714px","left":"1860px","code":"","sourceConnections":{"display-25":{"label":null}},"targetConnections":{},"width":null,"height":null},{"id":"display-25","type":"display","top":"756px","left":"1467px","code":"x + \"World\"","sourceConnections":{"process-24":{"label":null}},"targetConnections":{"end-26":{"label":null}},"width":null,"height":null},{"id":"process-24","type":"process","top":"597px","left":"1439px","code":"x <- \"Hello \"","sourceConnections":{"begin-23":{"label":null}},"targetConnections":{"display-25":{"label":null}},"width":"126px","height":"48px"},{"id":"begin-23","type":"begin","top":"543px","left":"1189px","code":"","sourceConnections":{},"targetConnections":{"process-24":{"label":null}},"width":null,"height":null}]}},"data":{"count":35}});

		if (localStorage.getItem('flow') === null) {
			localStorage.setItem('flow', decisionExample);
		}
	};

	return flow;
})(flow || {}, jsPlumb);