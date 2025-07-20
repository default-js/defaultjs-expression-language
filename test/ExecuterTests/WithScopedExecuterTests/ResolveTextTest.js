import {ExpressionResolver} from "../../../index.js";
import {EXECUTERNAME} from "../../../src/executer/WithScopedExecuter.js"

describe("Test resolveText", () => {
	
	const CONTEXT = {
		test0 : undefined,
		test1 : "value1",
		test2 : "value2",
		test3 : function(){
			return Promise.resolve("value3")
		},
		test4 : function(){
			return new Promise(function(resolve){
				setTimeout(function(){
					resolve("value4");
				}, 1000);
			});
		},
		test5 : function(){
			return "value5";
		}		
	};

	const executerReset = ExpressionResolver.defaultExecuter;
	beforeAll(() => {
		ExpressionResolver.defaultExecuter = EXECUTERNAME;
	});

	afterAll(() => {
		ExpressionResolver.defaultExecuter = executerReset;
	});
	
	it("resolveText \"${test1}\"", async () => {
		const result = await ExpressionResolver.resolveText("${test1}", CONTEXT, "fail");
		expect(result).toBe("value1");
	});
	
	it("resolveText \"text ${test1} text\"", async () => {
		const result = await ExpressionResolver.resolveText("text ${test1} text", CONTEXT, "fail");
		expect(result).toBe("text value1 text");
	});
	
	it("resolveText \"text ${test1} text ${test1} text\"", async () => {
		const result = await ExpressionResolver.resolveText("text ${test1} text ${test1} text", CONTEXT, "fail");
		expect(result).toBe("text value1 text value1 text");
	});
	
	it("resolveText \"text ${test1} text ${test2} text\"", async () => {
		const result = await ExpressionResolver.resolveText("text ${test1} text ${test2} text", CONTEXT, "fail");
		expect(result).toBe("text value1 text value2 text");
	});
	
	it("resolveText \"text ${test1} ${test2} ${test3()} ${test4()} ${test5()} text\"", async () => {
		const result = await ExpressionResolver.resolveText("text ${test0} ${test1} ${test2} ${test3()} ${test4()} ${test5()} text", CONTEXT, "fail");
		expect(result).toBe("text fail value1 value2 value3 value4 value5 text");
	});
	
	it("resolveText \"test1\"", async () => {
		const result = await ExpressionResolver.resolveText("test1", CONTEXT, "fail");
		expect(result).toBe("test1");
	});
	
	it("resolveText \"text test1 text\"", async () => {
		const result = await ExpressionResolver.resolveText("text test1 text", CONTEXT, "fail");
		expect(result).toBe("text test1 text");
	});
	
	it("resolveText \"${test1}\" with timeout", async () => {
		const result = await ExpressionResolver.resolveText("${test1}", CONTEXT, "fail", 1000);
		expect(result).toBe("value1");
	});	
	
	it("resolveText \"test\" with timeout", async () => {
		const result = await ExpressionResolver.resolveText("test", CONTEXT, "fail", 1000)
		expect(result).toBe("test");
	});	
	
	it("resolveText \"text ${test1} text\" with timeout", async () => {
		const result = await ExpressionResolver.resolveText("text ${test1} text", CONTEXT, "fail", 1000)
		expect(result).toBe("text value1 text");
	});
	
	it("resolveText \"text ${test1} ${test2} ${test3()} ${test4()} ${test5()} text\"", async () => {
		const result = await ExpressionResolver.resolveText("text ${test0} ${test1} ${test2} ${test3()} ${test4()} ${test5()} text", CONTEXT, "fail", 1000)
		expect(result).toBe("text fail value1 value2 value3 value4 value5 text");
	});
	
});