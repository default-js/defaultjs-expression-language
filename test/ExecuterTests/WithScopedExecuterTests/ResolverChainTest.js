import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {ExpressionResolver} from "../../../index.js";
import { catchError } from "../../TestUtils.js";
import {EXECUTERNAME} from "../../../src/executer/WithScopedExecuter.js"

// the chain test deliberately runs long-running resolutions; 120s was the jasmine
// DEFAULT_TIMEOUT_INTERVAL this suite used to set
describe("Resolver chain", { timeout: 120000 }, () => {

	const executerReset = ExpressionResolver.defaultExecuter;
	beforeAll(() => {
		ExpressionResolver.defaultExecuter = EXECUTERNAME;
	});

	afterAll(() => {
		ExpressionResolver.defaultExecuter = executerReset;
	});

	it("resolve \"${first}\" from third", async () => {
		const first = new ExpressionResolver({ context: { first: "first" }, name: "first" });
		const second = new ExpressionResolver({ context: { second: "second" }, name: "second", parent: first });
		const third = new ExpressionResolver({ context: { third: "third" }, name: "third", parent: second });

		const result = await third.resolve("${first}", "fail");
		expect(result).toBe("first");
	});

	it("resolve \"${second}\" from third", async () => {
		const first = new ExpressionResolver({ context: { first: "first" }, name: "first" });
		const second = new ExpressionResolver({ context: { second: "second" }, name: "second", parent: first });
		const third = new ExpressionResolver({ context: { third: "third" }, name: "third", parent: second });

		const result = await third.resolve("${second}", "fail");
		expect(result).toBe("second");
	});

	it("resolve \"${third}\" from third", async () => {
		const first = new ExpressionResolver({ context: { first: "first" }, name: "first" });
		const second = new ExpressionResolver({ context: { second: "second" }, name: "second", parent: first });
		const third = new ExpressionResolver({ context: { third: "third" }, name: "third", parent: second });

		const result = await third.resolve("${third}", "fail");
		expect(result).toBe("third");
	});

	it("resolve \"${first}\" second third", async () => {
		const first = new ExpressionResolver({ context: { first: "first" }, name: "first" });
		const second = new ExpressionResolver({ context: { second: "second", first: "second" }, name: "second", parent: first });
		const third = new ExpressionResolver({ context: { third: "third" }, name: "third", parent: second });

		let result = await third.resolve("${second}", "fail");
		expect(result).toBe("second");
		result = await third.resolve("${first}", "fail");
		expect(result).toBe("second");

	});

	it("resolve \"${second}\" from third and second context=null", async () => {
		const first = new ExpressionResolver({ context: null, name: "first" });
		const second = new ExpressionResolver({ context: { second: "second" }, name: "second", parent: first });
		const third = new ExpressionResolver({ context: { third: "third" }, name: "third", parent: second });

		const result = await third.resolve("${second}", "fail");
		expect(result).toBe("second");
	});

	it("resolve \"${first}\" from third and second context=null", async () => {
		const first = new ExpressionResolver({ context: { first: "first" }, name: "first" });
		const second = new ExpressionResolver({ context: null, name: "second", parent: first });
		const third = new ExpressionResolver({ context: { third: "third" }, name: "third", parent: second });

		const result = await third.resolve("${first}", "fail");
		expect(result).toBe("first");
	});

	it("resolve \"${first}\" from third and third context=null", async () => {
		const first = new ExpressionResolver({ context: { first: "first" }, name: "first" });
		const second = new ExpressionResolver({ context: { second: "second" }, name: "second", parent: first });
		const third = new ExpressionResolver({ context: null, name: "third", parent: second });

		const result = await third.resolve("${first}", "fail");
		expect(result).toBe("first");
	});

	it("resolve \"${first == 'first' && second == 'second' && third =='third'}\" one expression over multible resolver", async () => {
		const first = new ExpressionResolver({ context: { first: "first" }, name: "first" });
		const second = new ExpressionResolver({ context: { second: "second" }, name: "second", parent: first });
		const third = new ExpressionResolver({ context: { third: "third" }, name: "third", parent: second });

		const result = await third.resolve("${first == 'first' && second == 'second' && third =='third'}", "fail");
		expect(result).toBe(true);
	});

	it("resolve \"${first == 'first' && second == 'second' && third =='third'}\" one expression over multible resolver with updated context", async () => {
		const first = new ExpressionResolver({context: {}, name: "first" });
		const second = new ExpressionResolver({ context: { second: "second" }, name: "second", parent: first });
		const third = new ExpressionResolver({ context: { third: "third" }, name: "third", parent: second });

		// "first" is carried by no link yet, so the statement raises and resolve lets it through
		// instead of answering the default - SPECIFICATION.md 7, since 2026-08-29.
		const error = await catchError(() => third.resolve("${first == 'first' && second == 'second' && third =='third'}", "fail"));
		expect(error instanceof Error).toBe(true);

		third.updateData("first", "first");

		const result = await third.resolve("${first == 'first' && second == 'second' && third =='third'}", "fail");
		expect(result).toBe(true);
	});

	it("resolveText \"${first} ${second} ${third}\" one expression over multible resolver with updated context", async () => {
		const first = new ExpressionResolver({context: {}, name: "first - resolver" });
		const second = new ExpressionResolver({ context: { second: "second" }, name: "second - resolver", parent: first });
		const third = new ExpressionResolver({ context: { third: "third" }, name: "third - resolver", parent: second });

		// "first" is carried by no link yet, so that statement raises - since 2026-08-29 the
		// expression stands as written and the default does not cover it (SPECIFICATION.md 7),
		// while the rest of the text renders as before.
		let result = await third.resolveText("${first} ${second} ${third}", "fail");
		expect(result).toBe("${first} second third");

		first.updateData("first", "first");

		result = await third.resolveText("${first} ${second} ${third}", "fail");
		expect(result).toBe("first second third");
	});

	// These three used to ride along in the tests above, asserting that a link built with
	// context: null appears in effectiveChain. Under SPECIFICATION.md 5.5 it does not - such a
	// link provides no context until something is written to it - so the expectation was wrong
	// rather than the code. They stand on their own now, because the resolutions they shared a
	// test with are correct and have to keep being proven.
	// not implemented, waits for BACKLOG.md "`effectiveChain` is a copy of `chain`, and a resolver without a name"
	it.fails("effectiveChain skips the root when it was built with context=null", async () => {
		const first = new ExpressionResolver({ context: null, name: "first" });
		const second = new ExpressionResolver({ context: { second: "second" }, name: "second", parent: first });
		const third = new ExpressionResolver({ context: { third: "third" }, name: "third", parent: second });

		expect(third.effectiveChain).toBe("/second/third");
	});

	// not implemented, waits for BACKLOG.md "`effectiveChain` is a copy of `chain`, and a resolver without a name"
	it.fails("effectiveChain skips the middle link when it was built with context=null", async () => {
		const first = new ExpressionResolver({ context: { first: "first" }, name: "first" });
		const second = new ExpressionResolver({ context: null, name: "second", parent: first });
		const third = new ExpressionResolver({ context: { third: "third" }, name: "third", parent: second });

		expect(third.effectiveChain).toBe("/first/third");
	});

	// not implemented, waits for BACKLOG.md "`effectiveChain` is a copy of `chain`, and a resolver without a name"
	it.fails("effectiveChain skips the resolver itself when it was built with context=null", async () => {
		const first = new ExpressionResolver({ context: { first: "first" }, name: "first" });
		const second = new ExpressionResolver({ context: { second: "second" }, name: "second", parent: first });
		const third = new ExpressionResolver({ context: null, name: "third", parent: second });

		expect(third.effectiveChain).toBe("/first/second");
	});
});
