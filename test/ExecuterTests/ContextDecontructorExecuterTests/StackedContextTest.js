import {ExpressionResolver} from "../../../index.js";
import {EXECUTERNAME } from "../../../src/executer/ContextDeconstructorExecuter.js";

describe(`${EXECUTERNAME} context checks: `, () => {

	const executerReset = ExpressionResolver.defaultExecuter;
	beforeAll(() => {
		ExpressionResolver.defaultExecuter = EXECUTERNAME;
	});	

	afterAll(() => {
		ExpressionResolver.defaultExecuter = executerReset;
	});
	
	it("No Stacked context", async () => {
		const resolver = new ExpressionResolver({ context: {string:"string", number:0, boolean:false, test:"success"}});
		expect(await resolver.resolve("${string}")).toBe("string");
	});

	it("Stacked context", async () => {
		const resolver = new ExpressionResolver({ 
			context: {string:"string", number:0, boolean:false, test:"success"}, 
			parent: new ExpressionResolver({ 
				context: {parentTest:"parentSuccess"}, 
				parent: new ExpressionResolver() 
			})	
		});
		
		const data = resolver.getData();
		expect(await resolver.resolve("${string}")).toBe("string");
	});
});