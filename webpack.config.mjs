import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const project = require("./package.json");
const entries = require("./entries.config.json");

/**
 * One configuration per entry of entries.config.json. The module bundle is an ES module and the
 * browser bundle a classic script, and output.module - which an ES module library needs - holds for
 * every bundle of a compiler, so the two cannot share one. See DECISIONS.md.
 */
export default (env, argv) => {
	const devMode = argv.mode != "production";

	const build = (aName) => ({
		name: aName,
		entry: { [aName]: entries[aName] },
		// no browserslist in this project, so plain "web" makes webpack emit ES5-capable
		// runtime helpers for sources that ship untranspiled anyway
		target: ["web", "es2022"],
		mode: devMode ? "development" : "production",
		// caches module compilation under node_modules/.cache/webpack between runs, one cache
		// per configuration and mode
		cache: { type: "filesystem", name: `${aName}-${devMode ? "development" : "production"}` },
		optimization: {
			minimize: !devMode,
		},
		devtool: devMode ? "inline-source-map" : "source-map",
		output: {
			filename: devMode ? `[name]-${project.buildname}.js` : `[name]-${project.buildname}.min.js`,
			path: path.resolve(import.meta.dirname, "dist"),
			// Two configurations in two modes emit into the same directory, and the files array
			// publishes all of it. Each run therefore only removes its own stale artifacts - the
			// files of its mode not belonging to the other entry - and keeps everything else.
			clean: {
				keep: (asset) => (devMode ? asset.includes(".min.") : !asset.includes(".min.")) || Object.keys(entries).some((name) => name != aName && asset.startsWith(`${name}-`)),
			},
		},
	});

	return [
		{
			...build("browser"),
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
				static: ["./WebContent"],
				watchFiles: { paths: ["src/**/*", "./WebContent"] }
			}
		},
		{
			...build("module"),
			experiments: { outputModule: true },
			output: { ...build("module").output, module: true, library: { type: "module" } },
		}
	];
};
