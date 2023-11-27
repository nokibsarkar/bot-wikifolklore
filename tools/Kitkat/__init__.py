from fastapi import APIRouter
from .models.__init__ import *
from .api import *
kitkat_router = APIRouter(
    prefix="/kitkat",
    tags=["Kitkat"],
    responses={404: {"details": "Not found"}},
)
@kitkat_router.on_event("startup")
async def startup():
    Server.init()
@kitkat_router.get("/")
async def read_root():
    return {"message": "Hello World"}
kitkat_router.include_router(user_router)
kitkat_router.include_router(campaign_router)
kitkat_router.include_router(statistics_router)
kitkat_router.include_router(submission_router)
