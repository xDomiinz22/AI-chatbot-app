type MessageType = {
  sender: "user" | "bot";
  text: string;
};

type MessageProps = MessageType

function Message({ sender, text }: MessageProps) {
  const baseClasses = "my-2 max-w-[80%] px-4 py-2 rounded-[15px] text-base leading-[1.3] break-words";
  const userClasses = "bg-[#2a9d8f] text-white self-end rounded-br-none";
  const botClasses = "bg-[#264653] text-white self-start rounded-bl-none";
  const classes = sender === "user" ? userClasses : botClasses;

  const isUser = sender === 'user';

  return (
    <div className={`${baseClasses} ${classes}`}>
      <strong>{isUser ? 'You' : 'AI'}:</strong> {text}
    </div>
  );
}

export default Message;
export { MessageType };