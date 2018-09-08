// (function(){
	// port_connected = true;
	
	function escapeHTML(str) 
	{
		return str.replace(/[&"<>]/g, function (m){ return escapeHTML.replacements[m];});
	}
	escapeHTML.replacements = { "&": "&amp;", '"': "&quot;", "<": "&lt;", ">": "&gt;" };
	
	var locStrings = ["wdg_state", "wdg_remark", "wdg_stateOn", "wdg_stateOff", "wdg_unavailable", "wdg_FROM_LNG"];
	var localisedStrings = null;
	var elemtitlelng = document.getElementById("l-titlelng");
	var elemActionChangeStatus = document.getElementById("p-change");
	var elemRemark = document.getElementById("p-remark");
	var elemUrl = document.getElementById("p-url");
	var elemLNG_FROM = document.getElementById('LNG_FROM');
	var elemOpenApp = document.getElementById('openapp');
	var elemConfigApp = document.getElementById('configure');
	var WState = null;
	var disabled = true;
	var lang_list = null;

	// self.port.on("state", function(_state){
	dispatch(CONST.ACTION_W_state, function(_state){
		if(_state === null || typeof _state === 'undefined')
		{
			disabled = true;
			return;
		}

		if(!_state.isin)
		{
			elemActionChangeStatus.text = localisedStrings["wdg_stateOn"];
			elemActionChangeStatus.parentElement.classList.remove("isoff");
			elemActionChangeStatus.parentElement.classList.add("ison");
		}else{
			elemActionChangeStatus.text = localisedStrings["wdg_stateOff"];
			elemActionChangeStatus.parentElement.classList.remove("ison");
			elemActionChangeStatus.parentElement.classList.add("isoff");
		}
		WState= _state;
		disabled = false;
		populateLangs(lang_list);
		var url = _state.url;
		if(url.indexOf("about:") === 0 || (url.indexOf("resource:") === 0 && url.indexOf("/y-translate")<0))
		{
			url = localisedStrings["wdg_unavailable"];
			elemActionChangeStatus.style.display = "none";
			elemLNG_FROM.setAttribute("disabled", "disabled");
		}else{
			// url = getHostName(url, true);
			elemActionChangeStatus.style.removeProperty("display");
			elemLNG_FROM.removeAttribute("disabled");
		}

		elemUrl.textContent = escapeHTML(url);
	});
    function getHostName(url, hostOnly)// returns [protocol://(hostOnly??)]host
    {
       var arr = url.split("/");
       var result = (hostOnly ? "" : (arr[0] + "//")) + arr[2];
       if(hostOnly && (result.length === 0 || /^\s*$/.test(result)))
       {
       	// file?
       	result = arr[0];
       }
       return result;
    }
	// self.port.on("locStrings", function(_locStrings){
	dispatch(CONST.ACTION_W_locStrings, function(_locStrings){
		localisedStrings = _locStrings;
		elemtitlelng.textContent = localisedStrings["wdg_FROM_LNG"];
	});
	// self.port.on("locLangs", function(list){
	dispatch(CONST.ACTION_W_locLangs, function(list){
		// {val, name}
		lang_list = list;
		populateLangs(list);
	});
	function populateLangs(list){
		elemLNG_FROM.options.length = 0; // clear out existing items

		var use_lngfrom = WState !== null && WState.prefs !== null && WState.prefs.LNG_FROM !== null && typeof WState.prefs.LNG_FROM !== 'undefined';

		for(var i=0; i < list.length; i++) {
		    var d = list[i];
		    var selected = false;

		   if(!disabled){
			    if(use_lngfrom)
			    	selected = WState.prefs.LNG_FROM == d.val;
			    else if(WState.prefs !== null)
			    	selected = WState.prefs.page_lng == d.val;
			}

 			var opt2 = document.createElement("option");
 			opt2.value = d.val;
 			opt2.text = d.name;
 			opt2.selected = selected?"selected":"";
		    elemLNG_FROM.options.add(opt2);
		}
	}
	// ui
	elemActionChangeStatus.addEventListener("click", function(){
		if(disabled)
			return;
		// self.port.emit("disableUrl", {url: WState.url});
		emit(CONST.ACTION_B_disableUrl, {url: WState.url});
	});

	elemLNG_FROM.addEventListener("change", function(){
		if(disabled)
			return;
		// self.port.emit("setLngFrom", {url: WState.url, LNG_FROM: elemLNG_FROM.value});
		emit(CONST.ACTION_B_setLngFrom, {url: WState.url, LNG_FROM: elemLNG_FROM.value});
	});

	//
	async function con_port()
	{
		await connected(CONST.ACTION_B_BEEPW);
		emit(CONST.ACTION_B_locData, locStrings);
	}
	con_port()

	elemOpenApp.addEventListener("click", function(){
		self.port.emit("openApp", {});
	});
	elemConfigApp.addEventListener("click", function(){
		self.port.emit("openConfApp", {});
	});
// }());
