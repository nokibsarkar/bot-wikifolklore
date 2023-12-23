from fastapi import APIRouter, HTTPException, Query, Request
from ..models import *
campaign_router = APIRouter(
    prefix="/campaign",
    tags=["Campaign"],
    responses={404: {"details": "Not found"}},
)


@campaign_router.get("/", response_model=ResponseMultiple[CampaignScheme])
async def list_campaigns(language : Language = None, status : Annotated[list[CampaignStatus] | None, Query()] = None, limit : int=50, offset : int= 0):
    """
    This endpoint is used to get all campaigns.
    """
    try:
        with Server.get_parmanent_db() as conn:
            campaigns = Campaign.get_all(conn.cursor(), language=language, status=status, limit=limit, offset=offset)
        result = [CampaignScheme.from_dict(campaign) for campaign in campaigns]
        return ResponseMultiple[CampaignScheme](success=True, data=result)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))



#---------------------------------- GET A CAMPAIGN ----------------------------------#
@campaign_router.get("/{campaign_id}", response_model=ResponseSingle[CampaignScheme])
async def get_campaign(req : Request, campaign_id: int, check_judge : bool = False):
    """
    This endpoint is used to get a campaign by id.
    """
    try:
        user_id = req.state.user['id']
        with Server.get_parmanent_db() as conn:
            campaign = Campaign.get_by_id(conn.cursor(), campaign_id)
            if not campaign:
                raise Exception("Campaign not found")
            result = CampaignScheme.from_dict(campaign)
            if check_judge:
                is_judge = Judgement.verify_judge(conn.cursor(), campaign_id, user_id)
                result.am_i_judge = bool(is_judge)
            
            return ResponseSingle[CampaignScheme](success=True, data=result)
    except Exception as e:
        
        raise HTTPException(status_code=404, detail=str(e))
#------------------------------------------------------------------------------

#---------------------------------- LIST ALL the Jury ----------------------------------#
@campaign_router.get("/{campaign_id}/jury", response_model=ResponseMultiple[JudgeScheme])
async def list_jury(campaign_id: int):
    """
    This endpoint is used to get a campaign by id.
    """
    try:
        with Server.get_parmanent_db() as conn:
            jury = Campaign.get_jury(conn.cursor(), campaign_id, allowed=True)
        if jury is None:
            raise Exception("Jury not found")
        result = []
        for judge in jury:
            result.append(JudgeScheme.from_dict(judge))
        return ResponseMultiple[JudgeScheme](success=True, data=result)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
#------------------------------------------------------------------------------

#---------------------------------- Add or Remove a Jury ----------------------------------#


#---------------------------------- CREATE A CAMPAIGN ----------------------------------#
@campaign_router.post("/", response_model=ResponseSingle[CampaignScheme])
async def create_campaign(req : Request, campaign: CampaignCreate):
    """
    This endpoint is used to create a new campaign.
    """
    try:
        assert User.is_admin(req.state.user['rights']), "You don't have `campaign` rights"
        if campaign.name is not None:
            assert len(campaign.name.strip()) > 0, "Campaign name cannot be empty"
        assert campaign.start_at, "Campaign start date cannot be empty"
        assert campaign.end_at, "Campaign end date cannot be empty"
        jury_list = campaign.jury
        if len(jury_list) < 1:
            raise Exception("At least one jury must be selected")
        with Server.get_parmanent_db() as conn:
            new_campaign = Campaign.create(conn.cursor(), campaign)
        result = CampaignScheme.from_dict(new_campaign)
        return ResponseSingle[CampaignScheme](success=True, data=result)
    except sqlite3.IntegrityError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
#------------------------------------------------------------------------------

#---------------------------------- UPDATE A CAMPAIGN ----------------------------------#
@campaign_router.post("/{campaign_id}", response_model=ResponseSingle[CampaignScheme])
async def update_campaign(req : Request, campaign_id: int, campaign: CampaignUpdate):
    try:
        assert User.is_admin(req.state.user['rights']), "You don't have `campaign` rights"
        jury_list = campaign.jury
        if len(jury_list) < 1:
            raise Exception("At least one jury must be selected")
        if campaign.name is not None:
            assert len(campaign.name.strip()) > 0, "Campaign name cannot be empty"
        assert campaign.start_at, "Campaign start date cannot be empty"
        assert campaign.end_at, "Campaign end date cannot be empty"
        with Server.get_parmanent_db() as conn:
            existing_campaign = Campaign.get_by_id(conn, campaign_id)
            updated_campaign = Campaign.update(conn, campaign, existing_campaign)
            cmp = CampaignScheme.from_dict(updated_campaign)
            return ResponseSingle[CampaignScheme](success=True, data=cmp)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
#---------------------------------- GET RESULTS OF A CAMPAIGN ----------------------------------#
@campaign_router.get("/{campaign_id}/result", response_model=ResponseSingle[CampaignResultScheme])
async def get_campaign_result(req : Request, campaign_id: int):
    """
    This endpoint is used to get a campaign by id.
    """
    try:
        with Server.get_parmanent_db() as conn:
            campaign = Campaign.get_by_id(conn.cursor(), campaign_id)
            if not campaign:
                raise Exception("Campaign not found")
            results = Campaign.get_results(conn.cursor(), campaign_id)
            return ResponseSingle[CampaignResultScheme](success=True, data=results)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))




#------------------------------------------------------------------------------
#---------------------------------- Approve, reject or cancel a CAMPAIGN ----------------------------------#
@campaign_router.post("/{campaign_id}/status", response_model=ResponseSingle[CampaignScheme])
async def approve_campaign(req : Request, campaign_id: int, update : CampaignStatusUpdate):
    """
    Approve, reject or cancel a campaign
    It can be cancelled by both the admin and the campaign owner
    But it can be approved or rejected only by the admin.
    """
    try:
        user = req.state.user
        
        with Server.get_parmanent_db() as conn:
            campaign = Campaign.get_by_id(conn.cursor(), campaign_id)
            assert campaign is not None, "Campaign not found"
            assert campaign['status'] not in (UpdatableStatus.cancelled.value, UpdatableStatus.ended.value), "Campaign is already cancelled or ended"
            is_admin = User.is_admin(user['rights'])
        
            if update.status in (UpdatableStatus.cancelled, UpdatableStatus.ended):
                assert is_admin, "Only admin or campaign owner can cancel or end a campaign"
            elif update.status in (UpdatableStatus.scheduled, UpdatableStatus.rejected):
                assert is_admin, "Only admin can approve or reject a campaign"
            campaign = Campaign._update_status(conn.cursor(), campaign_id, update.status)
            result = CampaignScheme.from_dict(campaign)
            return ResponseSingle[CampaignScheme](success=True, data=result)
    except Exception as e:
        raise HTTPException(status_code=403, detail=str(e))

#---------------------------------- Approve or Reject a CAMPAIGN ----------------------------------#

