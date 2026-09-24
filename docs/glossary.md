# Glossary

Terms from palaeography, pattern recognition and this codebase. The spec is [[requirements]].

## Manuscripts

| Term                   | Meaning                                                                                   |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| Folio, recto, verso    | A leaf of a manuscript; `12r` is its front, `12v` its back. One page image is one side.   |
| Carolingian minuscule  | The Latin book hand of the Saint Gall dataset. See [[ml/README#Datasets]].                |
| Gothic script          | The Middle High German hand of the Parzival dataset.                                      |
| Rubric                 | Text written in red ink, usually a heading.                                               |
| Abbreviation expansion | Turning scribal shorthand into full words, e.g. "dñs" to "dominus" (story D3).            |
| IIIF                   | A standard for serving images and manifests; e-codices publishes manuscripts with it (A2).|

## Pattern recognition

| Term                | Meaning                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------ |
| HTR                 | Handwritten text recognition: line image in, text out.                                     |
| Line segmentation   | Finding text-line polygons on a page (story B1).                                           |
| CER / WER           | Character / word error rate: edit distance divided by length. Lower is better.             |
| mAP                 | Mean average precision, for segmentation and keyword spotting.                             |
| Keyword spotting    | Finding images of a word across pages without a transcription (story D1).                  |
| TrOCR               | Transformer-based HTR model; our SOTA recognizer.                                          |
| CTC                 | The loss behind our from-scratch CNN-BiLSTM baseline recognizer.                           |
| Page-level split    | Train/val/test assigned per page, so lines of one page never cross splits.                 |
| Model card          | A note describing a model's data, training, metrics and limits. See [[models/README]].     |

## Codebase

| Term                | Meaning                                                                                        |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| Proxy               | The Next.js route that forwards `/api/*` to the backend. See [[architecture/frontend]].        |
| API types           | `frontend/src/lib/api/schema.ts`, generated from the backend schema. See [[architecture/api-contract]]. |
| `check.sh`          | Each app's quality gate, run by the pre-push hook. See [[workflow/git-workflow]].              |
| Machine output      | Anything a model produced. The UI always labels it as such.                                    |
| MLflow, DVC         | Experiment tracking and model registry; data versioning. See [[ml/README]].                    |
