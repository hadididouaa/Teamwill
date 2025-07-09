import pdfplumber
import tkinter as tk
from tkinter import filedialog
import os
import re
from collections import defaultdict
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import glob
import ollama
from IPython.display import display, HTML
import base64
import nltk
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import word_tokenize

# Ensure NLTK resources are downloaded
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet')

def upload_file():
    """Open a file dialog to select a PDF file."""
    root = tk.Tk()
    root.withdraw()  # Hide the root window
    file_path = filedialog.askopenfilename(title="Select a PDF file", filetypes=[("PDF files", "*.pdf")])
    return file_path

def extract_sections(pdf_path, start_page=1, end_page=None):
    """Extracts sections based on the first two words from each page of the specified PDF."""
    sections = defaultdict(str)  # Dictionary to hold section names and their content
    current_section = None  # To track the current section name

    # Create a directory for images
    os.makedirs("output/images", exist_ok=True)

    with pdfplumber.open(pdf_path) as pdf:
        if end_page is None:
            end_page = len(pdf.pages)  # Set end_page to total pages if not specified

        for page_num in range(start_page - 1, end_page):  # start_page - 1 for 0-indexing
            page = pdf.pages[page_num]
            text = page.extract_text() or ""  # Extract text, default to empty string if None
            tables = page.extract_tables()  # Extract tables
            images = page.images  # Extract images

            # Prepare content for the current page
            page_content = ""

            # Add text content
            if text:
                page_content += text + "\n"

            # Add tables to the page content
            if tables:
                for table in tables:
                    for row in table:
                        if row:  # Check if the row is not None
                            # Filter out None values from the row
                            filtered_row = [str(cell) for cell in row if cell is not None]
                            if filtered_row:  # Only join if there are valid cells
                                page_content += " | ".join(filtered_row) + "\n"  # Join table rows with a separator

            # Add image references to the page content
            if images:
                for index, img in enumerate(images):
                    img_filename = f"image_{page_num + 1}_{index + 1}.png"  # Create a unique filename for the image
                    img_path = os.path.join("output/images", img_filename)
                    with open(img_path, "wb") as img_file:
                        img_file.write(img['stream'].get_data())  # Save the image data
                    page_content += f"[Image: {img_filename}] (Position: {img['x0']}, {img['top']})\n"

            if not page_content.strip():  # Skip empty pages
                continue

            lines = page_content.split('\n')
            if lines:  # Check if there are any lines
                first_line = lines[0].strip()  # Get the first line
                # Extract the first two words as the section name
                words = first_line.split()
                if len(words) >= 2:
                    section_name = ' '.join(words[:2])  # Join the first two words
                else:
                    section_name = first_line  # If less than two words, use the whole line

                # If we have a new section, store the previous section content
                if current_section and current_section != section_name:
                    sections[current_section] += "\n"  # Add a newline before the next section

                # Update the current section
                current_section = section_name
                sections[current_section] += page_content + "\n"  # Append the entire content of the page to the current section

    return sections

def save_sections(sections, output_dir="output"):
    """Saves each section's content to a separate text file."""
    os.makedirs(output_dir, exist_ok=True)
    for section_name, content in sections.items():
        # Clean section title for filename
        filename = f"{section_name.replace(' ', '_')}.txt"
        file_path = os.path.join(output_dir, filename)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
    print(f"Sections saved to '{output_dir}' directory.")

def read_sections_from_files(directory):
    """Reads section files from the specified directory and returns their content."""
    sections = {}
    for filename in os.listdir(directory):
        if filename.endswith('.txt'):
            with open(os.path.join(directory, filename), 'r', encoding='utf-8') as f:
                content = f.read()
                sections[filename] = content
    return sections

def preprocess_text(text):
    """Preprocesses the text by removing irrelevant content and applying lemmatization."""
    # Remove common irrelevant sections
    irrelevant_keywords = ["cover", "table of contents", "thank you", "agenda", "plan", "merci", ]
    for keyword in irrelevant_keywords:
        if re.search(r'\b' + re.escape(keyword) + r'\b', text, re.IGNORECASE):
            return None  # Mark as irrelevant

    # Lemmatization
    lemmatizer = WordNetLemmatizer()
    tokens = word_tokenize(text)
    lemmatized_text = ' '.join([lemmatizer.lemmatize(token) for token in tokens])

    return lemmatized_text.strip()  # Return cleaned text

def group_similar_sections(sections):
    """Groups similar sections based on their content."""
    # Preprocess the sections
    cleaned_sections = {name: preprocess_text(content) for name, content in sections.items()}
    cleaned_sections = {name: content for name, content in cleaned_sections.items() if content}

    # Create a list of section contents for vectorization
    section_names = list(cleaned_sections.keys())
    section_contents = list(cleaned_sections.values())

    # Vectorize the text using TF-IDF
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(section_contents)

    # Calculate cosine similarity
    similarity_matrix = cosine_similarity(tfidf_matrix)

    # Group similar sections
    grouped_sections = defaultdict(str)  # Change to store combined content
    threshold = 0.5  # Similarity threshold for grouping

    for i in range(len(section_names)):
        for j in range(i + 1, len(section_names)):
            if similarity_matrix[i][j] > threshold:
                # Combine the content of similar sections
                grouped_sections[section_names[i]] += cleaned_sections[section_names[j]] + "\n"

    # Create a final grouped result with original content
    final_grouped = {}
    for key, content in grouped_sections.items():
        final_grouped[key] = cleaned_sections[key] + "\n" + content  # Include the original section content

    return final_grouped

def save_grouped_sections(grouped_sections, output_dir="output/grouped_sections"):
    """Saves the grouped sections to text files."""
    os.makedirs(output_dir, exist_ok=True)
    for group_name, content in grouped_sections.items():
        filename = f"group_{group_name.replace(' ', '_')}.txt"
        file_path = os.path.join(output_dir, filename)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)  # Save the combined content
    print(f"Grouped sections saved to '{output_dir}' directory.")

def extract_images(pdf_path, figure_pages, output_dir="output/figures"):
    """
    Extracts images from specified pages in the PDF.

    Args:
        pdf_path (str): Path to the PDF file.
        figure_pages (List[int]): List of page numbers containing figures.
        output_dir (str): Directory to save the extracted images.

    Returns:
        List[str]: List of paths to the extracted image files.
    """
    os.makedirs(output_dir, exist_ok=True)
    extracted_images = []

    with fitz.open(pdf_path) as pdf:
        for page_num in figure_pages:
            if page_num < 1 or page_num > len(pdf):
                print(f"Page {page_num} is out of range. Skipping.")
                continue
            page = pdf.load_page(page_num - 1)  # 0-indexed
            image_list = page.get_images(full=True)
            if not image_list:
                print(f"No images found on page {page_num}.")
                continue
            for img_index, img in enumerate(image_list, start=1):
                xref = img[0]
                base_image = pdf.extract_image(xref)
                image_bytes = base_image["image"]
                image_ext = base_image.get("ext", "png")  # Default to png if not found
                image_filename = f"page_{page_num}_img_{img_index}.{image_ext}"
                image_path = os.path.join(output_dir, image_filename)
                with open(image_path, "wb") as img_file:
                    img_file.write(image_bytes)
                extracted_images.append(image_path)
                print(f"Extracted {image_filename}")

    return extracted_images

def extract_text_from_image(image_path, tesseract_cmd=None):
    """
    Extracts text from an image using PyTesseract with PSM 3.

    Args:
        image_path (str): Path to the image file.
        tesseract_cmd (str, optional): Path to the Tesseract executable.

    Returns:
        str: Extracted text.
    """
    if tesseract_cmd:
        pytesseract.pytesseract.tesseract_cmd = tesseract_cmd

    try:
        image = Image.open(image_path)
        text = pytesseract.image_to_string(image, config="--psm 3")
        return text.strip()
    except Exception as e:
        print(f"Error extracting text from {image_path}: {e}")
        return ""

def generate_description_with_llama(text, model_name="llama3:8b"):
    """
    Sends extracted text to LLaMA 3 model via Ollama's API to generate a detailed description.

    Args:
        text (str): Extracted text from the image.
        model_name (str): Name of the LLaMA model deployed in Ollama.

    Returns:
        str: Description generated by the LLaMA model.
    """
    try:
        # Construct the prompt
        prompt = (
            "This text is extracted from a figure in a risk management document:\n"
            f"{text}\n\n"
            "Please generate a detailed explanation of this figure based on the extracted text."
        )

        # Use Ollama's chat method
        response = ollama.chat(
            model=model_name,
            messages=[
                {
                    'role': 'user',
                    'content': prompt,
                },
            ]
        )

        description = response['message']['content'].strip()
        return description
    except Exception as e:
        print(f"Error generating description with LLaMA: {e}")
        return "Description generation failed."

def process_images_with_llama(images, tesseract_cmd, texts_dir="output/texts", descriptions_dir="output/descriptions", model_name="llama3:8b"):
    """
    Processes a list of images with LLaMA and saves the descriptions.

    Args:
        images (List[str]): List of image file paths.
        tesseract_cmd (str): Path to the Tesseract executable.
        texts_dir (str): Directory to save the extracted texts.
        descriptions_dir (str): Directory to save the descriptions.
        model_name (str): Name of the LLaMA model deployed in Ollama.

    Returns:
        Dict[str, str]: Dictionary mapping image paths to their descriptions.
    """
    os.makedirs(texts_dir, exist_ok=True)
    os.makedirs(descriptions_dir, exist_ok=True)
    descriptions = {}

    for image_path in images:
        image_filename = os.path.basename(image_path)
        base_name, _ = os.path.splitext(image_filename)
        text_file = os.path.join(texts_dir, f"{base_name}.txt")
        description_file = os.path.join(descriptions_dir, f"{base_name}_description.txt")

        # Check if description already exists
        if os.path.isfile(description_file):
            with open(description_file, "r", encoding="utf-8") as f:
                description = f.read().strip()
            print(f"Loaded existing description for {image_filename}")
        else:
            # Check if extracted text exists
            if os.path.isfile(text_file):
                with open(text_file, "r", encoding="utf-8") as f:
                    extracted_text = f.read().strip()
                print(f"Loaded existing extracted text for {image_filename}")
            else:
                print(f"Extracting text from {image_filename}...")
                extracted_text = extract_text_from_image(image_path, tesseract_cmd)
                if not extracted_text:
                    print(f"No text extracted from {image_filename}. Skipping description generation.")
                    extracted_text = "No text extracted from the image."
                else:
                    print(f"Extracted text from {image_filename}.")
                # Save the extracted text
                with open(text_file, "w", encoding="utf-8") as f:
                    f.write(extracted_text)
                print(f"Saved extracted text for {image_filename}")

            # Generate description
            print(f"Generating description for {image_filename}...")
            description = generate_description_with_llama(extracted_text, model_name)
            # Save the description
            with open(description_file, "w", encoding="utf-8") as f:
                f.write(description)
            print(f"Saved description for {image_filename}\n")

        descriptions[image_path] = description

    return descriptions

def display_images_and_descriptions(sample_data):
    """
    Displays images and their descriptions side by side in the Jupyter notebook.

    Args:
        sample_data (List[Tuple[str, str]]): List of tuples containing image paths and descriptions.
    """
    html_content = """
    <html>
    <head>
        <style>
            .container {
                display: flex;
                flex-wrap: wrap;
            }
            .figure {
                display: flex;
                margin-bottom: 20px;
                width: 100%;
            }
            .figure img {
                max-width: 300px;
                margin-right: 20px;
            }
            .description {
                max-width: 600px;
            }
        </style>
    </head>
    <body>
        <h1>Figure Descriptions Report</h1>
        <div class="container">
    """

    for image_path, description in sample_data:
        # Ensure the image path is relative to the report location
        relative_image_path = os.path.relpath(image_path, os.getcwd())
        # Encode image to base64 to embed directly
        try:
            with open(image_path, "rb") as img_file:
                encoded_string = base64.b64encode(img_file.read()).decode('utf-8')
                # Determine MIME type based on file extension
                extension = os.path.splitext(image_path)[1].lower()
                mime_types = {
                    '.png': 'image/png',
                    '.jpg': 'image/jpeg',
                    '.jpeg': 'image/jpeg',
                    '.gif': 'image/gif',
                    '.bmp': 'image/bmp',
                    '.tiff': 'image/tiff'
                }
                mime_type = mime_types.get(extension, 'image/png')
                img_src = f"data:{mime_type};base64,{encoded_string}"
        except Exception as e:
            print(f"Error encoding image {image_path}: {e}")
            img_src = ""

        html_content += f"""
            <div class="figure">
                <img src="{img_src}" alt="Figure Image">
                <div class="description">
                    <p>{description}</p>
                </div>
            </div>
        """

    html_content += """
        </div>
    </body>
    </html>
    """

    display(HTML(html_content))

def main():
    pdf_path = upload_file()

    # Ensure the PDF exists
    if not pdf_path:
        print("No file selected.")
        return

    # Step 1: Extract sections from the PDF
    print("Extracting sections from the PDF...")
    sections = extract_sections(pdf_path, start_page=1)

    if not sections:
        print("No sections found.")
    else:
        print("Sections Found:")
        for name, content in sections.items():
            print(f"{name}: {len(content.splitlines())} lines")  # Print number of lines in each section

    # Step 2: Save sections to files
    save_sections(sections)

    # Directory where the section files are saved
    section_directory = "output"  # Update this to your actual directory

    # Step 3: Read sections from files
    sections = read_sections_from_files(section_directory)

    # Step 4: Group similar sections
    grouped_sections = group_similar_sections(sections)

    # Step 5: Save the grouped sections
    save_grouped_sections(grouped_sections)

    # Step 6: Extract images from figure pages
    figure_pages_file = "output/figure_pages.txt"
    if not os.path.isfile(figure_pages_file):
        print(f"Error: Figure pages file '{figure_pages_file}' not found.")
        print("No figures found in the PDF.")
        return

    with open(figure_pages_file, "r", encoding="utf-8") as f:
        figure_pages = [int(line.strip().split()[-1]) for line in f if line.strip().isdigit()]

    if not figure_pages:
        print("No figure pages to process.")
        return

    # Define the path to the Tesseract executable
    tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"  # Update this path as necessary
    if not os.path.isfile(tesseract_cmd):
        print(f"Error: Tesseract executable not found at '{tesseract_cmd}'. Please verify the path.")
        return

    # Step 7: Extract images from figure pages
    images = extract_images(pdf_path, figure_pages)

    if not images:
        print("No images found in the specified figure pages.")
        return

    # Step 8: Process images and generate descriptions
    descriptions = process_images_with_llama(images, tesseract_cmd, texts_dir="output/texts", descriptions_dir="output/descriptions")
    print("Descriptions generated.\n")

    if not descriptions:
        print("No descriptions to display.")
        return

    # Step 9: Select a sample of 3 images with descriptions
    sample_size = 3
    sample_data = list(descriptions.items())[:sample_size] if len(descriptions) >= sample_size else list(descriptions.items())

    # Step 10: Display images and descriptions directly in Jupyter
    display_images_and_descriptions(sample_data)

    print("Processing completed.")

if __name__ == "__main__":
    main()