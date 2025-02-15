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

To run the backend server:

```bash
poetry run start
```

This will start the server at http://localhost:8000/api.

You can find Swagger API documentation at `/docs`.

## Linting / Pre-commit

To install [pre-commit](https://pre-commit.com/) simply run inside the shell:

```bash
pre-commit install
```

Configured using the `.pre-commit-config.yaml` file, it runs the following before proceeding with a commit:

- black (formats the code);
- mypy (validates types);
- ruff (spots possible bugs);

You can also manually run the lint commands using:

```bash
poetry run lint
```

## Tests

For running tests on your local machine:

```bash
poetry run test
```

## References

- the initial FastAPI boilerplate was created with the help of the [fastapi_template](https://github.com/s3rius/FastAPI-template) package.
