from fastapi import APIRouter
kitkat_router = APIRouter(
    prefix="/kitkat",
    tags=["Kitkat"],
    responses={404: {"details": "Not found"}},
)
from .models.__init__ import *