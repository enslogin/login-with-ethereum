const path    = require('path');
const pkg     = require('./package.json');
const webpack = require('webpack');

module.exports =
{
	mode: 'production',
	entry: path.join(__dirname, './src/index.js'),
	output:
	{
		path: path.join(__dirname, './dist'),
		filename: 'LoginWithEthereum.js',
		library: pkg.name,
		libraryTarget: 'umd',
		publicPath: '/dist/',
		umdNamedDefine: true,
	},
	resolve:
	{
		extensions:
		[
			'.js',
			'.jsx',
		],
		alias:
		{
			'react': path.resolve(__dirname, './node_modules/react'),
			'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
		},
	},
	module:
	{
		rules:
		[
			{
				test: /\.(js|jsx)$/,
				use:
				[
					{
						loader: 'babel-loader',
						options: {
							cacheDirectory: true,
							babelrc: false,
							presets:
							[
								'@babel/env',
								'@babel/react',
							]
						},
					},
				],
				include: path.resolve(__dirname, 'src'),
				exclude: /node_modules/,
			},
			{
				test: /\.(css)$/,
				use :
				[
					'css-loader',
				],
			},
			{
				test: /\.(png|svg|jpg|gif)$/,
				use :
				[
					{
						loader: 'url-loader',
						options:
						{
							fallback: 'file-loader',
							name: '[name][md5:hash].[ext]',
							outputPath: 'assets/',
							publicPath: '/assets/',
						},
					},
				],
			},
			{
				test: /\.(eot|ttf|woff|woff2)$/,
				use :
				[
					'file-loader',
				],
			},
		]
	},
	externals:
	{
		'react':
		{
			commonjs: 'react',
			commonjs2: 'react',
			amd: 'React',
			root: 'React',
		},
		'react-dom':
		{
			commonjs: 'react-dom',
			commonjs2: 'react-dom',
			amd: 'ReactDOM',
			root: 'ReactDOM',
		},
	},
}
