from fastapi import APIRouter
from .models.__init__ import *
from .api import *
campwiz_router = APIRouter(
    prefix="/campwiz",
    tags=["Kitkat"],
    responses={404: {"details": "Not found"}},
)
@campwiz_router.on_event("startup")
async def startup():
    Server.init()
@campwiz_router.get("/")
async def read_root():
    return {"message": "Hello World"}
campwiz_router.include_router(user_router)
campwiz_router.include_router(campaign_router)
campwiz_router.include_router(statistics_router)
campwiz_router.include_router(submission_router)
