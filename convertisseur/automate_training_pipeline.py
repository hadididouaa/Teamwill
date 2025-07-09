import subprocess
import sys
import os
import tkinter as tk
from tkinter import filedialog

def run_script(script_path, args=[]):
    command = [sys.executable, script_path] + args
    print(f"Running: {' '.join(command)}")
    result = subprocess.run(command, capture_output=True, text=True)
    print(result.stdout)
    if result.returncode != 0:
        print(f"Error running {script_path}:\n{result.stderr}")
        sys.exit(result.returncode)

def automate_pipeline(labeled_md_file):
    # Step 1: Extract labeled data
    extract_script = "extract_labeled_data.py"
    run_script(extract_script, [labeled_md_file])

    # extract_labeled_data.py outputs a JSON file with _labeled.json suffix
    json_file = labeled_md_file.replace(".md", "_labeled.json")

    # Step 2: Prepare training data
    prepare_script = "prepare_training_data.py"
    run_script(prepare_script, [json_file])

    # prepare_training_data.py outputs a training data file with _training.txt suffix
    training_data_file = json_file.replace("_labeled.json", "_labeled_training.txt")

    # Step 3: Fine-tune BERT model
    fine_tune_script = "fine_tune_bert_for_structure_labeling.py"
    run_script(fine_tune_script, ["--train_file", training_data_file, "--output_dir", "./bert-structure-labeler"])

if __name__ == "__main__":
    root = tk.Tk()
    root.withdraw()
    labeled_md_file = filedialog.askopenfilename(title="Select manually labeled markdown file", filetypes=[("Markdown files", "*.md")])
    if labeled_md_file:
        automate_pipeline(labeled_md_file)
    else:
        print("No file selected.")
