
// (function(){

	// TODO: http option in settings instead https
	var request_url = 'https://translate.google.com/translate_a/single';

	function gt_request_word(word, languageFrom, languageTo){
		var http_cont = {
			client: "gtx",
			//client: "dict-chrome-ex",
			//client: "y-translate",
			text : word,
			hl : browser.i18n.getUILanguage(), // "en"
			sl : languageFrom,
			tl : languageTo,
			ie : 'UTF-8',
			oe : 'UTF-8',
			multires : 1,
			otf : 2,
			trs : 1,
			ssel : 0,
			tsel : 0,
			sc : 1,
			dj : 1,
			dt : ["t", "bd"]
		};

		return {url:request_url, content:http_cont};
	}

	function gt_get_data(response)
	{
		//{source:'',trans:'',pos:'',terms:[''],entrys:[{word:'',reversed:[''],score}]}
		var populated = {debug:response, source:'', trans:'', pos:[], terms:[], entrys:[], src: response.src};

		if(response.results && !response.sentences)
		{
			response = response.results[0];
		}

		//return populated;
		for (var i = 0; i < response.sentences.length; i++) 
		{
			if(response.sentences[i].translit !== undefined ||
				response.sentences[i].src_translit !== undefined)
				continue;
			populated.source += response.sentences[i].orig;
			populated.trans += response.sentences[i].trans;
		};
		if(typeof response.dict !== 'undefined'){
			for (var i = 0; i < response.dict.length; i++) {
				var dict = response.dict[i];
				//populated.pos = dict.pos;
				var tms = [];
				var eys = [];
				for (var j = 0; j < dict.entry.length; j++) {
					var gentry = dict.entry[j];
					var entry = {word:gentry.word, reversed:gentry.reverse_translation, score:gentry.score};

					tms.push(entry.word);	
					eys.push(entry);
				};
				populated.pos.push(dict.pos);
				populated.terms.push(tms);	
				populated.entrys.push(eys);
			};
		}
		return populated;
	}

	function google_obj()
	{
		this.setCookies();
	}
	google_obj.prototype = {
		requestObj: null,
		cookies: null,
		rq: null,
		setCookies: function()
		{
		},
		translate: function(src, to, text, callback)
		{
			var that = this;
			that.rq = null;
			that.requestObj = gt_request_word(text, src, to);
			// that.requestObj.headers = {"Cookie": that.cookies};

	        // this.requestObj.onComplete = function(response){
        	function onComplete(response)
        	{
	           var result = null;

	           if(response.status === 503 && response.text.contains('<form action="CaptchaRedirect"'))
	           {
	           	callback({OK: false, error: "gCaptcha", errorMessage: "Captcha requested", redirectURL: response.responseURL});
	           }else{
		           try{
		           	result = gt_get_data(response.json);
		           	result.OK = true;
		           }catch(exc)
		           {
		           	result = {};
		           	result.OK = false;
		           	result.error = exc;
		           	result.errorMessage = exc.message;
		           }
		           callback(result);
		       }
	        };
	        
	        // that.rq = Request(this.requestObj);
	        // that.rq.get();
	        request(onComplete, 
	        	function(){console.log("error request")},
	        	that.requestObj.content,
	        	that.requestObj.url
	        	);
		}
	};
	// exports.Request = gt_request_word;
	// exports.Parse = gt_get_data;
	// exports.Provider = google;
	
	var google = {};
	google.Provider = google_obj;
	google.Parse = gt_get_data;
	google.Request = gt_request_word;
// }());