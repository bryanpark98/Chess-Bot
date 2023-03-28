import chess
import random
import numpy as np
from core.chess_bot import ChessBot, Action


class Simon(ChessBot):
    def __init__(self):
        pass

    def act(self, fen):
        def score_board(board: chess.Board):
            board_value = 0
            for piece in board.piece_map().values():
                value = 0
                if piece.piece_type == 1:
                    value = 1
                elif piece.piece_type == 2 or piece.piece_type == 3:
                    value = 3
                elif piece.piece_type == 4:
                    value = 5
                elif piece.piece_type == 5:
                    value = 9
                value = value * (-1 if piece.color == chess.BLACK else 1)
                board_value += value
            return board_value + random.random()

        def minimax(board: chess.Board, depth, maximizing_player):
            outcome = board.outcome()
            if outcome is not None:
                if (outcome.winner == chess.WHITE):
                    return 9999
                if (outcome.winner == chess.BLACK):
                    return -9999
                return 0
            if depth == 0:
                return score_board(board)

            if maximizing_player:
                max_value = float("-inf")
                for action in board.legal_moves:
                    new_board = board.copy(stack=False)
                    new_board.push(action)
                    value = minimax(new_board, depth - 1, False)
                    max_value = max(max_value, value)
                return max_value
            else:
                min_value = float("inf")
                for action in board.legal_moves:
                    new_board = board.copy(stack=False)
                    new_board.push(action)
                    value = minimax(new_board, depth - 1, True)
                    min_value = min(min_value, value)
                return min_value

        board = chess.Board(fen)
        actions = list(board.legal_moves)
        values = []
        for action in actions:
            new_board = board.copy(stack=False)
            new_board.push(action)
            values.append(minimax(new_board, 2, board.turn == chess.BLACK))
        # print(np.stack((values, actions), axis=1))

        action = (actions[np.argmax(values)] if board.turn ==
                  chess.WHITE else actions[np.argmin(values)]).uci()
        return Action(action)


simon = Simon()
simon.serve(8000)
