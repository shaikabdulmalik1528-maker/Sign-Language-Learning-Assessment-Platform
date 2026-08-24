import sys
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.database.database import SessionLocal, engine, Base
import app.models.session as session_models
from app.models.learner_state import LearnerAlphabetState, LearnerStateHistory
from app.models.progress import LearnerProgressSummary

from app.services.session_service import end_practice_session
from app.services.recommendation_service import get_recommended_alphabets

# Automatically locate PracticeSession and PracticeAttempt classes from session_models
PracticeSession = getattr(session_models, "PracticeSession", None)

# Find any model in session_models that represents attempts
PracticeAttempt = None
for attr_name in dir(session_models):
    attr = getattr(session_models, attr_name)
    if isinstance(attr, type) and issubclass(attr, Base) and attr != Base:
        if "attempt" in attr_name.lower():
            PracticeAttempt = attr
            break

# Fallback: if not named *Attempt*, grab the second model in session_models
if PracticeAttempt is None:
    for attr_name in dir(session_models):
        attr = getattr(session_models, attr_name)
        if isinstance(attr, type) and issubclass(attr, Base) and attr != Base and attr != PracticeSession:
            PracticeAttempt = attr
            break

User = getattr(session_models, "User", None)

def run_simulation():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    user_id = 1
    if User is not None:
        try:
            test_user = db.query(User).first()
            if not test_user:
                test_user = User(username="simulated_learner", email="simulated_learner@example.com")
                db.add(test_user)
                db.commit()
                db.refresh(test_user)
            user_id = test_user.id
        except Exception:
            db.rollback()
            user_id = 1

    print("\n=======================================================")
    print(f"   STARTING 5-SESSION SIMULATION FOR USER ID: {user_id}")
    print("=======================================================\n")

    session_scenarios = [
        [("A", False, 0.40), ("A", True, 0.65), ("B", False, 0.35), ("C", True, 0.80)],
        [("B", True, 0.78), ("B", True, 0.82), ("A", True, 0.85), ("D", False, 0.50)],
        [("A", True, 0.90), ("A", True, 0.94), ("B", True, 0.88), ("C", True, 0.92)],
        [("A", True, 0.97), ("D", True, 0.86), ("D", True, 0.89), ("E", False, 0.45)],
        [("E", True, 0.79), ("E", True, 0.83), ("B", True, 0.94), ("C", True, 0.95)]
    ]

    for i, attempts_data in enumerate(session_scenarios, 1):
        recs = get_recommended_alphabets(db, user_id, limit=3)
        print(f"------------------- SESSION {i} -------------------")
        print(f"Target Recommendations: {recs}")

        sess = PracticeSession(user_id=user_id, status="IN_PROGRESS")
        db.add(sess)
        db.commit()
        db.refresh(sess)

        for char, correct, conf in attempts_data:
            att_kwargs = {"session_id": sess.id, "is_correct": correct}
            
            # Dynamically map target character attribute name
            if hasattr(PracticeAttempt, "alphabet_char"):
                att_kwargs["alphabet_char"] = char
            elif hasattr(PracticeAttempt, "target_char"):
                att_kwargs["target_char"] = char
            elif hasattr(PracticeAttempt, "alphabet"):
                att_kwargs["alphabet"] = char
            elif hasattr(PracticeAttempt, "predicted_alphabet"):
                att_kwargs["predicted_alphabet"] = char

            # Dynamically map confidence attribute name
            if hasattr(PracticeAttempt, "confidence_score"):
                att_kwargs["confidence_score"] = conf
            elif hasattr(PracticeAttempt, "confidence"):
                att_kwargs["confidence"] = conf

            att = PracticeAttempt(**att_kwargs)
            db.add(att)

        db.commit()

        res = end_practice_session(db, sess.id)
        summary = res["progress_summary"]

        print(f"Status: COMPLETED")
        print(f"Accuracy Improvement: {summary.accuracy_improvement:+.3f}")
        print(f"Total Learning Progress: {summary.total_learning_progress}%")
        print(f"Most Improved: {summary.most_improved_alphabet} | Least Improved: {summary.least_improved_alphabet}")
        print(f"State Distribution: {summary.state_counts}\n")

    db.close()

if __name__ == "__main__":
    run_simulation()
    