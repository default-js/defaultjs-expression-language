import { describe, it, expect } from "vitest";
import executer, { setupExecuter, getContextVar } from "../../../src/executer/ContextObjectExecuter.js";
import { catchError } from "../../TestUtils.js";

/**
 * ContextObjectExecuter - reaching a context value. SPECIFICATION.md 9.2, 9.3.
 *
 * Whether a construct carrying a context name still reaches that value. A statement addresses a
 * context value as a member of `ctx` here: the executer hands the context over as that one object.
 * `setupExecuter` sets another name for every statement the executer runs; a case that sets one
 * puts `ctx` back, because the name is module state. Which name is in use is read from
 * `getContextVar`.
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

	it("addresses a context value as a member of the name setupExecuter sets", async () => {
		setupExecuter({ contextVar: "data" });
		try {
			expect(await executer.execute("data.value", { value: "from context" })).toBe("from context");
		} finally {
			setupExecuter({ contextVar: "ctx" });
		}
	});

	it("compiles a statement anew once setupExecuter sets another name", async () => {
		// compiled under ctx first, where data is no variable: a cache keyed by the statement alone
		// would keep answering that compilation
		await catchError(() => executer.execute("data.cached", { cached: "from context" }));
		setupExecuter({ contextVar: "data" });
		try {
			expect(await executer.execute("data.cached", { cached: "from context" })).toBe("from context");
		} finally {
			setupExecuter({ contextVar: "ctx" });
		}
	});

	it("answers ctx from getContextVar while no name is set", async () => {
		expect(getContextVar()).toBe("ctx");
	});

	it("answers the name setupExecuter sets from getContextVar", async () => {
		setupExecuter({ contextVar: "data" });
		try {
			expect(getContextVar()).toBe("data");
		} finally {
			setupExecuter({ contextVar: "ctx" });
		}
	});

	it("trims the name setupExecuter sets", async () => {
		setupExecuter({ contextVar: " data " });
		try {
			expect(getContextVar()).toBe("data");
		} finally {
			setupExecuter({ contextVar: "ctx" });
		}
	});

	it("keeps the name where setupExecuter is called without options", async () => {
		setupExecuter({ contextVar: "data" });
		try {
			setupExecuter();
			expect(getContextVar()).toBe("data");
		} finally {
			setupExecuter({ contextVar: "ctx" });
		}
	});

	it("keeps the name where setupExecuter is called without contextVar", async () => {
		// the case the option was made for: other code on the page tuning the cache size
		setupExecuter({ contextVar: "data" });
		try {
			setupExecuter({ size: 5000 });
			expect(getContextVar()).toBe("data");
		} finally {
			setupExecuter({ contextVar: "ctx" });
		}
	});

	it("keeps the name where contextVar is null", async () => {
		setupExecuter({ contextVar: "data" });
		try {
			setupExecuter({ contextVar: null });
			expect(getContextVar()).toBe("data");
		} finally {
			setupExecuter({ contextVar: "ctx" });
		}
	});

	it("keeps the name where contextVar is undefined", async () => {
		setupExecuter({ contextVar: "data" });
		try {
			setupExecuter({ contextVar: undefined });
			expect(getContextVar()).toBe("data");
		} finally {
			setupExecuter({ contextVar: "ctx" });
		}
	});

	it("keeps the name where contextVar is empty after trimming", async () => {
		setupExecuter({ contextVar: "data" });
		try {
			setupExecuter({ contextVar: " \t " });
			expect(getContextVar()).toBe("data");
		} finally {
			setupExecuter({ contextVar: "ctx" });
		}
	});

	it("rejects a contextVar that is not a string with a TypeError", async () => {
		const error = await catchError(() => setupExecuter({ contextVar: 1 }));
		expect(error instanceof TypeError).toBe(true);
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
