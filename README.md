# Gap Analysis Exercise - Business Analysts

## Context

You are reviewing a commodity market dashboard project.
Your mission is to compare:

- the initial specification in [`initial-specification/`](initial-specification/)
- the implementation in the codebase

Do not assume that everything in UI labels, comments, or docs is accurate.

## Deliverable

Produce a `gap-analysis.md` (or `.txt`) and share your conclusions in Teams.

Your report must answer:

1. Is `/initial-specification` well implemented? Is code close to the original scope?
2. What is different between specification and implementation?
3. What is the purpose of the application?
4. What is the technology stack?
5. Can users create an account or log in?
6. Are rates real-time or static?

## Investigation Rules

- Use repository evidence only.
- Cite files and code sections that support each conclusion.
- If behavior and wording conflict, prioritize actual runtime/code behavior.
- Explicitly list assumptions when evidence is ambiguous.

## Suggested Approach

1. Start with `initial-specification/SPECIFICATION.md`.
2. Map the application architecture (`src/app`, `src/components`, `src/lib`, config files).
3. Verify data flow end-to-end (UI -> API route -> external/static source).
4. Check whether account/auth features are functional or only presented in UI.
5. Build a requirement-by-requirement gap table.
