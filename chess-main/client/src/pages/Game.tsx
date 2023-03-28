import React, { useEffect, useState, useRef, useCallback, FormEvent } from 'react';
import Chessboard from 'chessboardjsx';
import { Chess as ChessGame, Square, Color } from 'chess.js';
import axios from 'axios';
import Console from '../components/Console';

// TODO: different colors for different parties
// TODO: undo
// BUG: reset during two bot game does not work

const STARTING_POSITION_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const game = new ChessGame();

function Chess() {
  const [fen, setFen] = useState('start');
  const [orientation, setOrientation] = useState<Color>('w');
  const [moveDelay, setMoveDelay] = useState(400);
  const [paused, setPaused] = useState(false);
  const [pendingMove, setPendingMove] = useState(false);

  // empty if human player
  const [whiteAddress, setWhiteAddress] = useState('');
  const [blackAddress, setBlackAddress] = useState('');

  const [output, setOutput] = useState<string[]>([]);

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView();
  };

  const writeOutput = (message: string) => {
    setOutput((output) => [...output, message]);
  };

  const botCanMove = (turn: Color, whiteAddress: string, blackAddress: string) => {
    return (game.turn() === 'w' && whiteAddress) || (game.turn() === 'b' && blackAddress);
  };

  const processInput = async (input: string) => {
    if (input === 'help') {
      writeOutput('| reset - resets game');
      writeOutput('| flip - flips board');
      writeOutput('| set [w/b] [address/human] - sets player to address');
      writeOutput('| set delay [delay_in_ms] - sets bot move delay');
      writeOutput('| pause - pauses bot action');
      writeOutput('| resume - resumes bot action');
      writeOutput('| retry - retries bot action');
    } else if (input === 'reset') {
      resetGame();
      writeOutput('game was reset');
    } else if (input === 'flip') {
      flipBoard();
      writeOutput('flipped board, enjoy');
    } else if (/set (b|w) .*/g.test(input)) {
      const splitInput = input.split(' ');
      const player = splitInput[1] as Color;
      const address = splitInput[2];

      if (address === 'human') {
        if (player === 'w') {
          setWhiteAddress('');
        } else {
          setBlackAddress('');
        }
        writeOutput(`set ${player} as human player`);
        return;
      }

      // TODO: this is too trustful of the address
      try {
        await setAddressFactory(player)(address);
        writeOutput(`success, ${address} looks healthy!`);
      } catch (error) {
        console.error(error);
        writeOutput(JSON.stringify(error));
      }
    } else if (input === 'step') {
      if (!botCanMove(game.turn(), whiteAddress, blackAddress)) {
        writeOutput("cannot step, it is not a bot's turn");
      } else if (!paused) {
        writeOutput('cannot step, game is not paused');
      } else {
        takeBotTurn();
      }
    } else if (/set delay \d*/g.test(input)) {
      setMoveDelay(parseInt(input.split(' ')[2]));
      writeOutput(`updated bot move delay`);
    } else if (input === 'retry') {
      if (!whiteAddress && !blackAddress) {
        writeOutput('no bot is active, cannot retry');
        return;
      }
      writeOutput('retrying bot action');
      await takeBotTurn();
    } else if (input === 'pause') {
      writeOutput('game paused');
      setPaused(true);
    } else if (input === 'resume') {
      if (!paused) {
        writeOutput('game is not paused, cannot resume');
        return;
      }
      if (!whiteAddress && !blackAddress) {
        writeOutput('game resumed but no bot is active');
      } else {
        writeOutput('game resumed');
      }
      setPaused(false);
    } else if (input === 'fen') {
      writeOutput(game.fen());
    } else if (input === 'undo') {
      game.undo();
      setFen(game.fen());
    } else {
      writeOutput('command not recognized');
    }
  };

  const setAddressFactory = (color: Color) => {
    return async (address: string) => {
      // Bot health check
      await requestBotAction(address, STARTING_POSITION_FEN);

      const addressSetter = color === 'w' ? setWhiteAddress : setBlackAddress;
      addressSetter(() => address);
    };
  };

  const resetGame = () => {
    game.reset();
    setFen(game.fen());
  };

  const flipBoard = () => {
    if (orientation === 'w') {
      setOrientation('b');
    } else {
      setOrientation('w');
    }
  };

  const isTerminalState = useCallback(() => {
    if (game.isDraw()) {
      writeOutput('game drawn');
    } else if (game.isCheckmate()) {
      writeOutput(`checkmate, ${game.turn()} wins`);
    } else {
      return false;
    }
    return true;
  }, []);

  const requestBotAction = async (address: string, fen: string) => {
    let formattedAddress =
      address.slice(-1) === '/' ? address.substring(0, address.length - 1) : address;
    if (formattedAddress.startsWith('localhost')) {
      formattedAddress = 'http://' + formattedAddress;
    } else if (!isNaN(parseInt(formattedAddress))) {
      formattedAddress = 'http://localhost:' + parseInt(formattedAddress);
    }
    const response = await axios.get(`${formattedAddress}/action?fen=${fen.replace(/\s/g, '+')}`);
    const data = response.data;
    return data.action;
  };

  const takeBotTurn = useCallback(async () => {
    if (botCanMove(game.turn(), whiteAddress, blackAddress)) {
      if (isTerminalState()) return;
      try {
        setPendingMove(true);
        const action = await requestBotAction(
          game.turn() === 'w' ? whiteAddress : blackAddress,
          game.fen()
        );
        const turn = game.turn();
        const move = game.move(action);
        await new Promise((r) => setTimeout(r, moveDelay));
        setFen(game.fen());
        writeOutput(`${turn}: ${move.lan}`);
      } catch (error) {
        console.error(error);
        writeOutput(JSON.stringify(error));
      }
      setPendingMove(false);
    }
  }, [blackAddress, whiteAddress, moveDelay, isTerminalState]);

  const takeHumanMove = async ({
    sourceSquare,
    targetSquare
  }: {
    sourceSquare: Square;
    targetSquare: Square;
  }) => {
    if (isTerminalState()) return;
    try {
      const turn = game.turn();
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // default to queen promotion for player
      });
      setFen(game.fen());
      writeOutput(`${turn}: ${move.lan}`);
    } catch (error) {
      // invalid move
      console.error(error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [output]);

  // Take bot turn whenever assigned to bot or whenever board changes
  useEffect(() => {
    const tryBotMove = async () => {
      if (paused || pendingMove) return;
      await takeBotTurn();
    };
    tryBotMove();
  }, [whiteAddress, blackAddress, fen, paused, pendingMove, takeBotTurn]);

  return (
    <div
      style={{
        width: '100%',
        height: '80%',
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: 'rgb(17, 17, 17)',
        justifyContent: 'space-between',
        borderTop: '1px solid rgb(39, 39, 39)',
        borderBottom: '1px solid rgb(39, 39, 39)'
      }}>
      <Console output={output} setOutput={setOutput} processInput={processInput} />
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px'
        }}>
        <Chessboard
          position={fen}
          width={500}
          onDrop={takeHumanMove}
          orientation={orientation === 'w' ? 'white' : 'black'}
        />
      </div>
    </div>
  );
}

export default Chess;
