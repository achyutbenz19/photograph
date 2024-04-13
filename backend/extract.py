import google.generativeai as genai
import os
import shutil
from helpers import save_file, FRAME_EXTRACTION_DIRECTORY, upload_files, extract_frame_from_video, make_request

genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))

LLM = genai.GenerativeModel('models/gemini-1.5-pro-latest')

def chat(prompt: str, path: str = None, type: str = 'text'):
    if type == 'video':
        saved_video_path = save_file(path)
        
        frame_dir = extract_frame_from_video(saved_video_path)
        uploaded_files = upload_files(frame_dir, genai)
        request = make_request(prompt, uploaded_files)

        shutil.rmtree(FRAME_EXTRACTION_DIRECTORY)
    elif type == 'image':
        uploaded_path = genai.upload_file(path)
        request = [prompt, uploaded_path]
    else:
        request = [prompt]
    response = LLM.generate_content(request)
    return response.candidates[0].content.parts[0].text