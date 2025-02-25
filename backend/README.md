# Backend

## Installation

This project uses [poetry](https://python-poetry.org/), a modern dependency management
tool.

To install Poetry

```bash
curl -sSL https://install.python-poetry.org | python3 -
```

Be sure to add the prompted PATH variable to your `.bashrc` after running:

```bash
# Open editor, add poetry to PATH, save
nano ~/.bashrc
# Refresh terminal
source ~/.bashrc
```

Other system dependencies that must be installed:

```bash
sudo apt update
sudo apt install llvm-dev
```

Lastly, install the project's Python dependencies via Poetry:

```bash
poetry install
```

## Setting Environment Variables

The Supabase URL, Key, and Database URL must be declared in the .env file:

```env
SUPABASE_URL = ""
SUPABASE_KEY = ""
DB_URL = ""
```

**SUPABASE URL**: Project Settings -> Configuration -> Data API and are under the **Project URL** and **Project API Keys** respectively
**SUPABASE_KEY**: Project Settings -> Configuration -> Data API and are under the **Project URL** and **Project API Keys** respectively
**DB_URL** can be found by clicking _Connect_ in the top bar of the Project Dashboard and under the **Session Pooler** section. The DB password must be substituted into the URL.

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

## Syncing DB to Pydantic Models

This project leverages [supabase-pydantic](https://github.com/kmbhm1/supabase-pydantic) to automatically generate Pydantic models from the Supabase database schema.

```bash
poetry run sync-db
```

The generated models are stored under [`server/services/db/models`](https://github.com/owencooke/memento/tree/main/backend/server/services/db/models)

## Tests

For running tests on your local machine:

```bash
poetry run test
```

## References

- the initial FastAPI boilerplate was created with the help of the [fastapi_template](https://github.com/s3rius/FastAPI-template) package.
