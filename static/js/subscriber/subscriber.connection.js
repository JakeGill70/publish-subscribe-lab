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

    getSubscriberNotificationsFromServer : function(subscriberName){
        let notifications = []
        let payload = {"subscriberName":subscriberName}
        $.ajax({
            async:false,
            url:"./notification",
            type:"GET",
            contentType:"application/json; charset=utf-8",
            data:payload,
            success:function(response){
                // If the user has an active subscription
                if(response != "none"){
                    notifications = JSON.parse(response);
                }
                // console.log(["+++", subscriber, "+++"]);
                // populateFormWithSubscriberInfo(subscriber);
            }
        })
        return notifications;
    },

    submitSubscriberInfo: function(){
        // Get the latest info from the form
        let subscriber = this.view.getSubscriberInfoFromForm();
        // Update the local model
        this.subscriber = subscriber;
        // Send form data to the server as JSON
        this.socket.emit("subscriber", subscriber);
    }
};
