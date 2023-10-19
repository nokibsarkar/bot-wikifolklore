# Load .env file first
from dotenv import load_dotenv
if not load_dotenv():
    raise Exception("Failed to load .env file")
#------------------------------------ .env file loaded------------------------------------
from settings import *
from api2 import api, Server, User
from fastapi import FastAPI, responses, Request, Response
from fastapi.templating import Jinja2Templates
class TukTukBot(FastAPI):
    """
    This is the bot that will be used to extract the data from the wikipedia.
    """
    templates = Jinja2Templates("templates")
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.add_lifecycle()

    def add_lifecycle(self):
        @self.on_event("startup")
        def startup():
            Server.init()
            print("Starting up...")

        @self.on_event("shutdown")
        def shutdown():
            print("Shutting down...")

app = TukTukBot()
app.include_router(api)



@app.get("/", response_class=responses.HTMLResponse)
async def home(request : Request):
    stats = Server.get_stats()
    user = User.logged_in_user(request.cookies)
    return app.templates.TemplateResponse("index.html", context= {
        'request' : request,
        'user' : user,
        'stats' : stats
    })

def redirect_to(url, cookies : dict = {}):
    response = responses.RedirectResponse(
        url,
    )
    for key, value in cookies.items():
        response.set_cookie(key, value)
    return response
@app.get("/user/callback", response_class=responses.RedirectResponse)
def login(code : str, state : str):
    cookie_name, cookie_value, redirect_uri = User.generate_access_token(code = code, state = state)
    return redirect_to(redirect_uri, {
        cookie_name : cookie_value
    })

#------------------------------------ Logout ------------------------------------
@app.post("/user/logout", response_class=responses.RedirectResponse)
def logout():
    cookie_name, cookie_value, redirect_uri = User.logout()
    return redirect_to(redirect_uri, {
        cookie_name : cookie_value
    })
@app.get("/tuktukbot", response_class=responses.HTMLResponse)
async def tuktukbot(req : Request):
    user = User.logged_in_user(req.cookies)
    if user is None:
        redirect_uri = User.generate_login_url('/tuktukbot')
        return redirect_to(redirect_uri)
    return app.templates.TemplateResponse("interface.html", context= {
        'request' : req,
        'user' : user,
        'topics' : AVAILABLE_TOPICS,
        'countries' : AVAILABLE_COUNTRY,
        'wikis' : AVAILABLE_WIKI
    })
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="", port=5000)
    