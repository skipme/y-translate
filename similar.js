// language detection errors
var famA = [ 
	['en', 'pl', 'cy', 'ca', 'ga', 'eo' ], 
	['ru', 'bg', 'tg', 'mk', 'be', 'uk'] 
];

var dict = {};

for (var i = 0; i < famA.length; i++) {
	var sims = famA[i];
	for (var j = 0; j < sims.length; j++) {
		for (var k = 0; k < sims.length; k++) {
			if(j === k)
				continue;
			if(dict[sims[j]] === undefined)
			{
				dict[sims[j]] = [];
			}
			if(dict[sims[j]].indexOf(sims[k]) < 0)
				dict[sims[j]].push(sims[k]);
		};
	};
};

function isSimilar (lngA, lngB) {
	var a = dict[lngA];
	if(a === undefined)
		return false;
	return a.indexOf(lngB) >= 0;
}
// exports.isSimilar = isSimilar;
var similar = {};
similar.isSimilar = isSimilar;
