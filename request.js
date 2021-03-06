 function createGETUrl(url, data) 
 {
        url = url + "?";
        var arrx = [];
        for (var k in data) 
        {
            if(Array.isArray(data[k]))
            {
                for(var j = 0; j < data[k].length; j++) arrx.push(k + '=' + data[k][j]);
            }
            else
            {
                arrx.push(k + '=' + data[k]);
            }
        }
        return url+arrx.join("&");
}
function request(succ, err, data, url) 
{
    var request = new XMLHttpRequest();

    url = createGETUrl(url, data);
    request.open("GET", url, true);
    //request.responseType = "json";// firefox, opera only

    request.onerror = function () 
    {
        if (err)
            err();
    };
    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            //succ(request.response);// firefox, opera only
            var json;
            try {
                json = JSON.parse(request.responseText);
                succ({status: request.status, text: request.responseText, json: json});
            }
            catch (e) {
                err();
            }
        }
    };

    request.send();

}