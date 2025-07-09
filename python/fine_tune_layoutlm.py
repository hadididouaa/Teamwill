import os
import torch
from torch.utils.data import DataLoader, Dataset
from transformers import LayoutLMTokenizer, LayoutLMForTokenClassification, AdamW
from transformers import get_scheduler
from datasets import load_metric
from tqdm import tqdm

# Example Dataset class for LayoutLM token classification
class LayoutLMDataset(Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels
    def __len__(self):
        return len(self.labels)
    def __getitem__(self, idx):
        item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
        item['labels'] = torch.tensor(self.labels[idx])
        return item

def fine_tune_layoutlm(train_texts, train_bboxes, train_labels, val_texts, val_bboxes, val_labels, label_list, output_dir, epochs=3, batch_size=8, learning_rate=5e-5):
    tokenizer = LayoutLMTokenizer.from_pretrained("microsoft/layoutlm-base-uncased")
    model = LayoutLMForTokenClassification.from_pretrained("microsoft/layoutlm-base-uncased", num_labels=len(label_list))

    # Tokenize and encode inputs with bounding boxes
    train_encodings = tokenizer(train_texts, boxes=train_bboxes, padding="max_length", truncation=True, max_length=512, return_tensors="pt")
    val_encodings = tokenizer(val_texts, boxes=val_bboxes, padding="max_length", truncation=True, max_length=512, return_tensors="pt")

    train_dataset = LayoutLMDataset(train_encodings, train_labels)
    val_dataset = LayoutLMDataset(val_encodings, val_labels)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)

    optimizer = AdamW(model.parameters(), lr=learning_rate)
    num_training_steps = epochs * len(train_loader)
    lr_scheduler = get_scheduler("linear", optimizer=optimizer, num_warmup_steps=0, num_training_steps=num_training_steps)

    metric = load_metric("seqeval")

    model.train()
    for epoch in range(epochs):
        loop = tqdm(train_loader, leave=True)
        for batch in loop:
            batch = {k: v.to(device) for k, v in batch.items()}
            outputs = model(**batch)
            loss = outputs.loss
            loss.backward()

            optimizer.step()
            lr_scheduler.step()
            optimizer.zero_grad()

            loop.set_description(f"Epoch {epoch}")
            loop.set_postfix(loss=loss.item())

        # Validation
        model.eval()
        all_predictions = []
        all_labels = []
        for batch in val_loader:
            batch = {k: v.to(device) for k, v in batch.items()}
            with torch.no_grad():
                outputs = model(**batch)
            logits = outputs.logits
            predictions = torch.argmax(logits, dim=-1)

            labels = batch["labels"]
            predictions = predictions.cpu().numpy()
            labels = labels.cpu().numpy()

            # Convert predictions and labels to label names
            for pred, label in zip(predictions, labels):
                true_labels = [label_list[l] for l in label if l != -100]
                true_preds = [label_list[p] for (p, l) in zip(pred, label) if l != -100]
                all_labels.append(true_labels)
                all_predictions.append(true_preds)

        results = metric.compute(predictions=all_predictions, references=all_labels)
        print(f"Validation results at epoch {epoch}: {results}")
        model.train()

    # Save fine-tuned model
    os.makedirs(output_dir, exist_ok=True)
    model.save_pretrained(output_dir)
    tokenizer.save_pretrained(output_dir)
    print(f"Model saved to {output_dir}")

# Note: You need to prepare train_texts, train_bboxes, train_labels, val_texts, val_bboxes, val_labels, and label_list according to your dataset.

if __name__ == "__main__":
    print("This script fine-tunes LayoutLM for token classification.")
    print("Prepare your dataset and call fine_tune_layoutlm() with appropriate parameters.")
