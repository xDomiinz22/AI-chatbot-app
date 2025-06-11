from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from backend.authentication.crud import (
    DatabaseMethods,
    TokenException,
)
from backend.database.schemas import (
    ConversationOut,
    MessageOut,
    newConversation,
    newMessage,
)

token_auth = HTTPBearer()
router = APIRouter()
db_methods = DatabaseMethods()


@router.post("/conversations", response_model=ConversationOut)
async def new_conversation(
    conversation: newConversation,
    credentials: HTTPAuthorizationCredentials = Depends(token_auth),
):
    try:
        db_user = db_methods.get_user_by_token(credentials.credentials)
        new_conversation = db_methods.create_new_conversation(
            conversation.title, db_user.email
        )
        return ConversationOut(title=new_conversation.title, id=new_conversation.id)
    except TokenException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)


@router.post("/messages", response_model=MessageOut)
async def new_message(
    message: newMessage,
    credentials: HTTPAuthorizationCredentials = Depends(token_auth),
):
    try:
        db_methods.get_user_by_token(credentials.credentials)  # Checks if token works
        new_message = db_methods.create_new_message(
            message.conversation_id, message.text, message.sender
        )
        return MessageOut(text=new_message.text, sender=new_message.sender)
    except TokenException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
