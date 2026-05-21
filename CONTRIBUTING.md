# Contributing to Platform POC API

## Setup

```bash
python -m venv venv
source venv/bin/activate
pip install -r app/requirements-dev.txt
pre-commit install
```

## Code Style

- **Formatter**: ruff (auto-fixes on commit)
- **Linter**: ruff check
- **Type hints**: mypy (optional, but recommended)

## Testing

```bash
cd app
pytest tests/ -v --cov=config
```

All PRs must pass CI checks:
- Linting (ruff)
- Tests (pytest with coverage)
- Security (Semgrep, Socket.dev)

## Pull Requests

1. Create branch from `main`: `git checkout -b feature/your-feature`
2. Make changes and commit
3. Pre-commit hooks will run automatically
4. Push and create PR
5. Ensure all CI checks pass
6. Request review from @dcortizo-nr
