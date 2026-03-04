# `src/lib/line-generation` Module Analysis

## Executive summary

The `line-generation` module is a focused, pure TypeScript domain utility for generating line-level possibilities under Takuzu rules. It supports three major concerns:

1. **Enumerating valid fully-filled lines of a given size** (`lines-of-size.ts`)
2. **Completing partially-filled lines** with or without strict validity (`completions.ts`)
3. **Avoiding repeated recomputation** through memoized wrappers (`memoized.ts`)

This module is strategically placed in `src/lib` and is consumed by both puzzle generation and solving logic, as well as the line-completions UI tool. Its composition is performance-aware and deliberately separated into low-level algorithms + cached facades.

---

## What the module does

### 1) Generates unique permutations from multisets

- File: `permutations.ts` + `utils.ts`
- Core API: `generateUniqueArrayPermutations(values)`
- Underlying algorithm: in-place recursive permutation with duplicate-swap guard (`_shouldSwap`) in `permuteUnique`.

This is a generic utility used by `generateAllLineCompletions` where we need all ways to place remaining `0`/`1` symbols into empty cells.

### 2) Generates all valid *filled* lines for a target length

- File: `lines-of-size.ts`
- Core API: `generateValidLinesOfSize(length, numRequired?)`

This recursively builds strings while enforcing:

- **No three consecutive equal symbols** (local check via `lastValue` / `secondLastValue`)
- **Balance count constraints** (`remainingZero`, `remainingOne`)

For odd sizes, balance is asymmetrical by design (`ceil/ floor` from `lineSizeToNumRequired`), so it still returns lines under that generalized rule.

### 3) Completes partial lines

- File: `completions.ts`
- APIs:
  - `generateValidLineCompletions(lineArr, lineCount?, numRequired?)`
  - `generateAllLineCompletions(lineArr, lineCount?)`

`generateValidLineCompletions`:

- Validates the input line against max-consecutive rule up front
- Computes remaining symbol quotas
- Uses DFS recursion over empty positions
- Prunes branches with local neighborhood checks:
  - `(prev, prevPrev)`
  - `(prev, next)`
  - `(next, nextNext)`

This local pruning is the key reason it is much more efficient than generate-all-then-filter.

`generateAllLineCompletions`:

- Fills all empties with all unique balanced placements
- Does **not** enforce no-three-consecutive validity
- Useful for broader combinatoric exploration, but not for strict Takuzu legality

### 4) Provides memoized entry points

- File: `memoized.ts`
- APIs:
  - `getUniqueArrayPermutations`
  - `getValidLinesOfSize`
  - `getAllLineCompletions`
  - `getValidLineCompletions`

These wrap pure generators with deterministic key serializers. Since line generation is repeatedly called with the same line states (especially in solver loops), this cache materially reduces repeated work.

---

## How it relates to the rest of the codebase

## Direct consumers

### Puzzle generation

- File: `src/lib/generation/solution.ts`
- Usage: `getValidLinesOfSize(initialFillSize)` in `getInitialFillData`

Why: solution generation pre-fills selected rows/columns with already-valid lines, then uses constraint solving to finish quickly. This improves average generation speed and quality of starting states.

### Board abstraction + solver strategies

- File: `src/lib/board/BoardLine.ts`
- Usage: `BoardLine.validPermutations` lazily computes via `getValidLineCompletions`

This makes line possibility space a first-class property on each board line. It is then consumed by:

- `src/lib/solvers/common/EliminationStrategy.ts`
- `src/lib/solvers/human-solver/techniques/GenericDuplicateLineTechnique.ts`

These techniques derive forced moves from recurring values across valid completions and enforce uniqueness constraints by excluding completions equal to already-filled lines.

### Feature/UI tooling

- File: `src/features/line-completions-tool/composables/valid-line-completions.ts`
- Usage: `getValidLineCompletions`

The line-completions debug/teaching UI uses this directly to display:

- all valid completions,
- inferred forced cells (intersection across completions),
- invalid-state detection (no completions).

## Architectural position

The module sits at a sweet spot between:

- **low-level board rules** (`validate`, line utility counts/splitting), and
- **high-level solving/generation flows**.

It is intentionally framework-agnostic and deterministic, matching the project’s `src/lib` purity boundary.

---

## Why it is composed this way

Several design choices appear intentional and pragmatic:

## A) Split between primitive algorithm layers

- `utils.ts` = generic permutation primitive
- `permutations.ts` = line-domain wrapper for stable sorted input
- `completions.ts` / `lines-of-size.ts` = Takuzu-specific generation
- `memoized.ts` = performance facade

This layering keeps algorithmic concerns isolated and testable.

## B) Recursion + early pruning over brute force

For line completions, DFS with local checks avoids huge invalid search branches early. This is especially important in solver hot paths where each line can be queried many times.

## C) Memoization at module boundary

Memoized wrappers keep internal implementations simple and pure while giving callers a high-performance API with zero extra integration cost.

## D) Optional precomputed arguments

APIs accept optional `lineCount` / `numRequired`, allowing callers like `BoardLine` (which already computes counts) to skip duplicate work.

## E) Strong typing for symbol/value line distinctions

Type aliases in `types.ts` and cross-lib branded types reduce accidental misuse (e.g., filled-symbol lines vs lines that may contain `.`).

---

## Behavior guarantees from tests

Current unit tests validate:

- unique permutation correctness and no input mutation,
- valid line generation for even and odd sizes,
- all-completions generation with/without precomputed counts,
- valid-completions handling of:
  - already-filled valid lines,
  - count-invalid lines,
  - max-consecutive-invalid lines,
  - specific regression scenarios,
- integration behavior in line-completions composable (`resultingLine` inference).

The tests are strong on correctness and regression coverage for known bugs, though there is room for property-style invariants and cache-specific tests.

---

## Performance characteristics

## Expected complexity shape

- `generateValidLinesOfSize(n)` is combinatorial but pruned by counts + no-triple rule.
- `generateValidLineCompletions` complexity depends mainly on number of empties and remaining symbol distribution; local pruning substantially reduces branch factor.
- `generateAllLineCompletions` is effectively combinations/permutations over empties and can grow quickly.

## Current optimization levers

- memoization of repeat calls,
- short-circuit validity checks,
- local neighborhood pruning,
- optional precomputed counts to avoid repeated counting.

---

## Potential improvements

Below are improvements with rough impact and implementation risk.

## 1) Add bounded or pluggable cache policy to memoized line-generation APIs

**Why:** current `memoize` uses unbounded `Map`, so long sessions (especially tools/debug workflows) can steadily grow memory.

**What to do:**

- Introduce optional LRU / max-size memoizer variant for line-generation wrappers, or
- Expose explicit cache-clear hooks by module/feature lifecycle.

**Impact:** medium-high for memory stability in long-running browser sessions.
**Risk:** low-medium (care needed to avoid accidental performance regressions).

## 2) Canonicalize memoization keys to include all effective constraints

`getValidLineCompletions` key currently uses line string + optional `numRequired`, but ignores provided `_counts` (which is fine if counts always match line). To reduce risk from future misuse:

- either remove `_counts` from public memoized signature,
- or assert consistency when `_counts` is provided in dev mode.

**Impact:** medium for future-proof correctness.
**Risk:** low.

## 3) Add property-based tests for invariants

Examples:

- every result of `generateValidLineCompletions` has no triple,
- every result matches required count constraints,
- every result preserves already-filled cells,
- for random lines, `valid ⊆ all` under same count assumptions.

**Impact:** high confidence against edge regressions.
**Risk:** low-medium (test runtime tuning required).

## 4) Add explicit complexity-safe APIs for solver usage

Some solver calls only need one of:

- existence (`hasAnyCompletion`),
- first completion,
- recurring-value mask without materializing all completions.

Creating specialized APIs could reduce allocations and runtime in hot paths.

**Impact:** potentially high for large boards / difficult states.
**Risk:** medium (new API surface and careful benchmarking needed).

## 5) Consider bitset or numeric encoding for internal recursion state

String slicing in recursion (`substring` per branch) is clean but allocation-heavy. An alternative is mutable char arrays or bit-level representation with backtracking.

**Impact:** medium-high performance upside in extreme cases.
**Risk:** medium-high complexity and maintainability cost.

## 6) Clarify odd-size semantics at module boundary

Takuzu boards are typically even-sized, but the module supports odd line lengths via ceil/floor balancing. Add doc comments clarifying that odd sizes are intentionally generalized behavior.

**Impact:** medium for clarity, prevents future confusion.
**Risk:** very low.

## 7) Improve naming consistency (`permutation` vs `completion`)

Naming is mostly clear but mixed terminology appears across older comments/API history. A small naming pass in docs/comments can improve readability.

**Impact:** low-medium (developer ergonomics).
**Risk:** low.

---

## Suggested next steps (incremental)

1. Add bounded-cache memoization for line-generation wrappers.
2. Add property-based tests for completion invariants (small board sizes first).
3. Benchmark a specialized “recurring-values without full materialization” path used by elimination strategies.
4. Document odd-size behavior and API expectations in module-level docs.

This sequence improves reliability and performance with minimal disruption to the rest of the architecture.

---

## Final assessment

`src/lib/line-generation` is well-structured and aligned with the project’s architecture principles:

- pure domain logic,
- reusable low-level functions,
- practical memoization,
- direct integration into generation, solver logic, and tooling.

Its biggest opportunity is not core correctness (already solid), but **cache lifecycle strategy**, **API specialization for hot paths**, and **broader invariant-style testing** to support future solver/generation enhancements.
