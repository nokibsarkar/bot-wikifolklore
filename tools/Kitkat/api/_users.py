from fastapi import APIRouter
from ..models import *
user_router = APIRouter(
    prefix="/user",
    tags=["User"],
    responses={404: {"details": "Not found"}},
)
@user_router.get("/", response_model=ResponseSingle[UserScheme])
async def list_users():
    return {"message": "Hello World"}
@user_router.get("/me", response_model=ResponseSingle[UserScheme])
async def get_user(user_id: int):
    return {"message": "Hello World"}