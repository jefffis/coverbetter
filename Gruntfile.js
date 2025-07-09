module.exports= function(grunt){
	
	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		// sass: {
		// 	dist: {
  //               files: {
  //                   'stylesheets/<%= pkg.file_name %>.css': 'stylesheets/sass/*.scss'
  //               }
  //           }
		// },

		'min': {
			'dist': {
				'options': {
					'report': false
				},
				'files': [{
					'src': ['js/font.js','js/jquery.js', 'js/appppp.js'],
					'dest': 'js/app.js'
				}]
			}
		},

		'cssmin': {
			'dist': {
				'options': {
					'report': false
				},
				'files': [{
					'src': ['styles/styles.css'],
					'dest': 'styles/<%= pkg.file_name %>.min.css'
				}]
			}
		},/*

		watch: {
			scripts: {
                files: [
                    'stylesheets/sass/*.scss'
                ],
                tasks: ['sass']
            }
		}*/

		'htmlmin': {                                     // Task
			dist: {                                      // Target
				options: {                                 // Target options
					removeComments: true,
					collapseWhitespace: true,
					minifyJS: true
				},
				files: {                                   // Dictionary of files
					'index.html': 'index-original.html',     // 'destination': 'source'
				}
			}
		}

	});

	//grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-yui-compressor');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');

	// grunt.registerTask('w',['watch']);

	//grunt.registerTask('default', ['sass','min','cssmin']);

	grunt.registerTask('default', ['min', 'cssmin', 'htmlmin']);

}