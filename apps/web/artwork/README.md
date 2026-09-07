# Milo synthetic product artwork

`generate.py` is the sole source for these original fictional editorial illustrations. It uses only Python's standard library: custom raster/vector drawing, a compact in-file glyph set, and a PNG encoder built with `struct` and `zlib`. It does not download, embed, trace, or depend on external assets. The artworks are illustrations, not photographic product claims.

All three 600 × 720 px RGB PNGs depict the fictional **STILL / No.01** botanical ceramic studio in a warm paper, peach, and olive composition, with a sculptural cylindrical vessel, plinth, arch, leaf forms, restrained labels, and soft shadows.

## Regenerate and verify

```sh
python3 apps/web/artwork/generate.py
```

The command is deterministic and prints each generated file's byte size and SHA-256 digest. It is a development asset generator only; it is not part of the web application's runtime.

| Asset | Dimensions | Bytes | SHA-256 |
| --- | ---: | ---: | --- |
| `public/images/hero.png` | 600 × 720 | 7,791 | `147cc4617f8a071993ffeeaee375b9ab97e70a156bbb109e01b4eda1a539aeb1` |
| `public/images/detail.png` | 600 × 720 | 7,564 | `3e67a0f0b6773fdcff14179be61d18898a4434fd1d3e075477e04e69247d2c28` |
| `public/images/collection.png` | 600 × 720 | 7,758 | `435f3d70cd82a623cd1ab65d174f57f47f7b5d1e59f55b60fbc9dd59a1f4a588` |

Hashes are local file-integrity checks only; they make no blockchain, provenance, or visual-quality claim.
