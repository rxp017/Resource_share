# Design contract - Pulse and Calm

Status: P01 deliverable, derived from planning doc 02 section 4 and doc 03 ADR-010. All color values are PROPOSALS: contrast ratios get measured per theme in P04 before any WCAG AA claim (UX-15). No user testing has occurred; usability targets in doc 02 section 9 remain pending (UX-26).

## 1. Identity and rules

Working identity: a contemporary campus noticeboard with clear exchange receipts. Pulse = expressive editorial design (strong display type, sticker-like category labels allowed on nonessential elements). Calm = same structure, restrained typography, quieter surfaces. One component system; themes swap semantic tokens only (ADR-010: themes cannot rearrange critical flows). Neither style removes features, lowers contrast, or is assigned by age/demographic (UX-01, UX-02).

Memorable anchor: every listing card carries a compact exchange strip - Sale / Free loan / Rental + relevant amount + availability. Every transaction detail renders as a vertical receipt: terms, handoff, return.

## 2. Semantic color tokens (proposals; measure in P04)

| Token | Pulse light | Pulse dark | Calm light | Calm dark |
|---|---|---|---|---|
| background | #FAF6EF | #201A17 | #F5F6F7 | #10161D |
| surface | #FFFFFF | #2A2320 | #FFFFFF | #1A222B |
| text | #201A17 | #F5EFE6 | #2F3A45 | #E6EBF0 |
| text-muted | #6B6259 | #B3A79A | #5D6B7A | #9AA7B4 |
| border | #E7DFD3 | #453B33 | #DFE3E8 | #33404D |
| accent (primary action) | #0F766E | #5EEAD4 | #0F766E | #7FD8CE |
| accent-contrast (text on accent) | #FFFFFF | #06201D | #FFFFFF | #0A2420 |
| focus ring | #0F766E | #5EEAD4 | #0F766E | #7FD8CE |
| success | #166534 | #4ADE80 | #15803D | #4ADE80 |
| warning | #92400E | #FBBF24 | #A16207 | #FCD34D |
| danger | #B91C1C | #F87171 | #B91C1C | #FCA5A5 |

Status is conveyed by words + icons + color, never color alone (UX-15). Dark themes must show a clear luminance hierarchy; no grey-on-grey low-contrast surfaces.

## 3. Typography

- Display face (Pulse headings/display only): Space Grotesk. Body face (both styles; Calm uses it throughout, headings weight 600): Source Sans 3. Both OFL-licensed; bundle via @fontsource in P04 after license/glyph verification; system fallback stack retained.
- Scale: display-xl 32/36, display 28/34, heading 20/28, body-lg 18/28, body 16/24, small 14/20, micro 13/18 (nonessential only). Base body 16px minimum, line-height ~1.5, reading width 65-75ch. Type adapts to text zoom; no fixed-height text containers (UX-12).

## 4. Spacing, sizing, motion

- Spacing scale: 4, 8, 12, 16, 24, 32, 48 px. Cards 16-24px padding. Radii: 8/12/16. Depth separates content; no nested-box dashboards.
- Primary control target: 44x44 CSS px minimum (product target; WCAG AA minimum is 24px with exceptions) (UX-16).
- Motion: 120-180ms feedback only. No parallax, autoplay video, cursor replacement, animated checkout/QR backgrounds. Reduced-motion follows OS/user setting and never removes information (UX-07).

## 5. Preference model and onboarding

Preferences: style (Pulse/Calm; default Calm if skipped), appearance (System/Light/Dark; default System; OS changes affect only System mode), motion (System/Reduced), density (Comfortable/Compact; both preserve 44px targets).

First successful login: skippable "Make it feel like you" step after authentication, before marketplace entry. Equal-content Pulse and Calm previews of the same sample listing, radio choices, appearance control, live preview, "You can change this in Settings", buttons "Continue" + "Skip for now". No questionnaire, no animation gate (UX-03). onboarding_completed_at saved even when skipped; returning and cross-device users never repeat it (UX-04). A safe same-origin intended destination (e.g. an item link) is preserved through verification and onboarding; external redirect targets rejected (AUTH-10).

Precedence: authenticated server profile is canonical across devices; an account-aware local cookie mirror prevents first-paint flash; unsaved previews apply locally only; switching accounts clears the previous account's mirror (UX-05, UX-09). Save failure keeps the last confirmed value, offers retry, never resets auth or transaction drafts (UX-08). Pending members may choose a style but stay on verification status.

## 6. Interaction and accessibility contract

Visible focus ring (2px accent + 2px offset) in every theme. Skip link, landmarks, semantic headings, visible labels, error association (aria-describedby), announced async status (aria-live), keyboard dialogs with focus trap + restoration, no keyboard traps (UX-13, UX-14). Photo reorder has button alternatives to drag (UX-22). QR flows have a typed-code fallback (doc 02). 320px reflow, 200% text scaling, 400% zoom where applicable, on-screen keyboard compatibility. WCAG 2.2 AA target: 4.5:1 ordinary text, 3:1 large text/controls - measured, not assumed.

## 7. Universal states (every screen implements)

Loading: skeleton with stable dimensions (no layout shift). Empty: purposeful message + primary action. Error: plain-language message + retry; never silent demo-data fallback (UX-19). Forbidden: honest "you do not have access". Stale/expired: refreshed-state prompt. Unavailable (post-tomorrow features: handoff/QR, chat, reviews, notifications delivery): the entry point stays visible but disabled with the label "Not available in this preview" and a one-line explanation - no inert unlabeled controls (UX-25).

## 8. Copy rules

Approved core phrases: "Rs 40 per day" (rendered with the rupee symbol), "Free loan - return by 18 Sep, 5:00 pm", "Payment arranged directly with the owner", "Both participants confirmed this handoff", "No completed exchanges yet.", "Proof submitted", "Receipt acknowledged by seller". Forbidden: "Guaranteed safe", "Verified payment", "QR-certified condition", bank/escrow implications, fake counts, fabricated savings. No "Gen Z" or demographic framing anywhere near the style choice.

## 9. Styling implementation note (decision in P04)

Tokens ship as CSS custom properties on [data-style]/[data-appearance] roots. Utility layer (Tailwind v4 with @theme mapping vs. a small hand-rolled utility set) is decided in P04; either way styles are co-located per the frontend-architecture skill (D-007) and tokens remain the single source of truth.

## 10. Assumptions recorded (not test results)

Contrast values unmeasured until P04; font licensing (OFL) to be re-verified at bundling; density "Compact" affects paddings/font-size only, never target sizes; all usability targets in doc 02 section 9 are pending real participants (UX-26). No user-testing results are claimed anywhere in this contract.