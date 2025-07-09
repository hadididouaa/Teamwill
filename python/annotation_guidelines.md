# Annotation Guidelines for LayoutLM Fine-Tuning

This document explains the annotation labels used for token-level labeling to convert PDFs into structured Markdown files.

## Label Definitions

- **O**: Outside any special token. Regular paragraph text or content that does not belong to any structural element.

- **B-TITLE**: Beginning of the file title. Marks the first token of the document's main title.

- **I-TITLE**: Inside or continuation tokens of the file title.

- **B-PAGE**: Beginning of a page marker or page break indicator (e.g., "## --- Page 1 ---").

- **I-PAGE**: Inside or continuation of a page marker segment.

- **B-CHAPTER**: Beginning of a chapter title. Marks the first token of a chapter heading.

- **I-CHAPTER**: Inside or continuation tokens of the chapter title.

- **B-SECTION**: Beginning of a section title within a chapter.

- **I-SECTION**: Inside or continuation tokens of a section title.

- **B-SUBSECTION**: Beginning of a subsection title within a section.

- **I-SUBSECTION**: Inside or continuation tokens of a subsection title.

- **B-SUBSUBSECTION**: Beginning of a subsubsection title within a subsection.

- **I-SUBSUBSECTION**: Inside or continuation tokens of a subsubsection title.

- **B-ENUMITEM**: Beginning of an enumerated list item (numbered list).

- **I-ENUMITEM**: Inside or continuation tokens of an enumerated list item.

- **B-BULLETLIST**: Beginning of a bulleted list item.

- **I-BULLETLIST**: Inside or continuation tokens of a bulleted list item.

- **B-IMGCAP**: Beginning of an image caption or image reference.

- **I-IMGCAP**: Inside or continuation tokens of an image caption.

## Annotation Tips

- Use the BIO scheme: `B-` for the first token of a segment, `I-` for continuation tokens.

- Label all tokens in a segment consistently.

- Use `O` for regular text or tokens that do not belong to any special structure.

- For image captions, label the entire caption including the image reference.

- For page markers, label the entire page break line.

- For titles, use `B-TITLE` and `I-TITLE` to distinguish the main document title from other headings.

## Example

For the text:

```
Formation Métiers du financement
Septembre 2024
```

The labels would be:

```
[B-CHAPTER] Formation
[I-CHAPTER] Métiers
[I-CHAPTER] du
[I-CHAPTER] financement
[O] Septembre
[O] 2024
```

This structured annotation helps the model learn to convert PDFs into well-organized Markdown files.

If you have any questions or need further assistance, please refer to the training instructions or contact the development team.
