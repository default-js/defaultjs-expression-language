import ExpressionResolver from "@src/ExpressionResolver";

describe("Resolver chain", () => {

	beforeAll(() => { });
	
	const TEST__DEEPCHAINCOUNT = 1000000;
	it("resolve deep chain test (case 1)", async () => {
		let resolver = new ExpressionResolver({ context: { first: "first" }, name: "first" });
		for (let i = 0; i < TEST__DEEPCHAINCOUNT; i++)
			resolver = new ExpressionResolver({ context: { test: "test" }, name: "next" + i, parent: resolver });


		const start = Date.now();
		const result = await resolver.resolve("${first}", "fail");
		const runtime = Date.now() - start;
		console.info("deep chain test (case 1) runtime:", runtime, "ms by deep:", TEST__DEEPCHAINCOUNT);

		expect(result).toBe("first");
	});

	it("resolve deep chain test (case 2)", async () => {
		let resolver = new ExpressionResolver({ context: { first: "first" }, name: "first" });
		for (let i = 0; i < TEST__DEEPCHAINCOUNT; i++)
			resolver = new ExpressionResolver({ context: null, name: "next" + i, parent: resolver });

		const start = Date.now();
		const result = await resolver.resolve("${first}", "fail");
		const runtime = Date.now() - start;
		console.info("deep chain test (case 2) runtime:", runtime, "ms by deep:", TEST__DEEPCHAINCOUNT);

		expect(result).toBe("first");
	});
});