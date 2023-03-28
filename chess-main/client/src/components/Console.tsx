import React, { useEffect, useState, useRef, FormEvent } from 'react';

function Chess({
  output,
  setOutput,
  processInput
}: {
  output: string[];
  setOutput: React.Dispatch<React.SetStateAction<string[]>>;
  processInput: (input: string) => void;
}) {
  const [input, setInput] = useState('');

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView();
  };

  const onSubmit = (event: FormEvent) => {
    setOutput((output) => [...output, `$ ${input}`]);
    processInput(input);
    setInput('');
    event.preventDefault();
  };

  useEffect(() => {
    scrollToBottom();
  }, [output]);

  return (
    <div
      style={{
        backgroundColor: 'rgb(17, 17, 17)',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        borderRight: '1px solid rgb(39, 39, 39)'
      }}>
      <div
        style={{
          width: '100%',
          fontFamily: 'monospace',
          fontSize: 14,
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          height: '100%',
          color: 'white',
          textAlign: 'left',
          paddingTop: '20px',
          overflow: 'scroll'
        }}>
        {output.map(function (message, idx) {
          return (
            <div
              style={{ wordBreak: 'break-word', paddingLeft: '20px', paddingRight: '20px' }}
              key={idx}>
              {message}
            </div>
          );
        })}
        <div ref={messagesEndRef} style={{ height: '20px', display: 'flex', flexShrink: 0 }} />
      </div>
      <div style={{ borderTop: '1px solid rgb(39, 39, 39)', display: 'flex' }}>
        <form onSubmit={onSubmit} style={{ width: '100%', margin: '10px 20px 10px 20px ' }}>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            type="text"
            name="name"
            autoComplete="off"
            placeholder="command... ($ help for help)"
            style={{ color: 'white', width: '100%', textAlign: 'left' }}
          />
        </form>
      </div>
    </div>
  );
}

export default Chess;
