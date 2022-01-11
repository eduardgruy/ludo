interface Props {
  messages: Array<string>
} 

const Chat = (props: Props) => {

  return (
    <div className="container">
       {props.messages.map((message => { return (<p>{message}</p>) }))}
    </div>
  );
};

export default Chat;
