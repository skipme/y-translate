
(function(){
	var CONST = window.clone(window.CONST);
	var divId = 'ytranslate02';
	var divCId = '#' + divId;
	var $divCId = null;
	var USER_WAIT = 700;
	//var rootDiv = undefined;

	var mode = {disabled: false, off: false, isShow: true, isSelection: false, isUserWait: false, isTranslating: false, timeShowed: Date(), sentence: '', translated: '', Loader: false, textSelected: false};
	var preferences = {mouseTrigger: true};
	var urls = {ajax_loader: ''};
	var context = {originalShowed: '',mx: 0,my: 0, cx: 0,cy: 0, timerUserWait: 0, lastKD: Date(), element: undefined, dWidth: 0, dHeight: 0, waitServerAnswerTimer: 0, timerCursorLeavedW: 0};
	var BodyObserver;

	var $id = function(id, element)
	{
		if(!element)
			element = document;
		return element.getElementById(id);
	}
	var $class = function(classname, element){
		if(!element)
			element = document;
		var list = element.getElementsByClassName(classname);
		return list;
	}
	var $tag = function(tagName){return document.getElementsByTagName(tagName);}
	var $create = function(tagName, idName, classes, styles, text)
	{
		var element = document.createElement(tagName);
		
		if(idName)
			element.id = idName;

		for(var ks in styles)
		{
			element.style.setProperty(ks, styles[ks]);
		}
		if(classes)
			element.classList.add.apply(element.classList, classes);

		if(text)
		{
			var newContent = document.createTextNode(text); 
	  		element.appendChild(newContent);
	  	}

  		return element;
	}
	var $iterate = function(array, foo)
	// HTMLCollection.prototype['forEach'] = function(foo)
	{
		// var array = this;
		for (var i = 0; i < array.length; i++) {
			foo(array[i]);
		};
	}


	// ~~~ Reducing onmousemove event cost
	var mouseMoveLimiter = null;
	var transferObject = 
	{
		originalEvent: {rangeParent: null, rangeOffset: null, target: null}, 
		pageX: null, pageY: null, 
		clientX: null, clientX: null
	};

	function mouseMoveAvangard(e){
		// if(mode.isShow)
		if(context.timerUserWait || mode.isShow)
		{	
			mouseMoved(e, 0);
		}else{

			transferObject.rangeParent = e.rangeParent;
			transferObject.rangeOffset = e.rangeOffset;
			transferObject.target = e.target;

			transferObject.pageX = e.pageX;
			transferObject.pageY = e.pageY;
			transferObject.clientX = e.clientX;
			transferObject.clientY = e.clientY;
			mouseMoveLimiter.criticalOneArg(transferObject);
		}
	}
	// - ~~~

	// - exchange :
		// self.port.on("Prefs", function(_prefs){
		dispatch(CONST.ACTION_F_Prefs, function(_prefs){
			preferences = _prefs;
			USER_WAIT = _prefs.baloonLagMs;
		});
		// self.port.on("Urls", function(_urls){
		dispatch(CONST.ACTION_F_Urls, function(_urls){
			urls=_urls;
		});
		// self.port.on("showTranslated", function(original, forTranslate, trans, also1, also2, lSrc, lDst){
		dispatch(CONST.ACTION_F_showTranslated, function(original, forTranslate, trans, also1, also2, lSrc, lDst){	
			translated(original, forTranslate, trans, also1, also2, lSrc, lDst);
		});
		// self.port.on("disable", function(){
		dispatch(CONST.ACTION_F_disable, function(){
			if(mode.disabled || mode.off)
				return;
			unBoundEvents();
			// $(divCId).remove();
			$id(divId).remove();
			// destroy mouseMoveLimiter
			mouseMoveLimiter.stop();
			mouseMoveLimiter = null;
			mode.off = true;
		});
		// self.port.on("enable", function(){
		dispatch(CONST.ACTION_F_enable, function(){
			if(mode.disabled)
				return;
			prepareAll();// can set mode.disabled as true
			mode.off = mode.disabled;
		});

	// - reflect page lng:
		//self.port.emit('page_lng', $('html').attr('lang'));

		var htmln = $tag('html');
		if(htmln.length > 0)
			emit(CONST.ACTION_B_page_lng, htmln[0].getAttribute('lang'));
	// - logic :
	function translated(originalSentence, sentence, result, also1, also2, lSrc, lDst)
	{
		clearTimeout(context.waitServerAnswerTimer);

		mode.isTranslating = false;
		showLoader(false);
		showWithAll(originalSentence, sentence, result, also1, also2, lSrc, lDst);
	}
	function translate(sentence)
	{
		if(mode.isTranslating)
			return;
		showLoader(true);
		emit(CONST.ACTION_B_scoped, sentence);
		mode.isTranslating = true;
		context.waitServerAnswerTimer = setTimeout(function(){
			mode.isTranslating = false;
			showLoader(false);
			showWithAll(sentence, sentence, "error: request timed out");
		}, 10000);// wait 10sec for translation
	}
	function setClipboard(text)
	{
		emit(CONST.ACTION_B_setClipboard, text);
	}

	function requestTranslate(sentence, lag)
	{
		if(mode.isTranslating)return;
		hideBox();
		 setUserWait(function(){ translate(sentence); }, lag);
		//translate(sentence);
	}
	function requestTranslateImmidietly(sentence)
	{
		if(mode.isTranslating)return;
		hideBox();
		translate(sentence);
	}
	function setUserWait(foo, lag)
	{
		clearUserWait();
		context.timerUserWait = setTimeout(function() {context.timerUserWait = 0; foo.call();}, USER_WAIT - (lag > USER_WAIT ? USER_WAIT : lag));
	}
	function clearUserWait()
	{
		if(context.timerUserWait > 0)
		{
			clearTimeout(context.timerUserWait);
			context.timerUserWait = 0;
		}
	}
	function dispatched(evt)
	{

	}
	function prefMouseDispatch(evt)
	{
		return preferences.translateEvtType === 'h';
	}
	// - element :
	function checkCreateElement()
	{
		if ($id(divId) === null) 
		{
			var msgd = $create("div", divId, null, {position: "absolute", 
			"z-index": 99999, border: 'solid 1px #000000', 
			"background-color": "#FFFFFF", margin: 0, 
			padding: "4px",
			//"font-family": 'helvetica,arial,sans-serif', 
			"font-family": 'sans-serif',
			"font-style": "normal",
			"font-size": "11.5pt", "line-height": "1.538em", color: "#223355",
			"text-align":'left', "border-radius": "4px", 
			//"min-width": "80px", "max-width": "400px"
			"top": "0px","left": "0px",
			"width": "auto",
			opacity: 0,
			"-moz-transition": "opacity 0.2s ease-out"
			});
			//
			msgd.appendChild($create("img", 'y-t-loader', null, {display:'none'}));
			msgd.appendChild($create("a", null, ['y-t-dtext', 'originalbrace'], {color:"#223355", "font-style": "normal", "font-size": "inherit", "text-decoration":'none', "border":"medium none"}, '['));
			msgd.appendChild($create("a", 'y-t-original', ['y-t-dtext'], {color:"#223355", "font-style": "normal", "font-size": "inherit", "text-decoration":'none', "border":"medium none"}));
			msgd.appendChild($create("a", null, ['y-t-dtext', 'originalbrace'], {color:"#223355", "font-style": "normal", "font-size": "inherit", "text-decoration":'none', "border":"medium none"}, '] - '));
			msgd.appendChild($create("a", 'y-t-translated', ['y-t-dtext'], {"font-weight": "bold", color:"#223355", "font-style": "normal", "font-size": "inherit", "text-decoration":'none', "border":"medium none"}));
			msgd.appendChild($create("span", 'y-t-also1', ['y-t-dtext'], {color:"#76797C", display : 'none', "font-style": "italic", "font-size": "10.5pt", "text-decoration":'none', "border":"medium none"}));
			msgd.appendChild($create("span", 'y-t-also2', ['y-t-dtext'], {color:"#76797C", display : 'none', "font-style": "italic", "font-size": "10.5pt", "text-decoration":'none', "border":"medium none"}));
			document.body.appendChild(msgd);

			mode.isShow = true;
			}

			$divCId = $id(divId);

			hideBox();
	}
	function showLoader(onOff)
	{
		if(onOff){
			$id('y-t-loader').setAttribute('src', urls.ajax_loader);
			$id('y-t-loader').style.removeProperty('display');
			$iterate($class('y-t-dtext', $divCId), function(e){e.style.setProperty("display", "none");});
			$divCId.style.setProperty("top", (context.my)+"px");
			$divCId.style.setProperty("left", (context.mx)+"px");
			$divCId.style.setProperty("visibility", "visible");
			if(!mode.isShow)
				showBox();
		}else{
			$id('y-t-loader').style.setProperty('display', "none");
			$iterate($class('y-t-dtext', $divCId), function(e){e.style.removeProperty("display");});
		}
		mode.Loader = onOff;
	}
	function showBox()
	{
		setupView(context.my, context.mx).style.setProperty("visibility", "visible");
		$divCId.style.setProperty("opacity", 1);

		mode.isShow = true;
	}
	function hideBox()
	{
		if(!mode.isShow)
			return;

		$divCId.style.setProperty("visibility", "hidden");
		$divCId.style.setProperty("opacity", 0);

		mode.isSelection = false;
		mode.isShow = false;
	}
	function setOriginalWord(text)
	{
		$id('y-t-original').textContent = text;
	}
	function showWithAll(originalText, textTranslated, translateResult, also1, also2, lSrc, lDst)
	{
		mode.sentence = originalText;
		mode.translated = translateResult;

		if(mode.isSelection)
		{
			$id('y-t-original').style.setProperty("display", "none");
			$iterate($class('originalbrace', $divCId), function(e){e.style.setProperty("display", "none")});
		}
		else
		{
			$iterate($class('originalbrace', $divCId), function(e){e.style.removeProperty("display")});
			$id('y-t-original').style.removeProperty("display");
			$id('y-t-original').textContent = textTranslated;
		}
		
		$id('y-t-translated').textContent = translateResult + (lSrc?(" ("+lSrc):"") + (lDst ? ( (lSrc ? "" : " (???")+"->"+lDst+")" ) : "");

		if(typeof also1 !== 'undefined' && also1 !== null)
		{
			$id('y-t-also1').textContent = also1;
			$id('y-t-also1').style.setProperty("display", "block");
		}else{
			$id('y-t-also1').style.setProperty("display", "none");
		}

		if(typeof also2 !== 'undefined' && also2 !== null)
		{
			$id('y-t-also2').textContent = also2;
			$id('y-t-also2').style.setProperty("display", "block");
		}else{
			$id('y-t-also2').style.setProperty("display", "none");
		}

		$divCId.style.setProperty("top", "0px");
		$divCId.style.setProperty("left", "0px");
		context.dWidth = $divCId.getClientRects()[0].width;
		context.dHeight = $divCId.getClientRects()[0].height;

		showBox();
	}
	function showWithOriginalWord(text)
	{
		setOriginalWord(text);
		showBox();
	}
	function MouseLeavedWindow(e)
	{
		e = e ? e : window.event;
	    var from = e.relatedTarget || e.toElement;
	    if (!from || from.nodeName == "HTML") {
	        // the cursor has left the building
	        //console.log("cursor leave window");
	        if(context.timerCursorLeavedW || !mode.isShow)
	        	return;
	        context.timerCursorLeavedW = setTimeout(
	        	function(){
	        		context.timerCursorLeavedW = 0;
	        		hideBox();
	        	}, 2500);
	    }
	}
	function boundEvents()
	{
		document.addEventListener("mousemove", mouseMoveAvangard);
		document.addEventListener("mouseout", MouseLeavedWindow);
		document.addEventListener("mouseup", selectedText);

		document.body.addEventListener("keyup", selectedText);
		document.body.addEventListener("keydown", keyDown);

		BodyObserver = new MutationObserver(nodeRemoved);
		BodyObserver.observe(document.body, {
		  	attributes: false, 
		  	childList: true, 
		  	characterData: false 
		   })
	}
	function nodeRemoved(events)
	{
		for (var i = 0; i < events.length; i++) {
			var mut = events[i];
			for (var j = 0; j < mut.removedNodes.length; j++) {
				var remn = mut.removedNodes[j];
				if(remn.id === "ytranslate02")
					checkCreateElement();
			};
			
		};
		
	}
	function unBoundEvents()
	{
		document.removeEventListener("mousemove", mouseMoveAvangard);
		document.removeEventListener("mouseout", MouseLeavedWindow);
		document.removeEventListener("mouseup", selectedText);

		document.body.removeEventListener("keyup", selectedText);
		document.body.removeEventListener("keydown", keyDown);

		BodyObserver.disconnect();
	}
	function keyDown(e) 
	{
		var kd = new Date();
		if((kd - context.lastKD < 500 ) && !e.shiftKey && !e.altKey && !e.ctrlKey
			// || e.which === 16
			)
			return;
		else context.lastKD = kd;

		var key = e.ctrlKey ? "ctrl":(e.shiftKey ? "shift":(e.altKey ? "alt":""));
      	var kc = String.fromCharCode(e.keyCode).toLowerCase();
      	kc = ((e.keyCode>18) ? (key.length===0 ? kc :(key+"+"+ kc )):key);

		if(mode.isShow 
			//&& e.which === 67 
			&& preferences.cpyClipboardEvtKeybrd === 'ckey'
			&& preferences.cpyClipboardKey === kc
			)// copy to clipboard
		{
			e.preventDefault();
			setClipboard(mode.translated);
			// TODO: show some animation
			return false;
		}

		if(preferences.translateEvtType === 'h')
			return;


		var okKey = false;
		// if((preferences.translateEvtKeybrd == 0 && e.ctrlKey) || (preferences.translateEvtKeybrd == 1 && e.shiftKey && e.which == 90)
		// 	|| (preferences.translateEvtKeybrd == 2 && e.shiftKey && e.which == 84))
		
		if(kc === preferences.translateEvtKeybrd)
			okKey = true;
		
		if(okKey)
		{
			clearUserWait();
			var textSelected = getSelectionText();
			if(typeof textSelected !== 'undefined' && textSelected.length < 255)
			{
				 var sel = window.getSelection();
	        	 var rect = sel.getRangeAt(0).getBoundingClientRect();
	        	 if(hittestrect(rect.left, rect.top, rect.width, rect.height, context.cx, context.cy))
	        	 {
	        	 	if(mode.isShow && mode.isSelection)
	        	 	{
	        	 		return;
	        	 	}
	        	 	
	    	 		requestTranslateImmidietly(textSelected);
	    	 		mode.isSelection = true;
	        	 	
	        	 	return;
	        	 }
			}
			// kick limiter
			mouseMoveLimiter.kick();
			var elem = context.element;
			if(typeof elem === 'undefined')
			{
				hideBox();
				return;
			}
			if(!mode.isShow || (mode.isShow && mode.sentence != elem.text))
			{
				requestTranslateImmidietly(elem.text);
				mode.isSelection = false;
			}
		}
	}
	
	function selectedText(e) 
	{
		var textSelected = getSelectionText();
		if(typeof textSelected !== 'undefined' && textSelected.length < 255)
		{
			 mode.textSelected = true;
			 mode.textSelectedText = textSelected;
			 var sel = window.getSelection();
        	 mode.srect = sel.getRangeAt(0).getBoundingClientRect();
        	 // 
        	 if(e !== 'deferred')// selected text cleared after mouse up
        	 	setTimeout(function(){selectedText('deferred');}, 1100);
		}else{
			mode.textSelected = false;
		}
	}
	function mouseMoved(e, _elapsed) 
	{
		clearUserWait();

		var x = e.pageX;
		var y = e.pageY;

		moveToPosition(x+15, y+15);

		context.cx = e.clientX;
		context.cy = e.clientY;

		// if(!prefMouseDispatch(e))
		// {
		// 	return;
		// }
		if(mode.textSelected)
		{
			var rect = mode.srect;
			 if(hittestrect(rect.left, rect.top, rect.width, rect.height, e.clientX, e.clientY))
        	 {
        	 	if(mode.isShow && mode.isSelection)
        	 	{
        	 		return;
        	 	}
        	 	if(prefMouseDispatch(e))
	    	 	{	
	    	 		requestTranslate(mode.textSelectedText, _elapsed);
	    	 		mode.isSelection = true;
        	 	}
        	 	return;
        	 }
		}

		var elem = elementUnderCursor(e);
		context.element = elem;
		if(typeof elem === 'undefined')
		{
			hideBox();
			return;
		}
		if((!mode.isShow || (mode.isShow && mode.sentence != elem.text)) && !mode.Loader)
		{
			if(prefMouseDispatch(e))
			{
				requestTranslate(elem.text, _elapsed);
				mode.isSelection = false;
			}else
			{
				hideBox();
			}
		}
	}

	function moveToPosition(x,y)
	{
		if(mode.Loader)
		{
			//$divCId.offset({ top: y, left: x});
			$divCId.style.setProperty("top", y+"px");
			$divCId.style.setProperty("left", x+"px");
		}else
		if(mode.isShow /*&& $(divCId).css("display") !== "none"*/)
		{
			//$(divCId).offset({ top: y, left: x});
			setupView(y, x);
		}
		context.mx=x;
		context.my=y;
	}
	function setupView(top, left)
    {
    	// console.log(context.dWidth)
    	var width = context.dWidth +10;//$(divCId).width();
    	var height = context.dHeight +10;

    	// document.documentElement.clientHeight working not well for some pages...
    	var w = window.innerWidth + window.pageXOffset;
    	var h = window.innerHeight - 20 + window.pageYOffset;
    	// if(width > window.innerWidth-60)
    	// {
    	// 	width = window.innerWidth - 60;
    	// 	$divCId.css("width", width);
    	// 	width += 20;
    	// }
    	var modTop = 0, modLeft = 0;

    	if(top + height > h)
    	{
    		modTop = (top + height) - h;
    	}
    	if(left + width > w)
    	{
    		modLeft = (left + width) - w;
    	}
    	modLeft += document.body.getClientRects()[0].left;
    	//return $divCId.offset({ top: top - modTop, left: left - modLeft});
    	$divCId.style.setProperty("top", (top - modTop)+"px");
    	$divCId.style.setProperty("left", (left - modLeft)+"px");

    	return $divCId;
    }
	function elementUnderCursor(mouseEvent)
	{
		// var evt = mouseEvent.originalEvent;
		var evt = mouseEvent;
		var startContainer = evt.rangeParent;
		if(startContainer === null || startContainer.nodeType !== 3)
		{
			return undefined;
		}
		if(!(startContainer.parentNode === evt.target || startContainer === evt.target))
		{
			return undefined;
		}
		// hit test
		var elp = startContainer.parentNode;
		var stl = getComputedStyle(startContainer.parentNode);
		var pl = parseInt(stl.paddingLeft, 10),
			pr = parseInt(stl.paddingRight, 10),
			pt = parseInt(stl.paddingTop, 10),
			pb = parseInt(stl.paddingBottom, 10),
			eld = elp.getBoundingClientRect();

		if(!hittestrect(eld.left + pl + window.pageXOffset, eld.top + pt + window.pageYOffset, eld.width - pl - pr, eld.height - pt - pb, 
			mouseEvent.clientX + window.pageXOffset, mouseEvent.clientY + window.pageYOffset))
		{
			return undefined;
		}
		//
		var startOffset = evt.rangeOffset;

		var txt = startContainer.nodeValue;
		var text = scopeTextSpaces(txt, startOffset);
    	if(typeof text === 'undefined')
    	{
    		return undefined;
    	}
		//return {element : $(evt.target), text : text};
		return {element : evt.target, text : text};
	}
	var ignoreCodes = [95,93,125,123,91,160,171,92,8230,187, 8212,8220,8221,8230];
 	function scopeTextSpaces(txt,startOffset)
    {
        var left = 0;
        var right = txt.length - 1;
        
        if(right < startOffset || right < 0)
        	return undefined;

        for (var i = startOffset-1; i >= 0; i--) {
            var chc = txt.charCodeAt(i);
           if(ignoreCodes.indexOf(chc) >= 0 || (chc <=64 && chc >= 0)){left = i+1; break;}
        }
        for (var i = left; i < txt.length; i++) {
            var chc = txt.charCodeAt(i);
            if(ignoreCodes.indexOf(chc) >= 0 || (chc <=64 && chc >= 0)){right = i-1; break;}
        }

        var result = txt.substr(left, right-left+1);
        if(result.length === 0)
        	return undefined;
        return result;
    }

    

    function getSelectionText() 
    {
    	var curSelection = null, st = null;
    	try{
    		curSelection = window.getSelection();
    	} catch(err)
    	{
    		return undefined;
    	}
    	if(curSelection === null)
	    	return undefined;

	    st = curSelection.toString();
	    if(st.length >= 3)// selected text length >= 3
	    	return st;
	    return undefined;
	}
	function hittestrect(x,y,w,h,hitX,hitY) {
    	return(x<hitX&&x+w>=hitX&&y<hitY&&y+h>=hitY);
	}

	function prepareAll()
	{
		function tintIn(text,lf,lt,ticket)
		{
			emit(CONST.ACTION_B_translate, text, lf, lt, ticket);
		}
		function cfgGet()
		{
			return JSON.stringify(preferences);
		}
		function cfgSet(objPrefs)
		{
			emit(CONST.ACTION_B_cfgSet, JSON.parse(objPrefs));
		}
		function integrateCfg(to)
		{
			// exportFunction(cfgGet, to, {defineAs: "cfgGet"});
			// exportFunction(cfgSet, to, {defineAs: "cfgSet"});
			to.cfgGet = cfgGet;
			to.cfgSet = cfgSet;

			to.connect(to.cfgGet, to.cfgSet);
		}
		function integrate(to)
		{
			exportFunction(tintIn, to, {defineAs: "iTranslate"});
			to.connect(to.iTranslate);
			self.port.on('translatec', function(result, ticket){
				to.ticketCallback(result, ticket);
			});
		}
		if(document.body === null || document.body === undefined)
		{	
			mode.disabled = true;
			return;
		}
		if(document.body.hasAttribute('contenteditable') || document.body.classList.contains('wysiwyg'))
		{
			mode.disabled = true;
			return;// most of editors & ckeditor & vbulletin editor
		}
		if(document.body.classList.contains('editable') || document.body.hasAttribute('g_editable'))
		{
			mode.disabled = true;
			return;// gmail editable area
		}
		var htmln = $tag('html');
		if(htmln.length > 0 && htmln[0].getAttribute('lang') === 'ipb')
		{
			mode.disabled = true;
			return;// ipboard forum editable area
		}

		// y-translate app
		if(document.location.origin === "resource://y-translate" && wrappedJSObject["p2ptranslate"] !== undefined)
		{
			
			if(wrappedJSObject.p2ptranslate.imachine !== undefined)
			{
				integrate(wrappedJSObject.p2ptranslate.imachine);	
			}else{
				exportFunction(integrate, wrappedJSObject.p2ptranslate, {defineAs: "imachine"});
			}
			// return;
		}
		// y-translate cfg

		if(document.location.href === browser.runtime.getURL("configure.html") && window["p2ptranslate"] !== undefined)
		{
			
			if(window.p2ptranslate.connect !== undefined)
			{
				integrateCfg(window.p2ptranslate);	

			}else{
				exportFunction(integrateCfg, window.p2ptranslate, {defineAs: "cfgGet"});
			}
			// return;
		}
		checkCreateElement();
		boundEvents();
		
		// mouseMoveLimiter initialiser (700 is minimal lag - choose that, reinitialisation due preferences changes may be costly)
		if(mouseMoveLimiter === null)
			mouseMoveLimiter = invokeLimiter.create(700, mouseMoved, this);
		else console.warn("mouseMoveLimiter initialised already...");
	}
	connected();
}());
