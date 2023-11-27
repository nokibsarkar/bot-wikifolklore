from fastapi import APIRouter
statistics_router = APIRouter(
    prefix="/statistics",
    tags=["User"],
    responses={404: {"details": "Not found"}},
)