from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from bia_model import analyze, score_single_log, label_from_score
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

class ReviewData(BaseModel):
    pre_logs: List[str]
    post_logs: List[str]

class LogData(BaseModel):
    log_text: str


@app.post("/analyze")
def analyze_data(data: ReviewData):

    result = analyze(data.pre_logs, data.post_logs)

    return {"result": result}


@app.post("/score-log")
def score_log(data: LogData):

    score = score_single_log(data.log_text)
    label = label_from_score(score)

    return {
        "score": score,
        "label": label
    }


@app.get("/")
def root():
    return {"message": "BIA ML Model Running"}




app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
