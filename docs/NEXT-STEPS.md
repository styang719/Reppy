# Next steps

Written at the handoff from a cloud session to local development. Read this with
`CLAUDE.md`, which carries the architecture constraints.

## Where things stand

Working and deployed: schema with RLS, a 16-machine catalog, 80 exercises ingested
from free-exercise-db, the `identify-equipment` Edge Function, and the app running on
a physical iPhone through a local Xcode build.

**The open question is vision accuracy.** Real gym photos came back badly
misidentified. The cause looks like configuration rather than model choice: the vision
call used `detail: 'low'`, which downsamples every image to 512x512, and the client
downscaled to 768px before that. Two machines differing only in seat angle or pad
placement are indistinguishable at that size.

That is fixed in the code (`detail: 'high'`, 1024px client downscale, a prompt that
names what actually discriminates) but **not yet deployed or measured**.

## Do these in order

### 1. Get current

Discard any local changes to `.gitignore` and `package.json` — they come from
`expo prebuild` and are safe to lose — then pull. Confirm with `git log --oneline -1`;
anything older than the tip means the pull did not land, which has happened twice
before when local edits silently blocked it.

### 2. Deploy the fix

```
npm run fn:deploy
```

The `detail: 'high'` change lives in the Edge Function and does nothing until this
runs.

### 3. Reload the app

```
npm start
```

Then reload on the phone. **No native rebuild** — the 1024px change is JavaScript, so
Metro picks it up. A rebuild is only needed when native dependencies change.

### 4. Measure it

This is the step that matters. Everything after it depends on the number.

Put 20-30 real gym photos in `photos/` (gitignored), named with the expected answer:

```
photos/lat-pulldown__crowded.jpg
photos/flat-bench-press__dim.jpg
photos/leg-press__side-angle.jpg
```

Then, with an OpenAI key in the environment:

```
npm run eval -- ./photos                 # the fix
npm run eval -- ./photos --detail=low    # what it was
```

Two accuracy numbers on identical photos. The harness also reports which misses the
alternatives list would have rescued, and which photos matched nothing — that second
list is the catalog gap list.

Shoot the awkward cases: machines in use, partial frames, side angles, backlighting,
several machines in one shot. Clean showroom photos flatter the model and predict
nothing about a gym floor.

### 5. Read the result before choosing a fix

- **Accuracy acceptable** → move on to walkthrough videos (below).
- **Right answer often in `alternatives`** → the disambiguation picker is doing its
  job; consider lowering `CONFIDENCE_THRESHOLD` in `app/scan.tsx` so it appears more
  often.
- **Photos matching nothing** → catalog gaps. Add those machines; four test photos
  already exposed four missing ones.
- **Confidently wrong on machines that are in the catalog** → now it is worth trying a
  stronger model (`--model=gpt-4o`) or a purpose-trained classifier. Roboflow hosts
  gym-equipment detectors reporting around 90% mAP@50 across classes that map closely
  onto this catalog, and one could run on-device with no per-scan cost.

Do not pick between those before seeing how it fails. The failure mode names the fix.

## Then: walkthrough videos

`content/walkthroughs.csv` has a row per machine and no video ids, deliberately — a
fabricated id looks real and resolves to nothing, which is worse than an empty table.

Fill in ids from YouTube URLs (`youtube.com/watch?v=THIS_PART`) and run `npm run
curate`. Blank rows are skipped, so it can be done in several sittings.

A good one shows the whole machine before anyone sits on it, covers seat and pad
adjustment rather than just reps, runs under two minutes, and has someone talking.

## Decisions already made — don't relitigate without new information

**Content source is free-exercise-db**, public domain, images and instructions but no
video. Deliberate: nothing should be purchased until scan data shows the long tail
matters. The ingest sits behind an adapter, so switching later is one flag.

**Machine walkthroughs come from curated YouTube**, not an API. Sixteen machines is an
evening of work, and a clip chosen for a specific machine beats anything retrieved by
id. It also costs nothing and carries no licence risk.

**A paid dataset stays deferred.** ExerciseDB sells a one-time perpetual dataset
(~$300, GIFs) and a subscription API (11,000+ exercises with video). MuscleWiki has
7,700 real-person videos but forbids caching them and its licence is revocable. At
this catalog size all of them are oversupplied. See the comparison in the project's
artifacts if the question reopens.

## Traps this project has already hit

**"Latest on npm" is not "works with this Expo SDK".** Three packages broke the native
build by being too new: react-native-worklets (expo-modules-core caps it at ^0.10),
react-native-reanimated (must pair with the worklets version), and
@react-native-async-storage/async-storage (3.x renames its pod and splits into a
legacy path supabase-js cannot reach). Check peer ranges in `node_modules` before
bumping any of them.

**Neither typecheck nor `expo export` catches those.** Both only exercise JavaScript. A
native mismatch appears only when Xcode compiles, which is why all three reached a
device before being found.

**Don't run `npm audit fix --force`.** It upgrades across majors and will break the
dependency tree Expo pins on purpose.

**A blocked `git pull` is silent.** Local edits abort the merge, `npm install` then
reports "up to date" against the stale lockfile, and the fix never arrives. If a
dependency change seems not to have applied, check `git log` before debugging anything
else.
