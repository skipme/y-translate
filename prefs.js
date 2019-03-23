var _def_prefs_ = {
		translateEvtType: "h", 
		translateEvtKeybrd: "ctrl+KeyX", 
		cpyClipboardEvtKeybrd: "ignore", 

		translateLNG_PREFER_TO: "ru", 
		translateLNG_PREFER_TO_ALT: "en", 

		baloonLagMs: 700,
		// sp.prefs.yandexKey// 6
		cpyClipboardKey: "ctrl+KeyC"
	};

var preferences = 
{
	hosts: undefined,
	host_params: null,
	temp_host_params: null,
	extension_prefs: null,

	read_model: async function(function_callback)
	{
		var that = this;

		this.hosts = [];
		this.extension_prefs = {};
		this.host_params = {_ytranslate_host_: {}};
		this.temp_host_params = {_ytranslate_host_: {}};

		var data = await that.readAsync("HostUrls");
		if(data === undefined || data.length === undefined)
			data = undefined;
		else
			that.hosts = data;

		// console.log("hp", that.hosts);
		
		data = await that.readAsync("HostPrefs");

		if(data === undefined || data._ytranslate_host_ === undefined)
			data = undefined;
		else
			that.host_params = data;

		// console.log("hp", that.host_params)

		data = await that.readAsync("ExtensionPrefs");

		if(data === undefined || data._ytranslate_ === undefined)
			data = _def_prefs_;
		else if(data._ytranslate_ === "0.4")// events changed
		{
			data.translateEvtType = _def_prefs_.translateEvtType;
			data.cpyClipboardKey = _def_prefs_.cpyClipboardKey;
			data.translateEvtKeybrd = _def_prefs_.translateEvtKeybrd;
		}
		
		this.extension_prefs = data;

		// console.log("ep", that.extension_prefs);
		
		function_callback();
	},

	storage_error_callback: function(err)
	{
		console.log("prefs storage_error_callback", err);
	},
	read: function (string_key, function_callback) 
	{
		let gettingItem = browser.storage.local.get(string_key);
		gettingItem.then(
			function(object_data)
			{
				if(object_data === undefined || object_data[string_key] === undefined)
					function_callback(undefined);
				else	
					function_callback(object_data[string_key]);
			}, 
			this.storage_error_callback);
	},
	readAsync: function (string_key) 
	{
		return new Promise(resolve => {
			let gettingItem = browser.storage.local.get(string_key);
			gettingItem.then(
				function(object_data)
				{
					if(object_data === undefined || object_data[string_key] === undefined)
						resolve(undefined);
					else	
						resolve(object_data[string_key]);
				}, 
				this.storage_error_callback);
	  	});
		
	},
	write: function (string_key, object_data) 
	{
		var set_pocket = {};
		set_pocket[string_key] = object_data;
		// console.log("set_pocket", set_pocket)
		let settingItem = browser.storage.local.set(set_pocket);// fire and forget
		settingItem.then(function(){console.log("write ok", string_key)}, this.storage_error_callback);
	},
	pushHostUrl: function(url)
	{
		this.hosts.push(url);
		this.write("HostUrls", this.hosts);
	},
	dropHostUrl: function(url)
	{
		var iof = this.hosts.indexOf(url);
		if(iof >= 0)
		{
			this.hosts.splice(iof, 1);
		}
		this.write("HostUrls", this.hosts);
	},
	isHostIn: function(url)
	{
		var iof = this.hosts.indexOf(url);
		return iof >= 0;
	},
	getHostPrefs: function(url)
	{
		var p__ = this.host_params[url];
		if(p__ === undefined || p__.LNG_FROM === undefined)
		{
			p__ = this.temp_host_params[url];
			if(p__ === undefined)
				p__ = {};
		}
		return p__ ;
	},
	setHostPrefs: function(url, obj)
	{			
		this.host_params[url] = obj;
		this.write("HostPrefs", this.host_params);
	},
	setHostPrefs_temp: function(url, obj)
	{		
		this.temp_host_params[url] = obj;	
	},
	getPrefs: function()
	{
		return this.extension_prefs;
	},
	setPrefs: function(prefs)
	{
		prefs._ytranslate_ = "0.4.12";
		this.extension_prefs = prefs;
		this.write("ExtensionPrefs", this.extension_prefs);
	}
}; 
