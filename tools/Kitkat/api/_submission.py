from fastapi import APIRouter, Request, Query, HTTPException
from ..models import *
from pprint import pprint as print
submission_router = APIRouter(
    prefix="/submission",
    tags=["Submission"],
    responses={404: {"details": "Not found"}},
)
@submission_router.get("/", response_model=ResponseMultiple[SubmissionScheme])
async def list_all_submissions(req : Request, campaignID: str, judgable : bool = None, judged : bool = None ):
    """
    List all submissions.`
    """
    with Server.get_parmanent_db() as conn:
        submissions = Submission.get_all_by_campaign_id(conn.cursor(), campaign_id=campaignID, judgable=judgable, judged=judged)
    results = []
    for submission in submissions:
        results.append(SubmissionScheme(**submission))
    return ResponseMultiple[SubmissionScheme](success=True, data=results)
@submission_router.get("/{submission_id}", response_model=ResponseSingle[SubmissionScheme])
async def get_submission(submission_id: int):
    try:
        with Server.get_parmanent_db() as conn:
            submission = Submission.get_by_id(conn.cursor(), submission_id)
        if not submission:
            raise Exception("Submission not found")
        result = SubmissionScheme(**submission)
        return ResponseSingle[SubmissionScheme](success=True, data=result)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
@submission_router.post("/", response_model=ResponseSingle[SubmissionScheme])
async def create_submission(req: Request, submission: SubmissionCreateScheme):
    try:
        campaign_id = submission.campaign_id
        with Server.get_parmanent_db() as conn:
            
            campaign = Campaign.get_by_id(conn, campaign_id)
            if not campaign:
                raise HTTPException(status_code=400, detail="Campaign not found")
            # if campaign['status'] != CampaignStatus.running:
            #     raise HTTPException(status_code=400, detail=f"Campaign status is {campaign['status']}")
            language : str = campaign['language'] # Language of the campaign
            usernames : list[str] = [submission.submitted_by_username]
            # If the user is not in the database, add it, then get the user id
            users = User.get_username_map_guaranteed(conn, usernames, lang=language)
            submitted_by = users[submission.submitted_by_username]
            
            errors, current_stat = Submission.fetch_stats(language, submission.title, submitted_by['username'], campaign['start_at'], campaign['end_at'])
            if errors:
                raise HTTPException(status_code=400, detail=errors)
            newSubmission = SubmissionScheme(
                title=current_stat['title'],
                pageid=current_stat['pageid'],
                oldid=current_stat['oldid'],
                target_wiki=language,
                submitted_by_username=submitted_by['username'],
                submitted_by_id=submitted_by['id'],
                total_bytes=current_stat['bytes'],
                total_words=current_stat['words'],
                created_at=current_stat['created_at'],
                created_by_id=current_stat['created_by_id'],
                created_by_username=current_stat['created_by_username'],
                campaign_id=submission.campaign_id,
                added_bytes=current_stat['added_bytes'],
                added_words=current_stat['added_words'],
            )
            newSubmission = Submission.create(conn, newSubmission)
        return ResponseSingle[SubmissionScheme](success=True, data=newSubmission)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@submission_router.post("/{submission_id}", response_model=ResponseSingle[SubmissionScheme])
async def update_submission(submission_id: int, submission: SubmissionScheme):
    return {"message": "Hello World"}
@submission_router.post("/{submission_id}/judge", response_model=ResponseSingle[SubmissionScheme])
async def judge_submission(submission_id: int, submission: SubmissionScheme):
    return {"message": "Hello World"}
