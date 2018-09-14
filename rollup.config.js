export default [
	{
		input: 'src/app/index.js',
		output: {
			file: 'app/index.js',
			format: 'cjs',
			sourcemap: false,
  		experimentalCodeSplitting: true,
  		experimentalDynamicImport: true
		}
	}, {
		input: 'src/main.js',
		output: {
			file: 'app/main.js',
			format: 'cjs',
			sourcemap: false,
  		experimentalCodeSplitting: true,
  		experimentalDynamicImport: true
		}
	}, {
		input: 'src/app/workers/song.js',
		output: {
			file: 'app/workers/song.js',
			format: 'cjs',
			sourcemap: false,
  		experimentalCodeSplitting: true,
  		experimentalDynamicImport: true
		}
	}, {
		input: 'src/app/workers/lines.js',
		output: {
			file: 'app/workers/lines.js',
			format: 'cjs',
			sourcemap: false,
  		experimentalCodeSplitting: true,
  		experimentalDynamicImport: true
		}
	}, {
		input: 'src/app/workers/watcher.js',
		output: {
			file: 'app/workers/watcher.js',
			format: 'cjs',
			sourcemap: false,
  		experimentalCodeSplitting: true,
  		experimentalDynamicImport: true
		}
	}, {
		input: 'src/app/workers/read.js',
		output: {
			file: 'app/workers/read.js',
			format: 'cjs',
			sourcemap: false,
  		experimentalCodeSplitting: true,
  		experimentalDynamicImport: true
		}
	}, {
		input: 'src/app/workers/collection.js',
		output: {
			file: 'app/workers/collection.js',
			format: 'cjs',
			sourcemap: false,
  		experimentalCodeSplitting: true,
  		experimentalDynamicImport: true
		}
	}, {
		input: 'src/app/workers/write.js',
		output: {
			file: 'app/workers/write.js',
			format: 'cjs',
			sourcemap: false,
  		experimentalCodeSplitting: true,
  		experimentalDynamicImport: true
		}
	}, {
		input: 'src/utils/worker.js',
		output: {
			file: 'app/utils/worker.js',
			format: 'cjs',
			sourcemap: false,
  		experimentalCodeSplitting: true,
  		experimentalDynamicImport: true
		}
	}
];
