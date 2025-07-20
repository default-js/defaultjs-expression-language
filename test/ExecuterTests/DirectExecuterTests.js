import {ExpressionResolver} from "../../src/index.js";
import getExecuter from "../../src/ExecuterRegistry.js";
import {EXECUTERNAME } from "../../src/executer/DirectExecuter.js";

describe("Test resolve", () => {
	const executerReset = ExpressionResolver.defaultExecuter;

	beforeAll(() => {
		ExpressionResolver.defaultExecuter = EXECUTERNAME;
	});
	it("check correct executer is set", () => {
		expect(getExecuter(EXECUTERNAME)).toBe(ExpressionResolver.defaultExecuter);
	});
	
	it("resolve \"${ctx.test}\"", async () => {
		const result = await ExpressionResolver.resolve("${ctx.test}", {"test":"success"});
		expect(result).toBe("success");
	});

	it("resolve \"${true}\"", async () => {
		const result = await ExpressionResolver.resolve("${true}", {});
		expect(result).toBe(true);
	});

	it("resolve \"${false}\"", async () => {
		const result = await ExpressionResolver.resolve("${false}", {});
		expect(result).toBe(false);
	});

	it("resolve \"${1}\"", async () => {
		const result = await ExpressionResolver.resolve("${1}", {});
		expect(result).toBe(1);
	});

	it("resolve \"${{test:'value'}}\"", async () => {
		const result = await ExpressionResolver.resolve("${{test:'value'}}", {});
		expect(result.test).toBe("value");
	});

	it("resolve \"${new Array()}\"", async () => {
		const result = await ExpressionResolver.resolve("${new Array()}", {});
		expect(result instanceof Array).toBe(true);
	});

	it("resolve \"${new Set()}\"", async () => {
		const result = await ExpressionResolver.resolve("${new Set()}", {});
		expect(result instanceof Set).toBe(true);
	});

	it("resolve \"${new Map()}\"", async () => {
		const result = await ExpressionResolver.resolve("${new Map()}", {});
		expect(result instanceof Map).toBe(true);
	});

	it("resolve \"${new Date()}\"", async () => {
		const result = await ExpressionResolver.resolve("${new Date()}", {});
		expect(result instanceof Date).toBe(true);
	});		

	afterAll(() => {
		ExpressionResolver.defaultExecuter = executerReset;
	});
});