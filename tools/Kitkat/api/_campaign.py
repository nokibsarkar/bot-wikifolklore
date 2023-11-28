from fastapi import APIRouter, HTTPException
from ..models import *
campaign_router = APIRouter(
    prefix="/campaign",
    tags=["Campaign"],
    responses={404: {"details": "Not found"}},
)
@campaign_router.get("/", response_model=ResponseMultiple[CampaignScheme])
async def list_campaigns():
    """
    This endpoint is used to get all campaigns.
    """
    try:
        with Server.get_parmanent_db() as conn:
            campaigns = Campaign.get_all(conn.cursor())
        result = [CampaignScheme.from_dict(campaign) for campaign in campaigns]
        return ResponseMultiple[CampaignScheme](success=True, data=result)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))



#---------------------------------- GET A CAMPAIGN ----------------------------------#
@campaign_router.get("/{campaign_id}", response_model=ResponseSingle[CampaignScheme])
async def get_campaign(campaign_id: int):
    """
    This endpoint is used to get a campaign by id.
    """
    try:
        with Server.get_parmanent_db() as conn:
            campaign = Campaign.get_by_id(conn.cursor(), campaign_id)
        if not campaign:
            raise Exception("Campaign not found")
        result = CampaignScheme.from_dict(campaign)
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
            jury = Campaign.get_jury(conn.cursor(), campaign_id)
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
async def create_campaign(campaign: CampaignCreate):
    """
    This endpoint is used to create a new campaign.
    """
    try:
        with Server.get_parmanent_db() as conn:
            new_campaign_id = Campaign.create(conn.cursor(), campaign)
            new_campaign = Campaign.get_by_id(conn.cursor(), new_campaign_id)
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
async def update_campaign(campaign_id: int, campaign: CampaignUpdate):
    try:
        with Server.get_parmanent_db() as conn:
            existing_campaign = Campaign.get_by_id(conn, campaign_id)
            updated_campaign = Campaign.update(conn, campaign)
            cmp = CampaignScheme.from_dict(updated_campaign)
            return ResponseSingle[CampaignScheme](success=True, data=cmp)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
#------------------------------------------------------------------------------


#---------------------------------- DELETE A CAMPAIGN ----------------------------------#
@campaign_router.delete("/{campaign_id}", response_model=ResponseSingle[CampaignScheme])
async def delete_campaign(campaign_id: int):
    """Cancel or reject a campaign.
    if the user is the creator of the campaign, cancel the campaign.
    else if the user is the admin and the campaign is not pending, reject the campaign.
    else, return 403.
    """
    return {"message": "Hello World"}