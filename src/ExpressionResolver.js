const EXPRESSION = /\$\{([^\{\}]+)\}/;

const execute = function(aStatement, aContext, aDefault, aTimeout) {
		if(typeof aTimeout === "number" && aTimeout > 0)
			return new Promise((resolve) => {
				setTimeout(() => {
					resolve(execute(aStatement, aContext, aDefault))
				}, aTimeout);
			});
		
	    if (typeof aStatement !== "string")
		    return Promise.resolve(aStatement);
	    
	    const statement = aStatement.trim();			    
	    if(statement.length == 0)
	    	return Promise.resolve(aDefault);
	    try{
		    const expression = new Function("aContext", "try{" +
		    		"	with(aContext || window || global || self || this){" +
		    		"		return Promise.resolve(" + statement + ");" +
		    		"	}" +
		    		"}catch(e){" +
		    		"	throw e;" +
		    		"}");
		    return expression(aContext)
			    .then(aResult => {
			    	if(typeof aResult === "undefined")
			    		return Promise.resolve(aDefault);
			    	
			    	return Promise.resolve(aResult);
			    })
		}catch(e){
			return Promise.reject(e);
		}
};

const resolve = function(aExpression, aDataContext, aDefault, aTimeout) {
	const match = EXPRESSION.exec(aExpression);
	if (match)
		return execute(match[1], aDataContext, aDefault, aTimeout);
	
	return execute(aExpression, aDataContext, aDefault, aTimeout);
};

const resolveText = function(aText, aContext, aDefault, aTimeout) {
	if(typeof aTimeout === "number" && aTimeout > 0)
		return new Promise(resolve => {
			setTimeout(() => {
				resolve(resolveText(aText, aContext, aDefault));
			}, aTimeout);
		});
	
	
	const match = EXPRESSION.exec(aText);
	if(match != null)
		return execute(match[1], aContext, aDefault)
		.then(aResult => resolveText(aText.split(match[0]).join(aResult), aContext, aDefault));
	
	return Promise.resolve(aText);
};

const ExpressionResolver = {
		resolve : resolve,
		resolveText : resolveText
};
export default ExpressionResolver;