import './Message.css'

function Message({ sender, text}) {
    const isUser = sender === 'user';
    
    return (
        <div className={`message ${isUser ? 'user' : 'bot'}`}>
            <strong>{isUser ? 'You' : 'AI'}:</strong> {text}
        </div>
    )
}

export default Message;