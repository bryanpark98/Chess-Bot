import Game from './pages/Game';
// import Game from './pages/Game';
import './App.css';
import React from 'react';

function App() {
  return (
    <div
      className="App"
      style={{ width: '100vw', height: '100vh', backgroundColor: 'black', margin: 0 }}>
      <div style={boardsContainer}>
        <Game />
      </div>
    </div>
  );
}

const boardsContainer: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  flexWrap: 'wrap',
  height: '100vh'
};

export default App;
