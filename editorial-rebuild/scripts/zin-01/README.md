# ZIN 01 reconstruction source

Build the traced front, clear lenses, silver temples and small hardware with
Blender 4.3.2. The source contour coordinates and photo hashes are included;
the official reference photographs are not required at runtime or for rebuilding.

From the editorial-rebuild directory:

```sh
blender -b -t 8 --python scripts/zin-01/build_zin.py
blender -b -t 8 --python scripts/zin-01/build_zin.py -- render final
```

The first command creates the model and GLB. The second also renders the
1200×1000, 512-sample Cycles poster. Outputs are written under `output/zin-01/`.
Omit `final` for a 64-sample preview; add `front` or `side` to choose those views.

The model is a photo-based recreation of Gentle Monster ZIN 01, not manufacturer
CAD. See `public/models/zin-01-source.md` for reference dimensions and limitations.
The measured photo outline is uniformly scaled, then smoothed to remove pixel
noise while retaining its bounds. The locally built rounded surfaces, optical
curvature, hinges, and pad hardware are approximations based on the photographs.
