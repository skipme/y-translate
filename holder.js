var p2ptranslate = { }; // app holder
(function(){
	"use strict";
	
	p2ptranslate.c = {
		CONTANSTS: {
			ASYNC_RES_OK: 10,
			ASYNC_RES_ERROR: 11,
			ASYNC_RES_OK_DESC: "OK",
			ASYNC_DISP_LIMIT_MS: 1000 * 60, // 5min
		},
		asyncDispatcher: {
			lastItem: -1,
			itemCounter: 0,
			lastDate: 0,
			registeredEndpoints: {},
			get itemId(){
				var datenow = (new Date()).getTime();
				if(this.lastDate === datenow)
					this.itemCounter++;
				else 
					this.itemCounter = 1;

				this.lastDate = datenow;
				// 1418451338261 time 'basis', allow us to multiply by 100 taking place for counter
				return this.lastItem = (datenow - 1418451338261) * 100 + this.itemCounter;
			},
			enqueueEndpoint: function(callback)
			{
				var ticket = this.itemId;
				this.registeredEndpoints[ticket] = {callback: callback, 
						till: (new Date()).getTime() + 
							p2ptranslate.c.CONTANSTS.ASYNC_DISP_LIMIT_MS};
				return ticket;
			},
			dequeueEndpoint: function(ticket)
			{
				var obj = this.registeredEndpoints[ticket];
				if(obj)
				{	
					delete this.registeredEndpoints[ticket];
					return obj.callback;
				}
				return null;// ticket lost?
			},
			checkEndpoints: function()
			{
				var datenow = (new Date()).getTime();
				for(k in this.registeredEndpoints)
				{
					if(this.registeredEndpoints[k].till < datenow)
					{
						p2ptranslate.c.diagError("async endpoint has been lost", k, this.registeredEndpoints[k].callback);
					}
				}
			}
		},
		errorList: [],
		diagError: function ()
		{
			var line = "", err = new Error();
			for (var i = 0; i < arguments.length; i++) {
				line +=  (i==0?"":"; ") + 
					(typeof arguments[i] === "function" ? arguments[i].toString() 
						: JSON.stringify(arguments[i]));
			};

			// TODO: debug level...
			line += "; " + err.stack;
			console.error(line);
			line += "; at " + (new Date()).toUTCString();
			
			p2ptranslate.c.errorList.push(line);
			return line;
		},
		diagDebug: function ()
		{
			var line = "", err = new Error();
			for (var i = 0; i < arguments.length; i++) {
				line +=  (i==0?"":"; ");
				line += (typeof arguments[i] === "function" ? arguments[i].toString() 
						: JSON.stringify(arguments[i]));
			};

			// TODO: debug level...
			console.info(line);
			return line;
		},
		isNullOrWhiteSpace: function (str)
		{
			return (typeof str) !== "string" || str.length === 0 || /^\s*$/.test(str);
		},
		validateEmail: function (email) { 
		    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		    return re.test(email);
		},
		generateUid: (function() {
		    // Private array of chars to use
		    var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''); 
		   
		    return function (len, radix) {
		      var chars = CHARS, uuid = [], rnd = Math.random;
		      radix = radix || chars.length;
		   
		      if (len) {
		        // Compact form
		        for (var i = 0; i < len; i++) uuid[i] = chars[0 | rnd()*radix];
		      } else {
		        // rfc4122, version 4 form
		        var r;
		   
		        // rfc4122 requires these characters
		        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
		        uuid[14] = '4';
		   
		        // Fill in random data.  At i==19 set the high bits of clock sequence as
		        // per rfc4122, sec. 4.1.5
		        for (var i = 0; i < 36; i++) {
		          if (!uuid[i]) {
		            r = 0 | rnd()*16;
		            uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r & 0xf];
		          }
		        }
		      }
		   
		      return uuid.join('');
		    };
	    })(),
	    delays: {},
	    delay_clear: function(cname, callback)
	    {
	    	if(!callback || this.checkFunction(callback) || 
	    		// this.isNullOrWhiteSpace(callback.name))
				this.isNullOrWhiteSpace(cname))
	    		throw p2ptranslate.c.diagError("Required function with a unique name", cname);
	    	var fooname = cname;//callback.name; // ff only
	    	var dL = this.delays;
	    	var dobj = dL[fooname];
	    	if(dobj !== undefined && dobj !== null && !dobj.invoked)
	    	{
	    		var intId = dobj.intervalId;
	    		clearTimeout(intId);
	    	}
	    	// else{
	    		// we can't clearTimeout but it's - ok 
	    	// }
	    },
	    delay: function(cname, callback, ms, bool_dont_remove){// ms: [-1, 0...n], -1 means clear delay
	    	
	    	if(!callback || this.checkFunction(callback) || 
	    		// this.isNullOrWhiteSpace(callback.name))
				this.isNullOrWhiteSpace(cname))
	    		throw p2ptranslate.c.diagError("Required function with a unique name", cname);

	    	var fooname = cname;//callback.name; // ff only
	    	var dL = this.delays;
	    	var dobj = dL[fooname];
	    	if(dobj !== undefined && dobj !== null && !dobj.invoked)
	    	{
	    		if(bool_dont_remove)
	    			return;// do nothing...
	    		var intId = dobj.intervalId;
	    		clearTimeout(intId);
	    	}
	    	dL[fooname] = {intervalId: setTimeout(function(){
	    		var dLobj = dL[fooname];
	    		try{
	    			callback();
	    		}catch(exc){
	    			dLobj.lastError = p2ptranslate.c.diagError("delay callback error", fooname, exc, exc.message, exc.stack);
	    		}finally{
		    		dLobj.invoked = true;
		    	}
	    	}, ms), fName: fooname, invoked: false, lastError: null};
	    },
		defer: function(callback, args)
		{
			//callback.apply(undefined, args);
			var err = new Error();
			setTimeout(function(){
					try{
						callback.apply(undefined, args);
					}catch(exc)
					{
						p2ptranslate.c.diagError(exc.message, err.stack);
					}
				}, 0);
		},
		deferAsync: function(foo, callback)// means foo first arg is callback
		{
			//callback.apply(undefined, args);
			var err = new Error();
			setTimeout(function(){
					try{
						foo.call(undefined, 
							function(result){
								p2ptranslate.c.asyncResultOk(callback, result);
							});
					}catch(exc)
					{
						var msg = exc.message + " " + err.stack + " [!] internal function Stack: " + exc.stack;
						p2ptranslate.c.diagError(exc.message, exc.message, err.stack, " [!] internal function Stack: " + exc.stack);
						p2ptranslate.c.asyncResultError(callback, msg, exc);
					}
				}, 0);
		},
		aftermath: function() {
            var aftermath_context = {
                num: 0,
                sequence: [],
                ondonef: null,
                onerrorf: null,
                errorHit: false,
                prevResult: null,
                sync: false,
                ondone: function (a, e, sync) { this.ondonef = a; this.onerrorf = e; this.go(sync); },
                ok: function (result) {
                    this.num++;
                    this.prevResult = result;
                    if (this.num === this.sequence.length && !this.errorHit) {
                        this.ondonef(result);
                    }
                    else if(this.sync)
                    {
                    	var that = this;
                    	p2ptranslate.c.defer(function(){that.sequence[that.num](that);});
                    }
                },
                error: function (msg) {
                    this.num++;
                    if (this.onerrorf && !this.errorHit) {
                        this.errorHit = true;
                        this.onerrorf(msg);
                    }
                },
                go: function (sync) {
                	this.sync = sync;
                	if(!sync)
                	{
	                    for (var i = 0; i < this.sequence.length; i++) {
	                        this.sequence[i](this);
	                    }
	                }else{
	                	this.sequence[0](this);
	                }
                }
            };
            for (var i = 0; i < arguments.length; i++) {
            	if(p2ptranslate.c.checkFunction(arguments[i]))
            		throw p2ptranslate.c.diagError("aftermath wrong argument at", i, arguments[i]);
                aftermath_context.sequence.push(arguments[i]);
            }
            return aftermath_context;
        },
        asyncResult: function(callback, status, statusDescription, result)
        {
        	if(p2ptranslate.c.checkFunction(callback))
        	{
        		throw p2ptranslate.c.diagError("check arguments");
        	}
        	var resultObj = new ASYNC_RES(status, statusDescription, result);
        	try{
	        	p2ptranslate.c.defer(callback, [resultObj]);
	        	// callback(resultObj);
	        }catch(exc)
	        {
	        	p2ptranslate.c.diagError(exc.message, exc.stack);
	        }
        },
        asyncResultOk: function(callback, result)
        {
        	var CONST = p2ptranslate.c.CONTANSTS;
        	p2ptranslate.c.asyncResult(callback, CONST.ASYNC_RES_OK, CONST.ASYNC_RES_OK_DESC, result)
        },
        asyncResultError: function(callback, errorString, error)// error is optional
        {
        	var CONST = p2ptranslate.c.CONTANSTS;
        	p2ptranslate.c.asyncResult(callback, CONST.ASYNC_RES_ERROR, errorString, error)
        },
        checkFunction: function(fn)
        {
			return fn === null || fn === undefined || typeof fn !== "function";
        },
        convHtml2PT: function(html)
        {
        	var xtag = false;
        	var tag = "";
        	var xamps = false;
        	var amps = "";
        	var output = "";
        	var empty = true;
        	for (var i = 0; i < html.length; i++) {
        		var x = html[i];
        		switch(x)
        		{
        			case '<':
        				xtag = true;
        			break;
        			case '>':
        				xtag = false;
        				switch(tag)
        				{
        					case "br":
        						output += "\n";
        					break;
        				}
        				tag = "";
        			break;
        			case (' ' || '\t') && xtag:
        				xtag = false;
        			break;
        			case !xtag && '&':
        				xamps = true;
        			break;
        			case xamps && ';':
        				xamps = false;
        				switch(amps)
        				{
        					case "quot":
        						output += "\"";
        					break;
        					case "amp":
        						output += "&";
        					break;
        					case "lt":
        						output += "<";
        					break;
        					case "gt":
        						output += "<";
        					break;
        					case "raquo":
        						output += "»";
        					break;
        					case "laquo":
        						output += "«";
        					break;
        				}
        				amps = "";
        			break;
        			default:
        				if(xtag)
        					tag += x;
        				else if(xamps)
        					amps += x;
    					else
        				 {
        				 	output += x;
        				 	empty = false;
        				 }
        			break;
        		}
        	};
        	return empty?"":output;
        },
        convPT2Html: function(text)
        {
        	var output = "";
        	for (var i = 0; i < text.length; i++) {
        		var x = text[i];
        		switch(x)
        		{
        			case '\n':
         				 output += "<br />";
        			break;  
        			case '<':
         				 output += "&lt;";
        			break; 
        			case '>':
         				 output += "&gt;";
        			break;      			
        			default:
        				 output += x;
        			break;
        		}
        	}
        	return output;
        },
        createGETUrl: function (url, data) {
	        url = url + "?";
	        var notFirst = false;
	        for (var k in data) {
	            if(notFirst)
	                url += "&";
	            else
	                notFirst = true;

	            url = url + k + '=' + data[k];
	        }
	        return url;
	    },
        request: function(data, url, headers, method, callback) {
	        // TODO: add timeout
	        if (this.isNullOrWhiteSpace(url))
	            throw new Error("set url please");
	        if (typeof method === "undefined")
	            method = "GET";
	        if(this.checkFunction(callback))
	        	throw new Error("set valid callback function");
	        // url += ".json";
	        url = (method === "GET") ? this.createGETUrl(url, data) : url;

	        var request = new XMLHttpRequest();

	        request.open(method, url, true);
	        //request.responseType = "json";// firefox, opera only
	        var that = this;
	        request.onerror = function (e) { that.asyncResultError(callback, "request error (onerror): " + e.message, e);};
	        request.onreadystatechange = function () {
	            if (request.readyState === 4) {
	                //succ(request.response);// firefox, opera only
	                var json;
	                try {
	                    json = JSON.parse(request.responseText);
	                    that.asyncResultOk(callback, json);
	                }
	                catch (e) {
	                    that.asyncResultError(callback, e.message, e);
	                }
	            }
	        };
	        if (method === "GET")
	        {  
	        	 try{
		          	request.send();
		          }
		          catch(e){
		          	that.asyncResultError(callback, "request error: " + e.message, e);
		          }
	        }
	        else if (method === "POST") {
	            // request.setRequestHeader('X-PINGOTHER', 'pingpong');
	            request.setRequestHeader('Content-Type', 'application/json');
	            for (var i = 0; i < headers.length; i++) {
	            	request.setRequestHeader(headers[i].key, headers[i].value);
	            };
	            try{
	               request.send(JSON.stringify(data));
	        	}catch(e){
		          	that.asyncResultError(callback, "request error: " + e.message, e);
		          }
	        }
	    }
	};
	var ASYNC_RES = function(status, statusDescription, result)
	{
		this.status = status;
		this.statusDescription = statusDescription;
		this.result = result;
	};
	ASYNC_RES.prototype = {
		status: 0,
		statusDescription: null,
		result: null,
		get OK(){
			return this.status === p2ptranslate.c.CONTANSTS.ASYNC_RES_OK;
		}
	};
}());