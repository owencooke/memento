# Backend

## Installation

This project uses [poetry](https://python-poetry.org/), a modern dependency management
tool.

To install Poetry

```
curl -sSL https://install.python-poetry.org | python3 -
```

Be sure to add the prompted PATH variable to your `.bashrc` after running. Then, install the project dependencies:

```
poetry install
```

## Running

To run the project use this set of commands:

```bash
poetry run python -m server
```

This will start the server at http://localhost:8000/api.

You can find Swagger documentation at `/docs`.

## Pre-commit

To install [pre-commit](https://pre-commit.com/) simply run inside the shell:

```bash
pre-commit install
```

Configured using the `.pre-commit-config.yaml` file, it runs:

- black (formats the code);
- mypy (validates types);
- ruff (spots possible bugs);

## Tests

For running tests on your local machine:

```bash
poetry run pytest -vv
```

## References

- the initial FastAPI boilerplate was created with the help of the [fastapi_template](https://github.com/s3rius/FastAPI-template) package.
