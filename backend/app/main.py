from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

# Import core routers and standalone API endpoints
from app.routers import (
    session_router,
    analytics_router,
    recommendation_router,
    report_router,
    learning_cycle_router
)
from app.api import lessons, predict, practice

app = FastAPI(
    title="Sign Language Platform API",
    version="1.0.0",
    description="Backend services for Learner State Engine & Autonomous Learning Cycle"
)

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "An unexpected error occurred while processing your request.",
            "details": str(exc)
        }
    )

# Health Check Route
@app.get("/health", tags=["Health Check"])
async def health_check():
    return {"status": "ok", "message": "Sign Language API is fully operational"}

# Dashboard Metrics Endpoint
@app.get("/dashboard/metrics/{user_id}", tags=["Dashboard"])
async def get_dashboard_metrics(user_id: int):
    return {
        "overall_accuracy": 0.785,
        "total_attempts": 30,
        "sessions_completed": 5,
        "average_confidence": 0.942,
        "accuracy_trend": [
            {"session": "S1", "accuracy": 65},
            {"session": "S2", "accuracy": 72},
            {"session": "S3", "accuracy": 78},
            {"session": "S4", "accuracy": 85},
            {"session": "S5", "accuracy": 92},
        ],
        "mastery_grid": {
            "A": "MASTERED", "B": "MASTERED", "C": "IMPROVING", "D": "MASTERED",
            "E": "IMPROVING", "F": "NEEDS_REVISION", "G": "NOT_ATTEMPTED", "H": "NOT_ATTEMPTED",
            "I": "MASTERED", "J": "NOT_ATTEMPTED", "K": "IMPROVING", "L": "MASTERED",
            "M": "NOT_ATTEMPTED", "N": "NOT_ATTEMPTED", "O": "IMPROVING", "P": "NOT_ATTEMPTED",
            "Q": "NOT_ATTEMPTED", "R": "IMPROVING", "S": "MASTERED", "T": "NOT_ATTEMPTED",
            "U": "NOT_ATTEMPTED", "V": "IMPROVING", "W": "NOT_ATTEMPTED", "X": "NEEDS_REVISION",
            "Y": "NOT_ATTEMPTED", "Z": "NOT_ATTEMPTED"
        }
    }

# Include Core Sub-Routers
app.include_router(session_router.router)
app.include_router(analytics_router.router)
app.include_router(recommendation_router.router)
app.include_router(report_router.router)
app.include_router(learning_cycle_router.router)

# Include Additional API Endpoints
app.include_router(lessons.router)
app.include_router(predict.router)
app.include_router(practice.router)
