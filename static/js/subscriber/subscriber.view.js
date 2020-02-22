// View
// Controller focused on human-computer interaction.
// Collects form data from the user.
// Mutates the HTML.
var view = {
    getSubscriberInfoFromForm : function(){
        // Get data from form
        let formDataRaw = $("#subscriptionRequest").serializeArray();
        // Format it into a single JS object
        let formData = this.convertFormArrayToAssociativeArray(formDataRaw);
        // Create a subscriber
        // Not strictly necessary, but I (Jake Gillenwater), feel like this line helps with readability
        let subscriber = Subscriber(); 
        // XXX: Form input's must be named the same as subscriber attributes
        subscriber = formData;
        return subscriber;
    },

    convertFormArrayToAssociativeArray: function(formArray){
        let formDataFormatted = {};
        formArray.forEach(input => {
            formDataFormatted[input.name] = input.value
        });
        return formDataFormatted
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
        $("#subscriptionRequest").on("submit", function(domEvent){connection.submitSubscriberInfo(domEvent)});
    }
}
