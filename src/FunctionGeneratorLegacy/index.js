const generate = (aStatement) => {
	return new Function(
		"context",
		`
return (async (context) => {
	try{ 
		with(context){
			 return ${aStatement}
		}
	}catch(e){
		throw e;
	}
})(context || {});`,
	);
};

export default generate;
