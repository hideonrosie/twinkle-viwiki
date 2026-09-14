const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const { execSync } = require('child_process');
const args = require('minimist')(process.argv.slice(2));
const fs = require('fs');

const OUTPUT_DIR = './build';
const OUTPUT_FILE = './build/twinkle.js';
const corePath = fs.existsSync('./twinkle-core') ? './twinkle-core' : './node_modules/twinkle-core';

function isGitWorkDirClean() {
	try {
		execSync('git diff-index --quiet HEAD --');
		return true;
	} catch (e) {
		return false;
	}
}

function makeHeader() {
	// This header comment is accurate only if grunt build is run with a clean
	// working directory.
	let includeCommitHashInComment = isGitWorkDirClean() || console.warn('\x1b[31m%s\x1b[0m', // red
		'[WARN] Git working directory is not clean.');

	let header =
`/*  _______________________________________________________________________________	
 * |                                                                               |
 * |                === CẢNH BÁO: TẬP TIN TIỆN ÍCH TOÀN WEBSITE ===                |
 * |        Các thay đổi ở đây có thể ảnh hưởng đến hàng loạt người sử dụng.       |
 * |          Vui lòng thảo luận tại [[WT:TW]] trước khi sửa đổi trang này.        |
 * |_______________________________________________________________________________|
 *
 * Được build từ kho mã nguồn GitHub [https://github.com/hideonrosie/twinkle-viwiki]
 * Mọi thay đổi nên được sửa đổi trực tiếp trên kho mã đó. Đừng sửa trực tiếp trang này.
`;
	if (includeCommitHashInComment) {
		const commitSHA = execSync('git rev-parse HEAD').toString().trim();
		header +=
` * Bản dựng này được tạo ra từ các tập tin nguồn tại kho mã tính đến thời điểm commit
 * ${commitSHA}. Bạn có thể duyệt kho mã tại thời điểm đó bằng liên kết này:
 * https://github.com/hideonrosie/twinkle-viwiki/tree/${commitSHA}
 * Thay đổi giữa các commit có thể được xem tại liên kết sau:
 * https://github.com/hideonrosie/twinkle-viwiki/compare/COMMIT_HASH_1..COMMIT_HASH_2
`;
	}

	header +=
` */
/* <nowiki> */
`;
	return header;
}

const footer = `
/* </nowiki> */`;

module.exports = function (grunt) {
	grunt.initConfig({
		// Clean build directory first
		clean: [OUTPUT_DIR],

		webpack: {
			myConfig: {
				...require('./webpack.config'),
				devtool: undefined,
				devServer: undefined,
				mode: 'production',
				plugins: [
					// specify --excludeEnglishMessages to exclude English messages (about 20 kb) in build
					// Do this ONLY if you are sure all messages have been translated into your local language,
					// otherwise users will see message keys
					new webpack.DefinePlugin({
						EXCLUDE_ENGLISH_MESSAGES: Boolean(args.excludeEnglishMessages)
					})
				],
				optimization: {
					minimizer: [
						new TerserPlugin({
							extractComments: /@preserve/,
							terserOptions: { output: { ascii_only: true } }
						}),
					],
				},
				performance: {
					hints: false,
				},
			},
		},

		// Escape any nowiki tags in code so they don't break the on-wiki gadget file
		// There's no point in writing nowiki tags as "<no" + "wiki>" in source files
		// as Webpack's Terser plugin will optimise away the string concatenation giving
		// a functional nowiki tag. So we must do this *after* webpack minimisation.
		replace: {
			nowiki: {
				options: {
					patterns: [
						{
							match: /<nowiki>/g,
							replacement: '<no"+"wiki>',
						},
						{
							match: /<\/nowiki>/g,
							replacement: '</no"+"wiki>',
						},
					],
				},
				files: [
					{
						src: [OUTPUT_FILE],
						dest: OUTPUT_FILE,
					},
				],
			},
		},

		// Concatenate the header and footer comments
		concat: {
			options: {
				separator: '\n',
				banner: makeHeader(),
				footer: footer,
				stripBanners: {
					block: true,
				},
			},
			dist: {
				src: [OUTPUT_FILE],
				dest: OUTPUT_FILE,
			},
		},

		// Copy other files to build directory (which don't need to be compiled)
		copy: {
			main: {
				files: [
					{ src: corePath + '/morebits/morebits.js', dest: 'build/morebits.js' },
					{ src: corePath + '/morebits/morebits.css', dest: 'build/morebits.css' },
					{ src: './css/twinkle.css', dest: 'build/twinkle.css' },
					{ src: './css/twinkle-pagestyles.css', dest: 'build/twinkle-pagestyles.css' },
				],
			},
		},
	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-webpack');
	grunt.loadNpmTasks('grunt-replace');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.registerTask('build', ['clean', 'webpack', 'replace', 'concat', 'copy']);
};
