
// var google = require("./gTranslate");
// var yandex = require("./yaTranslate");

// var similar = require("./similar");


var translator = {};
(function(){

	var CONST = {
		PS_DETECT_TRANSLATE: 1, PS_TRANSLATE: 2, PS_ERROR: 3, PS_OK: 4,
		PS_DETECT_TRANSLATE_REV: 5, //reducing requests
		PS_G_CAPTCHA: -69
	};

	function translationObj(text, distLang, altLang, defaultProvider, doNotPrepare)
	{
		this.textNotPrepared = text;
		this.text = doNotPrepare? text : this.prepareSentence(text);
		this.useDistLang = this.distLang = distLang;
		this.altLang = altLang;

		this.setProvider(new google.Provider());// TODO
		 // this.setProvider(new yandex.Provider());
	}

	translationObj.prototype = {
		srcLang: "auto",

		srcDetected: "unknown",

		useSrcLang: "auto",
		useDistLang: null,

		distLang: null,
		altLang: null,

		textNotPrepared: null,
		text: null,
		translated: null,

		// temporary specific
		also1: null,
		also2: null,

		currentProvider: null,
		providerStep: null,

		OK: true,
		error: null,
		errorMessage: null,

		redirectURL: null,

		setProvider: function(provider)
		{
			this.currentProvider = provider;
			this.providerStep = CONST.PS_DETECT_TRANSLATE;
		},
		prepareSentence: function(sentence){
	      var charStartL1 = sentence.charAt(0).toLowerCase();
	      var charStartL2 = sentence.charAt(1).toLowerCase();
	      var ToTranslation = sentence;
	      if(charStartL1 !== sentence.charAt(0) 
	        && charStartL2 === sentence.charAt(1))
	        // TODO: if we have sentence here, like 'Adam West'
	      {    
	        ToTranslation = charStartL1 + sentence.substr(1, sentence.length -1);
	      }
	      ToTranslation = ToTranslation.replace('\r','').replace('\n',' ');
	      return ToTranslation;
		},
		translate: function(srcMost, callback)
		{
			if(this.providerStep === CONST.PS_DETECT_TRANSLATE || this.providerStep === CONST.PS_TRANSLATE)
			{
				var that = this;
				//if(srcMost)
				//	that.useSrcLang = srcMost;
				if(this.providerStep === CONST.PS_DETECT_TRANSLATE && srcMost === this.useDistLang)
				{
					console.log("TR REV AS", srcMost)
					that.useDistLang = that.altLang;
					// that.useSrcLang = srcMost;
					//that.useSrcLang = "auto";
					this.providerStep = CONST.PS_DETECT_TRANSLATE_REV;
				}
				this.currentProvider.translate(this.useSrcLang, this.useDistLang, this.text, function(result){
					if(result.OK)
					{
						
						that.srcDetected = result.src;

						console.log("TR OK", that.providerStep, that.useSrcLang, that.srcDetected, that.useDistLang);

						if(that.providerStep === CONST.PS_DETECT_TRANSLATE && 
							that.useDistLang === that.srcDetected &&
							that.srcDetected !== that.altLang)
						{
							that.providerStep = CONST.PS_TRANSLATE;

							that.useSrcLang = that.srcDetected;
							that.useDistLang = that.altLang;
							console.log("TR ALT", that.providerStep, that.useSrcLang, that.useDistLang);

							that.translate(null, callback);
						}else if (that.providerStep === CONST.PS_DETECT_TRANSLATE && 
							result.trans.toUpperCase() === result.source.toUpperCase()
							// && (that.srcDetected !== srcMost || that.srcDetected !== )
							)
						{
							// ................................
							that.providerStep = CONST.PS_TRANSLATE;
							that.useSrcLang = srcMost;
							that.useDistLang = that.distLang;
							console.log("TR DETECT_OVER", that.providerStep, that.useSrcLang, that.useDistLang);

							that.translate(null, callback);
						}
						else if(that.providerStep === CONST.PS_DETECT_TRANSLATE_REV &&
							that.useDistLang !== that.srcDetected &&
							that.srcDetected !== srcMost)
						{
							that.providerStep = CONST.PS_TRANSLATE;
							if(similar.isSimilar(that.srcDetected, that.distLang))
							{
								that.useSrcLang = that.distLang;
								that.useDistLang = that.altLang;
							}else if(similar.isSimilar(that.srcDetected, that.altLang)){
								that.useSrcLang = that.altLang;
								that.useDistLang = that.distLang;
							}else if(that.useDistLang !== that.distLang)
							{
								that.useSrcLang = that.srcDetected;
								that.useDistLang = that.distLang;
							}else
							{
								that.providerStep = CONST.PS_OK;
								that.translated = result.trans;
								that.source = result.source;
								// temp
								that.also1 = that.prepareAlsoString(result, 0);
								that.also2 = that.prepareAlsoString(result, 1);

								callback.call(that);
								console.log("TR ALTREV RET");
								return;
							}
							
							console.log("TR ALTREV", that.providerStep, that.useSrcLang, that.srcDetected, that.useDistLang);

							that.translate(null, callback);
						}else if(that.providerStep === CONST.PS_DETECT_TRANSLATE_REV &&
							that.useDistLang === that.srcDetected &&
							that.srcDetected !== that.distLang)
						{
							that.providerStep = CONST.PS_TRANSLATE;
							that.useSrcLang = that.srcDetected;
							that.useDistLang = that.distLang;
							console.log("TR ALTREV X", that.providerStep, that.useSrcLang, that.srcLang, that.useDistLang);

							that.translate(null, callback);
						}else{
							that.providerStep = CONST.PS_OK;

							that.translated = result.trans;
							that.source = result.source;
							// temp
							that.also1 = that.prepareAlsoString(result, 0);
							that.also2 = that.prepareAlsoString(result, 1);

							callback.call(that);
						}
					}else{
						if(result.error === "gCaptcha")
						{
							that.OK = false;
							that.providerStep = CONST.PS_G_CAPTCHA;
							that.redirectURL = result.redirectURL;
							that.errorMessage = "Please enter captcha";
							callback.call(that);
						}else{
							that.OK = false;
							that.providerStep = CONST.PS_ERROR;
							that.error = result.error;
							that.errorMessage = result.errorMessage;
							callback.call(that);
						}
					}
				});
			}
			else{
				if(this.providerStep === CONST.PS_G_CAPTCHA)
					return;
				//throw new Error("Not implemented multiple providers or ");
				this.OK = false;
				this.error = new Error("Not implemented multiple providers or ");
				this.errorMessage = this.error.message
				callback.call(this);
			}

		},
		prepareAlsoString: function(response, index)
	    {
	      if(response.pos.length === 0 || response.pos.length <= index)
	        return undefined;

	      var result = '';//'('+response.pos[index]+') [';
	      for (var i = 0; i < response.entrys[index].length && i < 3; i++) {
	          var entry = response.entrys[index][i];
	          result += (i>0?'; [':'[')+entry.word+'] ';
	          if(typeof entry.reversed !== 'undefined')
	          {
	            for (var j = 0; j < entry.reversed.length && j < 3; j++) {
	              result += (j>0?', ':'')+entry.reversed[j];
	            }
	          }
	      };
	      return result;
	    }
	};
	// exports.translator = translationObj;

	translator.translator = translationObj;
}());


