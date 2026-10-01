import { describe, it, expect } from "vitest";
import { ExpressionResolver, ExecuterRegistry } from "../../index.js";
import Executer from "../../src/Executer.js";
import { EXECUTERNAME as WithScopedExecuterName } from "../../src/executer/WithScopedExecuter.js";

/**
 * The public surface of the package - SPECIFICATION.md 8.
 *
 * Existence and shape only. What each member does is pinned by the section that specifies it;
 * this file is the list a consumer can rely on being there, and it is what a removal has to trip
 * over.
 *
 * Two of the entry points are deliberately reached differently here. `ExpressionResolver` and
 * `ExecuterRegistry` come from index.js, which is what a bundler consumer imports. `Executer` is
 * imported by path, because index.js does not export it - reaching an executer module directly is
 * the intended usage (DECISIONS.md, 2026-09-28) and the same holds for the interface those modules
 * build on.
 *
 * What each executer module exports is surface as well, and asked in that executer's own
 * `interface.Test.js` under `test/executer/`, so a new executer brings it along.
 *
 * The last part imports through the package name, so the `exports` field of package.json is what
 * resolves it - a package may refer to itself by name once it has that field. It pins the paths the
 * field opens and only that. A closed path cannot be pinned here: Vite resolves a literal import
 * while transforming the file, so a path it cannot resolve fails the whole file instead of one
 * case, and a specifier built at run time reaches the browser unresolved and fails whether the path
 * is open or not. That half is checked against a packed install in Node (DECISIONS.md, 2026-10-01).
 * Whether a bundle in dist/ exports anything depends on the last build rather than on the sources,
 * so only that the path is open is asked here.
 */

describe("Specification 8 - ExpressionResolver, the static surface", () => {

	for (const name of ["resolve", "resolveText", "buildSecure"]) {
		it(`carries the static method ${name}`, async () => {
			expect(typeof ExpressionResolver[name]).toBe("function");
		});
	}

	it("carries defaultExecuter, readable and writable", async () => {
		const descriptor = Object.getOwnPropertyDescriptor(ExpressionResolver, "defaultExecuter");
		expect(typeof descriptor.get).toBe("function");
		expect(typeof descriptor.set).toBe("function");
	});
});

describe("Specification 8 - ExpressionResolver, the instance surface", () => {

	const resolver = new ExpressionResolver({ context: { value: 1 }, name: "root" });

	for (const name of ["resolve", "resolveText", "getData", "updateData", "deleteData", "mergeContext"]) {
		it(`carries the instance method ${name}`, async () => {
			expect(typeof resolver[name]).toBe("function");
		});
	}

	for (const name of ["name", "parent", "context", "contextHandle", "executer", "chain", "effectiveChain", "contextChain"]) {
		it(`carries the getter ${name}`, async () => {
			const descriptor = Object.getOwnPropertyDescriptor(ExpressionResolver.prototype, name);
			expect(typeof descriptor.get).toBe("function");
		});
	}

	it("takes the whole documented constructor option set", async () => {
		const root = new ExpressionResolver({ context: { rootOnly: 1 }, name: "root" });
		const built = new ExpressionResolver({
			context: { value: 1 },
			parent: root,
			name: "leaf",
			executer: WithScopedExecuterName
		});
		expect(built.name).toBe("leaf");
		expect(built.parent === root).toBe(true);
	});
});

describe("Specification 8 - ExecuterRegistry", () => {

	for (const name of ["registrate", "getExecuter"]) {
		it(`carries ${name}`, async () => {
			expect(typeof ExecuterRegistry[name]).toBe("function");
		});
	}
});

describe("Specification 8 - Executer", () => {

	it("is a class an own implementation can build on", async () => {
		expect(typeof Executer).toBe("function");
		expect(new Executer({ execution: () => null }) instanceof Executer).toBe(true);
	});
});

describe("Specification 8 - the modules a consumer imports by the package name", () => {

	it("opens the package itself, index.js", async () => {
		const module = await import("@default-js/defaultjs-expression-language");
		expect(typeof module.ExpressionResolver).toBe("function");
		expect(typeof module.ExecuterRegistry.getExecuter).toBe("function");
	});

	it("opens browser.js", async () => {
		const module = await import("@default-js/defaultjs-expression-language/browser.js");
		expect(typeof module.ExpressionResolver).toBe("function");
	});

	it("opens src/Executer.js", async () => {
		const module = await import("@default-js/defaultjs-expression-language/src/Executer.js");
		expect(typeof module.default).toBe("function");
	});

	// the path that tunes the default executer, so the one representative of src/executer/*
	it("opens the modules under src/executer/", async () => {
		const module = await import("@default-js/defaultjs-expression-language/src/executer/ContextDeconstructorExecuter.js");
		expect(typeof module.setupExecuter).toBe("function");
	});

	it("opens the bundles under dist/", async () => {
		const module = await import("@default-js/defaultjs-expression-language/dist/module-defaultjs-expression-language.min.js");
		expect(module).toBeDefined();
	});

	it("opens package.json", async () => {
		const module = await import("@default-js/defaultjs-expression-language/package.json");
		expect(module.default.name).toBe("@default-js/defaultjs-expression-language");
	});
});
