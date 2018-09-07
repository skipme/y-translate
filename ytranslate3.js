var dispatch_book = [];
var port_connected = true;

function connected(number_eventId) 
{
	console.log("page interface", window.document.location)

	number_eventId = number_eventId | CONST.ACTION_B_BEEP;

	var ret_msg = browser.runtime.sendMessage({action: number_eventId});
	if(ret_msg)
	{
		ret_msg.then(
			function(message)
			{
				console.log("con callback", message)
				port_connected = true;
				got_message(message);	
			},
			function(err)
			{
				console.log("con err", err)
				setTimeout(function(){connected(number_eventId);}, Math.random()*2000+500);
			}
		);
	}
}
function got_message(message)
{
	if(message)
	{
		if(message.action !== undefined)
		{
			communication_gate(message);
		}
		else if(message.length > 0)
		{
			for (var i = 0; i < message.length; i++) 
			{
				communication_gate(message[i]);
			}
		}
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
	{
		var ret_msg = browser.runtime.sendMessage({action: number_eventId, args: dargs});
		ret_msg.then(
			function(message)
			{
				console.log("con callback", message)
				port_connected = true;

				got_message(message);
			},
			function(err)
			{
				console.log("emit err", err)
			}
		);
	}
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
