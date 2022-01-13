import { useEffect, useRef } from 'react'
import sendIcon from './send.svg';

type Message = {
  sender: string,
  content: string
}
interface Props {
  messages: Array<Message>
  sendMessage: (message: Message) => void
}

const Chat = (props: Props) => {
  const messageEl = useRef(null);

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
        {props.messages.map((m, i) => <div key={i} className={`msg${i % 2 !== 0 ? ' dark' : ''}`}>{m.content}</div>)}
      </div>
      <div className="footer">
        <input type="text" placeholder="Type here..." />
        <img src={sendIcon} />
      </div>
    </div>
  );
};

export default Chat;
