import ExpressionResolver from "../src/ExpressionResolver";

describe("Test resolve", function() {
	beforeAll(function(done){		
		done();
	});
	
	it("resolve \"${test}\"", function(done){
		ExpressionResolver.resolveText("${test}", {"test":"success"}, "fail")
		.then(function(aResult){
			expect(aResult).toBe("success");
			done();	
		});		
	});
	
	it("resolve \"${test}\" to default", function(done){
		ExpressionResolver.resolveText("${typeof test !== \"undefined\" ? test : undefined}", {}, "fail")
		.then(function(aResult){
			expect(aResult).toBe("fail");
			done();	
		});		
	});
	
	it("resolve \"${test}\" throw an error", function(done){
		ExpressionResolver.resolveText("${test}", {}, "fail")
		["catch"](function(aError){
			expect(aError instanceof Error).toBe(true);
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
		ExpressionResolver.resolveText("${getPromise()}", {"getPromise":function(){
			return Promise.resolve("success");
		}}, "fail")
		.then(function(aResult){
			expect(aResult).toBe("success");
			done();	
		});		
	});
	
});