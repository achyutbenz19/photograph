import asyncio
from typing import List, Dict, Any, Optional
from supabase import create_client
from langchain.docstore.document import Document
from logger import logger
import os

# Create a single supabase client for interacting with your database
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_ANON_KEY")
client = create_client(url, key)

async def insert_relations(documents: List[Document], relations: List[dict]):
    batch_size = 10  # Set the desired batch size

    for i in range(0, len(documents), batch_size):
        batch_documents = documents[i:i + batch_size]
        batch_relations = relations[i:i + batch_size]

        async def process_document(document, index):
            document_relations = batch_relations[index]
            for relation in document_relations:
                if not relation:
                    continue

                node_1 = relation["node_1"]
                node_2 = relation["node_2"]
                edge = relation["edge"]

                # Insert nodes
                node1_id = await insert_node(node_1, document.metadata)
                node2_id = await insert_node(node_2, document.metadata)

                # Insert edge
                await insert_edge(
                    edge,
                    node_1,
                    node_2,
                    document.page_content,
                    document.metadata,
                )

        promises = [
            process_document(document, index)
            for index, document in enumerate(batch_documents)
        ]
        await asyncio.gather(*promises)

async def insert_node(data: str, metadata: Optional[Dict[str, Any]] = None) -> str:
    # Check if a node with the same data already exists
    response = client.from_("nodes").select("id").eq("data", data).limit(1).execute()
    logger.debug(f"node: {response=}")
    existing_node = None if len(response.data) == 0 else response.data[0]

    if existing_node:
        # Node already exists, return the existing node ID
        return existing_node["id"]
    else:
        # Insert a new node
        response = client.from_("nodes").upsert({"data": data, "metadata": metadata}).execute()
        logger.debug(f"Upsert Node: {response=}")
        inserted_node = None if len(response.data) == 0 else response.data[0]

        return inserted_node["id"]

async def insert_edge(data: str, from_node_data: str, to_node_data: str, page_content: str, metadata: Optional[Dict[str, Any]] = None) -> str:
    # Get the IDs of the source and target nodes
    from_node_id = await insert_node(from_node_data)
    to_node_id = await insert_node(to_node_data)

    # Check if an edge with the same data already exists
    response = client.from_("edges").select("id").eq("data", data).execute()
    logger.debug(f"edge: {response=}")
    existing_edge = None if len(response.data) == 0 else response.data[0]

    if existing_edge:
        # Edge already exists, return the existing edge ID
        return existing_edge["id"]
    else:
        # Insert a new edge
        response = client.from_("edges").upsert({
            "data": data,
            "from": from_node_id,
            "to": to_node_id,
            "page_content": page_content,
            "metadata": metadata
        }).execute()
        logger.debug(f"Upsert edge: {response=}")
        inserted_edge = None if len(response.data) == 0 else response.data[0]

        return inserted_edge["id"]

async def filter_new_documents(documents: List[Document]) -> List[Document]:
    batch_size = 1
    new_documents: List[Document] = []

    for i in range(0, len(documents), batch_size):
        batch = documents[i:i + batch_size]
        page_contents = [doc.page_content for doc in batch]

        response = client.from_("edges").select().in_("page_content", page_contents).execute()
        logger.debug(f"filter: {response=}")
        existing_edges = response.data

        existing_page_contents = set(edge["page_content"] for edge in existing_edges)
        new_batch_documents = [doc for doc in batch if doc.page_content not in existing_page_contents]
        new_documents.extend(new_batch_documents)

    return new_documents

async def clean_graph():
    # Step 1: Delete nodes with the same data and assign edges to one node
    async def merge_duplicate_nodes():
        # Retrieve all nodes grouped by their data
        response = client.from_("nodes").select("data, id").order("data").execute()
        logger.debug(f"merge: {response=}")
        nodes: List[Dict[str, Any]] = response.data

        # Create a dictionary to store the mapping of data to node ID
        data_to_id: Dict[str, str] = {}

        for node in nodes:
            data = node["data"]
            node_id = node["id"]

            if data in data_to_id:
                # If a node with the same data already exists, update the edges
                # to point to the existing node and delete the current node
                existing_node_id = data_to_id[data]

                client.from_("edges").update({"from": existing_node_id}).eq("from", node_id).execute()
                client.from_("edges").update({"to": existing_node_id}).eq("to", node_id).execute()
                client.from_("nodes").delete().eq("id", node_id).execute()
            else:
                # If it's the first node with this data, store the mapping
                data_to_id[data] = node_id

    # Step 2: Delete nodes without any relationships
    async def delete_isolated_nodes():
        # Retrieve nodes that have no edges connected to them
        response = await client.from_("nodes").select("id").not_.in_("id", client.rpc("get_connected_node_ids")).execute()
        isolated_nodes: List[Dict[str, str]] = response.data

        # Delete the isolated nodes
        for node in isolated_nodes:
            node_id = node["id"]
            await client.from_("nodes").delete().eq("id", node_id)
    
    await merge_duplicate_nodes()
    # await delete_isolated_nodes()

async def get_all_nodes() -> List[Dict[str, Any]]:
    page_size = 600
    page = 0
    nodes: List[Dict[str, Any]] = []

    while True:
        response = client.from_("nodes").select("*").range(page * page_size, (page + 1) * page_size - 1).execute()
        page_nodes = response.data

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
        response = client.from_("edges").select("*").range(page * page_size, (page + 1) * page_size - 1).execute()
        page_edges = response.data

        edges.extend(page_edges)

        if len(page_edges) < page_size:
            break

        page += 1

    return edges