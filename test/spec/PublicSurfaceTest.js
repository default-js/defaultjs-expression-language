import { describe, it, expect } from "vitest";
import { ExpressionResolver, ExecuterRegistry } from "../../index.js";
import Executer from "../../src/Executer.js";
import * as WithScopedModule from "../../src/executer/WithScopedExecuter.js";
import * as ContextObjectModule from "../../src/executer/ContextObjectExecuter.js";
import * as ContextDeconstructorModule from "../../src/executer/ContextDeconstructorExecuter.js";
import * as EsprimaModule from "../../src/executer/EsprimaExecuter.js";

/**
 * Conformance tests for SPECIFICATION.md section 9 - the public surface.
 *
 * Existence and shape only. What each member does is pinned by the section that specifies it;
 * this file is the list a consumer can rely on being there, and it is what a removal has to trip
 * over.
 *
 * Two of the entry points are deliberately reached differently here. `ExpressionResolver` and
 * `ExecuterRegistry` come from index.js, which is what a bundler consumer imports. `Executer` and
 * the executer modules are imported by path, because index.js does not export them - reaching an
 * executer module directly is the intended usage (DECISIONS.md, 2026-08-20) and the same holds
 * for the interface those modules build on.
 */

const EXECUTER_MODULES = [
	["WithScopedExecuter", WithScopedModule],
	["ContextObjectExecuter", ContextObjectModule],
	["ContextDeconstructorExecuter", ContextDeconstructorModule],
	["EsprimaExecuter", EsprimaModule]
];

describe("Specification 9 - ExpressionResolver, the static surface", () => {

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

	// not implemented, waits for BACKLOG.md "A write to an unknown name inside an expression lands on `globalThis`"
	it.fails("carries allowGlobalWrite", async () => {
		expect(typeof ExpressionResolver.allowGlobalWrite).toBe("boolean");
	});
});

describe("Specification 9 - ExpressionResolver, the instance surface", () => {

	const resolver = new ExpressionResolver({ context: { value: 1 }, name: "root" });

	for (const name of ["resolve", "resolveText", "getData", "updateData", "deleteData", "mergeContext"]) {
		it(`carries the instance method ${name}`, async () => {
			expect(typeof resolver[name]).toBe("function");
		});
	}

	for (const name of ["name", "parent", "context", "contextHandle", "chain", "effectiveChain", "contextChain"]) {
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
			executer: WithScopedModule.EXECUTERNAME,
			allowGlobalWrite: false
		});
		expect(built.name).toBe("leaf");
		expect(built.parent === root).toBe(true);
	});
});

describe("Specification 9 - ExecuterRegistry", () => {

	for (const name of ["registrate", "getExecuter"]) {
		it(`carries ${name}`, async () => {
			expect(typeof ExecuterRegistry[name]).toBe("function");
		});
	}
});

describe("Specification 9 - Executer", () => {

	it("is a class an own implementation can build on", async () => {
		expect(typeof Executer).toBe("function");
		expect(new Executer({ defaultContext: {}, execution: () => null }) instanceof Executer).toBe(true);
	});
});

describe("Specification 9 - the executer modules", () => {

	for (const [label, module] of EXECUTER_MODULES) {
		it(`${label} exports EXECUTERNAME`, async () => {
			expect(typeof module.EXECUTERNAME).toBe("string");
		});

		it(`${label} exports setupExecuter`, async () => {
			expect(typeof module.setupExecuter).toBe("function");
		});

		it(`${label} exports the executer as its default export`, async () => {
			expect(module.default instanceof Executer).toBe(true);
		});
	}

	it("EsprimaExecuter exports setDebug", async () => {
		expect(typeof EsprimaModule.setDebug).toBe("function");
	});
});
