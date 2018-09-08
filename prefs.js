var prefs = {
		translateEvtType: "h", 
		translateEvtKeybrd: "ctrl", 
		cpyClipboardEvtKeybrd: "ignore", 

		translateLNG_PREFER_TO: "ru", 
		translateLNG_PREFER_TO_ALT: "en", 

		baloonLagMs: 700,
		// sp.prefs.yandexKey// 6
		cpyClipboardKey: "c"
	};

var preferences = 
{
	hosts: undefined,
	host_params: null,
	temp_host_params: null,
	settings: null,

	read_model: function(function_callback)
	{
		var that = this;

		this.hosts = [];
		this.settings = {};
		this.host_params = {_ytranslate_host_: {}};
		this.temp_host_params = {_ytranslate_host_: {}};

		that.read("HostUrls", function(data){

			if(data === undefined || data.length === undefined)
				data = undefined;
			else
				that.hosts = data;

			that.read("HostPrefs", function(data){
				console.log("hpr", data)
				if(data === undefined || data._ytranslate_host_ === undefined)
					data = undefined;
				else
					that.host_params = data;
				console.log("hp", that.host_params)
				function_callback();
			});
		});
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
	write: function (string_key, object_data) 
	{
		var set_pocket = {};
		set_pocket[string_key] = object_data;
		console.log("set_pocket", set_pocket)
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
}; 
