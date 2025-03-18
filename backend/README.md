# Backend

## Get Started

### Prerequisites

This project uses [poetry](https://python-poetry.org/docs/), a modern dependency management
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

#### Setting Environment Variables

The Supabase URL, Key, and Database URL must be declared in the .env file:

```env
SUPABASE_URL = ""
SUPABASE_KEY = ""
DB_URL = ""
```

**SUPABASE URL**: Project Settings -> Configuration -> Data API and are under the **Project URL** and **Project API Keys** respectively
**SUPABASE_KEY**: Project Settings -> Configuration -> Data API and are under the **Project URL** and **Project API Keys** respectively
**DB_URL** can be found by clicking _Connect_ in the top bar of the Project Dashboard and under the **Session Pooler** section. The DB password must be substituted into the URL.

### Running

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

## Supabase Configuration

### Database

This project uses Supabase's PostgreSQL relational database for storing data. The SQL definitions for the public schema and its tables are defined in `/server/services/db/models/schema_public.sql`. To initialize a new Supabase database with this schema:

1. Enable the PostGIS extension through [Supabase dashboard](https://supabase.com/docs/guides/database/extensions/postgis?queryGroups=language&language=sql#enable-the-extension).
2. Add the tables to the public schema using either:

   - [psql](https://www.postgresql.org/docs/current/app-psql.html), the Postgres CLI

     ```bash
     psql postgres://your_user:your_password@your_host:5432/your_new_database < schema.sql

     ```

   - Supabase SQL Editor (copy/paste file and then run the query)

### Authentication

Supabase Auth makes it easy to support multiple types of authentication. In this project, we integrate Google OAuth with Supabase Auth to enable social sign in via Google Workspace.

1. Follow the Google Cloud documentation for creating a GCP project and [creating a web application OAuth 2.0 Client ID](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid).

   - Be sure to add the authorized redirect URI for Supabase Auth: `https://<your-project-id>.supabase.co/auth/v1/callback`

2. Navigate to the Auth > Sign In / Up section in the Supabase dashboard for your project and enable "Sign in with Google".

   - Enter the client ID and secret obtained from Step 1 in GCP dashboard.

3. Navigate to the Auth > URL Configuration section in the Supabase dashboard and add the following authorized redirect URLs:
   - `memento://auth/redirect` (deep link into actual app build)
   - `exp://*.*.*.*:19000/--/auth/redirect` (for Expo Go development)

### Storage

Used for storing the images associated with each memento. Navigate to the Storage section of the Supabase dashboard and be sure to create a private bucket called `images` that supports `image/*` MIME types.

## References

- the initial FastAPI boilerplate was created with the help of the [fastapi_template](https://github.com/s3rius/FastAPI-template) package.
