// Presenter
// Controller focused on interaction between the connection and the view.
var notificationService = {
    view: {},
    notificationsReceived: [],

    setView: function(v){
        this.view = v;
    },

    notificationReceived: function(notification, subscriber){
        
        if(notification.content.subscriberName != undefined){
            this.notificationAboutASubscriber(notification, subscriber);
        }
        else if(notification.content.id != undefined){
            this.notificationAboutATell(notification, subscriber);
        }
        else{
            console.error(["Publication type is unknown to the notification service", notification]);
        }
    },

    notificationAboutASubscriber: function(notification, subscriber){
        // Add the new notification if it updates the current subscriber information
        if(notification.content.subscriberName == subscriber.subscriberName){
            this.notificationsReceived.push(JSON.stringify(notification.content));
            this.view.updateNotificationTable(this.notificationsReceived)
        }
    },

    notificationAboutATell: function(notification, subscriber){
        // Add the new notification if it is about something that I have subscribed to
        // Get subscriber information
        let subTitles = subscriber.titles.split(",");
        let subTellers = subscriber.tellers.split(",");
        let subKeywords = subscriber.keywords.split(",");
        // Determine if the subscriber doesn't care about a particular datapoint
        let subEmptyTitles = subscriber.titles=="";
        let subEmptyTellers = subscriber.tellers=="";
        let subEmptyKeywords = subscriber.keywords=="";
        // Determine if the notification is about the subscriber's interest
        let conTitles = notification.content.title.containsAnyElementOf(subTitles);
        let conTellers = notification.content.teller.containsAnyElementOf(subTellers);
        let conKeywords = notification.content.keyword.containsAnyElementOf(subKeywords);
        
        // Determine if their was a false negative because the subscriber
        // did not care about a particular attribute
        let satisfiesTitles = conTitles || subEmptyTitles;
        let satisfiesTellers = conTellers || subEmptyTellers
        let satisfiesKeywords = conKeywords || subEmptyKeywords;
        // Determine to display the notification
        let shouldDisplay = satisfiesTitles && satisfiesTellers && satisfiesKeywords;
        // TODO: Remove this debug-info 
        // UN-Comment for Debug-Info
        console.log([   "subs", subTitles, subTellers, subKeywords,
                        "empty", subEmptyTitles, subEmptyTellers, subEmptyKeywords,
                        "content", notification.content.title, notification.content.teller, notification.content.keyword,
                        "contains", conTitles, conTellers, conKeywords, 
                        "results", satisfiesTitles, satisfiesTellers, satisfiesKeywords])
        if(shouldDisplay){
            this.notificationsReceived.push(JSON.stringify(notification.content));
            this.view.updateNotificationTable(this.notificationsReceived);
        }
    }
}
