# Gentle Monster ZIN 01 detail presentation

The model-images service page now targets Gentle Monster ZIN 01 (진 01): a
black acetate square front, clear lenses, and silver titanium temples. The
previous generic metal sunglasses and gold/silver finish selector are replaced
with a fixed ZIN 01 presentation. Portfolio photographs are outside this change.

## Reference and reconstruction

Official reference: https://www.gentlemonster.com/int/ko/item/ZYYE799SURVC/zin01

Published dimensions: front 147.2 mm, lens 52.7 × 40.9 mm, bridge 21 mm,
temple length 149.1 mm. The front silhouette and optical apertures are derived
from the official front photo. Depth, wrap, bevels, pads, hinges, and titanium
temple details are modeled using the angle and side photos. The model is a
photo-based reconstruction, not manufacturer CAD or a measured scan.

Official photographs are used as local modeling references and are not
redistributed in the page, GLB, or studio poster. The page labels the recreation
and links to the official product. The earlier Khronos asset and its notices
remain archived under their existing names; they are not the new geometry.

## Presentation

The default view is a Blender Cycles studio render of the locally authored
model. The same geometry loads only after the visitor selects the 3D control
or an inspection point. Studio mode pauses the interactive renderer. Reduced
motion, offscreen/background pausing, keyboard controls, loading cancellation,
and a static fallback remain supported.

The model loader distinguishes black acetate, silver temples and hardware,
clear optical glass, transparent silicone pads, and dark hinge recesses.
Published sizes are not inferred from the 3D model's outer bounding box.

## Validation

Browser and lifecycle checks are recorded in `eyewear-viewer-qa.json`.
Build checks and deployment file hashes are recorded in `build-audit.json`
and `production-manifest.json`. Browser GPU checks use Chromium/SwiftShader;
they do not measure performance on physical phones.

## Reproduction and final assets

- Source: `scripts/zin-01/build_zin.py`, `zin_temples.py`, `contours.json`.
- Rebuild: `blender -b -t 8 --python scripts/zin-01/build_zin.py -- render final`.
- Runtime GLB: `public/models/zin-01.glb`, 41 meshes, 130,020 triangles, no image textures.
- Poster: `public/art/zin-01-studio.webp`, 1200×1000, 512 samples, lossless WebP.
- Asset hashes and render notes: `zin-01-model.json` and `zin-01-studio-render.json`.

The source package was rebuilt without the original reference photographs.
The recreated GLB has identical vertex positions, normals, materials and triangle
sets; triangle serialization order differs in two index buffers. Final front
geometry has no boundary or non-manifold edges.

Mobile framing also fixes the stage width explicitly to its container. With the
previous automatic width, the 290px minimum height and 1.02 aspect ratio could
create a 295.8px canvas inside a 272px viewer. QA checks both DOM containment
and projection of every actual model vertex, including before/after captures.
