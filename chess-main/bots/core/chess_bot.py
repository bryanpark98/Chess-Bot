
import json
from core.flask_wrapper import FlaskAppWrapper
from flask import request


class Action:
    def __init__(self, action: str):
        self.action = action

    def serialize(self):
        return json.dumps({"action": self.action})


class ChessBot:
    def train(self) -> None:
        """Load in the file for extracting text."""
        pass

    def act(self, fen: str) -> Action:
        """Extract text from the currently loaded file."""
        pass

    def action_handler(self):
        args = request.args
        fen = args.get("fen", default="", type=str).replace("+", " ")
        action = self.act(fen)
        print("taking action: " + action.action)
        return action.serialize()

    def serve(self, port: int):
        a = FlaskAppWrapper('bot-' + str(port))
        a.add_endpoint(endpoint='/action',
                       endpoint_name='action', handler=self.action_handler)
        a.app.run(host="localhost", port=port, debug=True)
