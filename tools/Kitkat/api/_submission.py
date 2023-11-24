from fastapi import APIRouter
from ..models import *
submission_router = APIRouter(
    prefix="/submission",
    tags=["Submission"],
    responses={404: {"details": "Not found"}},
)
@submission_router.get("/", response_model=ResponseSingle[SubmissionScheme])
async def list_all_submissions():
    """
    List all submissions.
    """
    return {"message": "Hello World"}
@submission_router.get("/{submission_id}", response_model=ResponseSingle[SubmissionScheme])
async def get_submission(submission_id: int):
    return {"message": "Hello World"}
@submission_router.post("/", response_model=ResponseSingle[SubmissionScheme])
async def create_submission(submission: SubmissionScheme):
    return {"message": "Hello World"}
@submission_router.post("/{submission_id}", response_model=ResponseSingle[SubmissionScheme])
async def update_submission(submission_id: int, submission: SubmissionScheme):
    return {"message": "Hello World"}
@submission_router.post("/{submission_id}/judge", response_model=ResponseSingle[SubmissionScheme])
async def judge_submission(submission_id: int, submission: SubmissionScheme):
    return {"message": "Hello World"}
