from fastapi import FastAPI

from fastapi.middleware.cors import (
    CORSMiddleware
)

from app.api.routes import router

from app.database import (
    initialize_database
)

# =====================================
# FASTAPI APP
# =====================================

app = FastAPI(

    title="KubeNexus AI Backend",

    description="""
    AI-powered Kubernetes observability backend.

    Features:
    - Multi-agent AI analysis
    - Root cause detection
    - Log intelligence
    - Health scoring
    - NLP observability assistant
    - Blast radius analysis
    - Historical metrics
    """,

    version="1.0.0"
)

# =====================================
# CORS CONFIGURATION
# =====================================

app.add_middleware(

    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)

# =====================================
# STARTUP EVENTS
# =====================================

@app.on_event("startup")

def startup():

    print("\nStarting KubeNexus Backend...\n")

    # Initialize SQLite database
    initialize_database()

    print("SQLite database initialized")

    print("Backend startup completed\n")


# =====================================
# REGISTER ROUTES
# =====================================

app.include_router(router)

# =====================================
# ROOT ROUTE
# =====================================

@app.get("/")

def home():

    return {

        "message": "KubeNexus AI Backend Running",

        "status": "healthy",

        "docs": "/docs"
    }