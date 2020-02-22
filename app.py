from flask import Flask, render_template, url_for, copy_current_request_context, request, Response
from flask_socketio import SocketIO, emit
from threading import Thread, Event
import time
from time import sleep
import database as db
import json

app = Flask(__name__)
app.config["TOP_SECRET_KEY"] = "H4SH"
app.config["DEBUG"] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True

socketio = SocketIO(app, async_mode=None, logger=True, engineio_logger=True)

thread = Thread()
thread_stop_event = Event()

subscribers = {}
notifications = {}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/publish")
def admin():
    return render_template("publish.html")

def dispatchNotifications(publicationJSON:str):
    socketio.emit("publication", {"content":publicationJSON}, namespace="/")
    for subscriber in subscribers:
        if(shouldSaveNotification(subscribers[subscriber], publicationJSON)):
            notifications[subscriber].append(publicationJSON)
    
def shouldSaveNotification(subscriber, notification):
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

def isNotificationAboutSubscriber(subscriber, notification):
    if(notification["subscriberName"] == subscriber["subscriberName"]):
        return True


def isNotificationAboutSubscriberInterest(subscriber, notification):
   subTitles = subscriber["titles"].split(",")
   subTellers = subscriber["tellers"].split(",")
   subKeywords = subscriber["keywords"].split(",")

   subEmptyTitles = subscriber["titles"] == ""
   subEmptyTellers = subscriber["tellers"] == ""
   subEmptyKeywords = subscriber["keywords"] == ""

   conTitles = stringContainsAnyElementOf(notification["title"], subTitles)
   conTellers = stringContainsAnyElementOf(notification["teller"], subTellers)
   conKeywords = stringContainsAnyElementOf(notification["keyword"], subKeywords)

   satisfiesTitles = conTitles or subEmptyTitles
   satisfiesTellers = conTellers or subEmptyTellers
   satisfiesKeywords = conKeywords or subEmptyKeywords

   satisfiesAllCriteria = satisfiesTitles and satisfiesTellers and satisfiesKeywords

   return satisfiesAllCriteria


def stringContainsAnyElementOf(mainString, stringArray):
    output = False
    for subString in stringArray:
        if(mainString in subString.strip()):
            output = True
    return output

@app.route("/subscriber", methods=["GET"])
def subscriber():
    if( request.method == "GET"):
        subscriberName = request.args.get("subscriberName")
        if(subscriberName != None):
            return json.dumps(subscribers[subscriberName])
        else:
            return json.dumps(subscribers)

@app.route("/notification", methods=["GET"])
def notification():
    if( request.method == "GET"):
        subscriberName = request.args.get("subscriberName")
        if(subscriberName != None):
            return json.dumps(notifications[subscriberName])
        else:
            return json.dumps(notifications)

@app.route("/tell", methods=["POST"])
def tell():
    if( request.method == "POST"):
        print(request.get_json())
        dispatchNotifications(request.get_json())
        return ""

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

@socketio.on("subscriber", namespace="/")
def subscriptionRequest(payload):
    payload['sid'] = request.sid # Add SID to payload for simlier organization of data
    print("Client {0} made a request for {1}".format( request.remote_addr, payload) )
    subscribers[payload["subscriberName"]] = payload

    if(not payload["subscriberName"] in notifications):
        notifications[payload["subscriberName"]] = []

    dispatchNotifications(payload)

@socketio.on("connect", namespace="/")
def test_connect():
    global thread
    print("Client {0} Connected.".format( request.remote_addr))
    
@socketio.on("disconnect", namespace="/")
def test_disconnect():
    global thread
    print("Client {0} Disconnected.".format(request.remote_addr))

if __name__ == "__main__":
    print("Starting app...")
    db.createDatabase()
    app.run(host="127.0.0.1")