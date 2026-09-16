---
name: git-workflow
description: Strict git workflow policy for CapVenture. Enforces that the assistant MUST NEVER automatically run git push without explicit user request.
---

# Git Workflow & Push Policy

This skill defines the version control rules and workflow for this repository.

## 🛑 Strict Rule: Never Push Automatically to Git

- **NEVER** execute `git push` automatically or proactively after completing tasks, writing code, or making local commits.
- **NEVER** chain `git push` with other commands (e.g. `git add . ; git commit ; git push`) unless the user has **explicitly asked to push to git** in their prompt.
- Keep all changes local (staged or locally committed).

## Allowed Operations:
- Checking git status (`git status`)
- Viewing diffs (`git diff`)
- Local staging and commits when appropriate (`git add`, `git commit`)

## When Git Push is Allowed:
- **ONLY** when the user explicitly requests it with commands like:
  - *"push to git"*
  - *"git push"*
  - *"push changes to github"*
