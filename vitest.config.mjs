import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";

/**
 * Vitest runs the suite in a real browser, because the package targets the browser and the
 * tests reach for document, window and document.location. Node with jsdom would test a
 * simulation.
 *
 * ESM on purpose: this file is .mjs because the package has no "type": "module" yet. See the
 * open entry in BACKLOG.md - once that is settled, this and scripts/generate-version.js and
 * the two config files of the old chain get renamed together.
 */
export default defineConfig({
	test: {
		// deliberately NOT globals: true - the suite uses the bare identifier "test" as its
		// example of an undefined variable, and one afterAll does delete global.test. With
		// globals on, that is vitest own test function on window. Every test file imports
		// describe, it, expect, beforeAll and afterAll explicitly instead.
		globals: false,
		include: ["test/**/*Test.js"],
		// registers the esprima executer, which src/executer/index.js leaves out on purpose
		setupFiles: ["test/setup.js"],
		browser: {
			enabled: true,
			provider: playwright(),
			instances: [{ browser: "chromium" }],
			headless: true,
			// do not drop png files into the test tree on failure
			screenshotFailures: false
		},
		coverage: {
			provider: "v8",
			include: ["src/**/*.js"],
			reportsDirectory: "coverage",
			reporter: ["text-summary", "html", "lcov"]
		}
	}
});
