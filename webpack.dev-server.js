const path = require("path");
const webpack = require("webpack");
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const project = require("./package.json");

module.exports = merge(common, {
	mode: "development",
	optimization: {
		minimize: false,
		usedExports: false,
	},
	devtool: "inline-source-map",
	watch: true,
	devServer: {
		static: ["WebContent"],
		hot: true,
		port: 80,
	},
	output: {
		filename: "[name].js",
		path: path.resolve(__dirname, "dist"),
	},
	plugins: [new webpack.HotModuleReplacementPlugin()],
});
