from enum import Enum
from dataclasses import dataclass
from datetime import datetime
@dataclass
class BaseUserScheme:
    id : int
    username : str
    rights : int = 0
    article_count : int = 0
    category_count : int = 0
    task_count : int = 0
    created_at : str = None
    campaign_count : int = 0
    jury_count : int = 0
    jury_vote_count : int = 0
    submission_count : int = 0
    points : int = 0
    wiki_registered_at : datetime | str = None
    feedback_ui_score : int = 0
    feedback_speed_score : int = 0
    feedback_note : str = None
@dataclass
class FeedbackScheme:
    username : str = None
    ui_score : int = 0
    speed_score : int = 0
    why_better : str = ''
    feature_request : str = ''
    @staticmethod
    def from_dict(d : dict[str, str | int]):
        if d['feedback_note'].find('\n\n\n') != -1:
            why_better, feature_request = d['feedback_note'].split('\n\n\n', 1)
        else:
            why_better, feature_request = d['feedback_note'], ''
        return FeedbackScheme(
            username = d['username'],
            ui_score = d['feedback_ui_score'],
            speed_score = d['feedback_speed_score'],
            why_better = why_better,
            feature_request = feature_request
        )