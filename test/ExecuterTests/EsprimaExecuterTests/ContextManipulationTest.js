import {ExpressionResolver} from "../../../index.js";
import {EXECUTERNAME} from "../../../src/executer/EsprimaExecuter.js"

describe("Resolver context manipulation test - ", () => {

	const executerReset = ExpressionResolver.defaultExecuter;
	beforeAll(() => {
		ExpressionResolver.defaultExecuter = EXECUTERNAME;
	});

	afterAll(() => {
		ExpressionResolver.defaultExecuter = executerReset;
	});

	it("merge", async () => {
		const resolver = new ExpressionResolver({ context: { first: "first" }});		
		
		expect(resolver.context.first).toBe("first");
		expect(resolver.context.second).toBeUndefined();
		
		resolver.mergeContext({second: "second"});
		
		expect(resolver.context.second).toBeDefined();
		expect(resolver.context.second).toBe("second");
	});
});