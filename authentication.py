from fastapi.security import HTTPAuthorizationCredentials, http
from fastapi import Depends, HTTPException, status, Request
from models import User
UNAUTHORISED_EXCEPTION = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Invalid authentication credentials",
    headers={"WWW-Authenticate": "Bearer"},
)
def authenticate(req : Request) -> dict | None:
    try:
        logged_in_user = User.logged_in_user(req.cookies)
        req.state.user = logged_in_user
        if logged_in_user:
            return logged_in_user
        else:
            raise UNAUTHORISED_EXCEPTION
    except Exception as e:
        raise UNAUTHORISED_EXCEPTION