import json
from logger import logger
import os
import cv2
import os
import shutil

# Create or cleanup existing extracted image frames directory.
FRAME_EXTRACTION_DIRECTORY = "/content/frames"
FRAME_PREFIX = "_frame"

def create_frame_output_dir(output_dir):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    else:
        shutil.rmtree(output_dir)
        os.makedirs(output_dir)

def extract_frame_from_video(video_file_path):
    print(f"Extracting {video_file_path} at 1 frame per second. This might take a bit...")
    create_frame_output_dir(FRAME_EXTRACTION_DIRECTORY)
    vidcap = cv2.VideoCapture(video_file_path)
    fps = vidcap.get(cv2.CAP_PROP_FPS)
    frame_duration = 1 / fps  # Time interval between frames (in seconds)
    output_file_prefix = os.path.basename(video_file_path).replace('.', '_')
    frame_count = 0
    count = 0
    while vidcap.isOpened():
        success, frame = vidcap.read()
        if not success:  # End of video
            break
        if int(count / fps) == frame_count:  # Extract a frame every second
            min = frame_count // 60
            sec = frame_count % 60
            time_string = f"{min:02d}:{sec:02d}"
            image_name = f"{output_file_prefix}{FRAME_PREFIX}{time_string}.jpg"
            output_filename = os.path.join(FRAME_EXTRACTION_DIRECTORY, image_name)
            cv2.imwrite(output_filename, frame)
            frame_count += 1
        count += 1
    vidcap.release()  # Release the capture object
    print(f"Completed video frame extraction!\n\nExtracted: {frame_count} frames")
    return FRAME_EXTRACTION_DIRECTORY

class File:
    def __init__(self, file_path: str, display_name: str = None):
        self.file_path = file_path
        if display_name:
            self.display_name = display_name
        self.timestamp = get_timestamp(file_path)

    def set_file_response(self, response):
        self.response = response

def get_timestamp(filename):
    """Extracts the frame count (as an integer) from a filename with the format
       'output_file_prefix_frame00:00.jpg'.
    """
    parts = filename.split(FRAME_PREFIX)
    if len(parts) != 2:
        return None  # Indicates the filename might be incorrectly formatted
    return parts[1].split('.')[0]

def make_request(prompt, files):
    request = [prompt]
    for file in files:
        request.append(file.timestamp)
        request.append(file.response)
    return request

def upload_files(directory, genai):
    files = os.listdir(directory)
    files = sorted(files)
    files_to_upload = []
    for file in files:
        files_to_upload.append(File(file_path=os.path.join(directory, file)))

    uploaded_files = []
    print(f'Uploading {len(files_to_upload)} files. This might take a bit...')

    for file in files_to_upload:
        print(f'Uploading: {file.file_path}...')
        response = genai.upload_file(path=file.file_path)
        file.set_file_response(response)
        uploaded_files.append(file)

    print(f"Completed file uploads!\n\nUploaded: {len(uploaded_files)} files")
    return uploaded_files

def stoj(string: str) -> list:
    '''Convert string to json'''
    if string.startswith("```json") and string.endswith("```"):
        json_string = string[7:-3].strip()
        return json.loads(json_string)
    else:
        try:
            return json.loads(string)
        except json.JSONDecodeError as error:
            logger.error(f"JSON parsing failed: {str(error)}")
            return []

def save_file(bytes_data: bytes, content_type: str) -> str:
    '''Save file and return local file path'''
    file_extension = content_type.split('/')[-1]
    
    files = os.listdir("public")
    
    numbers = [int(file.split('.')[0]) for file in files if file.split('.')[0].isdigit()]
    
    max_number = max(numbers) if numbers else 0
    
    file_name = f"{max_number + 1}.{file_extension}"
    file_path = os.path.join("public", file_name)
    
    with open(file_path, "wb") as file:
        file.write(bytes_data)
    
    return file_path