// View
// Controller focused on human-computer interaction.
// Collects form data from the user.
// Mutates the HTML.
var view = {
    getSubscriberInfoFromForm : function(){
        // XXX: Requires that the form input's have the same name as a subscriber's attributes.
        // Get data from form
        let formData = formToObject.convert("#subscriptionRequest");
        // That data is a the same a subscriber object
        let subscriber = formData;
        return subscriber;
    },

    populateFormWithSubscriberInfo: function(subscriber){
        // Get subscriber information
        let subscriberName = subscriber.subscriberName;
        let titles = subscriber.titles;
        let tellers = subscriber.tellers;
        let keywords = subscriber.keywords;
        // Populate the form
        $("#subscriberName").val(subscriberName);
        $("#titles").val(titles);
        $("#tellers").val(tellers);
        $("#keywords").val(keywords);
    },

    openSubscriberNamePrompt: function(){
        return prompt("What is your subscriber name?");
    },

    updateNotificationTable: function(notifications){
        // Create the HTML for presenting all of the notifications
        let notificationString = "";
        for (let i = 0; i < notifications.length; i++) {
            notificationString = notificationString + "<p>" + notifications[i] + "</p>";
        }
        
        // Inject the HTML into the page
        $("#log").html(notificationString);
    },

    initJqueryHooks : function(){
        // Publish Subscriber Infomation
        $("#subscriptionRequest").on("submit", function(domEvent){domEvent.preventDefault(); connection.submitSubscriberInfo();});
    }
}
