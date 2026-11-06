---
description: "Use when analyzing test coverage, test gaps, acceptance criteria, or regression-test needs. Guides requirement-to-source-to-test traceability and risk-based test selection with the test pyramid."
---

# Test Coverage Analysis

Use this instruction when assessing whether requirements are covered by automated tests or designing additional tests.

## Ground the Analysis

- Read the requirement or acceptance criteria first. Split it into observable behaviors, outcomes, and constraints.
- Inspect the relevant source code and follow important call paths, inputs, state changes, validation, error handling, and external dependencies.
- Read the existing tests and their assertions. A test name, file, mock, or successful run alone does not establish that a requirement is covered.
- Trace each requirement to source evidence and one or more concrete assertions. Flag a requirement with no observable assertion as uncovered.
- Keep intended behavior distinct from current behavior. Report mismatches instead of treating implementation as the specification.
- Do not infer missing requirements, unobserved behavior, coverage percentages, or passing results. State assumptions and uncertainties explicitly.

## Apply the Test Pyramid

For each behavior, choose the lowest reliable layer that can verify it:

1. **Unit:** Pure business rules, transformations, and validation boundaries; favor fast, focused cases.
2. **Service/API or component integration:** Contracts and interactions across modules, persistence, or external boundaries; isolate unrelated systems where appropriate.
3. **UI/integration:** Browser-visible behavior, rendering, accessibility-relevant interaction, and client/server coordination that lower layers cannot prove.
4. **End-to-end:** A small set of high-value user journeys whose confidence depends on the real system working together.

Prefer broad coverage at lower layers and a smaller number of critical UI/E2E checks. Do not force a behavior into a lower layer that cannot observe its required outcome. If the repository lacks a suitable test harness, describe the limitation and recommend the smallest practical next step; do not add tooling unless requested.

## Identify Useful Scenarios

- Consider normal, invalid, missing, boundary, and state-dependent inputs when applicable to the requirement.
- Check relevant permission, locale, persistence, retry, and failure cases only when supported by the requirement or inspected behavior.
- Prioritize by user impact, likelihood, and failure cost. Avoid duplicating equivalent assertions across layers without a clear confidence benefit.
- Make every proposed scenario independently understandable, with a specific expected result.

## Project Conventions

- Inspect the nearest tests, source code, test configuration, scripts, and helpers before recommending or changing test code. Derive testing conventions from the codebase rather than assuming a framework or architecture.
- Keep each test at the lowest layer that can reliably verify its intended outcome. Respect the project's existing structure and place assertions and test setup where the local conventions expect them.
- Confirm the target environment is safe before running tests that create or modify shared data. Never run destructive tests against production.
- Run the narrowest relevant check when implementation is requested and safe. Report the exact command and outcome; distinguish a proposed test plan from added, type-checked, and executed tests.

## Report

Provide a concise criterion-to-test mapping that identifies:

- Requirement or behavior and its source evidence.
- Existing test and the assertion that covers it, or a clear coverage gap.
- Proposed test layer, scenario, expected result, and priority.
- Important assumptions, limitations, and validation status.
