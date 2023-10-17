# Load .env file first
from dotenv import load_dotenv
if not load_dotenv():
    raise Exception("Failed to load .env file")
#------------------------------------ .env file loaded------------------------------------
from settings import *
from api2 import api
from fastapi import FastAPI, responses


app = FastAPI()
app.include_router(api)
@app.get("/", response_class=responses.HTMLResponse)
async def home():
    return responses.FileResponse("templates/index.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="", port=5000)
    