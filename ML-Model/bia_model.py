import numpy as np
import pandas as pd
import re
from collections import Counter
import warnings
warnings.filterwarnings('ignore')

# ==========================
# KEYWORD DICTIONARIES
# ==========================

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
    "retested", "testing", "verification", "validated",
    "regression", "smoke", "sprint", "investigated", "resolved",
    "reviewed", "documented", "wrote", "executed"
}

COLLABORATION_WORDS = {
    "helped", "collaborated", "paired", "mentored", "reviewed",
    "discussed", "meeting", "presented", "shared", "supported",
    "coordinated", "assisted", "teamwork", "peer"
}

QUALITY_WORDS = {
    "refactored", "optimized", "documented", "cleaned", "improved",
    "enhanced", "polished", "tested", "validated", "verified", 
    "regression", "smoke", "verification", "coverage", 
    "accuracy", "consistency", "standards"
}

NEGATION_WORDS = {
    "not", "no", "never", "cannot", "can't", "didn't", "don't",
    "won't", "wouldn't", "hasn't", "haven't", "without", "unable", "forgot", "couldn't"
}

PROBLEMATIC_WORDS = {
    "forgot", "undefined", "failing", "inconsistent", "broken", "crash", "Time constraint"
}

SETUP_WORDS = {
    "setup", "installed", "configured", "cloned", "environment", "dependencies"
}

# Problem-resolution indicators
PROBLEM_INDICATORS = {
    "bug", "error", "issue", "blocked", "stuck", "failed", "problem"
}

RESOLUTION_INDICATORS = {
    "fixed", "resolved", "unblocked", "completed", "solved", "debugged"
}

FAILURE_PATTERNS = {

    "didn't complete", "didn't finish", "missed deadline", "couldn't deliver", "failed to complete"

}

# ==========================
# TOKENIZATION
# ==========================

def tokenize(text):
    """Convert text to lowercase tokens"""
    return re.findall(r'\b\w+\b', text.lower())

def detect_failure_patterns(text):
    text_lower = text.lower()
    return sum(1 for pattern in FAILURE_PATTERNS if pattern in text_lower)



# ==========================
# NEGATION-AWARE COUNTING
# ==========================

def count_keywords_with_negation(tokens, keywords):
    """
    Count keywords while avoiding negated instances
    Window size: 3 words before the keyword
    """
    count = 0
    window = []

    for token in tokens:
        window.append(token)
        if len(window) > 3:
            window.pop(0)

        if token in keywords:
            # Only count if not negated
            if not any(w in NEGATION_WORDS for w in window[:-1]):
                count += 1

    return count

# ==========================
# LOG QUALITY ASSESSMENT
# ==========================

def calculate_log_quality(text):
    """
    Custom log quality metric based on:
    - Word count
    - Vocabulary diversity
    - Repetition detection
    """
    if not text:
        return 0.3

    words = text.split()
    wc = len(words)

    # Too short
    if wc < 10:
        return 0.4
    
    # Too long
    if wc > 500:
        return 0.6

    # Check for excessive repetition
    freq = Counter(words)
    if max(freq.values()) > 5:
        return 0.5

    # Calculate vocabulary diversity
    diversity = len(set(words)) / wc

    if diversity < 0.3:
        return 0.6

    # Ideal range
    if 20 <= wc <= 200 and diversity >= 0.5:
        return 1.0

    return 0.8

# ==========================
# CUSTOM PATTERN DETECTION
# ==========================

def detect_problem_resolution_pattern(tokens):
    """
    Custom algorithm to detect problem-solving patterns
    Returns score based on presence of problems and resolutions
    """
    has_problem = any(t in PROBLEM_INDICATORS for t in tokens)
    has_resolution = any(t in RESOLUTION_INDICATORS for t in tokens)
    has_learning = any(t in LEARNING_WORDS for t in tokens)

    # Custom scoring logic
    if has_problem and has_resolution and has_learning:
        return 3.0  # Perfect: problem encountered, solved, and learned
    elif has_problem and has_resolution:
        return 2.0  # Good: problem solved
    elif has_problem and has_learning:
        return 1.0  # Neutral: problem exists, learning happening
    elif has_problem:
        return -1.0  # Bad: stuck on problem
    elif has_resolution:
        return 1.5  # Good: proactive resolution
    else:
        return 0.0  # No problem-solving activity

def calculate_completion_context(tokens):
    """
    Custom algorithm to assess task completion context
    Looks for patterns indicating successful completion
    """
    score = 0
    
    # Look for completion patterns
    for i in range(len(tokens) - 2):
        # Pattern: positive word + task word
        if tokens[i] in POSITIVE_WORDS:
            if i + 1 < len(tokens) and tokens[i+1] in TASK_WORDS:
                score += 2
                # Extra bonus if followed by successful outcome
                if i + 2 < len(tokens) and tokens[i+2] in {"successfully", "completely", "fully"}:
                    score += 1

    # Check for negative completion patterns
    for i in range(len(tokens) - 1):
        if tokens[i] in NEGATIVE_WORDS:
            # Check if followed by resolution
            if i + 1 < len(tokens) and tokens[i+1] in RESOLUTION_INDICATORS:
                score += 1  # Problem acknowledged and addressed
            else:
                score -= 0.5  # Problem without resolution

    return max(score, 0)  # Don't go negative

def calculate_proactive_score(tokens):
    """
    Custom metric for proactive vs reactive work
    """
    PROACTIVE_WORDS = {"proposed", "suggested", "initiated", "designed", "planned", "created"}
    REACTIVE_WORDS = {"firefighting", "urgent", "hotfix", "emergency", "critical"}
    
    proactive_count = sum(1 for t in tokens if t in PROACTIVE_WORDS)
    reactive_count = sum(1 for t in tokens if t in REACTIVE_WORDS)
    
    if proactive_count + reactive_count == 0:
        return 0
    
    # Return ratio: positive if more proactive, negative if more reactive
    return (proactive_count - reactive_count) / (proactive_count + reactive_count)

# ==========================
# FEATURE EXTRACTION
# ==========================

def extract_features(text):
    """
    Extract all custom features from log text
    """
    tokens = tokenize(text)

    # Basic keyword counts
    tasks = count_keywords_with_negation(tokens, TASK_WORDS)
    setup_tasks = count_keywords_with_negation(tokens, SETUP_WORDS)
    learning = count_keywords_with_negation(tokens, LEARNING_WORDS)
    negatives = count_keywords_with_negation(tokens, NEGATIVE_WORDS)
    positives = count_keywords_with_negation(tokens, POSITIVE_WORDS)
    collaboration = count_keywords_with_negation(tokens, COLLABORATION_WORDS)
    quality = count_keywords_with_negation(tokens, QUALITY_WORDS)
    problematic = count_keywords_with_negation(tokens, PROBLEMATIC_WORDS)

    # Custom pattern detection
    problem_solving = detect_problem_resolution_pattern(tokens)
    completion_context = calculate_completion_context(tokens)
    proactive_score = calculate_proactive_score(tokens)

    # Custom sentiment calculation
    sentiment = (
        positives * 1.0 -
        negatives * 1.5 - 
        problematic * 2.0 -
        detect_failure_patterns(text) * 3.0 +
        0.7 * quality +
        0.5 * problem_solving  # Add problem-solving bonus
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
        "problem_solving": problem_solving,
        "completion_context": completion_context,
        "proactive_score": proactive_score,
        "log_quality": calculate_log_quality(text)
    }

# ==========================
# DATAFRAME BUILDER
# ==========================

def build_df(logs, is_post=False):
    """
    Build scored dataframe from logs
    """
    rows = [extract_features(l) for l in logs]
    df = pd.DataFrame(rows)

    # Filter low-quality logs
    df = df[df["log_quality"] > 0.35].copy()

    if df.empty:
        return pd.DataFrame({"daily_score": [0.0]})

    # Normalize intensities
    for col in ["tasks", "learning", "collaboration", "quality"]:
        norm = max(df[col].quantile(0.75), 1)
        df[col + "_intensity"] = np.clip(df[col] / norm, 0, 1.5)

    # Task scale adjustment for post-review (expect less exploration)
    task_scale = 0.7 if is_post else 1.0

    # CUSTOM SCORING FORMULA (YOUR ALGORITHM)
    df["daily_score"] = (
        1.5 * df["tasks_intensity"] * task_scale +
        1.2 * df["learning_intensity"] +
        1.0 * df["collaboration_intensity"] +
        1.3 * df["quality_intensity"] +
        0.8 * df["problem_solving"] +  # New: problem-solving weight
        0.6 * df["completion_context"] +  # New: completion context weight
        0.4 * df["proactive_score"] +  # New: proactive work weight
        0.4 * df["sentiment"] +
        0.3 * df["tolerance"]
    ) * df["log_quality"]

    # Setup penalty (setup-only work without delivery)
    df.loc[
        (df["setup_tasks"] > 0) &
        (df["tasks_intensity"] < 0.5) &
        (df["quality_intensity"] < 0.5),
        "daily_score"
    ] *= 0.5

    # Learning-only penalty (exploration without implementation)
    df.loc[
        (df["learning_intensity"] > 0.8) & 
        (df["tasks_intensity"] == 0),
        "daily_score"
    ] *= 0.6

    # Clip to prevent negative scores
    # df["daily_score"] = np.clip(df["daily_score"], 0, None)

    return df

# ==========================
# CUSTOM TEMPORAL METRICS
# ==========================

def trend(arr):
    """
    Custom trend calculation: compare second half to first half
    """
    if len(arr) < 4:
        return 0.0

    mid = len(arr) // 2
    first_half = np.mean(arr[:mid])
    second_half = np.mean(arr[mid:])
    
    return float(second_half - first_half)

def stability(arr):
    """
    Custom stability metric: mean normalized by variance
    Higher = more stable performance
    """
    if len(arr) <= 1:
        return 0.0

    mean = np.mean(arr)
    var = np.var(arr)
    
    # Avoid division by zero
    return mean / (var + 0.01)

def consistency(arr):
    """
    Custom consistency metric: mean normalized by standard deviation
    Higher = more consistent performance
    """
    if len(arr) <= 1:
        return 0.0

    mean = np.mean(arr)
    std = np.std(arr)
    
    # Avoid division by zero
    return mean / (std + 0.001)

def calculate_momentum(pre_scores, post_scores):
    """
    Custom momentum calculation: trend improvement from pre to post
    """
    pre_trend = trend(pre_scores)
    post_trend = trend(post_scores)
    
    return post_trend - pre_trend

# ==========================
# PRE/POST ANALYSIS
# ==========================

def analyze(pre_logs, post_logs):
    """
    Main analysis function: Compare pre and post performance review logs
    Returns Behavioral Impact Score (BIS) and component metrics
    """
    # Build scored dataframes
    pre = build_df(pre_logs, is_post=False)
    post = build_df(post_logs, is_post=True)

    # Extract scores
    pre_scores = pre["daily_score"].values
    post_scores = post["daily_score"].values

    # Calculate averages
    pre_avg = float(np.mean(pre_scores))
    post_avg = float(np.mean(post_scores))

    # Calculate consistency metrics
    pre_const = consistency(pre_scores)
    post_const = consistency(post_scores)

    # Calculate stability metrics
    pre_st = stability(pre_scores)
    post_st = stability(post_scores)

    # Calculate deltas
    d_avg = post_avg - pre_avg
    d_const = post_const - pre_const
    d_st = post_st - pre_st

    # CUSTOM BEHAVIORAL IMPACT SCORE (BIS) FORMULA
    # Weights: 50% performance change, 30% consistency change, 20% stability change
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

    # ==========================
# FEATURE DISTRIBUTION ANALYSIS
# ==========================

def feature_distribution_analysis(texts):
    """
    Calculate feature prevalence across dataset
    Outputs count + percentage for each feature
    """

    total_logs = len(texts)

    # Counters
    feature_counts = {
        "Task Completion": 0,
        "Learning Activity": 0,
        "Setup Work": 0,
        "Collaboration": 0,
        "Quality Contributions": 0,
        "Problem-Solving Activity": 0,
        "Negative Sentiment": 0,
        "Proactive Work": 0
    }

    # Loop through logs
    for text in texts:
        f = extract_features(text)

        if f["tasks"] > 0:
            feature_counts["Task Completion"] += 1

        if f["learning"] > 0:
            feature_counts["Learning Activity"] += 1

        if f["setup_tasks"] > 0:
            feature_counts["Setup Work"] += 1

        if f["collaboration"] > 0:
            feature_counts["Collaboration"] += 1

        if f["quality"] > 0:
            feature_counts["Quality Contributions"] += 1

        if f["problem_solving"] > 0:
            feature_counts["Problem-Solving Activity"] += 1

        if f["sentiment"] < 0:
            feature_counts["Negative Sentiment"] += 1

        if f["proactive_score"] > 0:
            feature_counts["Proactive Work"] += 1

    # Convert to DataFrame
    results = []

    for feature, count in feature_counts.items():
        percentage = (count / total_logs) * 100
        results.append([feature, count, f"{percentage:.0f}%"])

    df = pd.DataFrame(
        results,
        columns=["Feature", "Prevalence (Logs)", "Percentage"]
    )

    print("\n" + "="*60)
    print("FEATURE DISTRIBUTION ANALYSIS")
    print("="*60)
    print(df.to_string(index=False))
    print("="*60)

    return df


# # ==========================
# # CLASSIFICATION
# # ==========================

def label_from_score(score):
    """
    Convert numeric score to categorical label
    Thresholds can be tuned based on validation data
    """
    GOOD_THRESHOLD = 0.8
    BAD_THRESHOLD = 0

    if score >= GOOD_THRESHOLD:
        return 1      # Good
    elif score < BAD_THRESHOLD:
        return -1     # Bad
    else:
        return 0      # Neutral



# # ==========================
# # TESTING & VALIDATION
# # ==========================

def score_single_log(log_text):
    """Score a single log entry"""
    df = build_df([log_text], is_post=False)
    return float(df["daily_score"].iloc[0])
