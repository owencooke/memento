from server.api.memento.models import NewImageMetadata
from server.services.db.queries.image import (
    create_image_metadata,
)
from tests.fixtures.supabase import MockSupabase


def test_create_image_metadata(
    mock_supabase: MockSupabase,
    image_data: dict,
    expected_image_data: dict,
) -> None:
    """Test creating a new image metadata record for a memento."""
    mock_supabase_client, mock_query_response = mock_supabase

    # Given
    mock_image = NewImageMetadata(**image_data)
    memento_id = 1
    mock_query_response.data = [expected_image_data]

    # When
    result = create_image_metadata(mock_image, memento_id)

    # Then
    mock_supabase_client.table.assert_called_once_with("image")
    mock_supabase_client.table().insert.assert_called_once()
    assert result is True


# def test_get_images_for_memento(
#     mock_supabase: MockSupabase,
#     expected_image_data: dict,
# ) -> None:
#     """Test retrieving all images belonging to a memento."""
#     mock_supabase_client, mock_query_response = mock_supabase

#     # Given
#     memento_id = 1
#     mock_query_response.data = [expected_image_data]

#     # When
#     results = get_images_for_memento(memento_id)

#     # Then
#     mock_supabase_client.table.assert_called_once_with("image")
#     mock_supabase_client.table().select.assert_called_once_with("*")
#     mock_supabase_client.table().select().eq.assert_called_once_with(
#         "memento_id", memento_id
#     )
#     assert len(results) == 1
#     assert isinstance(results[0], ImageWithUrl)
#     assert results[0].id == expected_image_data["id"]
#     assert results[0].url == expected_image_data["url"]
#     assert results[0].memento_id == expected_image_data["memento_id"]


# def test_delete_image_metadata(
#     mock_supabase: MockSupabase,
#     expected_image_data: dict,
# ) -> None:
#     """Test deleting an image metadata record."""
#     mock_supabase_client, mock_query_response = mock_supabase

#     # Given
#     image_id = 1
#     mock_query_response.data = [expected_image_data]

#     # When
#     result = delete_image_metadata(image_id)

#     # Then
#     mock_supabase_client.table.assert_called_once_with("image")
#     mock_supabase_client.table().delete.assert_called_once()
#     mock_supabase_client.table().delete().eq.assert_called_once_with("id", image_id)
#     assert result is True


# def test_update_image_order(
#     mock_supabase: MockSupabase,
#     expected_image_data: dict,
# ) -> None:
#     """Test updating an image's order index."""
#     mock_supabase_client, mock_query_response = mock_supabase

#     # Given
#     image_id = 1
#     new_order_index = 2
#     mock_query_response.data = [expected_image_data]

#     # When
#     result = update_image_order(image_id, new_order_index)

#     # Then
#     mock_supabase_client.table.assert_called_once_with("image")
#     mock_supabase_client.table().update.assert_called_once_with(
#         {"order_index": new_order_index}
#     )
#     mock_supabase_client.table().update().eq.assert_called_once_with("id", image_id)
#     assert result is True
