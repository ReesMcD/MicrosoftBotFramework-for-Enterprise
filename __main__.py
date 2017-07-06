from flask import Flask, jsonify, request
import json

app = Flask(__name__)




@app.route('/', methods=['GET'])
def init():
    with open('example.json') as data_file:
        data = json.load(data_file)
    # data = 'Hello world'
    return jsonify(data)


if __name__ == "__main__":
    # main()
    app.run(debug=True, port=8080)