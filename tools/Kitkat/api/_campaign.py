from fastapi import APIRouter, HTTPException
from ..models import *
campaign_router = APIRouter(
    prefix="/campaign",
    tags=["Campaign"],
    responses={404: {"details": "Not found"}},
)
@campaign_router.get("/", response_model=ResponseSingle[CampaignScheme])
async def list_campaigns():
    return {"message": "Hello World"}
@campaign_router.get("/{campaign_id}", response_model=ResponseSingle[CampaignScheme])
async def get_campaign(campaign_id: int):
    return {"message": "Hello World"}
@campaign_router.post("/", response_model=ResponseSingle[CampaignScheme])
async def create_campaign(campaign: CampaignCreate):
    try:
        with Server.get_parmanent_db() as conn:
            new_campaign_id = Campaign.create(conn.cursor(), campaign)
            new_campaign = Campaign.get_by_id(conn.cursor(), new_campaign_id)
        result = CampaignScheme(
            id=new_campaign['id'],
            title=new_campaign['title'],
            language=new_campaign['language'],
            start_at=new_campaign['start_at'],
            end_at=new_campaign['end_at'],
            status=new_campaign['status'],
            description=new_campaign['description'],
            rules=new_campaign['rules'],
            blacklist=new_campaign['blacklist'],
            image=new_campaign['image'],
            creator_id=new_campaign['creator_id'],
            approved_by=new_campaign['approved_by'],
            approved_at=new_campaign['approved_at'],
            created_at=new_campaign['created_at'],
        )
        return ResponseSingle[CampaignScheme](success=True, data=result)
    except sqlite3.IntegrityError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@campaign_router.post("/{campaign_id}", response_model=ResponseSingle[CampaignUpdate])
async def update_campaign(campaign_id: int, campaign: CampaignUpdate):
    return {"message": "Hello World"}
@campaign_router.delete("/{campaign_id}", response_model=ResponseSingle[CampaignScheme])
async def delete_campaign(campaign_id: int):
    """Cancel or reject a campaign.
    if the user is the creator of the campaign, cancel the campaign.
    else if the user is the admin and the campaign is not pending, reject the campaign.
    else, return 403.
    """
    return {"message": "Hello World"}