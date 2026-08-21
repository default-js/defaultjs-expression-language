/**
 * Writes the version of package.json into src/version.js.
 *
 * Runs before every build. The generated module is what the entry points read, so the raw
 * sources published to npm carry the right version too - nothing is patched after bundling.
 *
 * CommonJS on purpose: this package has no "type": "module", so a .js file in it is CJS.
 */
const { readFileSync, writeFileSync, existsSync } = require("node:fs");
const { resolve } = require("node:path");

const root = resolve(__dirname, "..");
const target = resolve(root, "src/version.js");

const { version } = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));

const content = `/**
 * The version of this package.
 *
 * Generated from package.json by scripts/generate-version.js before every build. Do not edit -
 * the next build overwrites it.
 *
 * @module version
 */
export const VERSION = "${version}";

export default VERSION;
`;

// only write when something changed, so a build does not touch the working tree for nothing
if (existsSync(target) && readFileSync(target, "utf8") === content) console.log(`version.js is up to date (${version})`);
else {
	writeFileSync(target, content);
	console.log(`version.js written (${version})`);
}
