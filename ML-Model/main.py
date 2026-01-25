from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from bia_model import analyze
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

class ReviewData(BaseModel):
    pre_logs: List[str]
    post_logs: List[str]

@app.post("/analyze")
def analyze_data(data: ReviewData):
    result = analyze(data.pre_logs, data.post_logs)
    return {"result": result}

@app.get("/")
def root():
    return {"message": "BIA ML Model Running"}


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
