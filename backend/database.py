from typing import List, Dict, Any, Optional
from supabase import create_client, Client
from langchain.docstore.document import Document
import os

# Create a single supabase client for interacting with your database
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_ANON_KEY")
client = create_client(url, key)

async def insert_node(data: str, metadata: Optional[Dict[str, Any]] = None) -> str:
    # Check if a node with the same data already exists
    response = await client.from_("nodes").select("id").eq("data", data).single()
    existing_node = response.data
    error = response.error

    if existing_node:
        # Node already exists, return the existing node ID
        return existing_node["id"]
    else:
        # Insert a new node
        response = await client.from_("nodes").insert({"data": data, "metadata": metadata}).select().single()
        inserted_node = response.data
        insert_error = response.error

        if insert_error:
            raise insert_error

        return inserted_node["id"]

async def insert_edge(data: str, from_node_data: str, to_node_data: str, page_content: str, metadata: Optional[Dict[str, Any]] = None) -> str:
    # Get the IDs of the source and target nodes
    from_node_id = await insert_node(from_node_data)
    to_node_id = await insert_node(to_node_data)

    # Check if an edge with the same data already exists
    response = await client.from_("edges").select("id").eq("data", data).single()
    existing_edge = response.data
    error = response.error

    if error and error.code != "PGRST116":
        raise error

    if existing_edge:
        # Edge already exists, return the existing edge ID
        return existing_edge["id"]
    else:
        # Insert a new edge
        response = await client.from_("edges").upsert({
            "data": data,
            "from": from_node_id,
            "to": to_node_id,
            "page_content": page_content,
            "metadata": metadata
        }).select().single()
        inserted_edge = response.data
        insert_error = response.error

        if insert_error:
            raise insert_error

        return inserted_edge["id"]

async def filter_new_documents(documents: List[Document]) -> List[Document]:
    batch_size = 1
    new_documents: List[Document] = []

    for i in range(0, len(documents), batch_size):
        batch = documents[i:i + batch_size]
        page_contents = [doc.page_content for doc in batch]

        response = await client.from_("edges").select().filter("page_content", "in", page_contents)
        existing_edges = response.data
        error = response.error

        if error:
            raise error

        existing_page_contents = set(edge["page_content"] for edge in existing_edges)
        new_batch_documents = [doc for doc in batch if doc.page_content not in existing_page_contents]
        new_documents.extend(new_batch_documents)

    return new_documents

async def get_all_nodes() -> List[Dict[str, Any]]:
    page_size = 600
    page = 0
    nodes: List[Dict[str, Any]] = []

    while True:
        response = await client.from_("nodes").select("*").range(page * page_size, (page + 1) * page_size - 1)
        page_nodes = response.data
        error = response.error

        if error:
            raise error

        nodes.extend(page_nodes)

        if len(page_nodes) < page_size:
            break

        page += 1

    return nodes

async def get_all_edges() -> List[Dict[str, Any]]:
    page_size = 600
    page = 0
    edges: List[Dict[str, Any]] = []

    while True:
        response = await client.from_("edges").select("*").range(page * page_size, (page + 1) * page_size - 1)
        page_edges = response.data
        error = response.error

        if error:
            raise error

        edges.extend(page_edges)

        if len(page_edges) < page_size:
            break

        page += 1

    return edges