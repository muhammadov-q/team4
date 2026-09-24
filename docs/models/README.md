# Model cards

One card per deployed model, named after the model (`trocr-saint-gall.md`). The rules the cards report against are in [[ml/README]].

No models are deployed yet. The first cards will be the CTC baseline and TrOCR (milestones M2 and M3 in [[requirements]]).

## Card template

```markdown
# <Model name>

- Task: <segmentation | recognition | classification | keyword spotting>
- Version: <MLflow run id>, promoted <YYYY-MM-DD>

## Data
Datasets, license, split sizes (pages and lines), preprocessing.

## Training
Base model, hyperparameters, seed, hardware, duration.

## Results (test set only)
| Metric | This model | Baseline |

## Limitations
Scripts, hands or page conditions where it fails.

## Intended use
What it's for in Codex Lens, and what it must not be used for.
```
