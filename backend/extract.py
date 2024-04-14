from logger import logger
import asyncio
from typing import List, Dict
import google.generativeai as genai
import os
import shutil
from helpers import save_file, FRAME_EXTRACTION_DIRECTORY, upload_files, extract_frame_from_video, make_request, stoj

genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))

LLM = genai.GenerativeModel('models/gemini-1.5-pro-latest')

EXTRACT_PROMPT = """\
You are a network graph maker who extracts terms and their relations from a given picture/video from a photo gallery of a human. \
Your task is to extract the ontology of terms mentioned in the given context. \
These terms should accurately capture the key concepts and actions represented in the image or video.
Thought 1: While traversing, think about the key things in it.
    Identify the salient objects, people, and entities present in the image or video.
    Recognize any actions, interactions, events taking place, or anything interesting that you see.
    Detect relevant attributes such as colors, sizes, textures, and emotions associated with the visual elements.
    Consider the spatial and compositional relationships among the elements.
    Semantic Relationships:
    Analyze the semantic connections between the identified terms.
    Determine relationships such as object co-occurrence, functional associations, and contextual similarities.
    Identify part-whole relationships, hierarchical structures, and object interactions.
    Consider temporal relationships and object persistence in videos.
    Terms should be as atomistic and singular as possible.

Thought 2: Think about how these terms can have one on one relation with other terms.
    Terms that are mentioned in the same sentence or the same paragraph are typically related to each other.
    Terms can be related to many other terms

Thought 3: Find out the relation between each such related pair of terms. 

Format your output as a list of json. Each element of the list contains a pair of terms and the relation between them, like the following: 
[
   {{
       "node_1": "A concept from extracted ontology",
       "node_2": "A related concept from extracted ontology",
       "edge": "relationship between the two concepts, node_1 and node_2 in one or two sentences"
   }}, {{...}}
]
YOUR RESPONSE SHOULD ALWAYS BE JSON COMPATIBLE. Do not add markdown in your response, just plain JSON.\
"""

SUMMARY_PROMPT = """\
You are an expert narrator who writes summaries about people's lives. \
You will be given memories, and other information about the human's life which you will \
write a short summary description using 2nd point of view to talk about the human's life to the human. \
The topic of the summary is: {node}
"""
SUMMARY_INFO_CHUNK = """\
{connection}: {description}\
"""

SUMMARY_END_PROMPT = """\
Make sure to keep it short, narrative 2nd POV format.\
"""

def get_data_type(path: str):
    type_dict = {
        'mp4': 'video',
        'png': 'image',
    }

    if file_path:= type_dict.get(path.split("/")[1]):
        return file_path
    else:
        return 'text'

async def stream_summary(node: str, neighbours: List[Dict]):
    prompts = [SUMMARY_PROMPT.format(node=node)]

    data = dict()
    for nei in neighbours:
        if nei['data'] not in data:
            data[nei['data']] = await extract_one(SUMMARY_INFO_CHUNK.format_map(nei), nei['data'])
        else:
            data[nei['data']].append(SUMMARY_INFO_CHUNK.format_map(nei))

    for val in data.values():
        prompts += val
    
    prompts += SUMMARY_END_PROMPT
    
    response = stream_content(prompts)
    return response

async def extract_one(prompt: str = EXTRACT_PROMPT, path: str = None, type: str = 'text'):
    logger.debug(f"{path=}, {type=}")
    type = type.split("/")[0]
    if type == 'video':
        logger.debug("Uploading video...")
        frame_dir = extract_frame_from_video(path)
        uploaded_files = upload_files(frame_dir, genai)
        request = make_request(prompt, uploaded_files)
        shutil.rmtree(FRAME_EXTRACTION_DIRECTORY)
    elif type == 'image':
        logger.debug("Uploading image...")
        uploaded_path = genai.upload_file(path)
        request = [prompt, uploaded_path]
    else:
        request = [prompt]
    return request

async def generate_content(request) -> str:
    response = await LLM.generate_content_async(request)
    text = response.candidates[0].content.parts[0].text
    logger.debug(f"{text=}")
    return text

async def stream_content(request):
    response = await LLM.generate_content_async(request, stream=True)
    async for chunk in response:
        yield chunk.text

async def extract_batch(paths: List[str], types: List[str] = [], prompt: str = EXTRACT_PROMPT, batch_size: int = 5):
    semaphore = asyncio.Semaphore(batch_size)

    async def generate_content_with_semaphore(request):
        async with semaphore:
            return await generate_content(request)

    requests = []
    for path, type in zip(paths, types):
        request = await extract_one(prompt, path, type)
        requests.append(request)

    relations = await asyncio.gather(*[generate_content_with_semaphore(request) for request in requests])
    responses = []
    for relation_list in relations:
        response = stoj(relation_list)
        responses.append(response)

    return responses