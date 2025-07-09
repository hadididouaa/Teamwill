import json
import os

LABELS = [
    "O",     # Outside any special token
    "B-TITLE", "I-TITLE",
    "B-PAGE", "I-PAGE",               # Beginning of a page, continuation of a page marker
    "B-CHAPTER", "I-CHAPTER",         # Start of a chapter title, continuation tokens of the chapter title
    "B-SECTION", "I-SECTION",         # Beginning of a section title within a chapter, continuation of a section title
    "B-SUBSECTION", "I-SUBSECTION",   # Beginning of a subsection title within a section, continuation tokens
    "B-SUBSUBSECTION", "I-SUBSUBSECTION", # Beginning of a subsubsection title, continuation tokens
    "B-ENUMITEM", "I-ENUMITEM",       # Beginning of an enumerated list item (numbered list), continuation tokens
    "B-BULLETLIST", "I-BULLETLIST",   # Beginning of a bulleted list item, continuation tokens
    "B-IMGCAP", "I-IMGCAP"            # Beginning of an image caption or image reference, continuation tokens
]


def load_annotations(json_path):
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data

def save_annotations(data, json_path):
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def annotation_helper(json_path):
    data = load_annotations(json_path)
    print("Starting annotation helper. Type label index to assign label to token.")
    print("Labels:")
    for i, label in enumerate(LABELS):
        print(f"{i}: {label}")
    print("Type 'q' to quit and save progress.")
    print("Type 'b' to go back to previous token to correct label.\n")

    # Find the first token index to start from (skip tokens already labeled)
    start_page_idx = 0
    start_token_idx = 0
    found_start = False
    for p_idx, page in enumerate(data):
        for t_idx, label in enumerate(page['labels']):
            if label == "O":  # Assuming "O" means unlabeled token
                start_page_idx = p_idx
                start_token_idx = t_idx
                found_start = True
                break
        if found_start:
            break

    for page_idx in range(start_page_idx, len(data)):
        page = data[page_idx]
        print(f"\n--- Page {page_idx + 1} ---")
        tokens = page['text']
        labels = page['labels']
        i = start_token_idx if page_idx == start_page_idx else 0
        while i < len(tokens):
            token = tokens[i]
            current_label = labels[i]
            print(f"Token [{i+1}/{len(tokens)}]: '{token}' (Current label: {current_label})")
            inp = input(f"Enter label index (0-{len(LABELS)-1}), 'b' to go back, or 'q' to quit: ").strip()
            if inp.lower() == 'q':
                print("Saving progress and exiting...")
                save_annotations(data, json_path)
                return
            elif inp.lower() == 'b':
                if i > 0:
                    i -= 1
                else:
                    print("Already at the first token, cannot go back further.")
                continue
            elif inp.isdigit() and 0 <= int(inp) < len(LABELS):
                labels[i] = LABELS[int(inp)]
                save_annotations(data, json_path)  # Save after each label assignment
                i += 1
            else:
                print("Invalid input. Please enter a valid label index, 'b', or 'q'.")

    print("Annotation complete. Saving file...")
    save_annotations(data, json_path)
    print("Done.")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Interactive annotation helper for LayoutLM dataset.")
    parser.add_argument("json_path", help="Path to the JSON annotation file to edit.")
    args = parser.parse_args()

    if not os.path.isfile(args.json_path):
        print(f"Error: File '{args.json_path}' does not exist.")
    else:
        annotation_helper(args.json_path)
