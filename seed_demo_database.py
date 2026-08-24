import sys
import os
import uuid
import random
from datetime import datetime, timezone, timedelta

# Add backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from app.database.database import SessionLocal
from app.models.session import PracticeSession, AssessmentAttempt
import app.models.progress as progress_module

# Dynamically locate the LearnerProgress model class inside progress.py
LearnerProgressModel = None
for attr_name in dir(progress_module):
    attr = getattr(progress_module, attr_name)
    if isinstance(attr, type) and hasattr(attr, "__tablename__"):
        LearnerProgressModel = attr
        break

def get_valid_kwargs(model_class, **kwargs):
    """Filter kwargs to only include valid column names for the model."""
    valid_cols = {c.name for c in model_class.__table__.columns}
    return {k: v for k, v in kwargs.items() if k in valid_cols}

def seed_demo_data():
    db = SessionLocal()
    print("Seeding dynamic demonstration data into SQLite database...")

    user_id = 1
    alphabets = [chr(i) for i in range(ord('A'), ord('Z') + 1)]

    # 1. Create 5 Practice Sessions with Attempt History
    for s_idx in range(1, 6):
        session_id = str(uuid.uuid4())
        now_utc = datetime.now(timezone.utc) - timedelta(days=6 - s_idx)
        
        session_kwargs = get_valid_kwargs(
            PracticeSession,
            id=session_id,
            user_id=user_id,
            status="COMPLETED",
            created_at=now_utc,
            timestamp=now_utc,
            started_at=now_utc
        )
        
        session = PracticeSession(**session_kwargs)
        db.add(session)
        db.commit()

        # Generate 6 attempts per session
        for _ in range(6):
            alpha = random.choice(['A', 'B', 'C', 'D', 'E', 'F', 'G'])
            is_corr = random.choice([1, 1, 1, 0])  # ~75% accuracy rate
            conf = round(random.uniform(0.85, 0.98), 2) if is_corr else round(random.uniform(0.35, 0.60), 2)
            
            attempt_kwargs = get_valid_kwargs(
                AssessmentAttempt,
                session_id=session_id,
                alphabet=alpha,
                is_correct=is_corr,
                confidence=conf,
                created_at=now_utc,
                timestamp=now_utc
            )
            
            attempt = AssessmentAttempt(**attempt_kwargs)
            db.add(attempt)
        db.commit()

    # 2. Upsert (Update or Insert) Progress States to avoid UNIQUE constraint conflicts
    if LearnerProgressModel:
        mastered_letters = ['A', 'B', 'D', 'E', 'F', 'G']
        learning_letters = ['H', 'I', 'J']
        revision_letters = ['C']

        for alpha in alphabets:
            if alpha in mastered_letters:
                state = "MASTERED"
                acc = 0.95
            elif alpha in learning_letters:
                state = "LEARNING"
                acc = 0.65
            elif alpha in revision_letters:
                state = "NEEDS_REVISION"
                acc = 0.33
            else:
                state = "NOT_ATTEMPTED"
                acc = 0.0

            # Check if record already exists for (user_id, alphabet)
            existing_p = db.query(LearnerProgressModel).filter(
                LearnerProgressModel.user_id == user_id,
                LearnerProgressModel.alphabet == alpha
            ).first()

            if existing_p:
                # Update existing row
                existing_p.current_state = state
                existing_p.rolling_accuracy = acc
                if hasattr(existing_p, 'total_attempts'):
                    existing_p.total_attempts = 5 if state != "NOT_ATTEMPTED" else 0
            else:
                # Create new row
                progress_kwargs = get_valid_kwargs(
                    LearnerProgressModel,
                    user_id=user_id,
                    alphabet=alpha,
                    current_state=state,
                    rolling_accuracy=acc,
                    total_attempts=5 if state != "NOT_ATTEMPTED" else 0
                )
                p = LearnerProgressModel(**progress_kwargs)
                db.add(p)

        db.commit()

    db.close()
    print("SUCCESS: Database successfully seeded with 5 sessions, 30 attempts, and multi-tier letter progress!")

if __name__ == "__main__":
    seed_demo_data()
