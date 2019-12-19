# defaultjs-expression-language

This lib provide functionallity similar to the text literals at javascript, but this lib supports Promise results from an Expression.


** **

1. [Install](#install)
2. [Using](#using)
3. [API Documentation](#api-documentation)
3. [License](#license)



## install

### browser

```html
<script type="text/javascript" src="defaultjs-expression-language.min.js"></script>
```

### npm

````
npm install defaultjs-expression-language

````

```javascript
import ExpressionResolver from "@modules/ExpressionResolver"

/*simple value replacement*/
ExpressionResolver.resolve("${name}", {"name": "max mustermann"})
.then(console.log); // max mustermann

ExpressionResolver.resolveText("hello ${name}, nice to see you!", {"name": "max mustermann"})
.then(console.log); // hello max mustermann, nice to see you!
```

## Using

** simple value replacement **

```javascript
import ExpressionResolver from "@modules/ExpressionResolver"

/*simple value replacement*/
ExpressionResolver.resolve("${name}", {"name": "max mustermann"})
.then(console.log); // max mustermann

ExpressionResolver.resolveText("hello ${name}, nice to see you!", {"name": "max mustermann"})
.then(console.log); // hello max mustermann, nice to see you!
```

** promise value replacement **

```javascript
/*promise value replacement*/
ExpressionResolver.resolve("${name}", {"name": function(){
	return Promise.resolve("max mustermann");
}).then(console.log); // max mustermann

ExpressionResolver.resolveText("hello ${name}, nice to see you!", {"name": function(){
	return Promise.resolve("max mustermann");
}).then(console.log); // hello max mustermann, nice to see you!
```


** promise value replacement **

```javascript
/*promise value replacement*/
defaultjs.el.ExpressionResolver.resolve("${name}", {"name": function(){
	return Promise.resolve("max mustermann");
}).then(console.log); // max mustermann

defaultjs.el.ExpressionResolver.resolveText("hello ${name}, nice to see you!", {"name": function(){
	return Promise.resolve("max mustermann");
}).then(console.log); // hello max mustermann, nice to see you!
```

## API Documentation


```javascript
ExpressionResolver.resolve(aStatement, aContext, aDefault, aTimeout) 
// returned a promise and the expression can be resolved to any type 

ExpressionResolver.resolveText(aStatement, aContext, aDefault, aTimeout) 
// returned a promise and the expression would be resolved to an string 
```


** context sensitive behavior **

```javascript
const global = window || global || self || this || {};
global.test = "global test var";
ExpressionResolver.resolve("${test}"); // global test var
ExpressionResolver.resolve("${test}", {}); // global test var
ExpressionResolver.resolve("${test}", {test: "local test var"}); // local test var 

ExpressionResolver.resolveText("text ${test} text"); // text global test var text
ExpressionResolver.resolveText("text ${test} text", {}); // text global test var text
ExpressionResolver.resolveText("text ${test} text", {test: "local test var"}); // text local test var text 

```

** default value behavior **

```javascript
const global = window || global || self || this || {};
global.test = undefined;
ExpressionResolver.resolve("${test}", global, "var is undefined"); // var is undefined
ExpressionResolver.resolveText("text ${test} text", global, "var is undefined"); // text var is undefined text 

```

** timeout **

```javascript
const global = window || global || self || this || {};
global.test = "global test var";
ExpressionResolver.resolve("${test}", global, undefined, 1000); 
// the expression resolver waits 1000ms, before starting the resolving process   

ExpressionResolver.resolveText("text ${test} text", global, undefined, 1000); 
// the expression resolver waits 1000ms, before starting the resolving process
```


## License

[MIT](LICENSE) 
