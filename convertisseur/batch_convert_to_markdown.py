import os
from convert_to_markdown import convert_to_markdown

def batch_convert_dataset(dataset_dir):
    supported_extensions = ['.docx', '.pdf', '.pptx']
    for root, dirs, files in os.walk(dataset_dir):
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in supported_extensions:
                file_path = os.path.join(root, file)
                print(f"Converting {file_path}...")
                convert_to_markdown(file_path)

if __name__ == "__main__":
    dataset_directory = os.path.join(os.path.dirname(__file__), 'dataset')
    batch_convert_dataset(dataset_directory)
