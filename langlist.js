(function(){
	"use strict";
	p2ptranslate.langs = {
		list: [//"en","ru","auto",
		"af","sq","ar","hy","az","eu","be","bn","bs","bg","ca","ceb","ny","zh-CN","hr","cs","da","nl","en","eo","et","tl","fi","fr","gl","ka","de","el","gu","ht","ha","iw","hi","hmn","hu","is","ig","id","ga","it","ja","jw","kn","kk","km","ko","lo","la","lv","lt","mk","mg","ms","ml","mt","mi","mr","mn","my","ne","no","fa","pl","pt","pa","ro","ru","sr","st","si","sk","sl","so","es","su","sw","sv","tg","ta","te","th","tr",
		// "uk",
		"ur","uz","vi","cy","yi","yo","zu"],
		en: [{
		    "id": "af",
		    "name": "Afrikaans"
		}, {
		    "id": "sq",
		    "name": "Albanian"
		}, {
		    "id": "ar",
		    "name": "Arabic"
		}, {
		    "id": "hy",
		    "name": "Armenian"
		}, {
		    "id": "az",
		    "name": "Azerbaijani"
		}, {
		    "id": "eu",
		    "name": "Basque"
		}, {
		    "id": "be",
		    "name": "Belarusian"
		}, {
		    "id": "bn",
		    "name": "Bengali"
		}, {
		    "id": "bs",
		    "name": "Bosnian"
		}, {
		    "id": "bg",
		    "name": "Bulgarian"
		}, {
		    "id": "ca",
		    "name": "Catalan"
		}, {
		    "id": "ceb",
		    "name": "Cebuano"
		}, {
		    "id": "ny",
		    "name": "Chichewa"
		}, {
		    "id": "zh-CN",
		    "name": "Chinese"
		}, {
		    "id": "hr",
		    "name": "Croatian"
		}, {
		    "id": "cs",
		    "name": "Czech"
		}, {
		    "id": "da",
		    "name": "Danish"
		}, {
		    "id": "nl",
		    "name": "Dutch"
		}, {
		    "id": "en",
		    "name": "English"
		}, {
		    "id": "eo",
		    "name": "Esperanto"
		}, {
		    "id": "et",
		    "name": "Estonian"
		}, {
		    "id": "tl",
		    "name": "Filipino"
		}, {
		    "id": "fi",
		    "name": "Finnish"
		}, {
		    "id": "fr",
		    "name": "French"
		}, {
		    "id": "gl",
		    "name": "Galician"
		}, {
		    "id": "ka",
		    "name": "Georgian"
		}, {
		    "id": "de",
		    "name": "German"
		}, {
		    "id": "el",
		    "name": "Greek"
		}, {
		    "id": "gu",
		    "name": "Gujarati"
		}, {
		    "id": "ht",
		    "name": "Haitian Creole"
		}, {
		    "id": "ha",
		    "name": "Hausa"
		}, {
		    "id": "iw",
		    "name": "Hebrew"
		}, {
		    "id": "hi",
		    "name": "Hindi"
		}, {
		    "id": "hmn",
		    "name": "Hmong"
		}, {
		    "id": "hu",
		    "name": "Hungarian"
		}, {
		    "id": "is",
		    "name": "Icelandic"
		}, {
		    "id": "ig",
		    "name": "Igbo"
		}, {
		    "id": "id",
		    "name": "Indonesian"
		}, {
		    "id": "ga",
		    "name": "Irish"
		}, {
		    "id": "it",
		    "name": "Italian"
		}, {
		    "id": "ja",
		    "name": "Japanese"
		}, {
		    "id": "jw",
		    "name": "Javanese"
		}, {
		    "id": "kn",
		    "name": "Kannada"
		}, {
		    "id": "kk",
		    "name": "Kazakh"
		}, {
		    "id": "km",
		    "name": "Khmer"
		}, {
		    "id": "ko",
		    "name": "Korean"
		}, {
		    "id": "lo",
		    "name": "Lao"
		}, {
		    "id": "la",
		    "name": "Latin"
		}, {
		    "id": "lv",
		    "name": "Latvian"
		}, {
		    "id": "lt",
		    "name": "Lithuanian"
		}, {
		    "id": "mk",
		    "name": "Macedonian"
		}, {
		    "id": "mg",
		    "name": "Malagasy"
		}, {
		    "id": "ms",
		    "name": "Malay"
		}, {
		    "id": "ml",
		    "name": "Malayalam"
		}, {
		    "id": "mt",
		    "name": "Maltese"
		}, {
		    "id": "mi",
		    "name": "Maori"
		}, {
		    "id": "mr",
		    "name": "Marathi"
		}, {
		    "id": "mn",
		    "name": "Mongolian"
		}, {
		    "id": "my",
		    "name": "Myanmar (Burmese)"
		}, {
		    "id": "ne",
		    "name": "Nepali"
		}, {
		    "id": "no",
		    "name": "Norwegian"
		}, {
		    "id": "fa",
		    "name": "Persian"
		}, {
		    "id": "pl",
		    "name": "Polish"
		}, {
		    "id": "pt",
		    "name": "Portuguese"
		}, {
		    "id": "pa",
		    "name": "Punjabi"
		}, {
		    "id": "ro",
		    "name": "Romanian"
		}, {
		    "id": "ru",
		    "name": "Russian"
		}, {
		    "id": "sr",
		    "name": "Serbian"
		}, {
		    "id": "st",
		    "name": "Sesotho"
		}, {
		    "id": "si",
		    "name": "Sinhala"
		}, {
		    "id": "sk",
		    "name": "Slovak"
		}, {
		    "id": "sl",
		    "name": "Slovenian"
		}, {
		    "id": "so",
		    "name": "Somali"
		}, {
		    "id": "es",
		    "name": "Spanish"
		}, {
		    "id": "su",
		    "name": "Sundanese"
		}, {
		    "id": "sw",
		    "name": "Swahili"
		}, {
		    "id": "sv",
		    "name": "Swedish"
		}, {
		    "id": "tg",
		    "name": "Tajik"
		}, {
		    "id": "ta",
		    "name": "Tamil"
		}, {
		    "id": "te",
		    "name": "Telugu"
		}, {
		    "id": "th",
		    "name": "Thai"
		}, {
		    "id": "tr",
		    "name": "Turkish"
		// }, {
		//     "id": "uk",
		//     "name": "Ukrainian"
		}, {
		    "id": "ur",
		    "name": "Urdu"
		}, {
		    "id": "uz",
		    "name": "Uzbek"
		}, {
		    "id": "vi",
		    "name": "Vietnamese"
		}, {
		    "id": "cy",
		    "name": "Welsh"
		}, {
		    "id": "yi",
		    "name": "Yiddish"
		}, {
		    "id": "yo",
		    "name": "Yoruba"
		}, {
		    "id": "zu",
		    "name": "Zulu"
		}],
		getName: function(idDict, idName){
			if(this[idDict] === undefined)
				idDict = "en";
			var dict = this.getDict(idDict);
			var r = dict[idName];
			return r?r:"UNKNOWN";
		},
		getDict: function(idDict)
		{
			if(this[idDict] === undefined)
				idDict = "en";
			if(this[idDict +"$c"] === undefined)
			{
				var dict = {};
				for (var i = 0; i < this[idDict].length; i++) {
					dict[this[idDict][i].id] = this[idDict][i].name;
				};
				this[idDict +"$c"] = dict;
			}
			return this[idDict +"$c"] ;
		}
}
}());