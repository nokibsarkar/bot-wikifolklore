from fastapi import APIRouter
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
@campaign_router.post("/", response_model=ResponseSingle[CampaignCreate])
async def create_campaign(campaign: CampaignCreate):
    return {"message": "Hello World"}
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