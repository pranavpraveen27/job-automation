from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi_app.api.routes.resume import router as resume_router
from fastapi_app.api.routes.jobs import router as jobs_router
from fastapi_app.api.routes.cover_letter import router as cover_letter_router
from fastapi_app.core.config import settings


def create_app() -> FastAPI:
    app = FastAPI(title="AI Job Application Agent", version="0.1.0")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(resume_router, prefix="/resume", tags=["resume"])
    app.include_router(jobs_router, prefix="/jobs", tags=["jobs"])
    app.include_router(cover_letter_router, prefix="/cover-letter", tags=["cover-letter"])
    return app


app = create_app()
