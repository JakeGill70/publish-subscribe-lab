// Presenter
// Controller focused on interaction between the connection and the view.
var notificationService = {
    view: {},
    notificationsReceived: [],

    setView: function(v){
        this.view = v;
    },

    notificationReceived: function(publication, subscriber){
        
        if(publication.content.subscriberName != undefined){
            this.notificationAboutASubscriber(publication, subscriber);
        }
        else if(publication.content.id != undefined){
            this.notificationAboutTell(publication, subscriber);
        }
        else{
            console.error(["Publication type is unknown to the notification service", publication]);
        }
    },

    notificationAboutASubscriber: function(publication, subscriber){
        // Add the new notification if it updates the current subscriber information
        if(publication.content.subscriberName == subscriber.subscriberName){
            this.notificationsReceived.push(JSON.stringify(publication.content));
            this.view.updateNotificationTable(this.notificationsReceived)
        }
    },

    notificationAboutTell: function(publication, subscriber){
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
        let conTitles = publication.content.title.containsAnyElementOf(subTitles);
        let conTellers = publication.content.teller.containsAnyElementOf(subTellers);
        let conKeywords = publication.content.keyword.containsAnyElementOf(subKeywords);
        
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
                        "content", publication.content.title, publication.content.teller, publication.content.keyword,
                        "contains", conTitles, conTellers, conKeywords, 
                        "results", satisfiesTitles, satisfiesTellers, satisfiesKeywords])
        if(shouldDisplay){
            this.notificationsReceived.push(JSON.stringify(publication.content));
            this.view.updateNotificationTable(this.notificationsReceived);
        }
    }
}
