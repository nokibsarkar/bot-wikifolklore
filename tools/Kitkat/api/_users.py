from fastapi import APIRouter, Request, Query, HTTPException
from ..models import *
user_router = APIRouter(
    prefix="/user",
    tags=["User"],
    responses={404: {"details": "Not found"}},
)
@user_router.get("/", response_model=ResponseMultiple[UserScheme])
async def list_users(req : Request):
    try:
        with Server.get_parmanent_db() as conn:
            users = User.get_all(conn.cursor())
        result = [UserScheme(**user) for user in users]
        return ResponseMultiple[UserScheme](success=True, data=result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@user_router.get("/me", response_model=ResponseSingle[UserScheme])
async def get_me(req: Request):
    try:
        user_id = req.state.user["id"]
        with Server.get_parmanent_db() as conn:
            me = User.get_by_id(conn.cursor(), user_id)
        return ResponseSingle[UserScheme](success=True, data=UserScheme(**me))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@user_router.get("/{user_id}", response_model=ResponseSingle[UserScheme])
async def get_user(user_id: int):
    try:
        with Server.get_parmanent_db() as conn:
            user = User.get_by_id(conn.cursor(), user_id)
        return ResponseSingle[UserScheme](success=True, data=UserScheme(**user))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@user_router.post("/{user_id}", response_model=ResponseSingle[UserScheme])
async def update_user(req : Request, user_id: int, user: UserUpdate):
    try:
        target_rights = user.rights
        my_rights = req.state.user["rights"]
        has_grant_access = User.has_access(my_rights, Permission.GRANT.value)
        assert has_grant_access, "You don't have permission to grant this right"
        with Server.get_parmanent_db() as conn:
            updated_user = User.update_rights(conn.cursor(), user_id, target_rights)
        return ResponseSingle[UserScheme](success=True, data=UserScheme(**updated_user))
    except Exception as e:
        raise HTTPException(status_code=403, detail=str(e))
