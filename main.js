
// if(typeof browser === "undefined")
// {
// 	window.browser = chrome;
// }

var configPage_tab_id = -1;
var parameters = {LNG_TO: 'ru', LNG_TO_ALT: "en" };
preferences.read_model(function()
{
	let prefs = preferences.getPrefs();
	parameters.LNG_TO = prefs.translateLNG_PREFER_TO;
	parameters.LNG_TO_ALT = prefs.translateLNG_PREFER_TO_ALT;
});

var localisedWidget;
var localisedLangs;

var currentTab;

var book_url_tabId = {};
var book_tabId_url = [];
var list_connected_tabs = [];
function set_url_tabid(string_url, number_tabId)
{
	if(book_tabId_url.indexOf(number_tabId) >= 0 
		&& book_tabId_url[number_tabId] === string_url)
		return;
	
	remove_tabid(number_tabId);

	if(list_connected_tabs.indexOf(number_tabId) < 0)
		list_connected_tabs.push(number_tabId);

	book_tabId_url[number_tabId] = string_url;

	var ref_url_ = book_url_tabId[string_url];
	if(ref_url_ !== undefined)
	{
		ref_url_.tabs.push(number_tabId);
	}
	else
	{
		book_url_tabId[string_url] = {tabs: [number_tabId], prefs: preferences.getHostPrefs(string_url)};
	}
}
function remove_tabid(number_tabId)
{
	var ref_tabid_ = book_tabId_url[number_tabId];
	if(ref_tabid_ !== undefined)
	{
		var prev_url_ = book_tabId_url[number_tabId];
		var remat_ = book_url_tabId[prev_url_].tabs.indexOf(number_tabId);
		book_url_tabId[prev_url_].tabs.splice(remat_, 1);
		if(book_url_tabId[prev_url_].tabs.length === 0)
		{
			delete book_url_tabId[prev_url_];
			delete book_tabId_url[number_tabId];
		}
	}
	if((ref_tabid_ = list_connected_tabs.indexOf(number_tabId)) >= 0)
		list_connected_tabs.splice(ref_tabid_, 1);
}
function get_url_tabIds(string_url)
{
	if(book_url_tabId[string_url])
		return book_url_tabId[string_url].tabs;
	else
		return undefined;
}

function communication_gate(object_message, sender, sendResponse) 
{
	switch(object_message.action)
	{
		case CONST.ACTION_B_BEEP:

			// console.log("action beep from main.js "+sender.tab.id);
			var url___ = getHostName(sender.tab.url, true);
			set_url_tabid(url___, sender.tab.id);

			browser.tabs.sendMessage(sender.tab.id, {action: CONST.ACTION_F_BEEP});

			browser.tabs.sendMessage(sender.tab.id, {action: CONST.ACTION_F_Prefs, args: [preferences.getPrefs()]});
			browser.tabs.sendMessage(sender.tab.id, {action: CONST.ACTION_F_Urls, args: [{
					ajax_loader: browser.runtime.getURL("ajax-loader.gif"),
					clipboard: browser.runtime.getURL("to copy.svg")
				}]});

			var isin = preferences.isHostIn(url___);
			if(!isin)
			{
				browser.tabs.sendMessage(sender.tab.id, {action: CONST.ACTION_F_enable, args: []});
			}
		break;
		case CONST.ACTION_B_page_lng:
			// console.log("action page_lng from main.js "+sender.tab.id);
			var url___ = getHostName(sender.tab.url, true);
			var lng___ = object_message.args[1];
			var props___ = preferences.getHostPrefs(url___);
		    if(props___.page_lng === undefined || props___.page_lng !== lng___)
          	{	
          		props___.page_lng = lng___;
          		preferences.setHostPrefs_temp(url___, props___);
          		book_url_tabId[url___].prefs.page_lng = lng___;
          	}
		break;
		case CONST.ACTION_B_scoped:
			var url___ = getHostName(sender.tab.url, true);
			var prefs__ = book_url_tabId[url___].prefs;
			var lang_from_ = prefs__.LNG_FROM;

			if(lang_from_ === undefined)
				lang_from_ = prefs__.page_lng;

			if(lang_from_ === undefined)
				lang_from_ = "auto";

			translate(sender.tab.id, lang_from_, object_message.args[1]); 
		break;
		// widget dont have fixed port hahdle so we can only answer to it
		case CONST.ACTION_B_BEEPW:
			if(localisedLangs === undefined)
				localisedLangs = getLocalisedLangs();
			sendResponse({action: CONST.ACTION_W_locLangs, args: [localisedLangs]});
		break;
		case CONST.ACTION_B_locData:
				var	url___ = getHostName(currentTab.url, true);
				if(localisedWidget === undefined)
					localisedWidget = localiseArray(object_message.args[1]);
				sendResponse([
				//{action: CONST.ACTION_W_locStrings, args: [localiseArray(object_message.args[1])]},
				{action: CONST.ACTION_W_locStrings, args: [localisedWidget]},
				{action: CONST.ACTION_W_state, args: [{isin: preferences.isHostIn(url___), url: url___, prefs: preferences.getHostPrefs(url___)}]}
				]);
		break;
		case CONST.ACTION_B_disableUrl:
			var url___ = object_message.args[1].url;
			var isin = preferences.isHostIn(url___);
			var tabs_event_ = -1;
			if(isin)
			{
				preferences.dropHostUrl(url___);
				tabs_event_ = CONST.ACTION_F_enable;
			}
			else
			{
				preferences.pushHostUrl(url___);
				tabs_event_ = CONST.ACTION_F_disable;
			}
			var tabs_ = get_url_tabIds(url___);
			if(tabs_)
			{
				for (var i = 0; i < tabs_.length; i++) 
				{
					var sent = browser.tabs.sendMessage(tabs_[i], {action: tabs_event_, args: []});
					let tabid = tabs_[i];
					sent.catch(function(err){
						remove_tabid(tabid);
					});
				}
			}
			sendResponse([
				{action: CONST.ACTION_W_state, args: [{isin: !isin, url: url___, prefs: preferences.getHostPrefs(url___)}]}
				]);
		break;
		case CONST.ACTION_B_setLngFrom:
			var url___ = object_message.args[1].url;
			var LNG_FROM___ = object_message.args[1].LNG_FROM;
			var __prefs = preferences.getHostPrefs(url___);
			
			__prefs.LNG_FROM = LNG_FROM___;
			book_url_tabId[url___].prefs.LNG_FROM = LNG_FROM___;

			preferences.setHostPrefs(url___, __prefs);
			var isin = preferences.isHostIn(url___);
			sendResponse([
				{action: CONST.ACTION_W_state, args: [{isin: isin, url: url___, prefs: __prefs}]}
				]);
		break;
		case CONST.ACTION_B_openConfApp:
				function showcfg()
				{
				   let creating = browser.tabs.create({
				     url: browser.runtime.getURL("configure.html")
				   });
				   creating.then(function(tab){
				   	configPage_tab_id = tab.id;
				   }, function(){});
				}

			  if(configPage_tab_id !== -1)
			  {
			  	let removed = browser.tabs.remove(configPage_tab_id);
			  	removed.then(showcfg);
			  }
			  else
			  {
			  	showcfg();
			  }
			  
		break;
		case CONST.ACTION_B_cfgSet:
			let _prefs_ = object_message.args[1];

			parameters.LNG_TO = _prefs_.translateLNG_PREFER_TO;
			parameters.LNG_TO_ALT = _prefs_.translateLNG_PREFER_TO_ALT;

			preferences.setPrefs(_prefs_);

			// for(var t in list_connected_tabs)
			for (var i = 0; i < list_connected_tabs.length; i++)
			{
				var t = list_connected_tabs[i];
				var sent = browser.tabs.sendMessage(t, {action: CONST.ACTION_F_Prefs, args: [_prefs_]});
				
				let tabid = t;
				sent.catch(function(err){
					remove_tabid(tabid);
				});
			}
		break;
		default:
			console.log("unknown action main.js: ", object_message);

		break;
	}
}

browser.runtime.onMessage.addListener(communication_gate);


function updateActiveTab(tabs) {

  // function isSupportedProtocol(urlString) {
  //   var supportedProtocols = ["https:", "http:", "ftp:", "file:"];
  //   var url = document.createElement('a');
  //   url.href = urlString;
  //   return supportedProtocols.indexOf(url.protocol) != -1;
  // }

  function updateTab(tabs) 
  {
    if (tabs[0]) 
    {
      currentTab = tabs[0];
      // console.log("CT", currentTab)
    }
  }

  var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
  gettingActiveTab.then(updateTab);
}

// listen to tab URL changes
// browser.tabs.onUpdated.addListener(updateActiveTab);

// listen to tab switching
browser.tabs.onActivated.addListener(updateActiveTab);

// listen for window switching
browser.windows.onFocusChanged.addListener(updateActiveTab);

// update when the extension loads initially
updateActiveTab();

function handleRemoved(tabId, removeInfo)
{
  if(tabId === configPage_tab_id)
  {
  	configPage_tab_id = -1;
  	// console.log("config closed");
  }
  if(list_connected_tabs.indexOf(tabId) >= 0)
  	remove_tabid(tabId);
}

browser.tabs.onRemoved.addListener(handleRemoved);

function handleUpdated(tabId, changeInfo, tabInfo) 
{
  if (changeInfo.url) 
  {
	  if(tabId === configPage_tab_id && changeInfo.url !== browser.runtime.getURL("configure.html"))
	  {
	  	configPage_tab_id = -1;
	  	// console.log("config closed");
	  }
	  if(configPage_tab_id === -1 && changeInfo.url === browser.runtime.getURL("configure.html"))
	  {
	  	configPage_tab_id = tabId;
	  	// console.log("config opened");
	  }
  }
  updateActiveTab();
}
browser.tabs.onUpdated.addListener(handleUpdated);

function translate(tab_id, lng_from, sentence, secondTry)
{
  var t = new translator.translator(sentence, parameters.LNG_TO, parameters.LNG_TO_ALT);
  t.translate(lng_from, function(){
    if(t.OK)
    {
	    browser.tabs.sendMessage(tab_id, {action: CONST.ACTION_F_showTranslated, args: [sentence, t.source, t.translated, t.also1, t.also2, t.srcDetected, t.useDistLang]});
	}
  });
}
var _l = browser.i18n.getMessage;
function getLocalisedLangs()
{
  var result = [];
  var array = langs.LangList;
  for (var i = 0; i < array.length; i++) {
    var f = array[i].mnem;
    var t = _l("gem_"+ f);
    result.push({val: f, name: t});
  };

  return result;
}
function localiseArray(array)
{
  var result = {};
  for (var i = 0; i < array.length; i++) {
    var f = array[i];
    var t = _l(f);
    if(!t)
      t = f;
    result[f] = t;
  };

  return result;
}
function getHostName(url, bool_include_protocol)
{
   var arr = url.split("/");
   if(arr.length < 3)
   	return url;
   
   var result = (bool_include_protocol ? (arr[0] + "//") : "") + arr[2];
   return result;
}
