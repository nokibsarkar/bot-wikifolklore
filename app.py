# Load .env file first
from dotenv import load_dotenv
if not load_dotenv():
    raise Exception("Failed to load .env file")
#------------------------------------ .env file loaded------------------------------------
from settings import *
from api import api, Server, User, ResponseSingle, Country, Language
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
        'stats' : stats,
        'login_url' : User.generate_login_url('/')
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
@app.get('/favicon.ico', response_class=responses.FileResponse)
def favicon():
    return responses.FileResponse("static/favicon.ico")
@app.get("/sitemap.xml", response_class=responses.FileResponse)
def sitemap():
    return responses.FileResponse("static/sitemap.xml")
@app.get("/robots.txt", response_class=responses.FileResponse)
def robots():
    return responses.FileResponse("static/robots.txt")
@app.get("/sitemap", response_class=responses.FileResponse)
def sitemap():
    return responses.FileResponse("static/sitemap.xml")
def redirect_to(url, cookies : dict = {}):
    response = responses.RedirectResponse(url)
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
@app.get("/user/logout", response_class=responses.RedirectResponse)
async def logout():
    cookie_name, cookie_value, redirect_uri = User.logout()
    return redirect_to(redirect_uri, {
        cookie_name : cookie_value
    })
#------------------------------- Credit ------------------------------------
@app.get("/credits", response_class=responses.HTMLResponse)
async def credit(request : Request):
    # user = User.logged_in_user(request.cookies)
    return app.templates.TemplateResponse("credits.html", context= {

        'request' : request,
        # 'user' : user,
        'login_url' : User.generate_login_url('/credit')
    })
@app.get("/fnf/{optional_path:path}", response_class=responses.HTMLResponse)
async def fnf(req : Request, optional_path : str = ''):
    user = User.logged_in_user(req.cookies)
    if user is None:
        redirect_uri = User.generate_login_url('/fnf')
        return redirect_to(redirect_uri)
    return responses.FileResponse("static/index.html", headers = {
        'Document-Policy' : 'js-profiling'
    })
@app.get("/kitkat/{optional_path:path}", response_class=responses.HTMLResponse)
async def kitkat(req : Request, optional_path : str = ''):
    user = User.logged_in_user(req.cookies)
    if user is None:
        redirect_uri = User.generate_login_url('/kitkat')
        return redirect_to(redirect_uri)
    return responses.FileResponse("static/index.html", headers = {
        'Document-Policy' : 'js-profiling'
    })
@app.get('/api/country', response_model=ResponseSingle[dict[Country, str]])
def get_country_list():
    countries = Country.get()
    return ResponseSingle[dict[Country, str]](
        success=True,
        data=countries
    )
@app.get('/api/language', response_model=ResponseSingle[dict[Language, str]])
def get_language_list():
    countries = Language.get()
    return ResponseSingle[dict[Language, str]](
        success=True,
        data=countries
    )
@app.get('/all-categories/{optional_path:path}')
def get_all_categories(req : Request):
    print(req.cookies)
    print(req.headers)
    print(req.scope)
    return 'No offense'
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="", port=5000)
    