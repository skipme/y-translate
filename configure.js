(function(){
	"use strict";
	var $id = function(id){return document.getElementById(id);}
	var $childclass = function(element, classname){
		var list = element.getElementsByClassName(classname);
		if(list.length > 0)
			return list[0];
		return null;
	}
	var $childSClass = function(element, classname){
		var list = element.getElementsByClassName(classname);
		if(list.length > 0)
			return list;
		return null;
	}
	var defer = p2ptranslate.c.defer;
	var diagError = p2ptranslate.c.diagError;
	var diagDebug = p2ptranslate.c.diagDebug;

	var single = {
		vheader_csequence: [["vslidepmin", "vslidepminhover"], ["vslidepmid"], ["vslidepfull", "vslidepmaxhover"]],
		
		panel_projects: null,
		panel_sentences: null,
		panel_project: null,
		menu_main: null,
		leftSlash: null,
		indicatorLoading: null,
		menuinterruption: null,
		vheader_sentences: null,
		vheader_project: null,
		vmheader_project: null,
		prjpanproj: null,
		prjpanver: null,
		verimport_textImport: null,
		verimport_set: null,
		textImportContainer: null,
		textImportFilter: null,
		textImportFilterSeparator: null,
		taggetInput: null,
		switchProject: null,
		addProjectPopUp: null,

		slashTimer: -1,
		sentencesHeaderTimer: -1,
		projectHeaderTimer: -1,

		menu_on: { main: false, addProjectPopUp: false },
		slide_on: { projects: true, sentences: true, projectpan: true, projectpan_fix: false },
		slide_state: {projects: 0, sentences: 0, projectpan: 0, set: function(which, mode){
			if(which === "projects")
				this.projects = mode;
			else if(which === "sentences")
				this.sentences = mode;
			else if(which === "projectpan")
				this.projectpan = mode;
		}},

		preview_page_callback: null,

		vheaderseqnum: function (classlist)
    	{
    		for (var i = 0; i < single.vheader_csequence.length; i++) {
    			if(classlist.contains(single.vheader_csequence[i][0]))
    				return {cnum: i, classn: [single.vheader_csequence[i][0], single.vheader_csequence[i][1]]};
    			else if (single.vheader_csequence[i].length > 1 
    				&& classlist.contains(single.vheader_csequence[i][1]))
    			return {cnum: i, classn: [single.vheader_csequence[i][0], single.vheader_csequence[i][1]]};
    		};
    		if(classlist.contains("vslidepoff"))
    			return {cnum: 0, classn: ["vslidepoff","vslidepoff"]};
    		return -1;
    	},
    	switchSummary: function(project, version, show)
    	{
    		var element = project? this.switchProject : this.switchProject;
    		var subelements = $childSClass(element, "switch-sub");
    		if(subelements.length < 2)
    		{
    			diagDebug("check switchSummary switch-sub divs < 2", element);
    			return;
    		}
    		var indexNow = 0;
    		for (var i = 0; i < subelements.length; i++) {
				if(subelements[i].classList.contains("switch-on"))
				{
					indexNow = i;		
					break;
				}
			};
    		var index = 0;
    		if(show !== undefined)
    		{
    			index = show?0:1;
    		} else{
    			index = indexNow + 1;
    		}
    		if(subelements.length <= index)
			{
				index = 0;
			}
    		subelements[indexNow].classList.remove("switch-on");
    		subelements[index].classList.add("switch-on");
    	},
		shiftPanel: function(sentences, project, up, setindex, hide)
		{
			var el = sentences?this.panel_sentences : 
				(project?this.panel_project: null);
			if(el === null)
			{
				this.slide_state.set(sentences?"sentences":(project?"projectpan":""), 0);
			}else{
				var hc = this.vheaderseqnum(el.classList);
				var index = hc.cnum + (up?1:-1);
				if(setindex !== undefined)
				{
					index = setindex;
				}
	    		if( index >= 0 && index < single.vheader_csequence.length)
	    		{
	    			if(hc.classn)
	    			{
		    			el.classList.remove(hc.classn[0]);
		    			el.classList.remove(hc.classn[1]);
		    		}
	    			if(hide)
	    			{
	    				el.classList.add("vslidepoff");
	    				index = 0;
	    			}
		    		else
	    				el.classList.add(single.vheader_csequence[index][0]);
	    		}

	    		this.slide_state.set(sentences?"sentences":(project?"projectpan":""), index);
			}
			this.activateVHeader();
		},
		activateVHeader: function(){
		
		},
		showProjects: function(show){

		},
		showSentences: function(show){

		},
		showProjectPan: function(show){

		},
		fixateProjectPan: function(fixate){

		},
		hideWorkzone: function(){
			this.showSentences(false);
			this.showProjects(false);
			this.showProjectPan(false);
			this.switchPrjPan(1,0);
		},
		staffElements: function(){
			this.menuinterruption = $id("menuinterruption");
			this.panel_projects = $id("projects");
			this.panel_sentences = $id("sentences");
			this.menu_main = $id("mainMenu");
			this.leftSlash = $id("leftslash");
			this.panel_project = $id("projectpanel");
			this.indicatorLoading = $id("procIndicator");
			// this.vheader_sentences = $childclass(this.panel_sentences, "sheader");
			// this.vheader_project = $childclass(this.panel_project, "sheader");
			// this.vmheader_project = $childclass(this.panel_project, "sheader-mouse");
			this.indicatorLoadingText = this.indicatorLoading.getElementsByTagName("span")[0];
			this.prjpanproj = $id("prjpanproj");
			this.prjpanver = $id("prjpanver");
			this.verimport_textImport = $id("verimport_textImport");
			this.verimport_set = $id("verimport_set");
			this.textImportContainer = $id("textImportContainer");
			this.textImportFilter = $id("textImportFilter");
			this.taggetInput = document.getElementsByClassName("dem");
			this.switchProject = $id("switch-project");
			this.textImportFilterSeparator = $id("textImportFilterSeparator");
			this.addProjectPopUp = $id("addProjectPopUp");

			this.blinkSaved_behaviour = $id("behSaved");
		},
		blinkSaved: function (behaviour) 
		{
			var elem = undefined;
			if(behaviour)
			{
				elem = this.blinkSaved_behaviour;
			}

			if(elem && !elem.classList.contains('hinfo-show'))
			{
				elem.classList.add('hinfo-show');
				p2ptranslate.c.delay('blinkSavedElem', function(){
						elem.classList.remove('hinfo-show');
					}, 2000);
			}
		},
		parentMatch: function(element, elementMatch)
		{
			var currentElement = element;
			while(true)
			{
				if(currentElement === elementMatch)
				{
					return true;
				}else if(currentElement.parentElement === document.body){
					return false;
				}else{
					currentElement = currentElement.parentElement;
				}
			}
		},
		switchPrjPan: function(proj, verList, newVerImport, newVerSet)
		{

		},
		bodyClick: function(e)
		{
			var mctx = single.menu_on;
			if(e.which === 1)
			{
				if(mctx.main && !single.parentMatch(e.target, single.menu_main))
				{
					single.mainMenu(false);
				}else{
					if(mctx.addProjectPopUp && !single.parentMatch(e.target, single.addProjectPopUp))
					{
						single.popUpNewProject(false);
					}
				}
			}
		},
		bindEvents: function(){
			document.body.addEventListener("click", this.bodyClick);

			// ['d_leftSOff']
			function d_leftSOff() {
				single.leftSlash.classList.remove('slidetoright');
			}
			// ['d_vhSenSOff']
			function d_vhSenSOff() {
				if(single.sentencesHeaderTimer < 0 && single.panel_sentences.classList.contains('vslidepmaxhover'))
				{
					single.panel_sentences.classList.remove('vslidepmaxhover');
						single.panel_sentences.classList.add('vslidepfull');
				}else if(single.sentencesHeaderTimer < 0 && single.panel_sentences.classList.contains('vslidepminhover'))
				{
					single.panel_sentences.classList.remove('vslidepminhover');
					single.panel_sentences.classList.add('vslidepmin');
				}
			}
			// ---
			this.leftSlash.addEventListener("mouseover", function(){
				single.leftSlash.classList.add('slidetoright');
				p2ptranslate.c.delay_clear('d_leftSOff', d_leftSOff);
			});
			this.leftSlash.addEventListener("mouseleave", function(){
				p2ptranslate.c.delay('d_leftSOff', d_leftSOff, 1000);
			});


			for (var i = 0; i < this.taggetInput.length; i++) {
				this.taggetInput[i].addEventListener("focus", function(e){
					if(e.target.value === "")
					{
						e.target.parentNode.classList.add('active');
					}
				});
				this.taggetInput[i].addEventListener("blur", function(e){
					if(e.target.value === "")
					{
						e.target.parentNode.classList.remove('active');
					}
				});
			};
			
		},
		checkFilterSeparatorUi: function(){
		
		},
		getBakeFilter: function(){

		},
		updatePagePreview: function(){

		},
		mainMenu: function(show){

		},
		popUpNewProject: function(show){
	
		},
		pLoadingCounter: 0,
		procedureLoading: function(show, text){
			if(show)
			{
				if(text === undefined && text === null)
					text = "Loading...";
				this.indicatorLoadingText.textContent = text;
				this.indicatorLoading.classList.add('right-active');
				this.pLoadingCounter++;
			}else{
				if(this.pLoadingCounter > 0)
					this.pLoadingCounter--;
				if(this.pLoadingCounter === 0)
				{
					this.indicatorLoading.classList.remove('right-active');
				}
			}
			console.log("this.pLoadingCounter", this.pLoadingCounter)
		}
	};

	function jqLiteHasClass(element, selector) 
	{
	  if (!element.getAttribute) return false;
	  return ((' ' + (element.getAttribute('class') || '') + ' ').replace(/[\n\t]/g, ' ').
	      indexOf(' ' + selector + ' ') > -1);
	}

	// MODULE 
	// var p2ptm = angular.module('p2ptm', [/*'ngAnimate'*/]);
	
	var p2ptm = p2ptranslate.p2ptm = 
	{
		$scope: {
			$apply: function()
			{
				p2ptm.$rerender();
			}
		},
		pxy_classes: {},
		pxy_bindings: {},
		binded_elements: [],
		run: function(cb)
		{
			
			cb();
		},
		// p2ptm.filter('lang', function() {
		filter: function(name, ffoo)
		{

		},
		update_classes: function(prop_name, prop_val)
		{
			let dl = this.pxy_classes[prop_name];
			for (var j = 0; j < dl.length; j++) 
			{
				let d = dl[j];
				let ison = d.element.classList.contains(d.class);
				// console.log(" = =c", ison, prop_name, prop_val)
				if(ison && prop_val && !d.neg || !ison && prop_val && d.neg)
					return;
				if(ison && !prop_val && !d.neg || ison && prop_val && d.neg)
				{
					d.element.classList.remove(d.class);
				}
				if(!ison && prop_val && !d.neg || !ison && !prop_val && d.neg)
				{
					d.element.classList.add(d.class);
				}
			}
		},
		$setter_proxy: function(prop_name, prop_val, bool_set)
		{
			// console.log("#setter", prop_name, prop_val, bool_set);
			if(!bool_set && this.pxy_classes[prop_name] !== undefined)
			{
				this.update_classes(prop_name, prop_val);
			}
			if(!bool_set && this.pxy_bindings[prop_name] !== undefined)
			{
				let dl = this.pxy_bindings[prop_name];
				for (var j = 0; j < dl.length; j++) 
				{
					let d = dl[j];
					// 
					if(d.element.$ng)
					{
						d.element.$ng.$bind_view_value(prop_val);
					}
				}
				let that = this;
				// console.log(" x delay");
				this.$rerender();
			}
		},
		$rerender: function()
		{
			let that = this;
			p2ptranslate.c.delay("$render", function()
				{
					for (var i = 0; i < that.binded_elements.length; i++) 
					{
						// console.log(that.binded_elements[i])
						if(that.binded_elements[i].$ng)
						{
							let ex = p2ptm.$scope;
							let path = that.binded_elements[i].$binding.split(".");

							if(!Object.hasOwnProperty(that.binded_elements[i], "$binding_getter")
								&& !Object.hasOwnProperty(that.binded_elements[i], "$binding_setter"))
							{
								for (var j = 0; j < path.length -1; j++) 
								{
									ex = ex[path[j]];
								}
								if(ex)
								{
									that.binded_elements[i].$binding_getter = Object.getOwnPropertyDescriptor(ex, path[path.length -1]).get;
									that.binded_elements[i].$binding_setter = Object.getOwnPropertyDescriptor(ex, path[path.length -1]).set;
								}
							}
							if(that.binded_elements[i].$binding_getter)
							{
								// that.binded_elements[i].$ng.$viewValue = that.binded_elements[i].$binding_getter();
								let getprop = that.binded_elements[i].$binding_getter();
								that.binded_elements[i].$ng.$bind_view_value(getprop);
								if(that.pxy_classes[that.binded_elements[i].$binding])
								{
									that.update_classes(that.binded_elements[i].$binding, getprop);
								}
							}

							// console.log("rerender", that.binded_elements[i].$binding, that.binded_elements[i].$ng.$viewValue, that.binded_elements[i].$binding_getter, that.binded_elements[i]);
							that.binded_elements[i].$ng.$render();
						}
					}
				}
				, 100);
		},
		// p2ptm.controller('mainCtrl', ['$scope', '$http', function mainCtrl($scope, $location) {
		controller: function(name, args)
		{
			let foo = args[2];
			foo(this.$scope);

			{
				let elements = document.querySelectorAll("[ng-class]");
				for (var i = 0; i < elements.length; i++) 
				{		
					let class_def = elements[i].getAttribute("ng-class");

					class_def = class_def.replace(/[{} ]/g,"").split(":");

					let scope_path = class_def[1].replace(/\!/g,"");
					if(this.pxy_classes[scope_path] === undefined)
						this.pxy_classes[scope_path] = [];

					this.pxy_classes[scope_path].push({class: class_def[0], element: elements[i], neg: class_def[1].indexOf('!') === 0});
				}
			}
			{
				let elements = document.querySelectorAll("[ng-model]");
				for (var i = 0; i < elements.length; i++) 
				{		
					let scope_path = elements[i].getAttribute("ng-model");

					if(this.pxy_bindings[scope_path] === undefined)
						this.pxy_bindings[scope_path] = [];

					this.pxy_bindings[scope_path].push({element: elements[i]});

					elements[i].$binding = scope_path;

					let ex = p2ptm.$scope;
					let path = scope_path.split(".");
					for (var j = 0; j < path.length -1; j++) 
					{
						ex = ex[path[j]];
					}
					if(ex)
					{	
						// Object.defineProperty(elements[i], "$binding_getter", {get: Object.getOwnPropertyDescriptor(ex, path[path.length -1]).get});
						elements[i].$binding_getter = Object.getOwnPropertyDescriptor(ex, path[path.length -1]).get;
						elements[i].$binding_setter = Object.getOwnPropertyDescriptor(ex, path[path.length -1]).set;
					}
					let element = [elements[i]];
					this.checkNgInElement(element);
					if(elements[i].nodeName === "INPUT" || elements[i].nodeName === "SELECT")
					{
						elements[i].addEventListener("change", elements[i].$ng.$change);
					}
					this.binded_elements.push(elements[i]);
				}
			}
			{
				let elements = document.querySelectorAll("[ang-select]");
				for (var i = 0; i < elements.length; i++) 
				{
					let scope_path = elements[i].getAttribute("ang-select");
					let ex = p2ptm.$scope;
					let path = scope_path.split(".");
					for (var j = 0; j < path.length; j++) 
					{
						ex = ex[path[j]];
					}
					
					let list = ex;
					for(var j=0; j < list.length; j++) 
					{
					    var d = list[j];
					    var selected = false;

			 			var opt2 = document.createElement("option");
			 			opt2.value = d;
			 			opt2.text = p2ptranslate.langs.getName("en", d);
			 			opt2.selected = selected?"selected":"";
					    elements[i].options.add(opt2);
					}
				}
			}

			for (var k in this.$scope) 
			{
				if(typeof this.$scope[k] === "object")
				{
					// createSettersProxy(string_name, object_setters, function_proxy)
					createSettersProxy(k, this.$scope[k], function(p, v, ch){p2ptm.$setter_proxy(p, v, ch);})
				}
			}
		},
		$apply: function(cb)
		{
			cb();
		},
		checkNgInElement: function(element)
		{
			if(!element[0].$ng)
			{
				element.$ng = element[0].$ng = {
					$render: function(){},
					$viewValue: "",
					$setViewValue: function(val)
					{
						// element[0].value = val;
						// this.$viewValue = val;
						if(element[0].hasOwnProperty("$binding_setter"))
						{
							// console.log("html to model ", element[0], val)
							element[0].$binding_setter(val);
						}
						else
						{
							this.$bind_view_value(val);
						}
						// this.$render();
					},
					$bind_view_value: function(val)
					{
						this.$viewValue = val;
						if(element[0].nodeName === "INPUT")
							element[0].value = val;
						let dict = "en";
						if(element[0].nodeName === "SELECT")
						{
							if(element[0].options.length >= 0)
							{
								for (var i = 0; i < element[0].options.length; i++) 
								{
									element[0].options[i].selected = element[0].options[i].value === val ? "selected" :"";
								}
							}
						}
						if(element[0].childElementCount === 0)
							element[0].textContent = val;
					},
					$change: function()
					{
						if(element[0].value !== this.$ng.$viewValue)
						{
							this.$ng.$setViewValue(element[0].value);
						}
					}
				};
			}
			else{
				element.$ng = element[0].$ng;
			}
		},
		directive: function(string_elem, function_dir)
		{
			if(typeof function_dir !== "function" && function_dir.length > 0)
				function_dir = function_dir[1];

			let dir = function_dir();
			// console.log("dir", string_elem, dir)
			let sel;
			if(dir.restrict === "E")
				sel = string_elem;
			if(dir.restrict === "A")
				sel = "["+string_elem+"]";
			
			let elements = document.querySelectorAll(sel);
			for (var i = 0; i < elements.length; i++) 
			{
				let element = [elements[i]];
				
				this.checkNgInElement(element);

				element.hasClass = function(str){return jqLiteHasClass(element[0], str);}
				element.on = function(str, cb){
					element[0].addEventListener(str, cb);
				}
				// console.log(element)
				if(dir.link)
				{
					dir.link(p2ptm, element, undefined/*attrs*/, element.$ng);
					// element.$ng.$render();
				}
			}
		}
	};
	p2ptm.run(function () {
        // Do post-load initialization stuff here
        // some ui initialisation
        single.staffElements();
        single.bindEvents();
        // hide panels
        single.hideWorkzone();
        // single.mainMenu(true);
        // single.showProjects();
        single.checkFilterSeparatorUi();
    });

	var animLabelDirFactory = ["$compile", function($compile) {
		return {
			restrict: 'E',//element, tag 
			require: '?ngModel',
		link: function(scope, elm, attrs, ctrl) {
			if(!ctrl || !elm.hasClass("dem") )
			{
				return;
			}
		  // model -> view
		  var prend = ctrl.$render;
		  ctrl.$render = function() {
		  	if(!p2ptranslate.c.isNullOrWhiteSpace(ctrl.$viewValue))
		  	{
		  		elm.parent().addClass('active');
		  	}
		  	prend();
		  };
		}
		};
	}];
	p2ptm.directive('input', animLabelDirFactory);
	// p2ptm.directive('textarea', animLabelDirFactory);
	p2ptm.directive('toggleme', function(){
		return {
				restrict: 'A',//attribute
				require: 'ngModel',
				link: function(scope, elm, attrs, ctrl) {
					if(!ctrl || !elm.hasClass("toggle"))
					{
						return;
					}
					var ielem = elm[0].getElementsByTagName("i")[0];
					elm.on('click', function() {
				        scope.$apply(function() {
				          ctrl.$setViewValue(!ctrl.$viewValue);
				          ctrl.$render();
				        });
				     });
					// model -> view
					ctrl.$render = function() {
						if(ctrl.$viewValue)
						{
							ielem.classList.remove('icon-toggle-off');
							ielem.classList.add('icon-toggle-on');
							if(ielem.parentElement.parentElement.classList.contains('ptoggle'))
							{
								ielem.parentElement.parentElement.classList.add('ptoggle-active');
							}
						}else{
							ielem.classList.remove('icon-toggle-on');
							ielem.classList.add('icon-toggle-off');
							if(ielem.parentElement.parentElement.classList.contains('ptoggle'))
							{
								ielem.parentElement.parentElement.classList.remove('ptoggle-active');
							}
						}
					};
				}
		};
	});
	// p2ptm.directive('rtoggleme', function(){
	// 	return {
				
	// 			restrict: 'A',
	// 			require: 'ngModel',
	// 			link: function(scope, elm, attrs, ctrl) {
	// 				if(!ctrl || !elm.hasClass("toggle"))
	// 				{
	// 					return;
	// 				}
	// 				var ielem = elm[0].getElementsByTagName("i")[0];

	// 				// model -> view
	// 				ctrl.$render = function() {
	// 					if(ctrl.$viewValue)
	// 					{
	// 						ielem.classList.remove('icon-toggle-off');
	// 						ielem.classList.add('icon-toggle-on');
	// 					}else{
	// 						ielem.classList.remove('icon-toggle-on');
	// 						ielem.classList.add('icon-toggle-off');
	// 					}
	// 				};
	// 			}
	// 	};
	// });
	function createSettersProxy(string_name, object_setters, function_proxy)
	{
	    Object.keys(object_setters).forEach((property) => {
	        let descriptor = Object.getOwnPropertyDescriptor(object_setters, property);
	        if (typeof descriptor.set === 'function'
	        	&& property.indexOf("_orig_") < 0) 
	        {
	            // console.log("set is ", property);
	            let pxy_name = property +"_orig_";

	            if(!object_setters.hasOwnProperty(pxy_name))
	            {
		            Object.defineProperty(object_setters, pxy_name, descriptor);
		        }
		        let prop_path = string_name+"."+property;
		        let allows_get = typeof descriptor.get === 'function';
	            let proxy_f = function(v)
	            {
	            	function_proxy(prop_path, v, true);// PROXY SPEC SET
	            	object_setters[pxy_name] = v;
	            	if(allows_get)
	            	{
	            		function_proxy(prop_path, descriptor.get(), false);// PROXY SPEC GET
	            	}
	            };
	            Object.defineProperty(object_setters, property, {set: proxy_f});
	            if(allows_get)
	            {
	            	function_proxy(prop_path, descriptor.get(), false);
	            }
	        }
	    });
	}
	p2ptm.directive('inpkey', function(){
		return {				
			restrict: 'A',
				require: 'ngModel',
				link: function(scope, elm, attrs, ctrl) {
					if(!ctrl)
					{
						return;
					}
					var ielem = elm[0];
					
					elm.on('keydown', function(e) {
						// console.log(e)
				        scope.$apply(function() {
				          var key = e.ctrlKey ? "ctrl":(e.shiftKey ? "shift":(e.altKey ? "alt":""));
				          var kc = String.fromCharCode(e.keyCode).toLowerCase();
				          ctrl.$setViewValue((e.keyCode>18) ? (key.length===0 ? kc :(key+"+"+ kc )):key);
				          ctrl.$render();
				        });
				        e.preventDefault();return false;
				     });
					// model -> view
					ctrl.$render = function() {
						ielem.value = '"'+ctrl.$viewValue+'"';
					};
				}
		};
	});
	p2ptm.directive('inpkey', function(){
		return {				
			restrict: 'A',
				require: 'ngModel',
				link: function(scope, elm, attrs, ctrl) {
					if(!ctrl)
					{
						return;
					}
					var ielem = elm[0];
					
					elm.on('keydown', function(e) {
						// console.log(e)
				        scope.$apply(function() {
				          var key = e.ctrlKey ? "ctrl":(e.shiftKey ? "shift":(e.altKey ? "alt":""));
				          var kc = String.fromCharCode(e.keyCode).toLowerCase();
				          ctrl.$setViewValue((e.keyCode>18) ? (key.length===0 ? kc :(key+"+"+ kc )):key);
				          ctrl.$render();
				        });
				        e.preventDefault();return false;
				     });
					// model -> view
					ctrl.$render = function() {
						ielem.value = '"'+ctrl.$viewValue+'"';
					};
				}
		};
	});
	// p2ptm.filter('lang', function() {
	//     return function(input) {
	//     	var dict = "en";
	//     	var out = p2ptranslate.langs.getName(dict, input);
	//         return out;
	//     }
	// });

	// CONTROLLER 
    p2ptm.controller('mainCtrl', ['$scope', '$http', function mainCtrl($scope, $location) {
    	
    	$scope.langs = p2ptranslate.langs;
    	$scope.props = {
    		translateEvtType: 'h',

    		translateLNG_PREFER_TO: "ru",
    		translateLNG_PREFER_TO_ALT: "en",

    		translateEvtKeybrd: 'ctrl',
    		baloonLagMs: 700,
    		cpyClipboardEvtKeybrd: 'ckey',// ignore
    		cpyClipboardKey: 'ctrl'
    	};
    	$scope.settings = { 
    		get translateEvtKeybrd(){
    			return $scope.props.translateEvtKeybrd;
    		},
    		set translateEvtKeybrd(val){
    			$scope.props.translateEvtKeybrd = val;
    			this.pushCfg();
    		},

    		get baloonLagMs(){
    			return $scope.props.baloonLagMs;
    		},
    		set baloonLagMs(val){
    			if(typeof val === 'string')
    				val = parseInt(val);
    			$scope.props.baloonLagMs = val;
    			this.pushCfg();
    		},

    		get translateLNG_PREFER_TO(){
    			return $scope.props.translateLNG_PREFER_TO;
    		},
    		set translateLNG_PREFER_TO(val){
    			$scope.props.translateLNG_PREFER_TO = val;
    			this.pushCfg();
    		},

    		get translateLNG_PREFER_TO_ALT(){
    			return $scope.props.translateLNG_PREFER_TO_ALT;
    		},
    		set translateLNG_PREFER_TO_ALT(val){
    			$scope.props.translateLNG_PREFER_TO_ALT = val;
    			this.pushCfg();
    		},

    		get activateModeMouse() {
    			return $scope.props.translateEvtType === 'h';
    		}, 
    		set activateModeMouse(val){
    			$scope.props.translateEvtType = val?'h':'k';
    			this.pushCfg();
    		}, 
    		get activateModeKey() {
    			return $scope.props.translateEvtType === 'k';
    		}, 
    		set activateModeKey(val){
    			$scope.props.translateEvtType = val?'k':'h';
    			this.pushCfg();
    		},

    		get clipboarcpy() {return $scope.props.cpyClipboardEvtKeybrd === 'ckey'},
    		set clipboarcpy(val){
    			$scope.props.cpyClipboardEvtKeybrd = val?'ckey':'ignore'; 
    			this.pushCfg();},

    		get clipboardcpykey() {return $scope.props.cpyClipboardKey;},
    		set clipboardcpykey(val){
    			$scope.props.cpyClipboardKey = val; 
    			this.pushCfg();},

    		pushCfg: function () {
    			if(p2ptranslate.cfgSet)
    			{	
    				p2ptranslate.c.delay("cfgset", function(){
	    				p2ptranslate.cfgSet(JSON.stringify($scope.props));
	    				single.blinkSaved("behaviour");
	    			}, 1000);
    			}
    			else console.warn("p2ptranslate.cfgSet not initialised")
    		},

    		get view_howfast()
    		{
    			return ($scope.props.baloonLagMs*0.001).toFixed(1)+
    			loc_messages[4] + // "sec. "
    			".  " + $scope.howFast();
    		}
    	};

    	single.swag = function(){return [$scope.settings,$scope.props];}
    	window['single'] = single;

    	p2ptranslate.connect = function(fCfgGet, fCfgSet)
		{
			if(p2ptranslate.c.checkFunction(fCfgGet)
				|| p2ptranslate.c.checkFunction(fCfgSet))
			{
				throw new Error("fCfgGet or fCfgSet not function");
			}
			p2ptranslate.cfgGet = fCfgGet;
			p2ptranslate.cfgSet = fCfgSet;
			// console.log("p2ptranslate.cfgGet: ", p2ptranslate.cfgGet());
			copyProps(p2ptranslate.cfgGet());
		}
    	if(p2ptranslate.cfgGet)
    	{
    		copyProps(p2ptranslate.cfgGet(p2ptranslate));
    	}
    	function copyProps(objPrefs)
    	{
    		objPrefs = JSON.parse(objPrefs);
			for (var x in objPrefs) 
			{
				$scope.props[x] = objPrefs[x];
				// console.log("for",x,"set",$scope.props[x])
			};
			if(!$scope.$$phase) 
				$scope.$apply();

			p2ptranslate.c.delay("$showin", function()
				{
					document.getElementById("projects").style.display = "block";

				},100);
    	}
    	var loc_messages = ["So_Slow", "Slow", "Fast", "Super_Fast", "msec"];
    	document.l10n.formatValues.apply(document.l10n, loc_messages.map((e)=>[e]))
				.then((v)=>{
					loc_messages = v;
					// console.log(v)
				});
    	$scope.howFast = function()
    	{
    		if($scope.props.baloonLagMs - 1800 > 0)
    			return loc_messages[0]; //'So Slow';
    		if($scope.props.baloonLagMs - 1400 > 0)
    			return loc_messages[1]; //'Slow';
    		if($scope.props.baloonLagMs - 1000 > 0)
    			return loc_messages[2]; //'Fast';
    		
    		return loc_messages[3];// 'Super Fast';
    	}
    	$scope.slideBehaviour = function(){
			single.procedureLoading(true);
			single.procedureLoading(false);

			single.showProjects(true);
    	}
    	  	
    	$scope.slideBehaviour();
    }]);// ~controller
}());