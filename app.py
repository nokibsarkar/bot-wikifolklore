
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
@app.get("/campwiz/{optional_path:path}", response_class=responses.HTMLResponse)
async def campwiz(req : Request, optional_path : str = ''):
    user = User.logged_in_user(req.cookies)
    if user is None:
        redirect_uri = User.generate_login_url('/campwiz')
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
@app.get('/feedback', response_class=responses.HTMLResponse)
def feedback_list(req : Request):
    return app.templates.TemplateResponse("feedback.html", 
                                      context = {'request' : req, 
                                                 'feedback' : [
                                                     {'username' : 'Nokib',
                                                      'feedback_ui_score' : 8,
                                                      'feedback_speed_score' :9,
                                                      'feedback_note' : 'Testing'
                                                     }
                                                 ]
                                                },
                                          
                                     ) 
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="", port=5000)
    
