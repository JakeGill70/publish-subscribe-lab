import sqlite3
databaseName = "ISC.db"

def addTell(id, teller, title, keyword):
    conn = sqlite3.connect(databaseName)
    c = conn.cursor()
    query = "INSERT INTO tell (id, teller, title, keyword) VALUES (?, ?, ?, ?);"
    data = (id, teller, title, keyword)
    c.execute(query, data)
    conn.commit()
    conn.close()

def addUser(firstName, lastName, isTeller=False):
    conn = sqlite3.connect(databaseName)
    c = conn.cursor()
    query = "INSERT INTO user (first_name, last_name, isTeller) VALUES (?, ?, ?);"
    data = (firstName, lastName, isTeller)
    c.execute(query, data)
    conn.commit()
    conn.close()

# Creates a simple test database with some mock data using SQLite
def createDatabase():
    conn = sqlite3.connect(databaseName)
    c = conn.cursor()

    # If the tables already exists, delete them
    c.execute("DROP TABLE IF EXISTS keywordSubscription")
    c.execute("DROP TABLE IF EXISTS tellerSubscription")
    c.execute("DROP TABLE IF EXISTS user")
    c.execute("DROP TABLE IF EXISTS tell")

    # Create table for managing subscriptions for certain keywords
    c.execute(''' CREATE TABLE keywordSubscription
    (subscriber INTEGER,
    keywords TEXT,
    FOREIGN KEY(subscriber) REFERENCES user(rowid) );''')

    # Create table for managing subscriptions between users
    c.execute(''' CREATE TABLE tellerSubscription
    (subscriber INTEGER,
    teller INTEGER,
    FOREIGN KEY(subscriber) REFERENCES user(rowid),
    FOREIGN KEY(teller) REFERENCES user(rowid) );''')

    # Create user table
    c.execute('''CREATE TABLE user 
        (firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        isTeller BOOLEAN);''')

    # Create tell table
    c.execute('''CREATE TABLE tell 
        (id INTEGER NOT NULL,
        teller INTEGER NOT NULL,
        title TEXT,
        keyword TEXT,
        FOREIGN KEY(teller) REFERENCES user(rowid) );''')

    conn.commit()

    conn.close()