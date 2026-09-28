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
