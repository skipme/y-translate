// invoke limiter
var invokeLimiter = {};

(function(){
	"use strict";
	function limiter (interval, func, funcScope) {
		if(func === null || func === undefined)
		{
			throw 'set arguments correctly please, limiter constructor';
		}
		
		var that = this;
		this.interval = interval;
		this.func = func;
		this.funcScope = funcScope;
		
		this.intervalId = setInterval(function(){that.intervalFunc.call(that);}, interval);
	};
	limiter.prototype = {
		intervalId: -1,
		interval: 100,
		arguments: [],
		argsNum: 0,
		func: null,
		funcScope: window, 
		
		flagIsCritical: false,

		intervalFunc: function(force){
			if(this.flagIsCritical || force)
			{	
				var timeNow = (new Date()).getTime();
				this.flagIsCritical = false;
				this.arguments[this.argsNum] = timeNow - this.arguments[this.argsNum];
				this.func.apply(this, this.arguments);
				this.arguments[this.argsNum] = timeNow;
			}
		},
		critical: function(functionArgs){
			var i = this.argsNum = functionArgs.length;
			this.arguments.length = this.argsNum + 1;
			while(i--)
			{
				this.arguments[i] = functionArgs[i];
			}
			this.arguments[this.argsNum] = (new Date()).getTime();
			this.flagIsCritical = true;
		},
		criticalOneArg: function(oneArg){
			this.arguments[0] = oneArg;
			this.arguments[1] = (new Date()).getTime();
			this.argsNum = 1;
			this.flagIsCritical = true;
		},
		stop: function(){
			if(this.intervalId > -1)
			{
				clearInterval(this.intervalId);
				this.intervalId = -1;
			}
		},
		kick: function(){
			this.intervalFunc(true);
		}
	};

	invokeLimiter.create = function(interval, func){
		return new limiter(interval, func);
	};
}());

// var current = invokeLimiter.create(500, function(a,b,c){console.log('func',a,b,c)});
// console.log(current.critical([1,2,3,4,5,6]))