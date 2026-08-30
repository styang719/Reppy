# Vision eval harness

Measures how well the vision model identifies gym equipment, using the same
prompt and closed-set schema as the `identify-equipment` Edge Function. Results
here predict what the app will do.

## Running it

```bash
mkdir photos                      # drop gym photos in here (gitignored)
OPENAI_API_KEY=sk-... npm run eval -- ./photos
```

Compare models:

```bash
OPENAI_API_KEY=sk-... npm run eval -- ./photos --model=gpt-4o
```

## Scoring

Prefix a filename with the expected slug and `__` to score it:

```
leg-press__crowded.jpg
flat-bench-press__dim-lighting.jpg
lat-pulldown__side-angle.jpg
unlabelled.jpg                    # identified but not scored
```

## Reading the output

- **Misses** — flags when the right answer appeared in `alternatives`, which
  means the disambiguation UI would have rescued it.
- **Matched nothing** — the catalog gap list. These are the machines to add.
- **Low confidence** — where the app shows the "is this right?" picker instead
  of asserting an answer. Use this to tune `CONFIDENCE_THRESHOLD` in
  `app/scan.tsx`.

## Building a useful photo set

Shoot the awkward cases, not the catalogue shots: machines in use, partial
frames, side angles, backlighting, several machines in one shot. Accuracy on
clean showroom photos tells you very little about a real gym floor.
