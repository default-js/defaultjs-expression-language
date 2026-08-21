const path = require("path");
const project = require("./package.json");

const entries = require("./entries.config.json");

module.exports = (env, argv) => {
	const devMode = argv.mode != "production";
	const target = argv.target ? argv.target : "dist";

	return {
		entry: entries,
		// no browserslist in this project, so plain "web" makes webpack emit ES5-capable
		// runtime helpers for sources that ship untranspiled anyway
		target: ["web", "es2022"],
		mode: devMode ? "development" : "production",
		// caches module compilation under node_modules/.cache/webpack between runs
		cache: { type: "filesystem" },
		optimization: {
			minimize: !devMode,
			// LOAD-BEARING, do not "clean up". The module entry has no output.library, so with
			// tree shaking on webpack sees its exports as unused and prunes the whole library
			// out of dist/module-...min.js - measured: 13809 -> 3685 bytes, resolveText and
			// DefaultValue gone. See DECISIONS.md.
			usedExports: false,
		},
		devtool: devMode ? "inline-source-map" : "source-map",
		output: {
			filename: devMode ? `[name]-${project.buildname}.js` : `[name]-${project.buildname}.min.js`,
			path: path.resolve(__dirname, target),
			// Both modes emit into the same directory, dev first, prod second. Cleaning
			// unconditionally would let the prod run delete the dev bundles, which are
			// published through the files array. Each mode therefore only removes its own
			// stale artifacts and keeps the ones belonging to the other.
			clean: { keep: (asset) => (devMode ? asset.includes(".min.") : !asset.includes(".min.")) },
		},
		devServer: {
			open: true,
			allowedHosts: "all",
			client: {
				overlay: true,
				progress: true,
				reconnect: true,
			},
			devMiddleware: {
				index: true,
				writeToDisk: false,
			},
			static: ["./webcontent", "./src/css"],
			watchFiles: { paths: ["src/**/*", "./webcontent"] }
		}
	};
};
