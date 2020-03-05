import ExpressionResolver from "../src/ExpressionResolver";

describe("Resolver chain", () => {

	beforeAll(() => { });


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
		
	const TEST__DEEPCHAINCOUNT = 1000000; 
	it("resolve deep chain test (case 1)", async () => {		
		let resolver = new ExpressionResolver({ context: { first: "first" }, name: "first" });
		for(let i = 0; i < TEST__DEEPCHAINCOUNT; i++)
			resolver = new ExpressionResolver({ context: { test: "test" }, name: "next" + i, parent: resolver });
		
		
		const start = Date.now();
		const result = await resolver.resolve("${first}", "fail");
		const runtime = Date.now() - start;
		console.info("deep chain test (case 1) runtime:", runtime, "ms by deep:", TEST__DEEPCHAINCOUNT);
		
		expect(result).toBe("first");
	});
	
	it("resolve deep chain test (case 2)", async () => {	
		let resolver = new ExpressionResolver({ context: { first: "first" }, name: "first" });
		for(let i = 0; i < TEST__DEEPCHAINCOUNT; i++)
			resolver = new ExpressionResolver({ context: null, name: "next" + i, parent: resolver });
		
		const start = Date.now();
		const result = await resolver.resolve("${first}", "fail");
		const runtime = Date.now() - start;
		console.info("deep chain test (case 2) runtime:", runtime, "ms by deep:", TEST__DEEPCHAINCOUNT);
		
		expect(result).toBe("first");
	});
	
});