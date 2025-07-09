# Instructions to Train and Test LayoutLM Fine-Tuning Pipeline

## Step 1: Create Annotations
- Manually annotate a small set of your PDF documents following the annotation guidelines in `annotation_guidelines.md`.
- Prepare a JSON file with token texts, bounding boxes, and labels as specified.

## Step 2: Prepare Dataset
- Use the script `prepare_layoutlm_dataset.py` to load your JSON annotation file and prepare the dataset.
- Example usage:
  ```python
  from prepare_layoutlm_dataset import load_annotations, prepare_dataset

  data = load_annotations('your_annotations.json')
  texts, bboxes, labels = prepare_dataset(data)
  ```

## Step 3: Fine-Tune LayoutLM Model
- Use the script `fine_tune_layoutlm.py` to fine-tune the model on your prepared dataset.
- Example usage:
  ```python
  from fine_tune_layoutlm import fine_tune_layoutlm

  fine_tune_layoutlm(
      train_texts=train_texts,
      train_bboxes=train_bboxes,
      train_labels=train_labels,
      val_texts=val_texts,
      val_bboxes=val_bboxes,
      val_labels=val_labels,
      label_list=label_list,
      output_dir='fine_tuned_model',
      epochs=3,
      batch_size=8,
      learning_rate=5e-5
  )
  ```
- Adjust parameters as needed.

## Step 4: Integrate Fine-Tuned Model for Inference
- Modify `convert_to_markdown_pipeline.py` to load your fine-tuned model instead of the base LayoutLM model.
- Change the model loading lines to:
  ```python
  from transformers import LayoutLMTokenizer, LayoutLMForTokenClassification

  tokenizer = LayoutLMTokenizer.from_pretrained('fine_tuned_model')
  model = LayoutLMForTokenClassification.from_pretrained('fine_tuned_model')
  ```
- This will enable the pipeline to use your fine-tuned model for better Markdown conversion.

## Step 5: Test the Pipeline
- Run `convert_to_markdown_pipeline.py` on test PDF files.
- Verify the Markdown output matches your expectations and the example Markdown structure.

## Step 6: Iterate and Improve
- Based on test results, refine your annotations and retrain the model to improve accuracy.

---

If you need help with any of these steps or want example scripts for integration and testing, feel free to ask.
