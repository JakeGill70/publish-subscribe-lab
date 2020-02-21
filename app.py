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

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/admin")
def admin():
    return render_template("admin.html")

def dispatchNotifications(tellJSON:str):
    socketio.emit("publication", {"content":tellJSON}, namespace="/")

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