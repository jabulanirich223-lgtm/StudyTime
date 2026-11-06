# StudyTime flat icon guide

Write each icon as a standalone SVG file: `src/assets/flaticons/<name>.svg`.

Style (match exactly, every icon must look like one set):
- `viewBox="0 0 128 128"`, no width/height attributes, no text, no gradients, no filters, no outlines/strokes around shapes.
- Flat, geometric, chunky, friendly cartoon objects (like modern flat app illustration). Rounded corners everywhere (rx on rects, round line caps).
- Each object uses 2-3 tones of its colour: base fill, a darker shade shape on the lower/right side, and one small light highlight shape (white at ~0.5 opacity or a lighter tint) on the upper-left.
- Bright palette: green #58cc02 / #46a302, blue #1cb0f6 / #1899d6, red #ff4b4b / #e03a3a, orange #ff9600 / #e08600, yellow #ffc800 / #e6a800, purple #ce82ff / #a568cc, pink #ff86d0, brown #a0612f / #7c4a22, grey #afafaf / #8a8a8a, dark #4b4b4b, cream #fff4d6, white #ffffff. Skin-free (objects only).
- Object fills about 80% of the canvas, centred, sitting on a soft flat shadow: `<ellipse cx="64" cy="116" rx="40" ry="6" fill="#000" opacity=".08"/>`.
- The object must be instantly recognisable at 32px. Prefer one clear object; no tiny details.
- Must be correct (e.g. DNA = clear double helix with rungs; magnet = red horseshoe with silver tips; router = box with two attached antennas; chip = square processor with pins on all sides).

After writing all icons, render a contact sheet to check them: use Playwright (`require('playwright')`, chromium.launch()) to load an HTML page that shows every SVG at 96px and 32px with its name, screenshot it, and LOOK at the screenshot (Read the PNG). Fix anything unclear, off-centre, clipped, or wrong. Reply with the list of files written.
