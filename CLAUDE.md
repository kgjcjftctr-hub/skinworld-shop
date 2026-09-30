# SkinWorld Task Center maintenance

`SKINWORLD_TASKS.json` is the persistent source of truth for the SkinWorld Task Center.
`node scripts/generate-task-center.mjs` renders it into two files with identical content:

- `SKINWORLD_TASK_CENTER.html` — a complete document, for opening locally.
- `.artifact/task-center.html` — the same page without the `<html>/<head>/<body>` wrapper, which is what
  gets published as the Claude artifact (the platform adds that wrapper on publish).

Republish the artifact to the SAME url after regenerating, so the shared link keeps working and its
history is preserved. Never publish a second Task Center artifact. The url lives in `artifactUrl` inside
`SKINWORLD_TASKS.json`; from a session that did not publish it, pass it to the Artifact tool as `url`.

At the end of every SkinWorld implementation, audit, or production-verification session:

1. Read the existing JSON first. Never start a replacement list.
2. Inspect the real current change and the affected buyer-facing paths. Search the repository for new
   TODO/FIXME, errors, placeholders, incomplete content, and changed integrations when relevant.
3. Match a finding to an existing stable `SW-###` ID. Update its status, `updatedAt`, origin files,
   completion criteria, and append an evidence-based history entry. Do not duplicate it.
4. Create a new stable ID only for a genuinely new finding. Classify it exactly as `detected_problem`,
   `improvement_suggestion`, or `requires_confirmation`; do not invent defects. Set `detectedIn` to the
   `lastInspectedAt` value you are about to write — that field, not the date, is what marks a finding as
   new, because two inspections can fall on the same day.
5. When verified fixed, use `completed`, keep the item and history, and state the verification evidence.
   Never delete completed items.
6. Add one concise entry to `recentChanges`, update `lastInspectedAt` and `lastInspectedBy`, then run
   `node scripts/generate-task-center.mjs` and republish the artifact to its existing url.
7. Run type-check/build or the relevant validation when changing application code. Production facts
   (payments, emails, deployments, cache freshness, accessibility/device behavior) must remain
   `requires_verification` until actually tested.

Do not modify storefront functionality merely to maintain the Task Center.
