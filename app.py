from flask import Flask, render_template, url_for, copy_current_request_context, request, Response
from flask_socketio import SocketIO, emit
from threading import Thread, Event
import time
from time import sleep


app = Flask(__name__)
app.config["TOP_SECRET_KEY"] = "H4SH"
app.config["DEBUG"] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True

conn = None
cursor = None

socketio = SocketIO(app, async_mode=None, logger=True, engineio_logger=True)

thread = Thread()
thread_stop_event = Event()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/admin")
def admin():
    return render_template("admin.html")

@app.route("/tell", methods=["POST"])
def tell():
    if( request.method == "POST"):
        print("=======")
        print(request.get_json())
        print("=======")
        return Response(status=200)

def randomNumberGenerator():
    while not thread_stop_event.isSet():
        number = 3
        socketio.emit('newnumber', {'number':number}, namespace="/test")
        socketio.sleep(5)

@socketio.on("my event")
def test_message(msg):
    emit("my response", {"data": "got it!"})

@socketio.on("connect", namespace="/test")
def test_connect():
    global thread
    print("Client {0} Connected.", request.remote_addr)

    if not thread.isAlive():
        print("Starting thread...")
        thread = socketio.start_background_task(randomNumberGenerator)
    
@socketio.on("disconnect", namespace="/test")
def test_disconnect():
    global thread
    print("Client {0} Disconnected.", request.remote_addr)


if __name__ == "__main__":
    print("Starting app...")
    app.run(host="127.0.0.1")