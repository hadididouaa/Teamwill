import os
import torch
from transformers import BertTokenizerFast, BertForTokenClassification, Trainer, TrainingArguments
<<<<<<< HEAD
from datasets import load_metric, Dataset
=======
import evaluate
from datasets import Dataset
def read_training_data(file_path):
    sentences = []
    labels = []
    with open(file_path, "r", encoding="utf-8") as f:
        tokens = []
        token_labels = []
        for line in f:
            line = line.strip()
            if not line:
                if tokens:
                    sentences.append(tokens)
                    labels.append(token_labels)
                    tokens = []
                    token_labels = []
            else:
                splits = line.split()
                if len(splits) >= 2:
                    token = splits[0]
                    label = splits[1]
                    tokens.append(token)
                    token_labels.append(label)
        # Add last sentence if any
        if tokens:
            sentences.append(tokens)
            labels.append(token_labels)
    return sentences, labels

def get_label_list(labels):
    unique_labels = set()
    for label_seq in labels:
        unique_labels.update(label_seq)
    return sorted(list(unique_labels))

def encode_tags(tags, encodings, label2id):
    labels = []
    for i, label in enumerate(tags):
        word_ids = encodings.word_ids(batch_index=i)
        previous_word_idx = None
        label_ids = []
        for word_idx in word_ids:
            if word_idx is None:
                label_ids.append(-100)
            elif word_idx != previous_word_idx:
                label_ids.append(label2id[label[word_idx]])
            else:
                # For wordpieces inside the same word, assign -100 to ignore
                label_ids.append(-100)
            previous_word_idx = word_idx
        labels.append(label_ids)
    return labels

def main():
    data_file = "dataset/training_data.txt"
    import tkinter as tk
    from tkinter import filedialog

    root = tk.Tk()
    root.withdraw()
    data_file = filedialog.askopenfilename(title="Select training data file", filetypes=[("Text files", "*.txt")])
    if not data_file or not os.path.exists(data_file):
        print("No valid training data file selected.")
        return


    model_name = "bert-base-uncased"
    output_dir = "./bert-structure-labeler"

    sentences, labels = read_training_data(data_file)
    label_list = get_label_list(labels)
    label2id = {l: i for i, l in enumerate(label_list)}
    id2label = {i: l for l, i in label2id.items()}

    tokenizer = BertTokenizerFast.from_pretrained(model_name)

    encodings = tokenizer(sentences, is_split_into_words=True, return_offsets_mapping=True, padding=True, truncation=True)
    encoded_labels = encode_tags(labels, encodings, label2id)

    dataset = Dataset.from_dict({
        "input_ids": encodings["input_ids"],
        "attention_mask": encodings["attention_mask"],
        "labels": encoded_labels
    })

    def compute_metrics(p):
        metric = load_metric("seqeval")
        metric = evaluate.load("seqeval")

        predictions, labels = p
        predictions = predictions.argmax(-1)
        true_labels = [[id2label[l] for l in label if l != -100] for label in labels]
        true_predictions = [
            [id2label[p] for (p, l) in zip(prediction, label) if l != -100]
            for prediction, label in zip(predictions, labels)
        ]
        results = metric.compute(predictions=true_predictions, references=true_labels)
        return {
            "precision": results["overall_precision"],
            "recall": results["overall_recall"],
            "f1": results["overall_f1"],
            "accuracy": results["overall_accuracy"],
        }

    model = BertForTokenClassification.from_pretrained(model_name, num_labels=len(label_list), id2label=id2label, label2id=label2id)

    training_args = TrainingArguments(
        output_dir=output_dir,
        evaluation_strategy="epoch",

        learning_rate=2e-5,
        per_device_train_batch_size=8,
        per_device_eval_batch_size=8,
        num_train_epochs=3,
        weight_decay=0.01,
        save_total_limit=2,
        logging_dir=f"{output_dir}/logs",
        logging_steps=10,
        load_best_model_at_end=True,
        metric_for_best_model="f1",
        load_best_model_at_end=False,

    )

    # Split dataset into train and eval (80/20)
    train_size = int(0.8 * len(dataset))
    train_dataset = dataset.select(range(train_size))
    eval_dataset = dataset.select(range(train_size, len(dataset)))

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=eval_dataset,
        tokenizer=tokenizer,
        compute_metrics=compute_metrics,
    )

    trainer.train()
    trainer.save_model(output_dir)
    print(f"Model fine-tuned and saved to {output_dir}")

if __name__ == "__main__":
    main()
