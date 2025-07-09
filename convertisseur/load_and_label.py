import os
from transformers import BertTokenizerFast, BertForTokenClassification
import torch

def load_model(model_dir):
    tokenizer = BertTokenizerFast.from_pretrained(model_dir)
    model = BertForTokenClassification.from_pretrained(model_dir)
    model.eval()
    return tokenizer, model

def label_text(text, tokenizer, model):
    # Tokenize input text
    tokens = text.split()
    encodings = tokenizer([tokens], is_split_into_words=True, return_tensors="pt", padding=True, truncation=True)
    input_ids = encodings["input_ids"]
    attention_mask = encodings["attention_mask"]

    # Predict labels
    with torch.no_grad():
        outputs = model(input_ids, attention_mask=attention_mask)
    logits = outputs.logits
    predictions = torch.argmax(logits, dim=-1)

    # Map predictions to labels
    labels = []
    for idx, pred in enumerate(predictions[0]):
        label_id = pred.item()
        label = model.config.id2label[label_id]
        labels.append(label)

    # Combine tokens and labels
    token_labels = list(zip(tokens, labels))
    return token_labels

if __name__ == "__main__":
    model_dir = "./bert-structure-labeler"
    tokenizer, model = load_model(model_dir)

    # Example usage: label a markdown text
    sample_text = "## Sample Heading\nThis is a sample paragraph in markdown."
    labeled_tokens = label_text(sample_text, tokenizer, model)
    for token, label in labeled_tokens:
        print(f"{token}\t{label}")
