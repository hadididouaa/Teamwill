import os
import subprocess
import tkinter as tk
from tkinter import filedialog

def convert_to_pdf_libreoffice(input_file):
    if not os.path.isfile(input_file):
        print(f"Error: File '{input_file}' does not exist.")
        return

    output_dir = os.path.dirname(input_file)

    try:
        # Call LibreOffice in headless mode to convert file to PDF
        subprocess.run([
            "soffice",
            "--headless",
            "--convert-to", "pdf",
            "--outdir", output_dir,
            input_file
        ], check=True)
        print(f"Converted to PDF successfully. Output directory: {output_dir}")
    except subprocess.CalledProcessError as e:
        print(f"Error during conversion: {e}")

if __name__ == "__main__":
    root = tk.Tk()
    root.withdraw()  # Hide the main window
    filetypes = [("Word and PowerPoint files", "*.docx *.pptx")]
    input_file = filedialog.askopenfilename(title="Select a .docx or .pptx file to convert to PDF", filetypes=filetypes)
    if input_file:
        convert_to_pdf_libreoffice(input_file)
    else:
        print("No file selected. Exiting.")
