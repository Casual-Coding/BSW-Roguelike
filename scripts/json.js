JSON.saveAs = function (object, download) {

    var string = JSON.stringify(object);

    if (download) {
        window.saveTextAs(string, download, "text/plain;charset=utf-8");
    }

    return string;

};