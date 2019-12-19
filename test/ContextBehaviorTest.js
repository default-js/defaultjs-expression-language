import ExpressionResolver from "../src/ExpressionResolver";

describe("Context Behavior Test", function() {
	
	beforeAll(function(done){	
		const global = window || global || self || this || {};		
		global.test = "global context";
		
		done();
	});
	
	afterAll(function() {
		const global = window || global || self || this || {};		
		delete global.test;
	});
	
	it("resolve \"${test}\" from global context", function(done){
		ExpressionResolver.resolveText("${test}")
		.then(function(aResult){
			expect(aResult).toBe("global context");
			done();	
		});		
	});
	
	it("resolve \"${test}\" from local context (override global context)", function(done){
		ExpressionResolver.resolveText("${test}", {test: "local context"})
		.then(function(aResult){
			expect(aResult).toBe("local context");
			done();	
		});		
	});
	
	it("resolve \"${document.location}\" from browser window context", function(done){
		ExpressionResolver.resolveText("${document.location}")
		.then(function(aResult){
			expect(aResult).toBeDefined();
			expect(aResult == document.location).toBe(true);
			done();	
		});		
	});
	
	it("resolve \"${document.location}\" with overrided browser window context", function(done){
		ExpressionResolver.resolveText("${document.location}", {document : {location : "overrided"}})
		.then(function(aResult){
			expect(aResult).toBeDefined();
			expect(aResult == document.location).toBe(false);
			expect(aResult == "overrided").toBe(true);
			done();	
		});		
	});
	
	it("resolve \"${document.location}\" from browser window context and local context", function(done){
		ExpressionResolver.resolveText("${document.location}", {test:"local context"})
		.then(function(aResult){
			expect(aResult).toBeDefined();
			expect(aResult == document.location).toBe(true);
			return ExpressionResolver.resolveText("${test}", {test:"local context"})
			.then(function(aResult){
				expect(aResult == "local context").toBe(true);
			});
		})["finally"](function(){
			done();
		});		
	});	
});