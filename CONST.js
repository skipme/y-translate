window.CONST = 
{
	ACTION_B_BEEP: 0,
	ACTION_F_BEEP: 1,

	ACTION_F_Prefs: 3,
	ACTION_F_Urls: 4,
	ACTION_F_showTranslated: 5,
	ACTION_F_disable: 6,
	ACTION_F_enable: 7,

	ACTION_B_page_lng: 8,
	ACTION_B_scoped: 9,
	ACTION_B_setClipboard: 10,
	ACTION_B_translate: 11,
	ACTION_B_cfgSet: 12,
	ACTION_B_translatec: 13,

	ACTION_B_locData: 14,
	ACTION_B_openConfApp: 15,
	ACTION_B_openApp: 16,
	ACTION_B_disableUrl: 17,
	ACTION_B_setLngFrom: 18,

	ACTION_B_BEEPW: 19,

	ACTION_W_state: 20,
	ACTION_W_locStrings: 21,
	ACTION_W_locLangs: 22,
	ACTION_W_state: 23,

};
window.clone = function clone(o) {
 if(!o || 'object' !== typeof o)  {
   return o;
 }
 var c = 'function' === typeof o.pop ? [] : {};
 var p, v;
 for(p in o) {
 if(o.hasOwnProperty(p)) {
  v = o[p];
  if(v && 'object' === typeof v) {
    c[p] = clone(v);
  }
  else {
    c[p] = v;
  }
 }
}
 return c;
}
