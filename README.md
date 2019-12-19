# defaultjs-expression-language

This lib provide functionallity similar to the text literals at javascript, but this lib supports Promise results from an Expression.

### use npm

````
npm install defaultjs-expression-language

````

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


### use browser

```html
<script type="text/javascript" src="defaultjs-expression-language.min.js"></script>
```


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
defaultjs.el.ExpressionResolver.resolve("${name}", {"name": function(){
	return Promise.resolve("max mustermann");
}).then(console.log); // max mustermann

defaultjs.el.ExpressionResolver.resolveText("hello ${name}, nice to see you!", {"name": function(){
	return Promise.resolve("max mustermann");
}).then(console.log); // hello max mustermann, nice to see you!
```
