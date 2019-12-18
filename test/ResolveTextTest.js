import ExpressionResolver from "../src/ExpressionResolver";

describe("Test resolveText", function() {
	
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
	
	it("resolveText \"${test1}\"", function(done){
		ExpressionResolver.resolveText("${test1}", CONTEXT, "fail")
		.then(function(aResult){
			expect(aResult).toBe("value1");
			done();	
		});		
	});
	
	it("resolveText \"text ${test1} text\"", function(done){
		ExpressionResolver.resolveText("text ${test1} text", CONTEXT, "fail")
		.then(function(aResult){
			expect(aResult).toBe("text value1 text");
			done();	
		});		
	});
	
	it("resolveText \"text ${test1} text ${test1} text\"", function(done){
		ExpressionResolver.resolveText("text ${test1} text ${test1} text", CONTEXT, "fail")
		.then(function(aResult){
			expect(aResult).toBe("text value1 text value1 text");
			done();	
		});		
	});
	
	it("resolveText \"text ${test1} text ${test2} text\"", function(done){
		ExpressionResolver.resolveText("text ${test1} text ${test2} text", CONTEXT, "fail")
		.then(function(aResult){
			expect(aResult).toBe("text value1 text value2 text");
			done();	
		});		
	});
	
	it("resolveText \"text ${test1} ${test2} ${test3()} ${test4()} ${test5()} text\"", function(done){
		ExpressionResolver.resolveText("text ${test0} ${test1} ${test2} ${test3()} ${test4()} ${test5()} text", CONTEXT, "fail")
		.then(function(aResult){
			expect(aResult).toBe("text fail value1 value2 value3 value4 value5 text");
			done();	
		});		
	});
	
	it("resolveText \"test1\"", function(done){
		ExpressionResolver.resolveText("test1", CONTEXT, "fail")
		.then(function(aResult){
			expect(aResult).toBe("test1");
			done();	
		});		
	});
	
	it("resolveText \"text test1 text\"", function(done){
		ExpressionResolver.resolveText("text test1 text", CONTEXT, "fail")
		.then(function(aResult){
			expect(aResult).toBe("text test1 text");
			done();	
		});		
	});
	
	it("resolveText \"${test1}\" with timeout", function(done){
		ExpressionResolver.resolveText("${test1}", CONTEXT, "fail", 1000)
		.then(function(aResult){
			expect(aResult).toBe("value1");
			done();	
		});		
	});	
	
	it("resolveText \"test\" with timeout", function(done){
		ExpressionResolver.resolveText("test", CONTEXT, "fail", 1000)
		.then(function(aResult){
			expect(aResult).toBe("test");
			done();	
		});		
	});	
	
	it("resolveText \"text ${test1} text\" with timeout", function(done){
		ExpressionResolver.resolveText("text ${test1} text", CONTEXT, "fail", 1000)
		.then(function(aResult){
			expect(aResult).toBe("text value1 text");
			done();	
		});		
	});
	
	it("resolveText \"text ${test1} ${test2} ${test3()} ${test4()} ${test5()} text\"", function(done){
		ExpressionResolver.resolveText("text ${test0} ${test1} ${test2} ${test3()} ${test4()} ${test5()} text", CONTEXT, "fail", 1000)
		.then(function(aResult){
			expect(aResult).toBe("text fail value1 value2 value3 value4 value5 text");
			done();	
		});		
	});
	
});