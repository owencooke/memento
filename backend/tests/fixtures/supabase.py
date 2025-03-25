from typing import Any, Generator
from unittest.mock import MagicMock, patch

import pytest

MockSupabase = tuple[MagicMock, MagicMock]


@pytest.fixture
def mock_supabase() -> Generator[MagicMock, MagicMock, Any]:
    """
    Create a mock Supabase DB client.

    Example usage:
    ```python
        def test_create_memento(mock_supabase: Tuple[MagicMock, MagicMock]) -> None:
            mock_supabase_client, mock_query_response = mock_supabase

            # Set the response of Supabase query to some mocked data
            mock_query_response.data = [mock_row_1, mock_row_2, ...]

            # Assert specific methods of the Supabase client were called
            mock_supabase_client.table.assert_called_once_with("memento")
            mock_supabase_client.table().insert.assert_called_once()
    ```
    """
    with patch("server.services.db.queries.memento.supabase") as mock_supabase:
        # Create a mock response object that can be configured in each test
        mock_query_response = MagicMock()

        # Create mock chain builders - each returns a mockable execute method
        def create_chain_builder() -> MagicMock:
            chain_builder = MagicMock()
            chain_builder.execute.return_value = mock_query_response
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

        # Set up table access
        mock_table = create_chain_builder()
        mock_supabase.table.return_value = mock_table

        # Set up RPC calls
        mock_rpc = create_chain_builder()
        mock_supabase.rpc.return_value = mock_rpc

        yield mock_supabase, mock_query_response
