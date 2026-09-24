# Hyperframes Composition Brief: EclipseID

## Objective
Create a short launch-style brag video for EclipseID.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 19 seconds

## Source Material
- Project root: `c:\Users\Asus\Desktop\bc-adv\midnight project`
- Primary files read: `frontend/index.html`, `frontend/src/index.css`, `README.md`
- Product name: EclipseID
- Tagline / strongest claim: Permissioned DeFi without the doxing.
- Key UI or visual moment to recreate: The brutalist input forms and the "ZK CREDENTIAL ISSUER" flow.
- Copy that must appear verbatim:
  - WEB3 WANTS YOU TO DOX YOURSELF.
  - WE DON'T.
  - ZK PROOF VERIFIED
  - Keep your identity off-chain.

## Creative Direction
- Tone preset: chaotic
- Creative direction: brutalist, fast, unapologetic Web3 manifesto
- Interpretation: rapid pacing, huge typography, stark colors. Every line hits hard and holds just long enough to read.
- Angle: "Permissioned DeFi without the doxing." We lean into the brutalist design and the contrast between public blockchains (which expose everything) and Midnight Network (which protects data via ZK).
- Hook: Big brutalist type slamming in: "WEB3 WANTS YOU TO DOX YOURSELF." Followed immediately by: "WE DON'T."
- Outro / punchline: "Keep your identity off-chain." EclipseID Logo + @EclipseID011.
- Avoid:
  - Generic SaaS language
  - Abstract filler visuals
  - Unrelated visual redesign

## Visual Identity
- Background: #F2F0EB
- Text: #1C1C1C
- Accent: #FF4522
- Display font: Geist
- Body font: Geist
- Visual references from the project: Brutalist thick borders (`border-4`), heavy box shadows `shadow-[8px_8px_0px_0px_rgba(28,28,28,1)]`.

## Storyboard
Use the storyboard in `brag-output/brag-plan.md` as the creative contract.

Scene summary:
1. The Hook — 3.5s — Giant text slams in: WEB3 WANTS YOU TO DOX YOURSELF / WE DON'T.
2. The Solution — 3.5s — EclipseID intro and Midnight Network mention.
3. The Flow (Issue) — 5.0s — ZK Credential Issuer card, simulated Lace wallet connect, progress bar.
4. The Flow (Unlock) — 4.0s — Darkpool OTC card, simulated access, massive orange ZK PROOF VERIFIED stamp.
5. Outro — 3.0s — "Keep your identity off-chain." with logo and @EclipseID011.

## Audio
- Audio role: dense rhythmic layer
- Audio arc: Aggressive start, mechanical/digital middle for the flow, satisfying finality.
- Music: default track or high energy track
- Music treatment: high energy, ducking for major SFX hits.
- Music cue guidance: detect at composition via `hyperframes beats`
- Audio-reactive treatment: subtle; use music RMS/bass to make the #FF4522 orange glow or text scale pulse slightly.
- Audio-coupled moments:
  - Scene 1 — beat reveal with heavy text slams.
  - Scene 3 — simulated interaction / progress bar / card sequence.
  - Scene 4 — massive stamp hit for VERIFIED.
- SFX selection guidance: hard impacts for text reveals, mechanical clicks for user flow, heavy stamp sound for validation.
- SFX analysis guidance: use lower high-frequency-risk sounds for repeated or polished moments.
- Exact SFX choice: Hyperframes should choose filenames, timestamps, density, and volume based on the implemented animation.
- Audio files: copy the chosen music and any Hyperframes-selected SFX into `brag-output/composition/assets/`

## Hyperframes Instructions
Load the composition-building Hyperframes domain skills — `hyperframes-core` (composition contract + `data-*` timing), `hyperframes-animation` (motion), `hyperframes-creative` (design spec, beats, audio-reactive), `hyperframes-keyframes` (seek-safe keyframes), and `hyperframes-cli` (lint/check/render). /brag is its own workflow: do not enter the `hyperframes` entry-point intent interview and do not route into its generic promo / launch-video workflow. Prefer native Hyperframes conventions over anything in `/brag`.

Requirements:
- Show at least one real UI, copy, or visual element from the source project.
- Keep all text readable in the final render.
- Keep the video within 15-25 seconds.
- Include the planned music/SFX layer unless audio was explicitly disabled or documented as intentionally silent.
- Treat `/brag` audio notes as guidance, not a fixed cue sheet. Choose SFX after the visual animation exists.
- Treat music cue metadata as optional timing hints. Hyperframes decides exact animation timing and should ignore cues that hurt readability, scene pacing, or the product story.
- Major reveals may move toward nearby strong cues within about 0.15s. Smaller entrances may align to nearby beat points within about 0.10s. Use only 1-3 strong cue locks in a 15-25s video unless the edit clearly benefits from more.
- Use SFX to support motion and interaction: card sounds for card-like reveals, short announcement cues for major payoffs, key/click sounds for text or user actions, and restraint when the edit is already busy.
- Honor planned music treatment such as fade-outs, ducking, beat-aligned reveals, or letting a final SFX ring over the music, using the best Hyperframes-supported implementation.
- When music is present and the treatment is not `none`, consider Hyperframes audio-reactive workflow: extract audio data and use RMS/frequency bands for subtle, brand-specific motion. Good targets are glow, depth, background warmth, card presence, title emphasis, or other existing visual elements. Avoid waveform/equalizer visuals, musical-note graphics, generic particle systems, strobing, or heavy pulsing.
- Use local assets for audio and any required runtime/media dependencies when possible.
- Run `hyperframes check` before render — it is brag's single gate.
