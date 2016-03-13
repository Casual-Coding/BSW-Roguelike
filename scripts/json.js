JSON.toURL = function (object, download) {

    var string = JSON.stringify(object);
    var base64 = btoa(string);
    var url = "data:text/javascript;base64," + base64;

    if (download) {

        if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
            // http://stackoverflow.com/questions/3916191/download-data-url-file
            var link = document.createElement("a");
            link.download = download;
            link.href = url;
            link.target = '_blank';
        }
        else {
            window.open(url, '_blank');
        }

    }

    return url;

};