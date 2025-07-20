import {ExpressionResolver} from "../../index.js";

describe("Resolver chain", () => {

	beforeAll(() => { });

	const TEST__DEEPCHAINCOUNT = 1000000;
	
	it("resolve deep chain - many calls test (case 1)", async () => {
		let resolver = new ExpressionResolver({ context: { first: "first" }, name: "first" });
		for (let i = 0; i < TEST__DEEPCHAINCOUNT; i++)
			resolver = new ExpressionResolver({ context: null, name: "next" + i, parent: resolver });

		const start = Date.now();
		for (let i = 0; i < TEST__DEEPCHAINCOUNT; i++)
			await resolver.resolve("${first}", "fail");
		const runtime = Date.now() - start;
		console.info("resolve deep chain - many calls test (case 1):", runtime, "ms by deep:", TEST__DEEPCHAINCOUNT);

	});

});