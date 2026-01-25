import numpy as np
import pandas as pd
import re
from collections import Counter
import warnings
warnings.filterwarnings('ignore')


POSITIVE_WORDS = {
    "completed", "finished", "implemented", "developed", "resolved", "fixed",
    "tested", "deployed", "integrated", "delivered", "helped", "collaborated",
    "learned", "understood", "improved", "explored", "debugged", "pushed",
    "refactored", "optimized", "documented", "reviewed", "shipped", "achieved",
    "successful", "merged", "released", "approved"
}

NEGATIVE_WORDS = {
    "struggled", "blocked", "delay", "delayed", "confused", "bug", "error",
    "failed", "issue", "stuck", "problem", "difficulty", "challenge",
    "blocker", "pending", "waiting", "unclear", "missing", "blockers", "access", "constraints", "workload",
    "unclear", "limited", "clarification"
}

LEARNING_WORDS = {
    "learned", "understood", "studied", "research", "explored",
    "experimented", "practiced", "training", "workshop", "course",
    "reading", "investigating", "analyzing", "verification", "regression", "understanding",
    "analysis", "mapping"
}

TASK_WORDS = {
    "completed", "implemented", "developed", "fixed", "created",
    "tested", "deployed", "updated", "debugged", "pushed",
    "built", "designed", "configured", "setup", "migrated", "tested", "retested", "testing", "verification", "validated",
    "regression", "smoke", "sprint", "investigated", "resolved",
    "reviewed", "documented", "wrote", "executed"
}

COLLABORATION_WORDS = {
    "helped", "collaborated", "paired", "mentored", "reviewed",
    "discussed", "meeting", "presented", "shared", "supported",
    "coordinated", "assisted"
}

QUALITY_WORDS = {
    "refactored", "optimized", "documented", "cleaned", "improved",
    "enhanced", "polished", "tested", "validated", "verified", "regression", "smoke", "verification", "validated",
    "coverage", "accuracy", "consistency"
}

NEGATION_WORDS = {
    "not", "no", "never", "cannot", "can't", "didn't", "don't",
    "won't", "wouldn't", "hasn't", "haven't", "without", "unable", "forgot"
}


PROBLEMATIC_WORDS = {"forgot", "undefined", "failing", "inconsistent", "broken"}

SETUP_WORDS = {
    "setup", "installed", "configured", "cloned", "environment", "dependencies"
}





def tokenize(text):
    
    return re.findall(r'\b\w+\b', text.lower())


def count_keywords_with_negation(tokens, keywords):
    
    count = 0
    window = []

    for token in tokens:
        window.append(token)

        if len(window) > 3:
            window.pop(0)

        if token in keywords:
            if not any(w in NEGATION_WORDS for w in window[:-1]):
                count += 1

    return count



def calculate_log_quality(text):
    

    if not text:
        return 0.3

    words = text.split()
    wc = len(words)

    if wc < 10:
        return 0.4

    if wc > 500:
        return 0.6

    freq = Counter(words)
    if max(freq.values()) > 5:
        return 0.5

    diversity = len(set(words)) / wc

    if diversity < 0.3:
        return 0.6

    if 20 <= wc <= 200 and diversity >= 0.5:
        return 1.0

    return 0.8


def extract_features(text):

    tokens = tokenize(text)

    tasks = count_keywords_with_negation(tokens, TASK_WORDS)
    setup_tasks = count_keywords_with_negation(tokens, SETUP_WORDS)
    learning = count_keywords_with_negation(tokens, LEARNING_WORDS)
    negatives = count_keywords_with_negation(tokens, NEGATIVE_WORDS)
    positives = count_keywords_with_negation(tokens, POSITIVE_WORDS)
    collaboration = count_keywords_with_negation(tokens, COLLABORATION_WORDS)
    quality = count_keywords_with_negation(tokens, QUALITY_WORDS)
    problematic = count_keywords_with_negation(tokens, PROBLEMATIC_WORDS)

    sentiment = (
        positives * 1.0 -
        negatives * 2.0 -
        problematic * 2.0 +
        0.7 * quality
    )

    tolerance = 1 if negatives > 0 else 0

    return {
    "tasks": tasks,
    "setup_tasks": setup_tasks,
    "learning": learning,
    "collaboration": collaboration,
    "quality": quality,
    "sentiment": sentiment,
    "tolerance": tolerance,
    "log_quality": calculate_log_quality(text)
}


def build_df(logs, is_post=False):
    rows = [extract_features(l) for l in logs]
    df = pd.DataFrame(rows)

    df = df[df["log_quality"] > 0.35].copy()

    if df.empty:
        return pd.DataFrame({"daily_score": [0.0]})

    for col in ["tasks", "learning", "collaboration", "quality"]:
        norm = max(df[col].quantile(0.75), 1)
        df[col + "_intensity"] = np.clip(df[col] / norm, 0, 1.5)

    task_scale = 0.7 if is_post else 1.0

    df["daily_score"] = (
        1.5 * df["tasks_intensity"] * task_scale +
        1.2 * df["learning_intensity"] +
        1.0 * df["collaboration_intensity"] +
        1.3 * df["quality_intensity"] +
        0.4 * df["sentiment"] +
        0.3 * df["tolerance"]
    ) * df["log_quality"]

    df.loc[
        (df["setup_tasks"] > 0) &
        (df["tasks_intensity"] < 0.5) &
        (df["quality_intensity"] < 0.5),
        "daily_score"
    ] *= 0.5


    df.loc[
        (df["learning_intensity"] > 0.8) & (df["tasks_intensity"] == 0),
        "daily_score"
    ] *= 0.6


    df["daily_score"] = np.clip(df["daily_score"], 0, None)

    return df


def trend(arr):
    
    if len(arr) < 4:
        return 0.0

    mid = len(arr) // 2
    return float(np.mean(arr[mid:]) - np.mean(arr[:mid]))


def stability(arr):
    if len(arr) <= 1:
        return 0.0

    mean = np.mean(arr)
    var = np.var(arr)
    return mean / (var + 0.01)


def consistency(arr):
    if len(arr) <= 1:
        return 0.0

    return np.mean(arr) / (np.std(arr) + 0.001)


def analyze(pre_logs, post_logs):


    pre = build_df(pre_logs, is_post=False)
    post = build_df(post_logs, is_post=True)

    pre_avg = pre["daily_score"].mean()
    post_avg = post["daily_score"].mean()

    pre_const = consistency(pre["daily_score"].values)
    post_const = consistency(post["daily_score"].values)

    pre_st = stability(pre["daily_score"].values)
    post_st = stability(post["daily_score"].values)

    d_avg = post_avg - pre_avg
    d_const = post_const - pre_const
    d_st = post_st - pre_st
    BIS = (0.5 * d_avg) + (0.3 * d_const) + (0.2 * d_st)

    return {
        "Pre_Avg": pre_avg, 
        "Post_Avg": post_avg,
        "Const_Before": pre_const,
        "Const_After": post_const,
        "Stability_Before": pre_st,
        "Stability_After": post_st,
        "BIS": BIS
    }