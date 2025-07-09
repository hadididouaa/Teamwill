import json
import pdfplumber
import os

def extract_tokens_and_bboxes(pdf_path, output_json_path):
    data = []
    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages, start=1):
            words = page.extract_words()
            tokens = []
            bboxes = []
            for word in words:
                tokens.append(word['text'])
                # pdfplumber bbox: x0, top, x1, bottom
                bbox = [int(word['x0']), int(word['top']), int(word['x1']), int(word['bottom'])]
                bboxes.append(bbox)
            # Initialize labels as 'O' for all tokens; you will manually update these later
            labels = ['O'] * len(tokens)
            data.append({
                "text": tokens,
                "bboxes": bboxes,
                "labels": labels
            })
    with open(output_json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Extracted tokens and bounding boxes saved to {output_json_path}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Extract tokens and bounding boxes from PDF for annotation.")
    parser.add_argument("pdf_path", help="Path to the PDF file to extract tokens from.")
    parser.add_argument("output_json", help="Path to save the extracted tokens and bounding boxes JSON.")
    args = parser.parse_args()

    if not os.path.isfile(args.pdf_path):
        print(f"Error: PDF file '{args.pdf_path}' does not exist.")
    else:
        extract_tokens_and_bboxes(args.pdf_path, args.output_json)
