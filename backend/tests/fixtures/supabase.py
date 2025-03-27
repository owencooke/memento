from typing import Any, Generator
from unittest.mock import MagicMock, patch

import pytest

# Create a more explicit type for the mock return value
MockSupabase = tuple[MagicMock, MagicMock, MagicMock]


@pytest.fixture
def mock_supabase() -> Generator[MockSupabase, None, None]:
    """
    Create a mock Supabase DB client with separate controls for DB and storage responses.

    Example usage:
    ```python
        def test_create_memento(mock_supabase: MockSupabase) -> None:
            mock_supabase_client, mock_db_response, mock_storage_response = mock_supabase

            # Set DB response data
            mock_db_response.data = [{"id": 1, "caption": "Test"}]

            # Set storage response properties
            mock_storage_response.path = "test-path"  # For upload responses
            mock_storage_response.signedUrl = "https://test-url.com"  # For signed URL responses

            # Test assertions
            mock_supabase_client.table.assert_called_once_with("memento")
    ```
    """
    with patch("server.services.db.supabase") as mock_supabase:
        # Create separate response objects for DB and storage operations
        mock_db_response = MagicMock()
        mock_storage_response = MagicMock()

        # Create mock chain builders for DB operations
        def create_db_chain_builder() -> MagicMock:
            chain_builder = MagicMock()
            chain_builder.execute.return_value = mock_db_response
            chain_methods = [
                "select",
                "insert",
                "update",
                "delete",
                "eq",
                "neq",
                "gt",
                "gte",
                "lt",
                "lte",
                "like",
                "ilike",
                "is_",
                "in_",
                "text_search",
                "not_",
                "or_",
                "filter",
            ]
            for method in chain_methods:
                getattr(chain_builder, method).return_value = chain_builder
            return chain_builder

        # Create storage mock that returns the storage response
        def create_storage_chain_builder() -> MagicMock:
            chain_builder = MagicMock()

            # Set up return values for storage methods
            chain_builder.upload.return_value = mock_storage_response
            chain_builder.create_signed_url.return_value = mock_storage_response
            chain_builder.create_signed_urls.return_value = mock_storage_response
            chain_builder.remove.return_value = mock_storage_response
            chain_builder.download.return_value = mock_storage_response

            return chain_builder

        # Set up DB table access
        mock_supabase.table.return_value = create_db_chain_builder()

        # Set up RPC calls
        mock_supabase.rpc.return_value = create_db_chain_builder()

        # Set up storage access
        mock_storage_bucket = create_storage_chain_builder()
        mock_supabase.storage.from_.return_value = mock_storage_bucket

        yield mock_supabase, mock_db_response, mock_storage_response
