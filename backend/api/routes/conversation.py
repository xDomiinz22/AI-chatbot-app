from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from backend.authentication.crud import (
    DatabaseMethods,
    TokenException,
)
from backend.database.schemas import (
    ConversationOut,
    MessageOut,
    RenameConversation,
    newConversation,
    newMessage,
)

token_auth = HTTPBearer()
router = APIRouter()
db_methods = DatabaseMethods()


@router.get("/get_conversations", response_model=List[ConversationOut])
def get_conversations_by_email(token: str = Query(..., description="User token")):
    try:
        db_user = db_methods.get_user_by_token(token)
        user_conversations = db_methods.get_user_conversations(db_user.email)
        return user_conversations
    except TokenException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)


@router.get("/get_messages/{conversation_id}", response_model=List[MessageOut])
def get_messages_by_conversation(conversation_id: int):
    try:
        user_conversations = db_methods.get_conversation_messages(conversation_id)
        return user_conversations
    except TokenException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)


@router.post("/add_conversation", response_model=ConversationOut)
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


@router.post("/add_messages", response_model=MessageOut)
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


@router.delete("/delete_conversation/{conversation_id}")
async def delete_conversation(
    conversation_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(token_auth),
):
    try:
        db_user = db_methods.get_user_by_token(credentials.credentials)
        db_methods.delete_conversation(db_user.email, conversation_id)
    except TokenException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)


@router.put("/rename_conversation")
async def rename_conversation(
    rename: RenameConversation,
    credentials: HTTPAuthorizationCredentials = Depends(token_auth),
):
    try:
        db_user = db_methods.get_user_by_token(credentials.credentials)
        db_methods.rename_conversation(db_user.email, rename.id, rename.title)
    except TokenException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
