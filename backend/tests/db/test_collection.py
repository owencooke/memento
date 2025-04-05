from unittest.mock import call

from pydantic import UUID4
from tests.fixtures.supabase import MockSupabase

from server.api.collection.models import NewCollection, UpdateCollection
from server.services.db.models.schema_public_latest import (
    Collection,
    HasMemento,
    HasMementoInsert,
    HasMementoUpdate,
)
from server.services.db.queries.collection import (
    associate_memento,
    create_collection,
    db_delete_collection,
    db_delete_has_memento,
    get_collection,
    get_collection_image_filenames,
    get_collections,
    get_has_mementos,
    update_associate_memento,
    update_collection,
)


def test_create_collection(
    mock_supabase: MockSupabase,
    collection_data: dict,
    expected_collection_data: dict,
) -> None:
    """Test creating a new collection with the create_collection function."""
    mock_supabase_client, mock_query_response, _ = mock_supabase

    # Given
    mock_collection = NewCollection(**collection_data)
    mock_query_response.data = [expected_collection_data]

    # When
    result = create_collection(mock_collection, collection_data["user_id"])

    # Then
    mock_supabase_client.table.assert_called_once_with("collection")
    mock_supabase_client.table().insert.assert_called_once()
    assert isinstance(result, Collection)
    assert result.id == expected_collection_data["id"]
    assert result.title == expected_collection_data["title"]
    assert result.caption == expected_collection_data["caption"]
    assert result.user_id == collection_data["user_id"]


def test_update_collection(
    mock_supabase: MockSupabase,
    collection_data: dict,
    expected_collection_data: dict,
) -> None:
    """Test updating an existing collection with the update_collection function."""
    mock_supabase_client, mock_query_response, _ = mock_supabase

    # Given
    # Create a copy with updated values
    updated_data = dict(collection_data)
    updated_data["title"] = "Updated Collection"
    updated_data["caption"] = "Updated Caption"

    # Update the expected response to reflect changes
    updated_expected = dict(expected_collection_data)
    updated_expected["title"] = "Updated Collection"
    updated_expected["caption"] = "Updated Caption"

    mock_collection = UpdateCollection(**updated_data)
    mock_query_response.data = [updated_expected]

    # When
    result = update_collection(collection_data["id"], mock_collection)

    # Then
    mock_supabase_client.table.assert_called_once_with("collection")
    mock_supabase_client.table().update.assert_called_once()
    assert isinstance(result, Collection)
    assert result.id == updated_expected["id"]
    assert result.title == updated_expected["title"]
    assert result.caption == updated_expected["caption"]
    assert result.user_id == mock_collection.user_id


def test_get_collection(
    mock_supabase: MockSupabase,
    expected_collection_data: dict,
) -> None:
    """Test getting a single collection with the get_collection function."""
    mock_supabase_client, mock_query_response, _ = mock_supabase

    # Given
    collection_id = expected_collection_data["id"]
    mock_query_response.data = expected_collection_data

    # Mock the from_ method and chain
    mock_supabase_client.from_.return_value = mock_supabase_client
    mock_supabase_client.select.return_value = mock_supabase_client
    mock_supabase_client.eq.return_value = mock_supabase_client
    mock_supabase_client.single.return_value = mock_supabase_client
    mock_supabase_client.execute.return_value = mock_query_response

    # When
    result = get_collection(collection_id)

    # Then
    mock_supabase_client.from_.assert_called_once_with("collection")
    mock_supabase_client.select.assert_called_once_with("*")
    mock_supabase_client.eq.assert_called_once_with("id", collection_id)
    assert isinstance(result, Collection)
    assert result.id == expected_collection_data["id"]
    assert result.title == expected_collection_data["title"]


def test_get_collections(
    mock_supabase: MockSupabase,
    collection_data: dict,
    collections_with_mementos_data: list[dict],
) -> None:
    """Test getting all collections for a user with the get_collections function."""
    mock_supabase_client, mock_query_response, _ = mock_supabase

    # Given
    user_id = collection_data["user_id"]
    mock_query_response.data = collections_with_mementos_data

    # When
    result = get_collections(user_id)

    # Then
    mock_supabase_client.table.assert_called_once_with("collection")
    mock_supabase_client.table().select.assert_called_once_with(
        "*, mementos:has_memento(*)"
    )
    mock_supabase_client.table().select().eq.assert_called_once_with(
        "user_id", str(user_id)
    )
    assert len(result) == 2
    assert result[0].id == collections_with_mementos_data[0]["id"]
    assert result[0].title == collections_with_mementos_data[0]["title"]
    assert len(result[0].mementos) == 2
    assert result[1].id == collections_with_mementos_data[1]["id"]
    assert result[1].title == collections_with_mementos_data[1]["title"]
    assert len(result[1].mementos) == 1


def test_get_has_mementos(
    mock_supabase: MockSupabase,
    collection_data: dict,
    associated_memento_ids: list[dict],
) -> None:
    """Test getting memento IDs associated with a collection."""
    mock_supabase_client, mock_query_response, _ = mock_supabase

    # Given
    collection_id = collection_data["id"]
    mock_query_response.data = associated_memento_ids

    # When
    result = get_has_mementos(collection_id)

    # Then
    mock_supabase_client.table.assert_called_once_with("has_memento")
    mock_supabase_client.table().select.assert_called_once_with("memento_id")
    mock_supabase_client.table().select().eq.assert_called_once_with(
        "collection_id", collection_id
    )
    assert len(result) == 3
    assert result == [1, 2, 3]


def test_db_delete_has_memento(
    mock_supabase: MockSupabase,
    has_memento_data: dict,
) -> None:
    """Test deleting a memento association from a collection."""
    mock_supabase_client, mock_query_response, _ = mock_supabase

    # Given
    collection_id = has_memento_data["collection_id"]
    memento_id = has_memento_data["memento_id"]
    mock_query_response.data = [has_memento_data]

    # When
    result = db_delete_has_memento(collection_id, memento_id)

    # Then
    calls = [
        call("collection_id", collection_id),
        call("memento_id", memento_id),
    ]

    mock_supabase_client.table.assert_called_once_with("has_memento")
    mock_supabase_client.table().delete.assert_called_once()
    mock_supabase_client.table().delete().eq.assert_has_calls(calls)
    assert isinstance(result, HasMemento)
    assert result.collection_id == collection_id
    assert result.memento_id == memento_id


def test_db_delete_collection(
    mock_supabase: MockSupabase,
    expected_collection_data: dict,
) -> None:
    """Test deleting a collection from the DB."""
    mock_supabase_client, mock_query_response, _ = mock_supabase

    # Given
    collection_id = expected_collection_data["id"]
    mock_query_response.data = [expected_collection_data]

    # When
    result = db_delete_collection(collection_id)

    # Then
    mock_supabase_client.table.assert_called_once_with("collection")
    mock_supabase_client.table().delete.assert_called_once()
    mock_supabase_client.table().delete().eq.assert_called_once_with(
        "id", collection_id
    )
    assert isinstance(result, Collection)
    assert result.id == collection_id
    assert result.title == expected_collection_data["title"]


def test_associate_memento(
    mock_supabase: MockSupabase,
    has_memento_data: dict,
) -> None:
    """Test associating a memento with a collection."""
    mock_supabase_client, mock_query_response, _ = mock_supabase

    # Given
    mock_has_memento = HasMementoInsert(**has_memento_data)
    mock_query_response.data = [has_memento_data]

    # When
    result = associate_memento(mock_has_memento)

    # Then
    mock_supabase_client.table.assert_called_once_with("has_memento")
    mock_supabase_client.table().insert.assert_called_once()
    assert isinstance(result, HasMemento)
    assert result.collection_id == has_memento_data["collection_id"]
    assert result.memento_id == has_memento_data["memento_id"]


def test_associate_memento_failure(
    mock_supabase: MockSupabase,
    has_memento_data: dict,
) -> None:
    """Test failure when associating a memento with a collection."""
    mock_supabase_client, mock_query_response, _ = mock_supabase

    # Given
    mock_has_memento = HasMementoInsert(**has_memento_data)
    mock_query_response.data = []  # Empty response simulates failure

    # When/Then
    try:
        associate_memento(mock_has_memento)
        assert False, "Expected ValueError but no exception was raised"
    except ValueError as e:
        assert str(e) == "Failed to associate memento with collection"

    mock_supabase_client.table.assert_called_once_with("has_memento")
    mock_supabase_client.table().insert.assert_called_once()


def test_update_associate_memento(
    mock_supabase: MockSupabase,
    has_memento_data: dict,
) -> None:
    """Test updating a memento association with a collection."""
    mock_supabase_client, mock_query_response, _ = mock_supabase

    # Given
    # Create updated has_memento data
    updated_has_memento_data = dict(has_memento_data)
    # ID is needed for updating
    updated_has_memento_data["id"] = 1

    mock_has_memento = HasMementoUpdate(**updated_has_memento_data)
    mock_query_response.data = [updated_has_memento_data]

    # When
    result = update_associate_memento(mock_has_memento)

    # Then
    mock_supabase_client.table.assert_called_once_with("has_memento")
    mock_supabase_client.table().update.assert_called_once()
    mock_supabase_client.table().update().eq.assert_called_once_with("id", id)
    assert isinstance(result, HasMemento)
    assert result.collection_id == updated_has_memento_data["collection_id"]
    assert result.memento_id == updated_has_memento_data["memento_id"]


def test_get_collection_image_filenames(
    mock_supabase: MockSupabase,
    collection_data: dict,
) -> None:
    """Test getting image filenames for mementos in a collection."""
    mock_supabase_client, mock_query_response, _ = mock_supabase

    # Given
    collection_id = collection_data["id"]

    # Mock response data structure for nested image filenames
    mock_response_data = [
        {
            "memento": {
                "images": [{"filename": "image1.jpg"}, {"filename": "image2.jpg"}]
            }
        },
        {"memento": {"images": [{"filename": "image3.jpg"}]}},
    ]

    mock_query_response.data = mock_response_data

    # Mock the from_ method and chain
    mock_supabase_client.from_.return_value = mock_supabase_client
    mock_supabase_client.select.return_value = mock_supabase_client
    mock_supabase_client.eq.return_value = mock_supabase_client
    mock_supabase_client.execute.return_value = mock_query_response

    # When
    result = get_collection_image_filenames(collection_id)

    # Then
    mock_supabase_client.from_.assert_called_once_with("has_memento")
    mock_supabase_client.select.assert_called_once_with(
        "memento:memento_id(images:image(filename))"
    )
    mock_supabase_client.eq.assert_called_once_with("collection_id", collection_id)

    assert len(result) == 3
    assert result == ["image1.jpg", "image2.jpg", "image3.jpg"]


def test_get_collection_image_filenames_empty(
    mock_supabase: MockSupabase,
    collection_data: dict,
) -> None:
    """Test getting image filenames when there are no images in the collection."""
    mock_supabase_client, mock_query_response, _ = mock_supabase

    # Given
    collection_id = collection_data["id"]

    # Empty response
    mock_query_response.data = []

    # Mock the from_ method and chain
    mock_supabase_client.from_.return_value = mock_supabase_client
    mock_supabase_client.select.return_value = mock_supabase_client
    mock_supabase_client.eq.return_value = mock_supabase_client
    mock_supabase_client.execute.return_value = mock_query_response

    # When
    result = get_collection_image_filenames(collection_id)

    # Then
    mock_supabase_client.from_.assert_called_once_with("has_memento")
    mock_supabase_client.select.assert_called_once_with(
        "memento:memento_id(images:image(filename))"
    )
    mock_supabase_client.eq.assert_called_once_with("collection_id", collection_id)

    assert result == []
