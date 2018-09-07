
var parameters = {LNG_TO: 'ru', LNG_TO_ALT: "en" };
var currentTab;

function communication_gate(object_message, sender, sendResponse) 
{
	switch(object_message.action)
	{
		case CONST.ACTION_B_BEEP:
			// console.log("action beep from main.js "+sender.tab.id);
			browser.tabs.sendMessage(sender.tab.id, {action: CONST.ACTION_F_BEEP});


			browser.tabs.sendMessage(sender.tab.id, {action: CONST.ACTION_F_Prefs, args: [prefs]});
			browser.tabs.sendMessage(sender.tab.id, {action: CONST.ACTION_F_Urls, args: [{ajax_loader: browser.runtime.getURL("ajax-loader.gif")}]});
			browser.tabs.sendMessage(sender.tab.id, {action: CONST.ACTION_F_enable, args: []});
		break;
		case CONST.ACTION_B_scoped:
			translate(sender.tab.id, "auto", object_message.args[1]); 
		break;
		// widget dont have fixed port hahdle so we can only answer to it
		case CONST.ACTION_B_BEEPW:
			sendResponse({action: CONST.ACTION_W_locLangs, args: [getLocalisedLangs()]});
		break;
		case CONST.ACTION_B_locData:
				sendResponse([
				{action: CONST.ACTION_W_locStrings, args: [localiseArray(object_message.args[1])]},
				{action: CONST.ACTION_W_state, args: [{isin: true, url: currentTab.url, prefs: {}}]}
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
