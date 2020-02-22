// Data Model
// Information holder about the local subscriber
function Subscriber(name="new"){
    this.subscriberName=name;
    this.titles="";
    this.tellers="";
    this.keywords="";
    this.sid="";
};

// Presenter
// Controller focused on interaction between the notificationService and the server.
// Does collect some form data from the view.
var connection = {
    // Socket.io connection used to communicate with the server
    socket: {},
    view: {},
    notificationService: {},
    subscriber : new Subscriber(),

    setView: function(v){
        this.view = v;
    },

    setNotificationService: function(ns){
        this.notificationService = ns;
    },

    // Connects to a server then automatically establishes socket event hooks
    connect: function(url){
        this.socket = io.connect(url);
        this.initSocketEventHooks();
    },

    initSocketEventHooks : function(){
        var self = this; // Store a reference to "this" object because of the contextual nature of JS's "this" keyword
        this.socket.on("publication", function(publication) { self.notificationReceived(publication);});
    },

    notificationReceived: function(publication){
        
        notificationService.notificationReceived(publication, this.subscriber);
    },

    getSubscriberInfoFromServer : function(subscriberName){
        let subsciberInfo = new Subscriber(subscriberName);
        let payload = {"subscriberName":subscriberName}
        $.ajax({
            async:false,
            url:"./user",
            type:"GET",
            contentType:"application/json; charset=utf-8",
            data:payload,
            success:function(response){
                // If the user has an active subscription
                if(response != "none"){
                    subsciberInfo = JSON.parse(response);
                }
                // console.log(["+++", subscriber, "+++"]);
                // populateFormWithSubscriberInfo(subscriber);
            }
        })
        return subsciberInfo;
    },

    submitSubscriberInfo: function(domEvent){
        // Prevent the form submission from refreshing the page
        domEvent.preventDefault();

        let subscriber = this.view.getSubscriberInfoFromForm();
        
        // Send form data to the server as JSON
        this.socket.emit("subscriber", subscriber);
    }
};

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

    notificationAboutASubscriber(publication, subscriber){
        // Add the new notification if it updates the current subscriber information
        if(publication.content.subscriberName == subscriber.subscriberName){
            this.notificationsReceived.push(JSON.stringify(publication.content));
            this.view.updateNotificationTable(this.notificationsReceived)
        }
    },

    notificationAboutTell(publication, subscriber){
        console.log("notifRecTell");
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
        console.log(notifications);
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

// Program entry point
$(window).on("load", function(){

    // Initialize the 3 main objects
    view.initJqueryHooks();
    notificationService.setView(view);
    connection.setView(view);
    connection.setNotificationService(notificationService);

    // Establish a connection with the server
    connection.connect("http://" + document.domain + ":" + location.port + "/")
    
    // Setup the local subscription
    let subscriberName = view.openSubscriberNamePrompt();
    connection.subscriber = connection.getSubscriberInfoFromServer(subscriberName);
    console.log([subscriberName, connection.subscriber]);

    view.populateFormWithSubscriberInfo(connection.subscriber);
    
});

// Extends the String prototype for use in the notification service.
// Determines if a string contains any substring in a list of potential substrings.
String.prototype.containsAnyElementOf = function(strArray){
    let output = false;
    // Store what "this" is because of the contextual nature of "this" keyword in JS.
    let thisString = this.valueOf();

    strArray.forEach(subString => {
        subsString = $.trim(subString);
        console.log([thisString, subString]);
        if(subString !== "" && thisString.indexOf(subString) > -1){
            output = true;
        }
    });
    return output;
}