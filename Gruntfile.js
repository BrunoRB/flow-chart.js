
module.exports = function(grunt) {

	var _shapes = [
		{
			type: 'begin', hasUserText: false, maxOutputs: 1, maxInputs: 0, maxCopies: 1, connectionType: 'text'
		},
		{
			type: 'end', hasUserText: false, maxOutputs: 0, maxInputs: 1, maxCopies: 1, connectionType: 'text'
		},
		{
			type: 'process', hasUserText: true, maxOutputs: 1, maxInputs: 1, maxCopies: -1, connectionType: 'text'
		},
		{
			type: 'manual_input', hasUserText: true, maxOutputs: 1, maxInputs: 1, maxCopies: -1,
			connectionType: 'text'
		},
		{
			type: 'display', hasUserText: true, maxOutputs: 1, maxInputs: 1, maxCopies: -1, connectionType: 'text'
		},
		{
			type: 'decision', hasUserText: true, maxOutputs: 2, maxInputs: 1, maxCopies: -1,
			connectionType: 'boolean'
		},
		{
			type: 'connector', hasUserText: true, maxOutputs: 1, maxInputs: 2, maxCopies: -1,
			connectionType: 'text'
		}
	];

	var indexTemplate = grunt.file.read('./src/templates/index.template.html'),
		processedTemplate = grunt.template.process(
			indexTemplate,
			{data: {shapes: _shapes}}
		);

	grunt.file.write('./index.html', processedTemplate);

	// Project configuration.
    grunt.initConfig({
		pkg: grunt.file.readJSON('package.json')
    });

    // Default task(s).
    grunt.registerTask(
        'default',
        []
    );

};