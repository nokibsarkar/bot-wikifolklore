from fastapi import APIRouter, Request, Query, HTTPException, BackgroundTasks
from ..models import *
# from pprint import pprint as print
submission_router = APIRouter(
    prefix="/submission",
    tags=["Submission"],
    responses={404: {"details": "Not found"}},
)
@submission_router.get("/", response_model=ResponseMultiple[SubmissionScheme])
async def list_all_submissions(req : Request, campaignID: str, judgable : bool = None, judged_by_me : bool = None ):
    """
    List all submissions.`
    """
    try:
        my_id = req.state.user['id']
        with Server.get_parmanent_db() as conn:
            if judged_by_me is not None:
                if judged_by_me == True:
                    submissions = Submission.get_all_by_campaign_id(conn.cursor(), campaign_id=campaignID, judgable=judgable, only_judged_by=my_id)
                elif judged_by_me == False:
                    submissions = Submission.get_all_by_campaign_id(conn.cursor(), campaign_id=campaignID, judgable=judgable, exclude_judged_user_id=my_id)
            else:
                submissions = Submission.get_all_by_campaign_id(conn.cursor(), campaign_id=campaignID, judgable=judgable)
            
        results = []
        for submission in submissions:
            # if submission.get('judged_by_me') is None:
            #     submission['judged_by_me'] = judge_by_me
            results.append(SubmissionScheme(**submission))
        print("Results")
        print(results)
        return ResponseMultiple[SubmissionScheme](success=True, data=results)
    except Exception as e:
        print(e)
        raise HTTPException(404, detail=str(e))




@submission_router.post("/draft", response_model=ResponseSingle[DraftSubmissionScheme])
async def create_draft(req : Request, draft_request : DraftCreateScheme, background_tasks: BackgroundTasks):
    try:
        current_user = req.state.user

        campaign_id = draft_request.campaign_id

        with Server.get_parmanent_db() as conn:
            campaign = Campaign.update_status(conn, campaign_id)
            if not campaign:
                raise HTTPException(status_code=400, detail="Campaign not found")
            statusError = None
            if campaign['status'] not in CampaignStatus.running.value:
                raise HTTPException(status_code=400, detail="Campaign is not running")
            if statusError:
                raise HTTPException(status_code=400, detail=statusError)
            language : str = campaign['language'] # Language of the campaign
            usernames : list[str] = [draft_request.submitted_by_username]
            # If the user is not in the database, add it, then get the user id
            users = User.get_username_map_guaranteed(conn, usernames, lang=language)
            submitted_by = users[draft_request.submitted_by_username]
            if not campaign['allowJuryToParticipate']: # If jury is not allowed to participate in the campaign
                # Check if the user is a jury
                is_submitter_jury = Judgement.verify_judge(conn, campaign_id, submitted_by['id'])
                if is_submitter_jury:
                    # If the user is a jury, raise an error
                    raise HTTPException(status_code=400, detail="Jury is not allowed to participate in the campaign")
            
            errors, current_stat = Submission.fetch_stats(language, draft_request.title)
            if errors:
                raise HTTPException(status_code=400, detail=errors)
            new_draft = DraftSubmissionScheme(
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
                campaign_id=draft_request.campaign_id,
                added_bytes=current_stat['added_bytes'],
                added_words=current_stat['added_words'],
            )
            new_draft = Submission.create_draft(conn, new_draft)
        async_calculation_params = {
            'draft_id' : new_draft.id,
            'lang' : language,
            'pageid' : current_stat['pageid'],
            'start_date' : campaign['start_at'],
            'end_date' : campaign['end_at'],
            'username' : submitted_by['username']
        }
        background_tasks.add_task(Submission.async_calculate_addition, **async_calculation_params)
        return ResponseSingle[DraftSubmissionScheme](success=True, data=new_draft)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Internal error: {e}")
    



@submission_router.get("/draft/{draft_id}", response_model=ResponseSingle[DraftSubmissionScheme])
async def get_draft(req : Request, draft_id: int):
    try:
        with Server.get_parmanent_db() as conn:
            draft = Submission.get_draft_by_id(conn.cursor(), draft_id)
        if not draft:
            raise Exception("Draft not found")
        result = DraftSubmissionScheme(**draft)
        return ResponseSingle[DraftSubmissionScheme](success=True, data=result)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
    



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
        with Server.get_parmanent_db() as conn:
            draft = Submission.get_draft_by_id(conn,  submission.draft_id)
            if not draft:
                raise HTTPException(status_code=400, detail="Draft not found")
            Submission.update_draft_flags(
                conn, submission.draft_id, calculated=True, passed=True, submitted=True
            )
            newSubmission = Submission.submit(conn, draft)
        return ResponseSingle[SubmissionScheme](success=True, data=newSubmission)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    




@submission_router.post("/{submission_id}/judge", response_model=ResponseSingle[SubmissionScheme])
async def judge_submission(req: Request, submission_id: int, judgement : JudgementScheme):
    try:
        jury_id = req.state.user['id']
        with Server.get_parmanent_db() as conn:
            submission = Submission.get_by_id(conn.cursor(), submission_id)
            if not submission:
                raise HTTPException(status_code=400, detail="Submission not found")
            assert submission['judgable'] == True, "Submission is not judgable"
            campaign = Campaign.update_status(conn, submission['campaign_id'])
            assert campaign['status'] in [CampaignStatus.running.value, CampaignStatus.evaluating.value], "Campaign is not in judging mode"
            jury = Judgement.verify_judge(conn,  submission['campaign_id'], jury_id,)
            assert jury, "Sorry, you are not a judge for this campaign"
            assert jury['allowed'] == True, "Sorry, you are not allowed to judge this campaign"
            Judgement.add(conn, submission_id, jury_id, judgement.vote, campaign_id=campaign['id'])
            Judgement.calculate_points(conn, submission_id)
            submission = Submission.get_by_id(conn.cursor(), submission_id)
        return ResponseSingle[SubmissionScheme](success=True, data=SubmissionScheme(**submission))
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
