// Taken from the following URL on 11/10/19
// https://html-online.com/articles/get-url-parameters-javascript/

function getURLparams() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}