import { useEffect, useRef, useState, useContext } from 'react'
import sendIcon from './send.svg';

import { UserContext } from '../context/user'


type Message = {
  sender: string,
  content: string
}
interface Props {
  messages: Array<Message>
  sendMessage: (message: Message) => void
}

const Chat = (props: Props) => {
  const user = useContext(UserContext)
  const messageEl = useRef(null);
  const [newMessage, setNewMessage] = useState("");

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const message = event.target.value;
    setNewMessage(message);
  };

  useEffect(() => {
    if (messageEl && messageEl.current) {
      //@ts-ignore
      messageEl.current.addEventListener('DOMNodeInserted', (event: any) => {
        const { currentTarget: target } = event;
        target.scroll({ top: target.scrollHeight, behavior: 'smooth' });
      });
    }
  }, [])
  return (
    <div>
      <div className="head">Game Chat</div>
      <div className="messages" ref={messageEl}>
        {props.messages.map((m, i) => <div key={i} className={`msg${i % 2 !== 0 ? ' dark' : ''}`}>{`${m.sender}: ${m.content}`}</div>)}
      </div>
      <div className="footer">
        <input type="text" onChange={handleInput} value={newMessage} placeholder="Type here..." />
        <img src={sendIcon} onClick={() => {
          if (newMessage) {
            props.sendMessage({ sender: user.username, content: newMessage })
            setNewMessage("")
          }
        }} />
      </div>
    </div>
  );
};

export default Chat;
