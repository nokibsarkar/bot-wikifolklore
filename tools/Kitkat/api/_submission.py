from fastapi import APIRouter, Request, Query
from ..models import *
submission_router = APIRouter(
    prefix="/submission",
    tags=["Submission"],
    responses={404: {"details": "Not found"}},
)
@submission_router.get("/", response_model=ResponseMultiple[SubmissionScheme])
async def list_all_submissions(req : Request, campaign_id: str, judgable : bool = None, judged : bool = None ):
    """
    List all submissions.`
    """
    with Server.get_parmanent_db() as conn:
        submissions = Submission.get_all_by_campaign_id(conn.cursor(), campaign_id=campaign_id, judgable=judgable, judged=judged)
    results = []
    for submission in submissions:
        results.append(SubmissionScheme(**submission))
    return ResponseMultiple[SubmissionScheme](success=True, data=results)
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
