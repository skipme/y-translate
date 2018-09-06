var dispatch_book = [];
var port_connected = false;

function connected() 
{
	var ret_msg = browser.runtime.sendMessage({action: CONST.ACTION_B_BEEP});
	if(ret_msg)
	{
		ret_msg.then(
			function(message)
			{
				port_connected = true;
			},
			function(err)
			{
				setTimeout(connected, Math.random()*2000+500);
			}
		);
	}
}

function dispatch(number_eventId, function_callback)
{
	// if(dispatch_book[number_eventId] !== undefined)
	// 	throw new Error("dispatch event already exists: ", number_eventId);
	dispatch_book[number_eventId] = function_callback;
}
function emit()
{
	var dargs = [];
	for (var i = 0; i < arguments.length; i++) 
	{
		dargs.push(arguments[i]);
	}
	var number_eventId = arguments[0];
	if(port_connected)
		browser.runtime.sendMessage({action: number_eventId, args: dargs});
	else
	{
		
		setTimeout(function(){
			// browser.runtime.sendMessage({action: number_eventId, args: dargs});
			emit.apply(window, dargs);
		}, 5000);
	}
}
browser.runtime.onMessage.addListener(communication_gate);
function communication_gate(object_message) 
{
	switch(object_message.action)
	{
		case CONST.ACTION_F_BEEP:
			// console.log("action beep from ytranslate3.js");
		break;
		default:
			var function_endpoint;
			if((function_endpoint = dispatch_book[object_message.action]) === undefined)
			{	console.log("unknown action ytranslate3.js: ", object_message.action);
			}
			else
			{
				function_endpoint.apply(window, object_message.args);
			}
		break;
	}
}

// connected();
