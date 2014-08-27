
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
			type: 'connector', hasUserText: false, maxOutputs: 1, maxInputs: 2, maxCopies: -1,
			connectionType: 'text'
		}
	];

	var indexTemplate = grunt.file.read('./src/templates/index.template.html'),
		processedTemplateDev = grunt.template.process(
			indexTemplate,
			{data: {shapes: _shapes, isProduction: false}}
		),
		processedTemplateProd = grunt.template.process(
			indexTemplate,
			{data: {shapes: _shapes, isProduction: true}}
		);

	grunt.file.write('./src/index.html', processedTemplateDev);
	grunt.file.write('./dist/index.html', processedTemplateProd);

	// Project configuration.
    grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
            flowchart: {
                src: [
                    'src/js/util.js', 'src/js/state.js', 'src/js/cache.js', 'src/js/alerts.js', 'src/js/defaults.js',
					'src/js/diagram-data.js',
					'src/js/listeners.js', 'src/js/static-listeners.js', 'src/js/template.js',
					'src/js/execution-handler.js', 'src/js/ui.js', 'src/js/constants.js', 'src/js/selection.js',
					'src/js/nodes.js', 'src/js/flow-chart.js', 'src/js/init.js',
                ],
                dest: 'dist/js/flow-chart.js'
            }
		},
		uglify: {
            options: {
                mangle: true,
                squeeze: true,
                codegen: true,
                banner: '/*! flow.chart.js - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %> */'
            },
            targetOne: {
                src: ['dist/js/flow-chart.js'],
                dest: 'dist/js/flow-chart.min.js'
            }
        },
		less: {
			 targetOne: {
                src: ['src/css/index.less'],
                dest: 'dist/css/flow-chart.min.css'
            }
		},
		htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {// Dictionary of files
                    'dist/index.html': 'dist/index.html',
                }
            }
        },
    });


	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
    // Default task(s).
    grunt.registerTask(
        'default', ['concat', 'uglify', 'less', 'htmlmin']
    );

};