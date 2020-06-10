const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const htmlWebpackPlugin = new HtmlWebpackPlugin({
	template: path.join(__dirname, "examples/src/index.html"),
	filename: "./index.html"
});

module.exports = {
	entry: path.join(__dirname, "examples/src/index.js"),
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				use: "babel-loader",
				exclude: /node_modules/
			},
			{
				test: /\.css$/,
				use: [
					"style-loader",
					"css-loader"
				]
			},
			{
				test: /\.svg$/,
				use: [
					'svg-inline-loader'
				]
			},
			{
				test: /\.(woff(2)?|ttf|eot|png|jpe?g|gif)$/i,
				use: [
					'file-loader',
				]
			},
		]
	},
	plugins: [
		htmlWebpackPlugin
	],
	resolve: {
		extensions: [
			".js",
			".jsx"
		]
	}
}
