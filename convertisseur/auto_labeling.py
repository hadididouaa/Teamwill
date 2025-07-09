import os
import re
from transformers import BertForTokenClassification, BertTokenizerFast, pipeline

def map_label_to_md(label):
    # Map entity labels to markdown structure labels
    mapping = {
        "SLIDE_BREAK": "---\n",
        "TITLE": "# ",
        "CHAPTER": "## ",
        "SECTION": "### ",
        "SUBSECTION": "#### ",
        "HEADER_LEVEL_5": "##### ",
        "LIST_ITEM": "- ",
        "LIST_ITEM_TITLE": "**",  # bold title in list item
        "NUMBERED_LIST_ITEM": "1. ",  
        "TABLE_LINE": "",  # include as is
        "CHART": "<!-- Chart placeholder -->\n",
        "IMAGE": "![image](image_path)\n",
        "PARAGRAPH": "",  # plain text
        # Add more mappings as needed
    }
    # Debug: print label mapping
    mapped_label = mapping.get(label.upper(), None)
    print(f"Mapping label '{label}' to markdown: '{mapped_label}'")
    return mapped_label

def auto_label_markdown(md_file_path, output_file_path):
    # Load the fine-tuned custom model and tokenizer explicitly
    model_dir = "bert-structure-labeler"  # Use model directory name without './'
    model = BertForTokenClassification.from_pretrained(model_dir, local_files_only=False)
    tokenizer = BertTokenizerFast.from_pretrained(model_dir, local_files_only=False)
    classifier = pipeline("token-classification", model=model, tokenizer=tokenizer, aggregation_strategy="simple")

    with open(md_file_path, "r", encoding="utf-8") as f:
        text = f.read()

    results = classifier(text)

    # Sort entities by start position
    results = sorted(results, key=lambda x: x['start'])

    labeled_text = ""
    last_idx = 0

    for entity in results:
        start = entity['start']
        end = entity['end']
        label = entity['entity_group']

        # Append text before entity
        labeled_text += text[last_idx:start]

        md_label = map_label_to_md(label)
        if md_label:
            # Insert markdown label before entity text
            if md_label == "---\\n":
                # Slide break on its own line
                labeled_text += md_label
            else:
                # Insert header or list marker
                # Ensure label is at start of line
                # Remove leading hashes or bullets from entity text if any
                entity_text = text[start:end].lstrip("#- *")
                labeled_text += f"{md_label}{entity_text}"
            last_idx = end
        else:
            # No mapping, just append entity text
            labeled_text += text[start:end]
            last_idx = end

    # Append remaining text
    labeled_text += text[last_idx:]

    # Heuristic labeling for "# Slide" lines
    lines = labeled_text.splitlines()
    new_lines = []
    for line in lines:
        if line.strip().lower().startswith("# slide"):
            # Insert slide break before this line
            new_lines.append("---")
            new_lines.append(line)
        else:
            new_lines.append(line)
    labeled_text = "\n".join(new_lines)

    # Clean up multiple consecutive newlines
    labeled_text = re.sub(r'\n{3,}', '\n\n', labeled_text)

    with open(output_file_path, "w", encoding="utf-8") as f:
        f.write(labeled_text)

    print(f"Auto-labeled markdown saved to {output_file_path}")

if __name__ == "__main__":
    import tkinter as tk
    from tkinter import filedialog

    root = tk.Tk()
    root.withdraw()
    md_file = filedialog.askopenfilename(title="Select markdown file to auto-label", filetypes=[("Markdown files", "*.md")])
    if md_file:
        output_file = md_file.replace(".md", "_labeled.md")
        auto_label_markdown(md_file, output_file)
    else:
        print("No file selected.")
