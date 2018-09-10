
// if(typeof browser === "undefined")
// {
// 	window.browser = chrome;
// }
preferences.read_model(function()
{

});

var parameters = {LNG_TO: 'ru', LNG_TO_ALT: "en" };
var currentTab;

var book_url_tabId = {};
var book_tabId_url = [];
function set_url_tabid(string_url, number_tabId)
{
	remove_tabid(number_tabId);
	book_tabId_url[number_tabId] = string_url;

	var ref_url_ = book_url_tabId[string_url];
	if(ref_url_ !== undefined)
	{
		ref_url_.push(number_tabId);
	}
	else
	{
		book_url_tabId[string_url] = [number_tabId];
	}
}
function remove_tabid(number_tabId)
{
	var ref_tabid_ = book_tabId_url[number_tabId];
	if(ref_tabid_ !== undefined)
	{
		var prev_url_ = book_tabId_url[number_tabId];
		var remat_ = book_url_tabId[prev_url_].indexOf(number_tabId);
		book_url_tabId[prev_url_].splice(remat_, 1);
		if(book_url_tabId[prev_url_].length === 0)
		{
			delete book_url_tabId[prev_url_];
		}
	}
}
function get_url_tabIds(string_url)
{
	return book_url_tabId[string_url];
}

function communication_gate(object_message, sender, sendResponse) 
{
	switch(object_message.action)
	{
		case CONST.ACTION_B_BEEP:

			console.log("action beep from main.js "+sender.tab.id);

			set_url_tabid(getHostName(sender.tab.url, true), sender.tab.id);

			browser.tabs.sendMessage(sender.tab.id, {action: CONST.ACTION_F_BEEP});

			browser.tabs.sendMessage(sender.tab.id, {action: CONST.ACTION_F_Prefs, args: [prefs]});
			browser.tabs.sendMessage(sender.tab.id, {action: CONST.ACTION_F_Urls, args: [{ajax_loader: browser.runtime.getURL("ajax-loader.gif")}]});
			browser.tabs.sendMessage(sender.tab.id, {action: CONST.ACTION_F_enable, args: []});
		break;
		case CONST.ACTION_B_page_lng:
			console.log("action page_lng from main.js "+sender.tab.id);
			var url___ = getHostName(sender.tab.url, true);
			var lng___ = object_message.args[1];
			var props___ = preferences.getHostPrefs(url___);
		    if(props___.page_lng !== lng___)
          	{	
          		props___.page_lng = lng___;
          		preferences.setHostPrefs_temp(url___, props___);
          	}
		break;
		case CONST.ACTION_B_scoped:
			translate(sender.tab.id, "auto", object_message.args[1]); 
		break;
		// widget dont have fixed port hahdle so we can only answer to it
		case CONST.ACTION_B_BEEPW:
			sendResponse({action: CONST.ACTION_W_locLangs, args: [getLocalisedLangs()]});
		break;
		case CONST.ACTION_B_locData:
				var	url___ = getHostName(currentTab.url, true);
				sendResponse([
				{action: CONST.ACTION_W_locStrings, args: [localiseArray(object_message.args[1])]},
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
			preferences.setHostPrefs(url___, __prefs);
			var isin = preferences.isHostIn(url___);
			sendResponse([
				{action: CONST.ACTION_W_state, args: [{isin: isin, url: url___, prefs: __prefs}]}
				]);
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
browser.tabs.onUpdated.addListener(updateActiveTab);

// listen to tab switching
browser.tabs.onActivated.addListener(updateActiveTab);

// listen for window switching
browser.windows.onFocusChanged.addListener(updateActiveTab);

// update when the extension loads initially
updateActiveTab();

function translate(tab_id, lng_from, sentence, secondTry)
{
  var t = new translator.translator(sentence, parameters.LNG_TO, parameters.LNG_TO_ALT);
  t.translate(lng_from, function(){
    // if(t.OK)
    browser.tabs.sendMessage(tab_id, {action: CONST.ACTION_F_showTranslated, args: [sentence, t.source, t.translated, t.also1, t.also2, t.srcDetected, t.useDistLang]});
      // worker.port.emit("showTranslated", sentence, t.source, t.translated, t.also1, t.also2, t.srcDetected, t.useDistLang);
    // else
    // {
    //   if(t.redirectURL !== null)
    //   {
    //     if(redirectPage === null)
    //     { 
    //       beforeRedirectPage = tabs.activeTab;
    //       beforeRedirectPage.on('close', function(tab){
    //         beforeRedirectPage = null;
    //       });
    //       tabs.open({url: t.redirectURL, 
    //         // isPinned: true,
    //         onOpen: function onOpen(tab) {
            
    //          redirectPage = tab;
    //           tab.on('close', function(tab){
    //             redirectPage = null;
    //             if(beforeRedirectPage)
    //             {
    //               beforeRedirectPage.activate();
    //               beforeRedirectPage.window.activate();
    //               beforeRedirectPage = null;
    //             }
    //           });
    //         }
    //       });
    //     }else{
    //       redirectPage.url = t.redirectURL;
    //       redirectPage.activate();
    //       redirectPage.window.activate();
    //     }
    //   }
    //   worker.port.emit("showTranslated", sentence, "Error", t.errorMessage);
    // }
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
