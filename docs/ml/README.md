# Machine learning

Pattern recognition quality is a third of the grade, and "used correctly" counts as much as accuracy. The full rules are in [[requirements]] (section 5); terms are in [[glossary]].

## Tasks and models

| Task                            | SOTA model                         | Baseline                        | Metric                    |
| ------------------------------- | ---------------------------------- | ------------------------------- | ------------------------- |
| Line segmentation               | YOLOv8/v11-seg, fine-tuned         | Kraken segmenter, pretrained    | mAP@0.5, IoU              |
| Line recognition (HTR)          | TrOCR, fine-tuned                  | CNN-BiLSTM-CTC from scratch     | CER, WER                  |
| Script / language classification | EfficientNet or ResNet, fine-tuned | none                           | accuracy, F1, confusion matrix |
| Keyword spotting                | PHOCNet or DINOv2 + pgvector       | simple CNN embeddings           | mAP                       |

Each deployed model gets a card in [[models/README|models]]. Where models plug into the system: [[architecture/overview#Recognition pipeline]] and [[architecture/design-patterns]].

## Datasets

- **Saint Gall**: Latin, Carolingian minuscule.
- **Parzival**: Middle High German, Gothic script.
- **Washington**: English, an optional benchmark.

Check each dataset's license before use. Datasets are tracked with DVC and never committed to git.

## Rules that are not negotiable

- Fixed train/val/test splits, stored as ID lists in `ml/splits/`, split by **page** so lines of one page never cross splits.
- The test set is never used for training or tuning. Report metrics on it only, for every model version.
- Every run is logged to MLflow: parameters, metrics, artifacts.
- Seeds set, library versions pinned.
- A new model version is promoted only if its test CER is lower (story C3).

## Initial targets

HTR CER under 10% on the Saint Gall test set, segmentation mAP@0.5 above 0.85, classifier accuracy above 95%. Adjust after the baselines exist.
