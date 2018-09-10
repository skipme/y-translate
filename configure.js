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

	// MODULE 
	var p2ptm = angular.module('p2ptm', [/*'ngAnimate'*/]);
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
    p2ptm.directive('contenteditable', function() {
	  return {
	    require: 'ngModel',
	    link: function(scope, elm, attrs, ctrl) {
	      // view -> model
	      elm.on('blur', function() {
	        scope.$apply(function() {
	          var vx = p2ptranslate.c.convHtml2PT(elm.html());
	          ctrl.$setViewValue(vx);
	          elm.html(p2ptranslate.c.convPT2Html(vx));
	        });
	      });

	      // model -> view
	      ctrl.$render = function() {
	        elm.html(p2ptranslate.c.convPT2Html(ctrl.$viewValue));
	      };
	    }
	  };
	});
	var animLabelDirFactory = ["$compile", function($compile) {
		return {
			restrict: 'E',
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
	p2ptm.directive('textarea', animLabelDirFactory);
	p2ptm.directive('toggleme', function(){
		return {
				restrict: 'A',
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
	p2ptm.directive('rtoggleme', function(){
		return {
				
				restrict: 'A',
				require: 'ngModel',
				link: function(scope, elm, attrs, ctrl) {
					if(!ctrl || !elm.hasClass("toggle"))
					{
						return;
					}
					var ielem = elm[0].getElementsByTagName("i")[0];

					// model -> view
					ctrl.$render = function() {
						if(ctrl.$viewValue)
						{
							ielem.classList.remove('icon-toggle-off');
							ielem.classList.add('icon-toggle-on');
						}else{
							ielem.classList.remove('icon-toggle-on');
							ielem.classList.add('icon-toggle-off');
						}
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
	// filters
	p2ptm.filter('sentenceConditions', function() {
	    return function(input, b,h) {
	    	if(input === undefined || input === null || input.length === undefined || input.length === null)
	    		return input;
	        var out = [];
	        for (var i = 0; i < input.length; i++) {
	            if(!input[i].isBlank && !input[i].isHidden){
	                out.push(input[i]);
	            }else if((input[i].isBlank && b) || (input[i].isHidden && h))
	            {
	            	out.push(input[i]);
	            }
	        }
	        return out;
	    }
	});
	p2ptm.filter('lang', function() {
	    return function(input) {
	    	var dict = "en";
	    	var out = p2ptranslate.langs.getName(dict, input);
	        return out;
	    }
	});

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
    	}
    	$scope.howFast = function()
    	{
    		if($scope.props.baloonLagMs - 1800 > 0)
    			return 'So Slow';
    		if($scope.props.baloonLagMs - 1400 > 0)
    			return 'Slow';
    		if($scope.props.baloonLagMs - 1000 > 0)
    			return 'Fast';
    		
    		return 'Super Fast';
    	}
    	$scope.slideBehaviour = function(){
			single.procedureLoading(true);
			single.procedureLoading(false);

			single.showProjects(true);
    	}
    	  	
    	$scope.slideBehaviour();
    }]);// ~controller
}());