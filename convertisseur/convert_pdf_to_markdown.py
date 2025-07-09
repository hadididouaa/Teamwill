import os
import tkinter as tk
from tkinter import filedialog
import pdfplumber

def pdf_to_markdown_text(pdf_path):
    markdown_lines = []
    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages, start=1):
            text = page.extract_text()
            if text:
                markdown_lines.append(f"# Slide {i}\n")
                # Simple conversion: add text as paragraphs
                paragraphs = text.split('\n\n')
                for para in paragraphs:
                    para = para.strip()
                    if para:
                        markdown_lines.append(para)
                        markdown_lines.append('')  # blank line for markdown paragraph
    return '\n'.join(markdown_lines)

def convert_pdf_to_markdown(input_file):
    output_file = os.path.splitext(input_file)[0] + '.md'
    try:
        markdown_content = pdf_to_markdown_text(input_file)
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(markdown_content)
        print(f"Converted PDF to Markdown successfully: {output_file}")
    except Exception as e:
        print(f"Error during conversion: {e}")

if __name__ == "__main__":
    root = tk.Tk()
    root.withdraw()  # Hide the main window
    filetypes = [("PDF files", "*.pdf")]
    input_file = filedialog.askopenfilename(title="Select a PDF file to convert to Markdown", filetypes=filetypes)
    if input_file:
        convert_pdf_to_markdown(input_file)
    else:
        print("No file selected. Exiting.")
