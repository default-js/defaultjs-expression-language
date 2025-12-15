import {ExpressionResolver} from "../../../index.js";
import {EXECUTERNAME } from "../../../src/executer/ContextDeconstructorExecuter.js";

describe(`${EXECUTERNAME} resolve test: `, () => {

	const executerReset = ExpressionResolver.defaultExecuter;
	beforeAll(() => {
		ExpressionResolver.defaultExecuter = EXECUTERNAME;
	});	
 
	afterAll(() => {
		ExpressionResolver.defaultExecuter = executerReset;
	});
	
	it("\"${test}\"", async () => {
		const result = await ExpressionResolver.resolve("${test}", {"test":"success"});
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

	it("varname not defined", async () => {
		const result = await ExpressionResolver.resolve("${test}", {});
		expect(typeof result === "undefined").toBe(true);
	});	

	it("illegal object member", async () => {
		const data = { test:"success"};
		data["test-test"] =  true;
		const result = await ExpressionResolver.resolve("${test}", data);
		expect(result).toBe("success");
	});	


	it("work with complex elements at first level", async () => {
		const div = document.createElement("div");
		const result = await ExpressionResolver.resolve("${children.length}", div);
		expect(result===0).toBe(true);
	});

	it("work with complex elements at deeper level", async () => {
		const div = document.createElement("div");
		const result = await ExpressionResolver.resolve("${div}", {div});
		expect(result == div).toBe(true);
		const resultchilderen = await ExpressionResolver.resolve("${div.children.length}", {div});
		expect(resultchilderen===0).toBe(true);
	});


	it("work with complex elements at deeper level", async () => {
		class TestClass {
			constructor(){			
			}
			get test() {
				return "success";
			}
		}

		let result = await ExpressionResolver.resolve("${test}",new TestClass());
		expect(result).toBe("success");
		result = await ExpressionResolver.resolve("${data.test}", {data: new TestClass()});
		expect(result).toBe("success");
	});

});