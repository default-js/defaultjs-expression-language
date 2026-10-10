import { describe, it, expect } from "vitest";
import executer from "../../../src/executer/WithScopedExecuter.js";

/**
 * WithScopedExecuter - which constructs run.
 *
 * Which JavaScript constructs a statement may use under this executer.
 *
 * This executer pastes the statement unchanged into the function it generates, so which construct
 * runs, and where a name is found, is the JavaScript engine's answer and the same for every one.
 * A single case stands for all of them; asking the engine twenty times proves nothing more.
 *
 * Every case hands the executer a statement and a plain data context, and nothing else - no
 * resolver, so neither the chain nor a scope prefix nor a default value takes part. Only what this
 * executer guarantees is tested; what it does not do is documented in README.md rather than pinned.
 */

describe("WithScopedExecuter - which constructs run", () => {

	it("evaluates an object literal", async () => {
		expect(await executer.execute("{a: 4}.a", {})).toBe(4);
	});
});
