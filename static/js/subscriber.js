// Data Model
function Subscriber(name="new"){
    this.subscriberName=name;
    this.titles="";
    this.tellers="";
    this.keywords="";
    this.sid="";
};

// Presenter
var connection = {
    // Socket.io connection used to communicate with the server
    socket: {},
    notificationService: {},
    subscriber = Subscriber(),

    setNotificationService: function(ns){
        this.notificationService = ns;
    },

    // Connects to a server then automatically establishes socket event hooks
    connect: function(url){
        this.socket = io.connect(url);
        this.initSocketEventHooks();
    },

    initSocketEventHooks : function(){
        socket.on("publication", this.notificationReceived(publication));
    },

    notificationReceived: function(publication){
        notificationService.notificationsReceived(publication, this.subscriber);
    },

    getSubscriberInfoFromServer : function(subscriberName){
        let subsciberInfo = Subscriber(subscriberName);
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
        return subsciberInfo();
    },

    openSubscriberNamePrompt: function(){
        return prompt("What is your subscriber name?");
    },

    submitSubscriberInfo: function(domEvent){
        // Prevent the form submission from refreshing the page
        domEvent.preventDefault();

        let subscriber = view.getSubscriberInfoFromForm();
        
        // Send form data to the server as JSON
        this.socket.emit("subscriber", subscriber);
    }
};

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
            this.notificationAboutTell(publication);
        }
        else{
            console.error(["Publication type is unknown to the notification service", publication]);
        }
    },

    notificationAboutASubscriber(publication, subscriber){
        // Add the new notification if it updates the current subscriber information
        if(publication.content.subscriberName == subscriber.subscriberName){
            notificationsReceived.push(content_string);
            this.view.updateNotificationTable(notificationsReceived)
        }
    },

    notificationAboutTell(publication, subscriber){
        // Add the new notification if it is about something that I have subscribed to
        // Get subscriber information
        let subTitles = subscriber.titles.split(",");
        let subTellers = subscriber.tellers.split(",");
        let subKeywords = subscriber.keywords.split(",");
        // Determine if the notification is about the subscriber's interest
        let conTitles = publication.content.title.containsAnyElementOf(subTitles);
        let conTellers = publication.content.teller.containsAnyElementOf(subTellers);
        let conKeywords = publication.content.keyword.containsAnyElementOf(subKeywords);
        // Determine if their was a false negative because the subscriber
        // did not care about a particular attribute
        let satisfiesTitles = conTitles || subscriber.titles=="";
        let satisfiesTellers = conTellers || subscriber.tellers=="";
        let satisfiesKeywords = conKeywords || subscriber.keywords=="";
        if(satisfiesTitles && satisfiesTellers && satisfiesKeywords){
            notificationsReceived.push(content_string);
            this.view.updateNotificationTable(this.notificationReceived)
        }
    }
}

// View
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
        let subscriberName = subscriber.subscriberName;
        let titles = subscriber.titles;
        let tellers = subscriber.tellers;
        let keywords = subscriber.keywords;
        $("#subscriberName").val(subscriberName);
        $("#titles").val(titles);
        $("#tellers").val(tellers);
        $("#keywords").val(keywords);
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
        $("#subscriptionRequest").on("submit", connection.submitSubscriberInfo());
    }
}

$(document).ready(function(){

    connection.connect("http://" + document.domain + ":" + location.port + "/")

    getSubscriberInfo(subscriberName);

    
});


String.prototype.containsAnyElementOf = function(strArray){
    let output = false
    strArray.forEach(subString => {
        subsString = $.trim(subString);
        if(subString !== "" && this.indexOf(subString > -1)){
            output = true;
        }
    });
    return output;
}