from flask import Flask, jsonify, request
import json

app = Flask(__name__)


@app.route('/example1.json', methods=['GET'])
def kautex():
    with open('example1.json') as data_file:
        data = json.load(data_file)
    return jsonify(data)


@app.route('/example2.json', methods=['GET'])
def bell():
    with open('example2.json') as data_file:
        data = json.load(data_file)
    return jsonify(data)


if __name__ == "__main__":
    # main()
    app.run(debug=True, port=8000)
