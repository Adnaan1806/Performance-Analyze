
import numpy as np
import pandas as pd
import re
from collections import Counter
from sklearn.model_selection import StratifiedShuffleSplit
import warnings
warnings.filterwarnings('ignore')


# KEYWORD DICTIONARIES


POSITIVE_WORDS = {
    "completed", "finished", "implemented", "developed", "resolved", "fixed",
    "tested", "deployed", "integrated", "delivered", "helped", "collaborated",
    "learned", "understood", "improved", "explored", "debugged", "pushed",
    "refactored", "optimized", "documented", "reviewed", "shipped", "achieved",
    "successful", "merged", "released", "approved", "solved", "accomplished",
    "enhanced", "upgraded", "validated", "verified"
}
NEGATIVE_WORDS = {
    "struggled", "blocked", "delay", "delayed", "confused", "bug", "error",
    "failed", "issue", "stuck", "problem", "difficulty", "challenge",
    "blocker", "pending", "waiting", "unclear", "missing", "blockers",
    "access", "constraints", "workload", "limited", "clarification"
}
LEARNING_WORDS = {
    "learned", "understood", "studied", "research", "explored",
    "experimented", "practiced", "training", "workshop", "course",
    "reading", "investigating", "analyzing", "verification", "regression",
    "understanding", "analysis", "mapping", "discovered", "gained"
}
TASK_WORDS = {
    "completed", "implemented", "developed", "fixed", "created",
    "tested", "deployed", "updated", "debugged", "pushed",
    "built", "designed", "configured", "setup", "migrated",
    "validation", "sprint", "investigated", "resolved",
    "documented", "wrote", "executed"
}
COLLABORATION_WORDS = {
    "helped", "collaborated", "paired", "mentored", "reviewed",
    "discussed", "meeting", "presented", "shared", "supported",
    "coordinated", "assisted", "teamwork", "peer"
}
QUALITY_WORDS = {
    "refactored", "optimized", "documented", "cleaned", "improved",
    "enhanced", "polished", "tested", "validated", "verified",
    "coverage", "accuracy", "consistency", "standards"
}
NEGATION_WORDS = {
    "not", "no", "never", "cannot", "can't", "didn't", "don't",
    "won't", "wouldn't", "hasn't", "haven't", "without", "unable", "forgot", "couldn't"
}
PROBLEMATIC_WORDS  = {"forgot", "undefined", "failing", "inconsistent", "broken", "crash"}
SETUP_WORDS        = {"setup", "installed", "configured", "cloned", "environment", "dependencies"}
PROBLEM_INDICATORS = {"bug", "error", "issue", "blocked", "stuck", "failed", "problem"}
RESOLUTION_INDICATORS = {"fixed", "resolved", "unblocked", "completed", "solved", "debugged"}
FAILURE_PATTERNS   = {
    "didn't complete", "didn't finish", "missed deadline",
    "couldn't deliver", "failed to complete"
}

STRONG_DELIVERY_WORDS = {
    "implemented", "developed", "configured", "debugged", "integrated",
    "built", "created", "deployed", "merged", "refactored", "optimized",
    "practiced", "validated", "executed", "designed", "wrote",
    "added", "finalized", "applied", "performed", "conducted", "connected"
}


PASSIVE_ACTIVITY_WORDS = {
    "standup", "meeting", "planning", "demo", "attended",
    "discussed", "participated", "monitored", "watched",
    "retested", "regression"
}
NEUTRAL_SIGNAL_WORDS = {"peer", "scenarios", "continued", "started", "reported"}


REVERTED_WORDS = {"reverted", "revert", "undone", "cancelled", "rollback"}


SECURITY_WORDS = {
    "ids", "ips", "siem", "firewall", "phishing", "malware", "vulnerability",
    "cve", "cvss", "patch", "iam", "mfa", "edr", "soc", "cyber", "infosec",
    "traffic", "anomal", "suspicious", "brute"
}



def tokenize(text):
    return re.findall(r'\b\w+\b', text.lower())

def detect_failure_patterns(text):
    return sum(1 for p in FAILURE_PATTERNS if p in text.lower())

def count_keywords_with_negation(tokens, keywords):
    count, window = 0, []
    for token in tokens:
        window.append(token)
        if len(window) > 3: window.pop(0)
        if token in keywords and not any(w in NEGATION_WORDS for w in window[:-1]):
            count += 1
    return count

def calculate_log_quality(text):
    if not text: return 0.3
    words = text.split(); wc = len(words)
    if wc < 10:  return 0.4
    if wc > 500: return 0.6
    freq = Counter(words)
    if max(freq.values()) > 5: return 0.5
    diversity = len(set(words)) / wc
    if diversity < 0.3:  return 0.6
    if 20 <= wc <= 200 and diversity >= 0.5: return 1.0
    return 0.8

def detect_problem_resolution_pattern(tokens):
    hp = any(t in PROBLEM_INDICATORS    for t in tokens)
    hr = any(t in RESOLUTION_INDICATORS for t in tokens)
    hl = any(t in LEARNING_WORDS        for t in tokens)
    if hp and hr and hl: return 3.0
    elif hp and hr:      return 2.0
    elif hp and hl:      return 1.0
    elif hp:             return -1.0
    elif hr:             return 1.5
    return 0.0

def calculate_completion_context(tokens):
    score = 0
    for i in range(len(tokens) - 2):
        if tokens[i] in POSITIVE_WORDS and tokens[i+1] in TASK_WORDS:
            score += 2
            if i+2 < len(tokens) and tokens[i+2] in {"successfully","completely","fully"}:
                score += 1
    for i in range(len(tokens) - 1):
        if tokens[i] in NEGATIVE_WORDS:
            score += 1 if tokens[i+1] in RESOLUTION_INDICATORS else -0.5
    return max(score, 0)

def calculate_proactive_score(tokens):
    p = sum(1 for t in tokens if t in {"proposed","suggested","initiated","designed","planned","created"})
    r = sum(1 for t in tokens if t in {"firefighting","urgent","hotfix","emergency","critical"})
    return 0 if p+r == 0 else (p-r)/(p+r)

def calculate_deliverable_boost(tokens):
    return sum(1 for t in tokens if t in STRONG_DELIVERY_WORDS)

def calculate_neutral_penalty(tokens):
    return (sum(1 for t in tokens if t in PASSIVE_ACTIVITY_WORDS) +
            sum(1 for t in tokens if t in NEUTRAL_SIGNAL_WORDS))

def calculate_revert_penalty(tokens):
    return sum(1 for t in tokens if t in REVERTED_WORDS)



# CONTEXT RULES


def apply_context_rules(score, text, tokens):
    text_lower = text.lower()
    has_delivery       = calculate_deliverable_boost(tokens) > 0
    has_sprint_delivery = any(t in {"implemented","developed","built","integrated","deployed","fixed"} for t in tokens)
    is_security        = (any(t in SECURITY_WORDS for t in tokens) or
                          any(w in text_lower for w in ["ids/ips","siem","firewall","phishing","vulnerability"]))

    
    if re.search(r'\bre[\s\-]?test', text_lower):
        score *= 0.30

    
    if "peer testing" in text_lower or "peer test" in text_lower:
        score *= 0.40

    
    if not has_delivery and not has_sprint_delivery:
        if re.search(r'\b(regression testing|uat testing|smoke testing|regression cycles)\b', text_lower):
            score *= 0.45

   
    if re.search(r'\b(installed|set up|setup)\b', text_lower):
        if not has_delivery and not has_sprint_delivery:
            score *= 0.45

 
    if re.search(r'\b(reviewed and discussed|discussed.*requirement|requirement document)\b', text_lower):
        if not has_delivery and not has_sprint_delivery:
            score *= 0.45

   
    has_investigation = any(t in {"investigated","analyzed","analysed","investigating"} for t in tokens)
    has_resolution    = any(t in RESOLUTION_INDICATORS for t in tokens)
    if has_investigation and not has_resolution and not has_delivery and not is_security:
        score *= 0.50

    
    if re.search(r'\b(monitored deployments|monitored.*release|validated releases)\b', text_lower):
        score *= 0.45

    
    if re.search(r'\bproduction release\b', text_lower):
        if not has_sprint_delivery:
            score *= 0.40

    
    if re.search(r'\breviewed pull requests?\b', text_lower):
        if not has_sprint_delivery:
            score *= 0.50

  
    if re.search(r'\brevie\w+\s+existing\b', text_lower):
        if not has_sprint_delivery:
            score *= 0.40

  
    if re.search(r'\bcreated?\s+sample\b', text_lower):
        score *= 0.40

    
    if is_security and "monitored" in tokens:
        score *= 1.5


    if re.search(r'\bsprint\s+testing\b', text_lower) and re.search(r'\bcompleted\b', text_lower):
        score = max(score, 1.6)

    return score



# FEATURE EXTRACTION


def extract_features(text):
    tokens    = tokenize(text)
    quality   = count_keywords_with_negation(tokens, QUALITY_WORDS)
    negatives = count_keywords_with_negation(tokens, NEGATIVE_WORDS)
    positives = count_keywords_with_negation(tokens, POSITIVE_WORDS)
    ps        = detect_problem_resolution_pattern(tokens)
    return {
        "tasks":              count_keywords_with_negation(tokens, TASK_WORDS),
        "setup_tasks":        count_keywords_with_negation(tokens, SETUP_WORDS),
        "learning":           count_keywords_with_negation(tokens, LEARNING_WORDS),
        "collaboration":      count_keywords_with_negation(tokens, COLLABORATION_WORDS),
        "quality":            quality,
        "sentiment":          (positives*1.0 - negatives*1.5
                               - count_keywords_with_negation(tokens, PROBLEMATIC_WORDS)*2.0
                               - detect_failure_patterns(text)*3.0
                               + 0.7*quality + 0.5*ps),
        "tolerance":          1 if negatives > 0 else 0,
        "problem_solving":    ps,
        "completion_context": calculate_completion_context(tokens),
        "proactive_score":    calculate_proactive_score(tokens),
        "log_quality":        calculate_log_quality(text),
        "deliverable_boost":  calculate_deliverable_boost(tokens),
        "neutral_penalty":    calculate_neutral_penalty(tokens),
        "revert_penalty":     calculate_revert_penalty(tokens),
    }



# DATAFRAME BUILDER


def build_df(logs, is_post=False):
    rows = [extract_features(l) for l in logs]
    df   = pd.DataFrame(rows)
    df   = df[df["log_quality"] > 0.35].copy()
    if df.empty:
        return pd.DataFrame({"daily_score": [0.0]})

    for col in ["tasks", "learning", "collaboration", "quality"]:
        norm = max(df[col].quantile(0.75), 1)
        df[col+"_intensity"] = np.clip(df[col]/norm, 0, 1.5)

    task_scale = 0.7 if is_post else 1.0

    df["daily_score"] = (
        1.5 * df["tasks_intensity"] * task_scale +
        1.2 * df["learning_intensity"] +
        1.0 * df["collaboration_intensity"] +
        1.3 * df["quality_intensity"] +
        0.8 * df["problem_solving"] +
        0.6 * df["completion_context"] +
        0.4 * df["proactive_score"] +
        0.4 * df["sentiment"] +
        0.3 * df["tolerance"] +
        1.8 * df["deliverable_boost"] -
        0.9 * df["neutral_penalty"] -
        2.5 * df["revert_penalty"]
    ) * df["log_quality"]

    # Penalty for setup tasks
    df.loc[
        (df["setup_tasks"] > 0) &
        (df["tasks_intensity"] < 0.5) &
        (df["quality_intensity"] < 0.5),
        "daily_score"
    ] *= 0.5


    df.loc[
        (df["learning_intensity"] > 0.8) &
        (df["tasks_intensity"] == 0) &
        (df["deliverable_boost"] == 0),
        "daily_score"
    ] *= 0.75

    return df



# TEMPORAL METRICS


def trend(arr):
    if len(arr) < 4: return 0.0
    mid = len(arr) // 2
    return float(np.mean(arr[mid:]) - np.mean(arr[:mid]))

def stability(arr):
    if len(arr) <= 1: return 0.0
    return np.mean(arr) / (np.var(arr) + 0.01)

def consistency(arr):
    if len(arr) <= 1: return 0.0
    return np.mean(arr) / (np.std(arr) + 0.001)


# PRE/POST ANALYSIS

def analyze(pre_logs, post_logs):
    pre  = build_df(pre_logs,  is_post=False)
    post = build_df(post_logs, is_post=True)

    pre_scores  = pre["daily_score"].values
    post_scores = post["daily_score"].values

    pre_avg   = float(np.mean(pre_scores))
    post_avg  = float(np.mean(post_scores))
    pre_c     = consistency(pre_scores)
    post_c    = consistency(post_scores)
    pre_st    = stability(pre_scores)
    post_st   = stability(post_scores)

    BIS = 0.5*(post_avg-pre_avg) + 0.3*(post_c-pre_c) + 0.2*(post_st-pre_st)
    return {
        "Pre_Avg": pre_avg, "Post_Avg": post_avg,
        "Const_Before": pre_c, "Const_After": post_c,
        "Stability_Before": pre_st, "Stability_After": post_st,
        "BIS": BIS
    }


GOOD_THRESHOLD = 1.55
BAD_THRESHOLD  = -999

def label_from_score(score):
    if score >= GOOD_THRESHOLD: return 1
    if score < BAD_THRESHOLD:   return -1
    return 0



# SINGLE LOG SCORER

def score_single_log(log_text):
    """Score a single log. Applies base scoring + context rule adjustments."""
    df     = build_df([log_text])
    raw    = float(df["daily_score"].iloc[0])
    tokens = tokenize(log_text)
    return apply_context_rules(raw, log_text, tokens)
