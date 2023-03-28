import chess
import numpy as np
from core.chess_bot import ChessBot, Action


class Random(ChessBot):
    def __init__(self):
        pass

    def act(self, fen):
        board = chess.Board(fen)
        random_move = np.random.choice(list(board.legal_moves), 1)[0].uci()
        return Action(random_move)


simon = Random()
simon.serve(8001)
