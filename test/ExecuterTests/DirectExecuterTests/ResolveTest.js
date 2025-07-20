import {ExpressionResolver} from "../../../index.js";
import {EXECUTERNAME } from "../../../src/executer/DirectExecuter.js";

describe(`${EXECUTERNAME} resolve test: `, () => {

	const executerReset = ExpressionResolver.defaultExecuter;
	beforeAll(() => {
		ExpressionResolver.defaultExecuter = EXECUTERNAME;
	});	

	afterAll(() => {
		ExpressionResolver.defaultExecuter = executerReset;
	});
	
	it("\"${ctx.test}\"", async () => {
		const result = await ExpressionResolver.resolve("${ctx.test}", {"test":"success"});
		expect(result).toBe("success");
	});

	it("\"${true}\"", async () => {
		const result = await ExpressionResolver.resolve("${true}", {});
		expect(result).toBe(true);
	});

	it("\"${false}\"", async () => {
		const result = await ExpressionResolver.resolve("${false}", {});
		expect(result).toBe(false);
	});

	it("\"${1}\"", async () => {
		const result = await ExpressionResolver.resolve("${1}", {});
		expect(result).toBe(1);
	});

	it("\"${{test:'value'}}\"", async () => {
		const result = await ExpressionResolver.resolve("${{test:'value'}}", {});
		expect(result.test).toBe("value");
	});

	it("\"${new Array()}\"", async () => {
		const result = await ExpressionResolver.resolve("${new Array()}", {});
		expect(result instanceof Array).toBe(true);
	});

	it("\"${new Set()}\"", async () => {
		const result = await ExpressionResolver.resolve("${new Set()}", {});
		expect(result instanceof Set).toBe(true);
	});

	it("\"${new Map()}\"", async () => {
		const result = await ExpressionResolver.resolve("${new Map()}", {});
		expect(result instanceof Map).toBe(true);
	});

	it("\"${new Date()}\"", async () => {
		const result = await ExpressionResolver.resolve("${new Date()}", {});
		expect(result instanceof Date).toBe(true);
	});	
});