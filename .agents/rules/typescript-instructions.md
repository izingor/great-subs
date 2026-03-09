---
trigger: always_on
---

# 🛠️ AGENT INSTRUCTION SET: Core TypeScript Standards

This file contains the **CRITICAL** instructions that define the quality, safety, and readability standards for all generated and refactored TypeScript code.

---

## 1. 👁️‍🗨️ HUMAN READABILITY (Priority: SUPREME)

This section ensures the code is optimized for the human reader first, and the compiler second.

- **Readability First:** The highest priority is that a human developer can instantly understand the intent. If a "smart" one-liner increases cognitive load, choose the more explicit approach.
- **Smart & Lean (Not Code Golf):** Strive for concise solutions, but **NEVER** at the cost of clarity. Avoid boilerplate, but also avoid dense, cryptic logic.
- **Single Responsibility Principle (SRP):** Functions, components, and classes **MUST** be small. Avoid functions longer than **25 lines**.
- **Descriptive Naming:** Names must narrate the code.
    - **Bad Example:** `data`, `handleIt`, `x`
    - **Good Example:** `userProfile`, `processPaymentTransaction`, `hasActiveSubscription`
- **Flatten Logic (Guard Clauses):** **NEVER** exceed a nesting depth of 3 levels. Use **early returns** to handle failure conditions immediately, keeping the "happy path" unindented.
- **Consistent Abstraction:** Logic must be grouped into small functions. If a block needs a comment to explain _what_ it is doing, extract it into a named function.

---

## 2. ⚡ FUNCTIONAL ITERATION & CONCISENESS

This section enforces a functional programming style to ensure code is lean and declarative, while maintaining readability.

- **Prefer Map/Reduce over Loops:** Prioritize immutable data transformations (`map`, `filter`, `reduce`, `find`) over imperative loops.
- **Readable Chains:** If a functional chain becomes too long or complex, break it into intermediate variables with descriptive names.
- **Avoid Imperative Loops:** Do **NOT** use `for` loops, `while` loops, or `forEach` unless strictly necessary for performance in hot paths.
- **Minimize Code:** Always look for ways to simplify logic. If a 5-line loop can be a clear 1-line chain, use the chain.

---

## 3. 🛡️ CORE TYPESCRIPT SAFETY

These rules enforce strict compiler checks and leverage TypeScript's type system.

- **STRICT MODE:** All code must be compatible with `"strict": true`.
- **`any` is Forbidden:** Use `unknown` and explicit type narrowing instead.
- **Explicit Returns:** All functions, especially public API handlers, must have explicit return type annotations.
- **Immutability:** Use the **`readonly`** keyword for properties in interfaces/types not intended to be mutated.

---

## 4. 📝 CODE STYLE AND DOCUMENTATION

- **Comment Prohibition:** **MANDATORY AVOIDANCE** of inline comments (`//`). The code itself must be the documentation.
- **Docstring Minimization:** Do not include docstrings unless explicitly requested.

---

## 🛑 FORBIDDEN PATTERNS

The agent must actively review and refactor away from these anti-patterns:

- **Imperative Loops:** usage of `for`, `for...of`, `while`, and `forEach` where a functional alternative exists.
- **Non-Null Assertion Operator (`!`)**: Forbidden. Use optional chaining (`?.`) and nullish coalescing (`??`).
- **Deep Nesting:** Logic with more than 3 levels of nested blocks.
- **Cryptic One-Liners:** Complex logic crammed into a single line that requires mental parsing.
