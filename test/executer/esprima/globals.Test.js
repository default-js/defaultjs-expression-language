import { describe, it, expect } from "vitest";
import executer from "../../../src/executer/EsprimaExecuter.js";

/**
 * EsprimaExecuter - the global object from a statement.
 *
 * Which globals a statement reaches, and which writes stay off the global object. A case that could
 * leave a name on the global object reads it and cleans up before it asserts.
 *
 * Every case hands the executer a statement and a plain data context, and nothing else - no
 * resolver, so neither the chain nor a scope prefix nor a default value takes part. Only what this
 * executer guarantees is tested; what it does not do is documented in README.md rather than pinned.
 */

describe("EsprimaExecuter - the global object from a statement", () => {

	it("reaches a global through window", async () => {
		expect(await executer.execute("window.Math.round(1.5)", { known: 1 })).toBe(2);
	});

	it("reaches the global Object", async () => {
		expect(await executer.execute("Object.name", { known: 1 })).toBe("Object");
	});

	it("reaches the global Array", async () => {
		expect(await executer.execute("Array.name", { known: 1 })).toBe("Array");
	});

	it("reaches the global Map", async () => {
		expect(await executer.execute("Map.name", { known: 1 })).toBe("Map");
	});

	it("reaches the global Set", async () => {
		expect(await executer.execute("Set.name", { known: 1 })).toBe("Set");
	});

	it("reaches the global console", async () => {
		// asked with typeof: a case must not write to the console
		expect(await executer.execute("typeof console", { known: 1 })).toBe("object");
	});

	it("reaches the global fetch", async () => {
		// asked with typeof: a case must not depend on the network
		expect(await executer.execute("typeof fetch", { known: 1 })).toBe("function");
	});
});
