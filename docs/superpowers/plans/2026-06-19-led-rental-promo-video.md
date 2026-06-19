# LED Rental Promo Video Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and validate a 25-second Chinese-narrated LED rental promo in landscape and portrait HyperFrames compositions.

**Architecture:** A self-contained `video/led-rental-promo` HyperFrames project will reuse verified product assets from the website. Shared script, narration, transcript, and brand tokens drive two composition files with format-specific layouts.

**Tech Stack:** HyperFrames HTML compositions, GSAP, HyperFrames CLI, local product PNG/MP4 assets, TTS and transcript timing.

---

## Chunk 1: Brand, narrative, and assets

### Task 1: Capture the source material

**Files:**
- Create: `video/led-rental-promo/DESIGN.md`
- Create: `video/led-rental-promo/assets/`

- [ ] Inspect the current site source, product copy, colors, fonts, PNGs, logo, and demo videos.
- [ ] Copy only verified assets into the video project.
- [ ] Record palette, typography, motion constraints, and prohibited treatments in `DESIGN.md`.
- [ ] Verify every product claim against the current website files.

### Task 2: Lock narration and beat timing

**Files:**
- Create: `video/led-rental-promo/SCRIPT.md`
- Create: `video/led-rental-promo/STORYBOARD.md`
- Create: `video/led-rental-promo/narration.wav`
- Create: `video/led-rental-promo/transcript.json`

- [ ] Write a concise Traditional Chinese voiceover for the approved five-beat structure.
- [ ] Create per-beat camera, typography, asset, transition, and sound direction.
- [ ] Generate narration and word timestamps.
- [ ] Replace estimated beat durations with measured narration timing.

## Chunk 2: Composition build

### Task 3: Build landscape composition

**Files:**
- Create: `video/led-rental-promo/index.html`
- Create: `video/led-rental-promo/compositions/landscape.html`

- [ ] Scaffold a non-interactive HyperFrames project.
- [ ] Build static hero-frame layouts before animation.
- [ ] Add GSAP entrances, exits, and purposeful scene transitions.
- [ ] Synchronize captions and audio to transcript timing.
- [ ] Review every beat at its hero frame.

### Task 4: Build portrait composition

**Files:**
- Create: `video/led-rental-promo/compositions/portrait.html`

- [ ] Recompose each beat for 1080×1920.
- [ ] Preserve headline hierarchy, product visibility, captions, and CTA safe areas.
- [ ] Verify portrait is not a cropped landscape layout.

## Chunk 3: Quality and handoff

### Task 5: Validate and preview

**Files:**
- Modify: `video/led-rental-promo/DEVLOG.md`

- [ ] Run `npx hyperframes lint` and fix all errors.
- [ ] Run `npx hyperframes validate` and resolve contrast findings.
- [ ] Run `npx hyperframes inspect --samples 15` and fix unintended overflow.
- [ ] Generate and review the animation map.
- [ ] Start HyperFrames Studio and verify both compositions through the full timeline.
- [ ] Record implementation and verification results in `DEVLOG.md`.
- [ ] Commit video source, assets, and DEVLOG together.
