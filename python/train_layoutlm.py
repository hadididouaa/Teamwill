import json
from sklearn.model_selection import train_test_split
from prepare_layoutlm_dataset import load_annotations, prepare_dataset
from fine_tune_layoutlm import fine_tune_layoutlm

def main():
    # Load your annotation JSON file
    annotation_file = "annotations.json"  # Update with your annotation JSON path
    data = load_annotations(annotation_file)

    # Split data into train and validation sets
    train_data, val_data = train_test_split(data, test_size=0.1, random_state=42)

    # Prepare datasets
    train_texts, train_bboxes, train_labels = prepare_dataset(train_data)
    val_texts, val_bboxes, val_labels = prepare_dataset(val_data)

    # Define label list (update with your actual labels)
    label_list = ["O", "B-PAGE", "I-PAGE", "B-HEAD1", "I-HEAD1", "B-LIST", "I-LIST", "B-IMGCAP", "I-IMGCAP"]

    # Fine-tune LayoutLM model
    fine_tune_layoutlm(
        train_texts=train_texts,
        train_bboxes=train_bboxes,
        train_labels=train_labels,
        val_texts=val_texts,
        val_bboxes=val_bboxes,
        val_labels=val_labels,
        label_list=label_list,
        output_dir="./fine_tuned_model",
        epochs=3,
        batch_size=8,
        learning_rate=5e-5
    )

if __name__ == "__main__":
    main()
