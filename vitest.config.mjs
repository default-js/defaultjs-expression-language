import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";

/**
 * Vitest runs the suite in a real browser, because the package targets the browser and the
 * tests reach for document, window and document.location. Node with jsdom would test a
 * simulation.
 */
export default defineConfig({
	test: {
		// deliberately NOT globals: true - the suite uses the bare identifier "test" as its
		// example of an undefined variable, and one afterAll does delete global.test. With
		// globals on, that is vitest own test function on window. Every test file imports
		// describe, it, expect, beforeAll and afterAll explicitly instead.
		globals: false,
		include: ["test/**/*Test.js"],
		// benchmarks are timing dependent and slow, so they are deliberately not part of
		// the test gate - the include above does not match them. `npm run bench` runs them.
		benchmark: { include: ["test/**/*.bench.js"] },
		// the type declarations, checked by tsc rather than run: an error in a declaration fails
		// the run as well, because skipLibCheck is off in test/tsconfig.json
		typecheck: {
			enabled: true,
			include: ["test/**/*Test-d.ts"],
			tsconfig: "test/tsconfig.json"
		},
		// loads the package once, which registers the default executers, before any test file
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
