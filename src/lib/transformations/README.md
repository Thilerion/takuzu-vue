# Transformations

Purpose: provide a small, reliable toolbox for transforming Takuzu puzzle grids so the app can canonicalize boards, detect symmetries, and present random or consistent variants (for restarts, UI effects, etc.).

Supported transforms
- Rotations: 0°, 90°, 180°, 270°.
- Mirror (flip): a single mirror option is combined with rotations to produce horizontal or vertical reflections as needed.
- Symbol inversion: swap the two filled symbols (0 ↔ 1). This is only meaningful for boards where inversion is allowed.

Key ideas (plain language)
- The module can apply any combination of rotation, mirror, and optional symbol inversion to a grid.
- It can produce every valid transformed version of a board and then pick a single canonical representation (the same representative every time) so different-looking but equivalent boards are treated uniformly.
- It can detect when different transforms yield the same result (symmetry) and pick only unique variants when needed.
- For paired grids (for example the puzzle and its solution), the module can align both to the same canonical frame so the same transform applies to both.

Simple pipeline (how it works)
1. Decide which transforms are valid for the board shape (some transforms are skipped for non-square or odd-sized boards).
2. Apply each valid transform to the grid to get a set of transformed boards.
3. Choose a canonical board from that set (a deterministic pick) and re-express all transforms relative to that canonical form.
4. Use the resulting map to look up transformed boards, pick random unique variants, or identify symmetry groups.
5. To keep multiple grids synchronized, convert the other grids into the canonical frame so the same transform keys apply to all.

Reversing transforms (intuitively)
- Rotation: reverse by rotating the opposite angle (e.g., undo 90° with 270°).
- Mirror: a mirror operation is its own inverse (apply it again to undo).
- Symbol inversion: swapping symbols is also its own inverse.
- For a combined transform, undo by reversing the order and inverting each step (invert symbols → un-invert, mirror → mirror, rotate → rotate by opposite angle).

When to use this module
- Canonicalize a board to compare puzzles regardless of orientation.
- Generate a random but controlled variant for restarts or visual variety.
- Check for symmetries (to avoid presenting effectively identical variants).

File: [src/lib/transformations/README.md](src/lib/transformations/README.md)
