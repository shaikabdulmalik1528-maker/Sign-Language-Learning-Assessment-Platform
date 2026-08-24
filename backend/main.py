from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import analytics_router, learning_cycle_router, recommendation_router, session_router

app = FastAPI(title="Sign Language Assessment Platform", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(learning_cycle_router.router)
app.include_router(recommendation_router.router)
app.include_router(analytics_router.router)
app.include_router(session_router.router)

@app.get("/")
def root():
    return {"status": "ok", "message": "Sign Language Platform API running"}
