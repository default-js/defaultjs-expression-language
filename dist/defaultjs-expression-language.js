/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./browser-index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./browser-index.js":
/*!**************************!*\
  !*** ./browser-index.js ***!
  \**************************/
/*! no exports provided */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _src__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./src */ "./src/index.js");


const global = window || global || self || undefined || {};
global.defaultjs = global.defaultjs || {};
global.defaultjs.el = global.defaultjs.el || {
	VERSION : "1.0.0-beta.1",
	ExpressionResolver : _src__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"].ExpressionResolver
};

/***/ }),

/***/ "./src/ExpressionResolver.js":
/*!***********************************!*\
  !*** ./src/ExpressionResolver.js ***!
  \***********************************/
/*! exports provided: default */
/*! exports used: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
const EXPRESSION = /\$\{([^\{\}]+)\}/;

const execute = function(aStatement, aContext, aDefault, aTimeout) {
		if(typeof aTimeout === "number" && aTimeout > 0)
			return new Promise(function(resolve){
				setTimeout(function(){
					resolve(execute(aStatement, aContext, aDefault));
				});
			});
		
	    if (typeof aStatement !== "string")
		    return Promise.resolve(aStatement);
	    
	    let statement = aStatement.trim();			    
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
		    .then(function(aResult){
		    	if(typeof aResult === "undefined")
		    		return Promise.resolve(aDefault);
		    	
		    	return Promise.resolve(aResult);
		    })["catch"](function(aError){
				return Promise.reject(aError);
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
		return new Promise(function(resolve){
			setTimeout(function(){
				resolve(resolveText(aText, aContext, aDefault));
			});
		});
	
	
	const match = EXPRESSION.exec(aText);
	if(match != null)
		return execute(match[1], aContext, aDefault)
		.then(function(aResult){
			return resolveText(aText.split(match[0]).join(aResult), aContext, aDefault);
		});
	
	return Promise.resolve(aText);
};

const ExpressionResolver = {
		resolve : resolve,
		resolveText : resolveText
};
/* harmony default export */ __webpack_exports__["a"] = (ExpressionResolver);

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! exports provided: default */
/*! exports used: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _ExpressionResolver__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ExpressionResolver */ "./src/ExpressionResolver.js");


/* harmony default export */ __webpack_exports__["a"] = ({
	ExpressionResolver:_ExpressionResolver__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"]
});

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vYnJvd3Nlci1pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvRXhwcmVzc2lvblJlc29sdmVyLmpzIiwid2VicGFjazovLy8uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO1FBQUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7OztRQUdBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwwQ0FBMEMsZ0NBQWdDO1FBQzFFO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0Esd0RBQXdELGtCQUFrQjtRQUMxRTtRQUNBLGlEQUFpRCxjQUFjO1FBQy9EOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQSx5Q0FBeUMsaUNBQWlDO1FBQzFFLGdIQUFnSCxtQkFBbUIsRUFBRTtRQUNySTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLDJCQUEyQiwwQkFBMEIsRUFBRTtRQUN2RCxpQ0FBaUMsZUFBZTtRQUNoRDtRQUNBO1FBQ0E7O1FBRUE7UUFDQSxzREFBc0QsK0RBQStEOztRQUVySDtRQUNBOzs7UUFHQTtRQUNBOzs7Ozs7Ozs7Ozs7OztBQ2xGQTtBQUFBO0FBQXdCOztBQUV4QiwyQ0FBMkMsU0FBSTtBQUMvQztBQUNBO0FBQ0EsY0FBYyxRQUFRO0FBQ3RCLHNCQUFzQixvREFBSTtBQUMxQixFOzs7Ozs7Ozs7Ozs7O0FDUEEsd0JBQXdCLEtBQUssRUFBRSxLQUFLOztBQUVwQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLElBQUk7O0FBRUo7QUFDQTs7QUFFQSx1QztBQUNBO0FBQ0E7QUFDQTtBQUNBLHVEQUF1RDtBQUN2RCw2REFBNkQ7QUFDN0QscURBQXFEO0FBQ3JELFdBQVc7QUFDWCxVQUFVLFNBQVM7QUFDbkIsa0JBQWtCO0FBQ2xCLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLE9BQU87QUFDUDtBQUNBLE9BQU87QUFDUCxHQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSixHQUFHOzs7QUFHSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ2UsMkVBQWtCLEU7Ozs7Ozs7Ozs7Ozs7QUNyRWpDO0FBQXNEOztBQUV2QztBQUNmLG9CQUFvQixtRUFBa0I7QUFDdEMsQ0FBQyxFIiwiZmlsZSI6ImRlZmF1bHRqcy1leHByZXNzaW9uLWxhbmd1YWdlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9icm93c2VyLWluZGV4LmpzXCIpO1xuIiwiaW1wb3J0IHBhY2sgZnJvbSBcIi4vc3JjXCJcclxuXHJcbmNvbnN0IGdsb2JhbCA9IHdpbmRvdyB8fCBnbG9iYWwgfHwgc2VsZiB8fCB0aGlzIHx8IHt9O1xyXG5nbG9iYWwuZGVmYXVsdGpzID0gZ2xvYmFsLmRlZmF1bHRqcyB8fCB7fTtcclxuZ2xvYmFsLmRlZmF1bHRqcy5lbCA9IGdsb2JhbC5kZWZhdWx0anMuZWwgfHwge1xyXG5cdFZFUlNJT04gOiBcIiR7dmVyc2lvbn1cIixcclxuXHRFeHByZXNzaW9uUmVzb2x2ZXIgOiBwYWNrLkV4cHJlc3Npb25SZXNvbHZlclxyXG59OyIsImNvbnN0IEVYUFJFU1NJT04gPSAvXFwkXFx7KFteXFx7XFx9XSspXFx9LztcclxuXHJcbmNvbnN0IGV4ZWN1dGUgPSBmdW5jdGlvbihhU3RhdGVtZW50LCBhQ29udGV4dCwgYURlZmF1bHQsIGFUaW1lb3V0KSB7XHJcblx0XHRpZih0eXBlb2YgYVRpbWVvdXQgPT09IFwibnVtYmVyXCIgJiYgYVRpbWVvdXQgPiAwKVxyXG5cdFx0XHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSl7XHJcblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0cmVzb2x2ZShleGVjdXRlKGFTdGF0ZW1lbnQsIGFDb250ZXh0LCBhRGVmYXVsdCkpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9KTtcclxuXHRcdFxyXG5cdCAgICBpZiAodHlwZW9mIGFTdGF0ZW1lbnQgIT09IFwic3RyaW5nXCIpXHJcblx0XHQgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhU3RhdGVtZW50KTtcclxuXHQgICAgXHJcblx0ICAgIGxldCBzdGF0ZW1lbnQgPSBhU3RhdGVtZW50LnRyaW0oKTtcdFx0XHQgICAgXHJcblx0ICAgIGlmKHN0YXRlbWVudC5sZW5ndGggPT0gMClcclxuXHQgICAgXHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGFEZWZhdWx0KTtcclxuXHQgICAgdHJ5e1xyXG5cdFx0ICAgIGNvbnN0IGV4cHJlc3Npb24gPSBuZXcgRnVuY3Rpb24oXCJhQ29udGV4dFwiLCBcInRyeXtcIiArXHJcblx0XHQgICAgXHRcdFwiXHR3aXRoKGFDb250ZXh0IHx8IHdpbmRvdyB8fCBnbG9iYWwgfHwgc2VsZiB8fCB0aGlzKXtcIiArXHJcblx0XHQgICAgXHRcdFwiXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoXCIgKyBzdGF0ZW1lbnQgKyBcIik7XCIgK1xyXG5cdFx0ICAgIFx0XHRcIlx0fVwiICtcclxuXHRcdCAgICBcdFx0XCJ9Y2F0Y2goZSl7XCIgK1xyXG5cdFx0ICAgIFx0XHRcIlx0dGhyb3cgZTtcIiArXHJcblx0XHQgICAgXHRcdFwifVwiKTtcclxuXHRcdCAgICByZXR1cm4gZXhwcmVzc2lvbihhQ29udGV4dClcclxuXHRcdCAgICAudGhlbihmdW5jdGlvbihhUmVzdWx0KXtcclxuXHRcdCAgICBcdGlmKHR5cGVvZiBhUmVzdWx0ID09PSBcInVuZGVmaW5lZFwiKVxyXG5cdFx0ICAgIFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGFEZWZhdWx0KTtcclxuXHRcdCAgICBcdFxyXG5cdFx0ICAgIFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShhUmVzdWx0KTtcclxuXHRcdCAgICB9KVtcImNhdGNoXCJdKGZ1bmN0aW9uKGFFcnJvcil7XHJcblx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KGFFcnJvcik7XHJcblx0XHQgICAgfSlcclxuXHRcdH1jYXRjaChlKXtcclxuXHRcdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KGUpO1xyXG5cdFx0fVxyXG59O1xyXG5cclxuY29uc3QgcmVzb2x2ZSA9IGZ1bmN0aW9uKGFFeHByZXNzaW9uLCBhRGF0YUNvbnRleHQsIGFEZWZhdWx0LCBhVGltZW91dCkge1xyXG5cdGNvbnN0IG1hdGNoID0gRVhQUkVTU0lPTi5leGVjKGFFeHByZXNzaW9uKTtcclxuXHRpZiAobWF0Y2gpXHJcblx0XHRyZXR1cm4gZXhlY3V0ZShtYXRjaFsxXSwgYURhdGFDb250ZXh0LCBhRGVmYXVsdCwgYVRpbWVvdXQpO1xyXG5cdFxyXG5cdHJldHVybiBleGVjdXRlKGFFeHByZXNzaW9uLCBhRGF0YUNvbnRleHQsIGFEZWZhdWx0LCBhVGltZW91dCk7XHJcbn07XHJcblxyXG5jb25zdCByZXNvbHZlVGV4dCA9IGZ1bmN0aW9uKGFUZXh0LCBhQ29udGV4dCwgYURlZmF1bHQsIGFUaW1lb3V0KSB7XHJcblx0aWYodHlwZW9mIGFUaW1lb3V0ID09PSBcIm51bWJlclwiICYmIGFUaW1lb3V0ID4gMClcclxuXHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKXtcclxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpe1xyXG5cdFx0XHRcdHJlc29sdmUocmVzb2x2ZVRleHQoYVRleHQsIGFDb250ZXh0LCBhRGVmYXVsdCkpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cdFxyXG5cdFxyXG5cdGNvbnN0IG1hdGNoID0gRVhQUkVTU0lPTi5leGVjKGFUZXh0KTtcclxuXHRpZihtYXRjaCAhPSBudWxsKVxyXG5cdFx0cmV0dXJuIGV4ZWN1dGUobWF0Y2hbMV0sIGFDb250ZXh0LCBhRGVmYXVsdClcclxuXHRcdC50aGVuKGZ1bmN0aW9uKGFSZXN1bHQpe1xyXG5cdFx0XHRyZXR1cm4gcmVzb2x2ZVRleHQoYVRleHQuc3BsaXQobWF0Y2hbMF0pLmpvaW4oYVJlc3VsdCksIGFDb250ZXh0LCBhRGVmYXVsdCk7XHJcblx0XHR9KTtcclxuXHRcclxuXHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGFUZXh0KTtcclxufTtcclxuXHJcbmNvbnN0IEV4cHJlc3Npb25SZXNvbHZlciA9IHtcclxuXHRcdHJlc29sdmUgOiByZXNvbHZlLFxyXG5cdFx0cmVzb2x2ZVRleHQgOiByZXNvbHZlVGV4dFxyXG59O1xyXG5leHBvcnQgZGVmYXVsdCBFeHByZXNzaW9uUmVzb2x2ZXI7IiwiaW1wb3J0IEV4cHJlc3Npb25SZXNvbHZlciBmcm9tIFwiLi9FeHByZXNzaW9uUmVzb2x2ZXJcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuXHRFeHByZXNzaW9uUmVzb2x2ZXI6RXhwcmVzc2lvblJlc29sdmVyXHJcbn07Il0sInNvdXJjZVJvb3QiOiIifQ==