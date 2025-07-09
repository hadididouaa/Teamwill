import json
import re

def auto_label_tokens(data):
    """
    Automatically label tokens based on simple heuristics to speed up annotation.
    This function updates the 'labels' field in-place.
    """

    for page in data:
        tokens = page['text']
        labels = page['labels']

        for i, token in enumerate(tokens):
            # Skip if already labeled (not 'O')
            if labels[i] != 'O':
                continue

            # Heuristic: Detect page markers (e.g., "Page 1", "--- Page 1 ---")
            if re.match(r'^(Page|page|---\s*Page\s*\d+\s*---)$', token, re.IGNORECASE):
                labels[i] = 'B-PAGE'
                continue

            # Heuristic: Detect headings by token capitalization and length
            if token.isupper() and len(token) > 3:
                labels[i] = 'B-HEAD1'
                continue

            # Heuristic: Detect list items (tokens that are numbers or bullets)
            if re.match(r'^(\d+[\.\)]|[-*•])$', token):
                labels[i] = 'B-LIST'
                continue

            # Heuristic: Detect image captions keywords
            if token.lower() in ['figure', 'fig.', 'image', 'photo', 'caption']:
                labels[i] = 'B-IMGCAP'
                continue

            # Otherwise, label as regular text
            labels[i] = 'O'

    return data

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Auto-label tokens to speed up annotation.")
    parser.add_argument("input_json", help="Path to input JSON annotation file.")
    parser.add_argument("output_json", help="Path to save auto-labeled JSON file.")
    args = parser.parse_args()

    with open(args.input_json, 'r', encoding='utf-8') as f:
        data = json.load(f)

    data = auto_label_tokens(data)

    with open(args.output_json, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Auto-labeled tokens saved to {args.output_json}")
