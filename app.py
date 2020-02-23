from flask import Flask, render_template, url_for, copy_current_request_context, request, Response
from flask_socketio import SocketIO, emit
from threading import Thread, Event
import time
from time import sleep
import database as db
import json

# Flask configuration
app = Flask(__name__)
app.config["TOP_SECRET_KEY"] = "Tony$112358$Rice"
app.config["DEBUG"] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True

# Socket.io configuration
socketio = SocketIO(app, async_mode=None, logger=True, engineio_logger=True)

# Holds subscriber/subcription requests as an associative array of associative arrays.
subscribers = {}
# Holds notifions as an associative array of associative arrays.
notifications = {}

# Serves UI for subscriptions
@app.route("/")
def index():
    return render_template("index.html")

# Serves UI for publications/notifications
@app.route("/publish")
def admin():
    return render_template("publish.html")

# Broadcast new notifications
# Stores them with the appropriate subscribers/subscriptions
def dispatchNotifications(publicationJSON:str):
    socketio.emit("publication", {"content":publicationJSON}, namespace="/")
    for subscriber in subscribers:
        if(shouldSaveNotification(subscribers[subscriber], publicationJSON)):
            notifications[subscriber].append(publicationJSON)

# Determines if a notification/publication meets the subscriber's critia. 
def shouldSaveNotification(subscriber, notification):
    # Must use try-except's inplace of if-elif-else because requesting data
    # from an associative array with a key that does not exists throws a
    # KeyError exception.
    try:
        if(notification["subscriberName"] != None):
            print("Notification is about a subscriber.")
            return isNotificationAboutSubscriber(subscriber, notification)
    except KeyError as keSubName:
        try:
            if(notification["id"] != None):
                print("Notification is about a tell.")
                return isNotificationAboutSubscriberInterest(subscriber, notification)
        except KeyError as keId:
            print("Notification type is unknwon.")
            return False

# Determines if a notification is about a particular subscriber
def isNotificationAboutSubscriber(subscriber, notification):
    if(notification["subscriberName"] == subscriber["subscriberName"]):
        return True

# Determines if a notification meets a subscriber's criteria to be stored
def isNotificationAboutSubscriberInterest(subscriber, notification):
    # This method is also done client side because of broadcasting

    # Get a subscriber's criteria
    subTitles = subscriber["titles"].split(",")
    subTellers = subscriber["tellers"].split(",")
    subKeywords = subscriber["keywords"].split(",")

    # Determine if the subscriber does not have a preference for a particular criteria
    subEmptyTitles = subscriber["titles"] == ""
    subEmptyTellers = subscriber["tellers"] == ""
    subEmptyKeywords = subscriber["keywords"] == ""

    # Determine if the notification's attributes meet the subscriber's criteria
    conTitles = stringContainsAnyElementOf(notification["title"], subTitles)
    conTellers = stringContainsAnyElementOf(notification["teller"], subTellers)
    conKeywords = stringContainsAnyElementOf(notification["keyword"], subKeywords)

    # Determine if notification attributes that did not meet the subscriber's criteria
    # is because the subscriber did not have a preference for a particular criteria
    satisfiesTitles = conTitles or subEmptyTitles
    satisfiesTellers = conTellers or subEmptyTellers
    satisfiesKeywords = conKeywords or subEmptyKeywords

    # Determine if all of the subscriber's criteria has been met
    satisfiesAllCriteria = satisfiesTitles and satisfiesTellers and satisfiesKeywords

    return satisfiesAllCriteria

# Determines if any element inside of a list of strings is a substring to a particular string
def stringContainsAnyElementOf(mainString, stringArray):
    output = False
    for subString in stringArray:
        if(mainString in subString.strip()):
            output = True
    return output

# REST-API for subscriber/subscription info
@app.route("/subscriber", methods=["GET"])
def subscriber():
    if( request.method == "GET"):
        subscriberName = request.args.get("subscriberName")
        if(subscriberName != None):
            return json.dumps(subscribers[subscriberName])
        else:
            return json.dumps(subscribers)

# REST-API for notification info
@app.route("/notification", methods=["GET"])
def notification():
    if( request.method == "GET"):
        subscriberName = request.args.get("subscriberName")
        if(subscriberName != None):
            # If the client requested information about a specific subscriber
            try:
                # Return that subscriber's notifications
                return json.dumps(notifications[subscriberName])
            except KeyError as ke:
                # Return "none" if that subscriber does not exists
                return "{}"
        else:
            return json.dumps(notifications)

# REST-API for tell info
@app.route("/tell", methods=["POST"])
def tell():
    if( request.method == "POST"):
        print(request.get_json())
        dispatchNotifications(request.get_json())
        return ""

# REST-API for user info
@app.route("/user", methods=["POST", "GET"])
def user():
    if( request.method == "POST"):
        print(request.get_json())
        dispatchNotifications(request.get_json())
        return ""

    elif( request.method == "GET"):
        subscriberName = request.args.get("subscriberName")
        if(subscriberName in subscribers):
            return json.dumps(subscribers[subscriberName])
        return "none"

# Socket.IO event handler for new subscribers/subscription request
@socketio.on("subscriber", namespace="/")
def subscriptionRequest(payload):
    payload['sid'] = request.sid # Add SID to payload for simlier organization of data
    print("Client {0} made a request for {1}".format( request.remote_addr, payload) )
    subscribers[payload["subscriberName"]] = payload

    if(not payload["subscriberName"] in notifications):
        notifications[payload["subscriberName"]] = []

    dispatchNotifications(payload)

# Socket.IO event handler for when clients connect
@socketio.on("connect", namespace="/")
def test_connect():
    print("Client {0} Connected.".format( request.remote_addr))
    
# Socket.IO event handler for when clients disconnect
@socketio.on("disconnect", namespace="/")
def test_disconnect():
    print("Client {0} Disconnected.".format(request.remote_addr))

# Program entry point
if __name__ == "__main__":
    print("Starting app...")
    db.createDatabase()
    app.run(host="127.0.0.1")