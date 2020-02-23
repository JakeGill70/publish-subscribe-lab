// JQuery function that runs code as soon as a page has finished loading
// Program entry point for publishers
$( window ).on("load", function() {
    var currentDomainURL = "http://" + document.domain + ":" + location.port + "/";

    // Load additional scripts necessary to run
    // This method is preferred because it only requires a single reference inside of the HTML file.
    $.when(
        $.getScript(currentDomainURL+"static/js/utilities/formToObjectConverter.js"),
        $.getScript(currentDomainURL+"static/js/publisher/publisher.presenter.js"),
        $.getScript(currentDomainURL+"static/js/publisher/publisher.view.js")
    ).done(function(){
        // Code run inside of this anonymous function will be run as if the window had loaded the above scripts.
        
        // Initialize Objects
        view.initJqueryHooks();
        presenter.setView(view);

        // Auto-populate a new tell's ID with a random string
        view.setTellId(presenter.autoGenerateId());
    });

});




