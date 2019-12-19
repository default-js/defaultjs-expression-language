import ExpressionResolver from "../src/ExpressionResolver";

describe("Test resolve", function() {
	beforeAll(function(done){		
		done();
	});
	
	it("resolve \"${test}\"", function(done){
		ExpressionResolver.resolve("${test}", {"test":"success"}, "fail")
		.then(function(aResult){
			expect(aResult).toBe("success");
			done();	
		});		
	});
	
	it("resolve \"${test}\" to default", function(done){
		ExpressionResolver.resolve("${typeof test !== \"undefined\" ? test : undefined}", {}, "fail")
		.then(function(aResult){
			expect(aResult).toBe("fail");
			done();	
		});		
	});
	
	it("resolve \"${test}\" throw an error", function(done){
		ExpressionResolver.resolve("${test}", {}, "fail")
		["catch"](function(aError){
			expect(aError instanceof Error).toBe(true);
			done();	
		});		
	});
	
	it("resolve \"${test}\" as Object", function(done){
		ExpressionResolver.resolve("${test}", {"test": {"type" : "object"}}, "fail")
		.then(function(aResult){
			expect(typeof aResult).toBe("object");
			expect(aResult.type).toBeDefined();
			expect(aResult.type).toBe("object");
			done();	
		});		
	});
	
	it("resolve \"${test}\" as function", function(done){
		ExpressionResolver.resolve("${test}", {"test": function(){return "function";}}, "fail")
		.then(function(aResult){
			expect(typeof aResult).toBe("function");
			expect(aResult()).toBe("function");
			done();	
		});		
	});
	
	it("resolve \"${test}\" with timeout", function(done){
		ExpressionResolver.resolve("${test}", {"test":"success"}, "fail", 1000)
		.then(function(aResult){
			expect(aResult).toBe("success");
			done();	
		});		
	});
	
	it("resolve \"test\"", function(done){
		ExpressionResolver.resolve("test", {"test":"success"}, "fail")
		.then(function(aResult){
			expect(aResult).toBe("success");
			done();	
		});		
	});
	
	it("resolve \"test\" with timeout", function(done){
		ExpressionResolver.resolve("test", {"test":"success"}, "fail", 1000)
		.then(function(aResult){
			expect(aResult).toBe("success");
			done();	
		});		
	});
	
	it("resolve \"${getPromise()}\" as a promise", function(done){
		ExpressionResolver.resolve("${getPromise()}", {"getPromise":function(){
			return Promise.resolve("success");
		}}, "fail")
		.then(function(aResult){
			expect(aResult).toBe("success");
			done();	
		});		
	});
	
});