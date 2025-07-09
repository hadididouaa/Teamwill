import json
import re
import os

LABELS = {
    "O": 0,
    "B-PAGE": 1,
    "I-PAGE": 2,
    "B-HEAD1": 3,
    "I-HEAD1": 4,
    "B-LIST": 5,
    "I-LIST": 6,
    "B-IMGCAP": 7,
    "I-IMGCAP": 8
}

def load_annotations(json_path):
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data

def save_annotations(data, json_path):
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def tokens_to_text(tokens):
    return " ".join(tokens)

def annotate_by_markdown(json_path, markdown_path, output_json_path):
    """
    Allows annotation by editing a Markdown-like file where each line is prefixed by a label.
    The function reads the markdown file, maps labels to tokens, and updates the JSON annotations.
    """

    data = load_annotations(json_path)

    # Read markdown annotation file
    with open(markdown_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Parse markdown lines: expected format "[LABEL] content"
    annotated_segments = []
    for line in lines:
        line = line.strip()
        if not line:
            continue
        match = re.match(r'^\[(\w+)\]\s+(.*)$', line)
        if match:
            label = match.group(1)
            content = match.group(2)
            if label not in LABELS:
                print(f"Warning: Unknown label '{label}' in markdown annotation.")
                continue
            annotated_segments.append((label, content))
        else:
            print(f"Warning: Line does not match expected format: {line}")

    # Flatten tokens from JSON data
    all_tokens = []
    for page in data:
        all_tokens.extend(page['text'])

    # Map annotated segments to tokens
    token_idx = 0
    for label, content in annotated_segments:
        content_tokens = content.split()
        length = len(content_tokens)
        # Check tokens match
        tokens_slice = all_tokens[token_idx:token_idx+length]
        if tokens_slice != content_tokens:
            print(f"Warning: Token mismatch at position {token_idx}. Markdown content tokens do not match JSON tokens.")
            print(f"Markdown tokens: {content_tokens}")
            print(f"JSON tokens: {tokens_slice}")
            # You may want to handle this more gracefully
        # Assign labels to tokens
        for i in range(length):
            # Find which page this token belongs to and update label
            cumulative = 0
            for page in data:
                page_len = len(page['text'])
                if token_idx + i < cumulative + page_len:
                    page_token_idx = token_idx + i - cumulative
                    if i == 0:
                        page['labels'][page_token_idx] = label if label.startswith('B-') else 'B-' + label[2:] if label.startswith('I-') else 'B-' + label
                    else:
                        page['labels'][page_token_idx] = 'I-' + label[2:] if label.startswith('B-') else label
                    break
                cumulative += page_len
        token_idx += length

    save_annotations(data, output_json_path)
    print(f"Annotations updated and saved to {output_json_path}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Annotate tokens by editing a Markdown-like file with labels.")
    parser.add_argument("json_path", help="Path to the JSON annotation file to update.")
    parser.add_argument("markdown_path", help="Path to the Markdown annotation file.")
    parser.add_argument("output_json_path", help="Path to save the updated JSON annotation file.")
    args = parser.parse_args()

    if not os.path.isfile(args.json_path):
        print(f"Error: JSON file '{args.json_path}' does not exist.")
    elif not os.path.isfile(args.markdown_path):
        print(f"Error: Markdown file '{args.markdown_path}' does not exist.")
    else:
        annotate_by_markdown(args.json_path, args.markdown_path, args.output_json_path)
