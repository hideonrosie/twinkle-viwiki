const fs = require('fs');
const path = require('path');
const args = require('minimist')(process.argv.slice(2));
const webpack = require('webpack');
const { EsbuildPlugin } = require('esbuild-loader');

const corePath = args.core || (fs.existsSync(path.resolve(__dirname, 'twinkle-core')) ? './twinkle-core' : './node_modules/twinkle-core');

module.exports = {
	mode: 'development',
	devtool: 'source-map',

	entry: './src/twinkle.ts',
	target: ['web', 'es6'],
	module: {
		rules: [
			{
				test: /\.[jt]s$/,
				loader: 'esbuild-loader',
				options: {
					target: 'es2015',
				},
			},
		],
	},
	optimization: {
		minimizer: [
			new EsbuildPlugin({
				target: 'es2015',
			}),
		],
	},
	resolve: {
		extensions: ['.js', '.ts'],
		alias: fs.existsSync(path.resolve(__dirname, 'twinkle-core')) ? {
			'twinkle-core': path.resolve(__dirname, 'twinkle-core'),
		} : {},
	},
	plugins: [
		new webpack.IgnorePlugin({
			resourceRegExp: /^\.\/(?!en\.json|vi\.json).*\.json$/,
			contextRegExp: /twinkle-core[\\/]i18n$/,
		}),
	],
	output: {
		filename: 'twinkle.js',
		path: path.resolve(__dirname, 'build'),
	},

	devServer: {
		setupMiddlewares: function (middlewares, server) {
			server.app.get('/core/*', function (req, response) {
				let path = req.url.slice('/core'.length);
				let ctype = req.url.endsWith('.js')
					? 'text/javascript'
					: req.url.endsWith('.css')
					? 'text/css'
					: 'text/plain';
				response.writeHead(200, {
					'Content-Type': `${ctype}; charset=utf-8`,
					'Cache-Control': 'no-cache, no-store, must-revalidate'
				});
				response.end(readFile(corePath + path), 'utf-8');
			});
			server.app.get('/css', function (req, response) {
				response.writeHead(200, {
					'Content-Type': `text/css; charset=utf-8`,
					'Cache-Control': 'no-cache, no-store, must-revalidate'
				});
				response.end(readFile('./css/twinkle.css'), 'utf-8');
			});
			server.app.get('/', function (req, response) {
				response.writeHead(200, {
					'Content-Type': 'text/javascript; charset=utf-8',
					'Cache-Control': 'no-cache, no-store, must-revalidate'
				});
				response.end(readFile('./dev-loader.js'), 'utf-8');
			});
			return middlewares;
		},
		static: path.join(__dirname, 'build'),
		port: 5500,
		host: 'localhost',
		allowedHosts: 'all'
	},
};

function readFile(file) {
	return fs.readFileSync(file).toString();
}
