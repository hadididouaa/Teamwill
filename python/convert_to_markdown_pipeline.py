import os
import re
import pdfplumber
import pytesseract
from PIL import Image
from transformers import LayoutLMTokenizer, LayoutLMForTokenClassification
import torch
import tkinter as tk
from tkinter import filedialog
import camelot
import docx2txt

# Set pytesseract language to French for better OCR on French documents
pytesseract.pytesseract.tesseract_cmd = r'tesseract'  # tesseract is in PATH : C:\Program Files\Tesseract-OCR
OCR_LANG = 'fra'  # French language code for Tesseract

# Load your fine-tuned LayoutLM model here
fine_tuned_model_path = "./local_fine_tuned_model"  # Update this path to your local fine-tuned model directory

tokenizer = LayoutLMTokenizer.from_pretrained(fine_tuned_model_path)
model = LayoutLMForTokenClassification.from_pretrained(fine_tuned_model_path)

# Helper function to save images extracted from PDF pages
def save_images_from_page(page, output_dir, page_number):
    images_paths = []
    for i, img in enumerate(page.images):
        try:
            im = page.to_image()
            cropped = im.crop((img['x0'], img['top'], img['x1'], img['bottom']))
            image_path = os.path.join(output_dir, f"page_{page_number}_image_{i+1}.png")
            cropped.save(image_path)
            images_paths.append(image_path)
        except Exception as e:
            print(f"Warning: Could not extract image {i+1} on page {page_number}: {e}")
    return images_paths

# Step 1: Extract text, layout, and images from PDF using pdfplumber and pytesseract with French language
def extract_text_layout_images(pdf_path, output_dir):
    pages_data = []
    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages, start=1):
            text = page.extract_text()
            # If text extraction fails or is empty, fallback to OCR with French language
            if not text or text.strip() == "":
                pil_image = page.to_image(resolution=300).original
                text = pytesseract.image_to_string(pil_image, lang=OCR_LANG)
            words = page.extract_words()
            images = save_images_from_page(page, output_dir, i)
            pages_data.append({'text': text, 'words': words, 'images': images})
    return pages_data

# Step 2: Use LayoutLM tokenizer and model for layout analysis (example)
def analyze_layout(text, words):
    encoding = tokenizer(text, return_tensors="pt", truncation=True, padding="max_length", max_length=512)
    outputs = model(**encoding)
    predictions = torch.argmax(outputs.logits, dim=2)
    return predictions

# Helper function to convert tables extracted by camelot to markdown
def convert_table_to_markdown(table):
    md = ""
    md += "| " + " | ".join(table.df.iloc[0]) + " |\n"
    md += "| " + " | ".join(["---"] * len(table.df.iloc[0])) + " |\n"
    for i in range(1, len(table.df)):
        md += "| " + " | ".join(table.df.iloc[i]) + " |\n"
    return md

# Step 3: Convert classified segments to Markdown with enhanced formatting including images and tables
def convert_segments_to_markdown(segments, images, tables):
    markdown = ""
    for img_path in images:
        rel_path = os.path.basename(img_path)
        markdown += f"![Image]({rel_path})\n\n"
    for table_md in tables:
        markdown += table_md + "\n\n"
    for segment in segments:
        text = segment['text'].strip()
        if re.match(r'^[A-Z0-9\s\-\']{3,}$', text) or text.endswith(':'):
            markdown += f"# {text}\n\n"
        elif re.match(r'^(\d+[\.\)]|\-|\*)\s+', text):
            markdown += f"- {text}\n"
        elif '\n\n' in text:
            paragraphs = text.split('\n\n')
            for para in paragraphs:
                markdown += f"{para.strip()}\n\n"
        else:
            markdown += f"{text}\n\n"
    return markdown

# Extract tables from PDF page using camelot
def extract_tables_from_pdf(pdf_path):
    tables = camelot.read_pdf(pdf_path, pages='all', flavor='stream')
    markdown_tables = [convert_table_to_markdown(table) for table in tables]
    return markdown_tables

# Extract text from DOCX file using docx2txt
def extract_text_from_docx(docx_path):
    text = docx2txt.process(docx_path)
    return text

if __name__ == "__main__":
    root = tk.Tk()
    root.withdraw()
    file_path = filedialog.askopenfilename(
        title="Select file to convert",
        filetypes=[("PDF files", "*.pdf"), ("DOCX files", "*.docx"), ("All files", "*.*")]
    )
    if not file_path:
        print("No file selected. Exiting.")
    elif not os.path.isfile(file_path):
        print(f"Error: File '{file_path}' does not exist.")
    else:
        ext = os.path.splitext(file_path)[1].lower()
        output_path = os.path.splitext(file_path)[0] + ".md"
        if ext == ".pdf":
            output_dir = os.path.splitext(file_path)[0] + "_images"
            os.makedirs(output_dir, exist_ok=True)
            pages = extract_text_layout_images(file_path, output_dir)
            tables_md = extract_tables_from_pdf(file_path)
            all_markdown = ""
            for page in pages:
                text = page['text']
                words = page['words']
                images = page['images']
                predictions = analyze_layout(text, words)
                segments = [{'type': 'paragraph', 'text': text}]
                markdown = convert_segments_to_markdown(segments, images, tables_md)
                all_markdown += markdown + "\n"
            with open(output_path, "w", encoding="utf-8") as f:
                f.write(all_markdown)
            print(f"Markdown output saved to: {output_path}")
        elif ext == ".docx":
            text = extract_text_from_docx(file_path)
            segments = [{'type': 'paragraph', 'text': text}]
            markdown = convert_segments_to_markdown(segments, [], [])
            with open(output_path, "w", encoding="utf-8") as f:
                f.write(markdown)
            print(f"Markdown output saved to: {output_path}")
        else:
            print(f"Unsupported file extension: {ext}. Only PDF and DOCX are supported.")
