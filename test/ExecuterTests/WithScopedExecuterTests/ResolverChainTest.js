import {ExpressionResolver} from "../../../index.js";
import {EXECUTERNAME} from "../../../src/executer/WithScopedExecuter.js"

describe("Resolver chain", () => {
	jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;

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
		expect(first.context).toBe(null);
		expect(third.effectiveChain).toBe("/second/third");
		expect(result).toBe("second");
	});

	it("resolve \"${first}\" from third and second context=null", async () => {
		const first = new ExpressionResolver({ context: { first: "first" }, name: "first" });
		const second = new ExpressionResolver({ context: null, name: "second", parent: first });
		const third = new ExpressionResolver({ context: { third: "third" }, name: "third", parent: second });

		const result = await third.resolve("${first}", "fail");
		expect(second.context).toBe(null);
		expect(third.effectiveChain).toBe("/first/third");
		expect(result).toBe("first");
	});

	it("resolve \"${first}\" from third and third context=null", async () => {
		const first = new ExpressionResolver({ context: { first: "first" }, name: "first" });
		const second = new ExpressionResolver({ context: { second: "second" }, name: "second", parent: first });
		const third = new ExpressionResolver({ context: null, name: "third", parent: second });

		const result = await third.resolve("${first}", "fail");
		expect(third.context).toBe(null);
		expect(third.effectiveChain).toBe("/first/second");
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
		
		let result = await third.resolve("${first == 'first' && second == 'second' && third =='third'}", "fail");			
		expect(result).toBe("fail");
		
		third.updateData("first", "first");

		result = await third.resolve("${first == 'first' && second == 'second' && third =='third'}", "fail");
		expect(result).toBe(true);
	});
	
	it("resolveText \"${first} ${second} ${third}\" one expression over multible resolver with updated context", async () => {
		const first = new ExpressionResolver({context: {}, name: "first - resolver" });
		const second = new ExpressionResolver({ context: { second: "second" }, name: "second - resolver", parent: first });
		const third = new ExpressionResolver({ context: { third: "third" }, name: "third - resolver", parent: second });
		
		let result = await third.resolveText("${first} ${second} ${third}", "fail");
		expect(result).toBe("fail second third");	
		
		first.updateData("first", "first");

		result = await third.resolveText("${first} ${second} ${third}", "fail");
		expect(result).toBe("first second third");
	});
});