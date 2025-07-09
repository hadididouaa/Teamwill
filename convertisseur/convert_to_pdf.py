import os
import sys
import comtypes.client
import tkinter as tk
from tkinter import filedialog

def docx_to_pdf(input_path, output_path):
    word = comtypes.client.CreateObject('Word.Application')
    word.Visible = False
    doc = word.Documents.Open(input_path)
    doc.SaveAs(output_path, FileFormat=17)  # 17 = wdFormatPDF
    doc.Close()
    word.Quit()

def pptx_to_pdf(input_path, output_path):
    powerpoint = comtypes.client.CreateObject('Powerpoint.Application')
    powerpoint.Visible = True  # Changed from False to True to avoid error
    presentation = powerpoint.Presentations.Open(input_path, WithWindow=False)
    presentation.SaveAs(output_path, FileFormat=32)  # 32 = ppSaveAsPDF
    presentation.Close()
    powerpoint.Quit()

def convert_to_pdf(input_file):
    if not os.path.isfile(input_file):
        print(f"Error: File '{input_file}' does not exist.")
        return

    file_ext = os.path.splitext(input_file)[1].lower()
    output_file = os.path.splitext(input_file)[0] + '.pdf'

    try:
        if file_ext == '.docx':
            docx_to_pdf(input_file, output_file)
            print(f"Converted DOCX to PDF: {output_file}")
        elif file_ext == '.pptx':
            pptx_to_pdf(input_file, output_file)
            print(f"Converted PPTX to PDF: {output_file}")
        else:
            print("Unsupported file type. Only .docx and .pptx are supported.")
    except Exception as e:
        print(f"Error during conversion: {e}")

if __name__ == '__main__':
    root = tk.Tk()
    root.withdraw()  # Hide the main window
    filetypes = [("Word and PowerPoint files", "*.docx *.pptx")]
    input_file = filedialog.askopenfilename(title="Select a .docx or .pptx file to convert to PDF", filetypes=filetypes)
    if input_file:
        convert_to_pdf(input_file)
    else:
        print("No file selected. Exiting.")
