import { describe, it, expect } from "vitest";
import { ExpressionResolver } from "../../index.js";

/**
 * SPECIFICATION.md 6.5 - the switch that allows writing to the global object.
 *
 * The negative guarantee itself - that a write stays out of the global object while the switch is
 * off - needs a statement and is a row of the capability catalogue, marked as a rule two executers
 * do not keep yet. The switch is not implemented at all; BACKLOG.md carries it.
 */

describe("Specification 6.5 - the switch that allows writing to the global object", () => {

	// Only the existence and the default are pinned here. That the switch, once on, lets a write
	// through cannot be told apart from today's behaviour - today every write reaches the global
	// object - so no test claims it. It belongs to the fix, together with the executer half of
	// 6.5 which section 8 covers.
	// not implemented, waits for BACKLOG.md "A write to an unknown name inside an expression lands on `globalThis`"
	it.fails("carries an application level switch that is off by default", async () => {
		expect(ExpressionResolver.allowGlobalWrite).toBe(false);
	});
});
