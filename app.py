# Load .env file first
from dotenv import load_dotenv
if not load_dotenv():
    raise Exception("Failed to load .env file")
#------------------------------------ .env file loaded------------------------------------
from settings import *
from api import api, Server, User
from fastapi import FastAPI, responses, Request, staticfiles
from fastapi.templating import Jinja2Templates
class FnF(FastAPI):
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

app = FnF()
app.include_router(api)
app.mount("/static", staticfiles.StaticFiles(directory="static"), name="static")



@app.get("/", response_class=responses.HTMLResponse)
async def home(request : Request):
    stats = Server.get_stats()
    user = User.logged_in_user(request.cookies)
    return app.templates.TemplateResponse("index.html", context= {
        'request' : request,
        'user' : user,
        'stats' : stats
    })
@app.get('/terms', response_class=responses.HTMLResponse)
def terms(request : Request):
    # user = User.logged_in_user(request.cookies)
    return app.templates.TemplateResponse("terms.html", context= {
        'request' : request,
    })
@app.get('/privacy', response_class=responses.HTMLResponse)
def privacy(request : Request):
    # user = User.logged_in_user(request.cookies)
    return app.templates.TemplateResponse("privacy.html", context= {
        'request' : request,
    })
def redirect_to(url, cookies : dict = {}):
    response = responses.RedirectResponse(
        url,
    )
    for key, value in cookies.items():
        response.set_cookie(key, value)
    return response
@app.get("/user/callback", response_class=responses.RedirectResponse)
def login(code : str, state : str = '/fnf'):
    cookie_name, cookie_value, redirect_uri = User.generate_access_token(code = code, state = state)
    return redirect_to(redirect_uri, {
        cookie_name : cookie_value
    })
@app.route('/error')
def error(request : Request, code : str = None):
    return app.templates.TemplateResponse("error.html", context= {
        'request' : request,
        'code' : code,
        'error' : "Unknown Error"
    })
@app.get('/manifest.json')
def manifest():
    return responses.RedirectResponse("/static/manifest.json")
#------------------------------------ Logout ------------------------------------
@app.post("/user/logout", response_class=responses.RedirectResponse)
async def logout():
    cookie_name, cookie_value, redirect_uri = User.logout()
    return redirect_to(redirect_uri, {
        cookie_name : cookie_value
    })

@app.get("/fnf/{optional_path:path}", response_class=responses.HTMLResponse)
async def fnf2(req : Request, optional_path : str = ''):
    user = User.logged_in_user(req.cookies)
    if user is None:
        redirect_uri = User.generate_login_url('/fnf')
        return redirect_to(redirect_uri)
    return responses.FileResponse("static/index.html")

@app.get('/favicon.ico', response_class=responses.RedirectResponse)
def favicon():
    return responses.RedirectResponse("/static/favicon.ico")
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="", port=5000)
    