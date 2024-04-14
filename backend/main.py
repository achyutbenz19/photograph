from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from typing import List, Dict
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi import File, UploadFile, HTTPException
from database import get_all_edges, get_all_nodes, insert_relations, filter_new_documents
from langchain.docstore.document import Document
from extract import extract_batch, stream_summary
from pydantic import BaseModel
from helpers import save_file


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup event that initializes the application's resources.
    """
    print("Server Started")
    yield
    print("Server Shutting down")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root() -> str:
    """
    Root endpoint that provides basic statistics of the application.

    Returns:
        dict: A dictionary containing the count of active chatbots in the cache.
    """
    return "PhotoGraph :)"



@app.post("/add")
async def upload_content(files: List[UploadFile] = File(...)):
    """
    Endpoint for uploading multiple files to the platform.
    """
    MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB in bytes
    ALLOWED_TYPES = ["image/png", "video/mp4"]

    file_paths = []
    file_types = []
    for file in files:
        content_type = file.content_type
        if content_type not in ALLOWED_TYPES:
            raise HTTPException(
                status_code=415,
                detail="Invalid file type. Only PNG images and MP4 videos are allowed."
            )



        # # Check if file size exceeds the maximum limit
        # if len(file_content) > MAX_FILE_SIZE:
        #     raise HTTPException(
        #         status_code=413,
        #         detail="File size exceeds the maximum limit of 20 MB."
        #     )

        file_content = await file.read()
        file_type = content_type
        file_path = save_file(file_content, file_type)
        file_paths.append(file_path)
        file_types.append(file_type)

    ### Extract, pre proccess, insert
    relations = await extract_batch(file_paths, file_types)
    # Add any additional metadata later
    documents = [Document(page_content=path) for path in file_paths]
    documents = await filter_new_documents(documents)
    await insert_relations(documents, relations)
    ###

    return "Success"


class Summary(BaseModel):
    node: str
    neighbours: List[Dict]

@app.post("/summary")
async def summary(data: Summary):
    node = data.node
    neighbours = data.neighbours
    response = await stream_summary(node, neighbours)
    return StreamingResponse(response)

@app.get("/nodes")
async def get_nodes():
    nodes = await get_all_nodes()
    return nodes


@app.get("/edges")
async def get_edges():
    edges = await get_all_edges()
    return edges