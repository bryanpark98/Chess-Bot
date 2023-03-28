from flask import Flask, Response
from flask_cors import CORS


class _EndpointAction(object):
    def __init__(self, action):
        self.action = action

    def __call__(self, *args):
        answer = self.action()
        # Create the answer (bundle it in a correctly formatted HTTP answer)
        self.response = Response(answer, status=200, headers={
                                 'content-type': 'application/json'})
        # Send it
        return self.response


class FlaskAppWrapper(object):
    app = None

    def __init__(self, name):
        self.app = Flask(name)
        CORS(self.app)

    def add_endpoint(self, endpoint=None, endpoint_name=None, handler=None):
        self.app.add_url_rule(endpoint, endpoint_name,
                              _EndpointAction(handler))
