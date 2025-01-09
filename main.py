from flask import request, Flask, jsonify, render_template
import sqlite3

misw = Flask(__name__)

def init_db():
    with sqlite3.connect('scores.db') as conn:
        conn.execute('CREATE TABLE IF NOT EXISTS scores (id INTEGER PRIMARY KEY, name TEXT, time TEXT)')
        conn.commit()

@misw.route('/submit-score', methods=['POST'])
def submit_score():
    data = request.json
    name = data['name']
    time = data['time']

    with sqlite3.connect('scores.db') as conn:
        conn.execute('INSERT INTO scores (name, time) VALUES (?, ?)', (name, time))
        conn.commit()

    # 순위 조회
    scores = conn.execute('SELECT name, time FROM scores ORDER BY time').fetchall()
    return jsonify(scores)

@misw.route('/get-scores', methods=['GET'])
def get_scores():
    with sqlite3.connect('scores.db') as conn:
        scores = conn.execute('SELECT name, time FROM scores ORDER BY time').fetchall()

    scores_list = [{"name": score[0], "time": score[1]} for score in scores]
    return jsonify(scores_list)

@misw.route("/")
def home():
    return render_template("load.html")

@misw.route("/mine1")
def game():
    return render_template("mine1.html")

if __name__ == '__main__':
    init_db()
    misw.run(host='0.0.0.0', debug=True,threaded=True)