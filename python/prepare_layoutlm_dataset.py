import json
import os
from typing import List, Dict

def load_annotations(json_path: str) -> List[Dict]:
    """
    Load annotations from a JSON file.
    Expected format: List of dicts, each dict representing a page/document with:
    - 'text': full text string
    - 'bboxes': list of bounding boxes for tokens [[x0, y0, x1, y1], ...]
    - 'labels': list of label ids for tokens
    """
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data

def prepare_dataset(data: List[Dict]):
    """
    Prepare dataset lists for LayoutLM fine-tuning.
    Returns:
    - texts: List of tokenized texts (strings)
    - bboxes: List of bounding boxes per text
    - labels: List of label ids per text
    """
    texts = []
    bboxes = []
    labels = []

    for item in data:
        text = item.get('text', '')
        box = item.get('bboxes', [])
        label = item.get('labels', [])

        if len(box) != len(label):
            print("Warning: bbox and label length mismatch, skipping item")
            continue

        texts.append(text)
        bboxes.append(box)
        labels.append(label)

    return texts, bboxes, labels

if __name__ == "__main__":
    print("This script helps prepare dataset for LayoutLM fine-tuning.")
    print("You need to provide a JSON file with text, bounding boxes, and labels.")
    print("Example usage:")
    print("  data = load_annotations('annotations.json')")
    print("  texts, bboxes, labels = prepare_dataset(data)")
