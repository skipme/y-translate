var parameters = {LNG_TO: 'ru', LNG_TO_ALT: "en" };



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
		default:
			console.log("unknown action main.js: ", object_message);

		break;
	}
}

browser.runtime.onMessage.addListener(communication_gate);

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