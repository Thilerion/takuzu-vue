# Copilot instructions for takuzu-vue

**Purpose**: Comprehensive guidance for AI agents to be immediately productive in this takuzu puzzle game codebase.

## Architecture Overview

The codebase cleanly separates **puzzle logic** (framework-agnostic) from the **Vue 3 UI layer**:

```
src/lib/                    # Pure TypeScript puzzle domain (no framework, fully testable)
  board/                    # Board representation and queries (SimpleBoard, BoardLine, ThreesUnit)
  generation/               # Puzzle + solution generation, difficulty control, mask validation
  solvers/                  # Multiple solver strategies: ConstraintSolver, LogicSolver, HumanSolver
  validate/                 # Board validation rules (balance, no-consecutive, unique lines, etc.)
  mistakes/                 # Error detection (incorrect values, rule violations)
  transformations/          # Board transformations (rotations, reflections) + undo/redo
  utils/                    # Utility helpers (line parsing, puzzle-value ops, memoization)
  types.ts, constants.ts    # Core type definitions and Takuzu constants (0, 1, .)

src/                        # Vue 3 application layer
  features/                 # Domain features as composables + components
    board-cell/             # Cell rendering, theme provider, interactions
    puzzle-play/            # Main gameplay loop, hotkeys, grid sizing
    hints/                  # Hint generation + display (stepped hints, visual cues)
    puzzle-editor/          # Debug editor for testing puzzle generation
    puzzle-visual-cues/     # Highlighting, mistake marks
    settings/, statistics/  # User preferences and game stats
  stores/                   # Pinia stores (global game state, puzzle state, history, etc.)
  services/                 # Persistence (Dexie DB, localStorage saves), fetch-puzzle
  router/, main.ts          # App bootstrap, PWA registration, plugin setup
  i18n/                     # i18n configuration + Pinia plugin for translations
```

**Key distinction**: Code in `src/lib` must remain pure (no Vue, no global state). Other parts consume it.

## Puzzle Domain: Core Concepts

### Board Representation
- **`SimpleBoard`** (`src/lib/board/Board.ts`): 2D grid of `PuzzleValue` (0, 1, or empty). Methods: `get(x, y)`, `getRow(y)`, `getColumn(x)`, `assign(x, y, value)`, `copy()`, `isValid()`, `isFilled()`, `isSolved()`.
- **`BoardLine`**: Wraps a row or column, provides element access, validation, filling counts.
- **`ThreesUnit`**: Represents a 3x1 or 1x3 block; used for "triples" constraint (no 3 consecutive same values).

### Takuzu Rules
1. **No 3 consecutive**: No row/column has 3+ same values in a row.
2. **Line balance**: Each row/column must have exactly n/2 zeros and n/2 ones.
3. **Unique lines**: No two rows are identical; no two columns are identical.

### Solvers Architecture

**Three solver types** for different use cases:

1. **ConstraintSolver** (`src/lib/solvers/constraint-solver/ConstraintSolver.ts`)
   - Fast, CSP-based with configurable constraints + optional DFS backtracking.
   - **Static constraints**: `applyTriplesConstraint`, `applyLineBalanceConstraint`, `applyEliminationConstraint`.
   - **DFS selection strategies**: `selectCellStrategies` (firstEmpty, fewestEmptyPeers, random), `selectValueStrategies` (zeroFirst, random, leastConstraining).
   - Used for: puzzle validation, generation, solution-checking. **Best for speed.**
   - Example: `ConstraintSolver.run(board, { constraints: [...], dfs: { enabled: true }, maxSolutions: 1 })`

2. **LogicSolver** (`src/lib/solvers/logic-solver/LogicSolver.ts`)
   - Implements human-like deduction techniques (not yet heavily integrated).
   - Documented techniques: `src/lib/solvers/human-solver/techniques/human-solver-techniques.md`.
   - Techniques: Triples, Line Balance, Elimination (with pattern matching), Duplicate Line Elimination.
   - Used for: learning moves, hint generation, assistant recommendations.

3. **HumanSolver** (techniques in `src/lib/solvers/human-solver/techniques/`)
   - Specific technique implementations (TriplesTechnique, BalanceTechnique, etc.).
   - Step-by-step move generation for hint UI.
   - Used by: `src/features/hints/services/search.js` to find hint candidates.

### Generation Pipeline
`src/lib/generation/puzzle.ts`:
1. **generateSolutionBoard(w, h)**: Randomly fill a valid board using constraints + DFS.
2. **createMaskWithDifficulty(solution, difficultyValidator, opts)**: Remove cells from solution; validate difficulty.
3. **checkMaskQuality(mask)**: Assess puzzle quality (uniqueness, elegance, complexity).
4. **createPuzzleWithPuzzleConfig(config)**: Orchestrate steps with timeout/attempt limits.

Difficulty config controls mask ratio (% of hidden cells) and which constraints are allowed in validation.

### Validation & Mistakes
- **Board validation** (`src/lib/validate/board.ts`): Checks all three rules.
- **Mistake detection** (`src/lib/mistakes/`):
  - `findIncorrectValuesFromSolution`: Compares player board to solution.
  - `findRuleViolations`: Detects rule breaks (triples, balance, duplicate lines).

### Transformations
`src/lib/transformations/PuzzleTransformations.ts`: Rotation, reflection, transposition. Stores transformation history for undo/redo. Syncs across solution + board simultaneously.

---

## Vue Layer: Patterns & State Management

### Store Architecture (Pinia)

**Puzzle state** is split across multiple interconnected stores:

- **`usePuzzleStore()`** (`src/stores/puzzle/store.ts`): Central puzzle state
  - Holds: `board`, `solution`, `initialBoard` (all `SimpleBoard` instances)
  - Manages: cell assignment (`assignToBoardAndHistory`), move history, grid counts tracking
  - Refs: `board` (reactive), `solution`/`initialBoard` (shallowRef, immutable)
  - Methods: `makePuzzleMove(x, y, value, opts)`, `undo()`, `redo()`, `reset()`

- **`usePuzzleStatusStore()`** (`src/stores/puzzle/status-store.ts`): Game lifecycle
  - States: `initialized`, `started`, `paused`, `finished`
  - Used to track: pause/resume, game-over conditions

- **`usePuzzleTimerStore()`** (`src/stores/puzzle/timer-store.ts`): Elapsed time tracking

- **Feature-specific stores**: 
  - `usePuzzleHintsStore()`: Hint caching, current hint display state
  - `usePuzzleHistoryStore()`: Move history + undo/redo stack
  - `usePuzzleBookmarksStore()`: Bookmarked cells
  - `usePuzzleVisualCuesStore()`: Visual highlights, mistake marks
  - `usePuzzleRecapStore()`: Post-game stats

**i18n integration**: Stores get `store.i18n` via Pinia plugin (`i18nPiniaPropertyPlugin`). Access translations via `store.i18n.t('key')`.

### Feature Structure
Each feature in `src/features/{feature-name}/`:
- **`components/`**: Vue components (Card.vue, Button.vue, etc.)
- **`composables/`**: Reusable logic (`useHints()`, `usePuzzleToggle()`)
- **`store.ts`** (optional): Pinia store if feature has global state
- **`locales/`** (optional): Feature-specific i18n strings

**Pattern**: Composables read/write to Pinia stores directly. Components use composables + stores.

### Key Composables
- `usePuzzleStore()`: Read puzzle board, solution, state
- `useSavedPuzzle()` (`src/services/savegame/useSavedGame.ts`): Auto-save via localStorage, resumable state
- `useStorage()` (from @vueuse/core): Reactive localStorage binding
- `useSharedComposable()` (from @vueuse/core): Singleton composables across app

### Persistence
- **Save system**: `useSavedPuzzle().savePuzzleSaveData()` writes to `localStorage['takuzu_saved-game']`.
- **SaveGame format**: Includes board/solution/initialBoard (as export strings), moveList, timeElapsed, bookmarks, hints, config.
- **Dexie DB**: `src/services/db/` stores stats, history, puzzle metadata (not hot-path saves).
- **Import/Export**: Boards serialized as `BoardExportString` (format: `WxH;...base64...`) or `BoardString` (format: `...base64...`).

### Hints System
- **Hint search** (`src/features/hints/services/search.js`): Runs solver techniques to find next logical move.
- **SteppedHint**: Encapsulates a hint with explanation, highlighted cells, actions.
- **Hint cache**: Per-board-state to avoid recalculating.
- **Visual cues**: `usePuzzleVisualCuesStore()` applies highlights (cell selection, hint cells, mistakes).

---

## Key File Reference

### Critical Entry Points
| Task | File | Example |
|------|------|---------|
| Understand board | `src/lib/board/Board.ts` | Methods: `get()`, `assign()`, `getRow()`, `copy()` |
| Validate puzzle | `src/lib/validate/board.ts` | `validateBoard(board)` |
| Generate puzzle | `src/lib/generation/puzzle.ts` | `createPuzzleWithPuzzleConfig({w, h, difficulty})` |
| Solve puzzle | `src/lib/solvers/constraint-solver/ConstraintSolver.ts` | `ConstraintSolver.run(board, opts)` |
| Find hints | `src/features/hints/services/search.js` | `searchForHint(board, solution)` |
| Manage game | `src/stores/puzzle/store.ts` | `usePuzzleStore().makePuzzleMove(x, y, value)` |
| Save game | `src/services/savegame/useSavedGame.ts` | `useSavedPuzzle().savePuzzleSaveData()` |

### Constraint Solver Details
The ConstraintSolver is the workhorse. Typical usage:

```typescript
import { ConstraintSolver } from '@/lib/solvers/constraint-solver/ConstraintSolver.js';
import { applyTriplesConstraintWithOpts, applyLineBalanceConstraintWithOpts } from '@/lib/solvers/constraint-solver/constraints/...js';

const board = SimpleBoard.fromArrayOfLines(['...', '...', '...']);
const result = ConstraintSolver.run(board, {
  constraints: [
    applyTriplesConstraintWithOpts({ singleAction: false }),
    applyLineBalanceConstraintWithOpts({ singleAction: false })
  ],
  maxSolutions: 1,
  dfs: { enabled: true, selectCell: 'firstEmpty', selectValue: 'leastConstraining', timeout: 2000 }
});
// result.solvable, result.solutions[0]
```

---

## Developer Workflows

### Commands
```bash
pnpm dev              # Start Vite dev server (http://localhost:5173)
pnpm build            # Production build (minified, optimized)
pnpm build:alpha      # Build with alpha metadata
pnpm build:beta       # Build with beta metadata
pnpm preview          # Preview prod build locally (port 4173)
pnpm test             # Run vitest (jsdom environment)
pnpm test -- -t "pattern"   # Run tests matching pattern
pnpm coverage         # Open vitest coverage UI
pnpm type-check       # TypeScript type checking (vue-tsc)
pnpm lint             # ESLint + auto-fix
pnpm pregenerate      # Regenerate pre-built puzzles (scripts/pregenerate-puzzles.ts)
```

### Testing Patterns
- **Vitest + jsdom** for unit tests in `tests/unit/`.
- **Test structure**: Mirror `src/` layout (e.g., `tests/unit/lib/board/Board.spec.ts`).
- **Mocking stores**: Use `@pinia/testing` with `createTestingPinia()`.
- **Seeded randomness**: Use `seedrandom` for deterministic puzzle generation tests (see `tests/unit/lib/generation/puzzle.spec.ts`).

Example test:
```typescript
import { createPuzzleWithPuzzleConfig } from '@/lib/generation/puzzle.js';
import seedrandom from 'seedrandom';

beforeEach(() => {
  Math.random = seedrandom('test-seed');
});

it('generates same puzzle with same seed', () => {
  const result = createPuzzleWithPuzzleConfig({ width: 6, height: 6, difficulty: 1 });
  expect(result?.solution.toBoardString()).toMatchInlineSnapshot(`"..."`);
});
```

### Build Modes
- **`mode: 'development'`**: Hot reload, source maps, no SW update checks.
- **`mode: 'alpha'`** / **`'beta'`**: Staging builds with different app names + metadata.
- Service Worker checks for updates every 30 minutes (configurable in `src/main.ts`).

### Build Output & PWA
- **Vite output**: `dist/` folder.
- **PWA manifest**: Generated by `vite-plugin-pwa`, includes app icons, colors, install prompts.
- **Icon generation**: `unplugin-icons` + Heroicons (prefixed as `<icon-his-*>`).
- **Fallback routing**: `dist/200.html` (Vercel/Netlify SPA fallback) created during build.

### i18n Conventions
- **Message files**: `src/locales/{en,nl}.ts` (JS files) + `src/locales/common/` & `src/locales/themed/` (nested JSON).
- **Feature messages**: `src/features/{feature}/locales/` for scoped translations.
- **Access in stores**: `store.i18n.t('key')`.
- **Access in components**: `{{ $t('key') }}` or `useI18n()`.
- **Supported locales**: Defined in `src/i18n/constants.ts` (`SUPPORTED_LOCALES`).

---

## Common Patterns & Conventions

### Type Safety
- **Flavor types** for board coordinates: `RowId`, `ColumnId`, `LineId` (prevent row/col confusion).
- **Branded types** for serialized boards: `BoardString`, `BoardExportString` (prevent accidental misuse).
- **PuzzleValue**: Union of `ZERO` (0), `ONE` (1), `EMPTY` ('.')`.
- **PuzzleSymbol**: Union of `ZERO`, `ONE` (filled cells only).

### Naming & File Organization
- Lib functions are **pure & stateless** (easy to test, reuse).
- Composables are **singletons** when using `createSharedComposable()` (e.g., `useSavedPuzzle`).
- Stores use **composition API** with `defineStore(() => { ... })` (not Options API).
- Feature folders are **cohesive**: one feature per folder.

### Avoiding Common Mistakes
1. **Never modify boards in place** without `copy()`: `const newBoard = board.copy(); newBoard.assign(x, y, val);`
2. **Keep lib logic pure**: No Vue refs, no Pinia imports in `src/lib/*`.
3. **Validate unique solutions**: Use `ConstraintSolver.hasSingleUniqueSolution()` during generation.
4. **Cache expensive computations**: Hint search uses board-state-based caching.
5. **Use readonly refs** for immutable data: `shallowRef()` for solution/initialBoard.

### Testing Lib Code
- Tests are **isolated** and **fast** (jsdom environment).
- **Puzzle generation tests** use seeded random for determinism.
- **Solver tests** check solutions against expectations and solution uniqueness.
- **Board tests** validate operations (get, assign, copy, validation rules).

---

## Extending the Codebase

### Adding a New Feature
1. Create `src/features/{feature-name}/` with `components/`, `composables/` subdirs.
2. If stateful: add `store.ts` (Pinia store).
3. If localized: add `locales/{en,nl}.ts`.
4. If UI components: register in `vite.config.ts` (auto-import via `unplugin-vue-components`).
5. Export public APIs from `index.ts` (if needed).

### Modifying Solver Logic
1. **New constraint**: Create `src/lib/solvers/constraint-solver/constraints/NewConstraint.ts`.
2. **New technique**: Create `src/lib/solvers/human-solver/techniques/NewTechnique.ts`.
3. **Tests**: Add `tests/unit/lib/solvers/...NewConstraint.spec.ts`.
4. **Integration**: Update hint search or ConstraintSolver default constraints if used broadly.

### Updating Puzzle Rules
1. Modify validation in `src/lib/validate/board.ts`.
2. Update constraints in solver files.
3. Add/update tests in `tests/unit/lib/validate/` & `tests/unit/lib/mistakes/`.
4. If rules change gameplay: update mistake detection, hints, visual cues.

### Adding UI State
1. Decide: **feature-local** (composable) or **global** (Pinia store)?
2. If global: add store to `src/stores/puzzle/` (puzzle-related) or `src/stores/` (general).
3. Use `reactive()` for mutable state, `ref()` for single values.
4. Export via `defineStore()` for Pinia; use `createSharedComposable()` for shared logic outside stores.

---

## Debugging & Performance

### Dev Tools
- **Vue DevTools**: Inspect components, stores, performance.
- **Vite DevTools**: Module graph, hot reload status.
- **Coverage UI**: `pnpm coverage` opens vitest UI.
- **Benchmarks**: `tests/benchmark/lib/ConstraintSolver.benchmark.ts` (run with `pnpm test bench`).

### Performance Hotspots
- **Constraint solving**: Capped with timeouts (default 2000ms DFS). Can be tuned via `selectCell` / `selectValue` strategies.
- **Hint generation**: Caches results per board state to avoid recalculation.
- **Board operations**: Use `shallow` refs for large boards to skip deep reactivity.
- **Rendering**: Cell grid can be large; Takuzu Vue uses lazy/virtual scrolling implicitly in certain modes.

### Common Issues
- **Timeout during generation**: Increase `maxAttempts` or `timeout` in `createPuzzle()`.
- **Hint not found**: Verify solver constraints are correct; may need to add new technique.
- **Type errors in lib**: Run `pnpm type-check`; ensure pure functions don't import Vue/Pinia.
- **Store not reactive**: Ensure you use `ref()` or `reactive()` for state, not plain values.

---

## Summary Checklist for Agents

When starting a task:
- [ ] Is this **lib logic** (solver, generation, validation) or **UI** (store, component, feature)?
- [ ] If lib: keep it pure (no Vue/Pinia), write tests.
- [ ] If UI: use Pinia stores, composables, follow feature structure.
- [ ] Check **existing patterns**: How do similar files structure code?
- [ ] **Test coverage**: Add tests in `tests/unit/` mirroring `src/` structure.
- [ ] **Type safety**: Use branded/flavor types; avoid `any`.
- [ ] **Performance**: Consider board copies, constraint timeout, caching.
- [ ] **i18n**: Use translation keys from `src/i18n/`, not hardcoded strings.
- [ ] **Documentation**: Solver techniques documented in `human-solver-techniques.md` for reference.