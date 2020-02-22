// Program entry point for Subscribers
$(window).on("load", function(){
    var currentDomainURL = "http://" + document.domain + ":" + location.port + "/";

    // Load additional scripts necessary to run
    // This method is preferred because it only requires a single reference inside of the HTML file.
    $.when(
        $.getScript(currentDomainURL+"static/js/utilities/string.extended.js"),
        $.getScript(currentDomainURL+"static/js/utilities/formToObjectConverter.js"),
        $.getScript(currentDomainURL+"static/js/subscriber/subscriber.data.js"),
        $.getScript(currentDomainURL+"static/js/subscriber/subscriber.connection.js"),
        $.getScript(currentDomainURL+"static/js/subscriber/subscriber.notificationService.js"),
        $.getScript(currentDomainURL+"static/js/subscriber/subscriber.view.js")
    ).done(function(){
        // Code run inside of this anonymous function will be run as if the window had loaded the above scripts.
        
        // Initialize the 3 main objects
        view.initJqueryHooks();
        notificationService.setView(view);
        connection.setView(view);
        connection.setNotificationService(notificationService);

        // Establish a connection with the server
        connection.connect(currentDomainURL)
        
        // Setup the local subscription
        let subscriberName = view.openSubscriberNamePrompt();
        connection.subscriber = connection.getSubscriberInfoFromServer(subscriberName);

        view.populateFormWithSubscriberInfo(connection.subscriber);
    }) 
});

