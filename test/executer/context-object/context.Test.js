import { describe, it, expect } from "vitest";
import executer from "../../../src/executer/ContextObjectExecuter.js";
import { catchError } from "../../TestUtils.js";

/**
 * ContextObjectExecuter - reaching a context value.
 *
 * Whether a construct carrying a context name still reaches that value. A statement addresses a
 * context value as a member of `ctx` here: the executer hands the context over as that one object.
 *
 * The statement is pasted unchanged, so the position of a name inside it changes nothing; the
 * cases here are the ones the executer's own strategy decides.
 *
 * Every case hands the executer a statement and a plain data context, and nothing else - no
 * resolver, so neither the chain nor a scope prefix nor a default value takes part. Only what this
 * executer guarantees is tested; what it does not do is documented in README.md rather than pinned.
 */

describe("ContextObjectExecuter - reaching a context value", () => {

	it("evaluates an await inside the statement", async () => {
		// the promise comes from the context, so no global is needed
		expect(await executer.execute("await ctx.promised + 1", { promised: Promise.resolve(20) })).toBe(21);
	});

	it("addresses a context value as a member of ctx", async () => {
		expect(await executer.execute("ctx.value", { value: "from context" })).toBe("from context");
	});

	it("does not answer a bare context name", async () => {
		// a bare name is no variable here, so the statement raises
		const error = await catchError(() => executer.execute("value", { value: "from context" }));
		expect(error instanceof ReferenceError).toBe(true);
	});

	it("keeps this bound to the context when a method is called", async () => {
		class Data {
			constructor() {
				this.value = "from this";
			}
			greet() {
				return this.value;
			}
		}
		expect(await executer.execute("ctx.greet()", new Data())).toBe("from this");
	});
});
