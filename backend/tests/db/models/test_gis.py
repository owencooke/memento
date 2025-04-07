import binascii
from unittest.mock import MagicMock, patch

import pytest
from shapely.geometry import Point

from server.services.db.models.gis import (
    BaseWithCoordinates,
    Coordinates,
    CoordinatesInsert,
)


class TestCoordinates:
    """Test suite for Coordinates class."""

    def test_init(self, coordinates_data):
        """Test initialization with valid data."""
        coords = Coordinates(**coordinates_data)
        assert coords.lat == coordinates_data["lat"]
        assert coords.long == coordinates_data["long"]

    def test_to_gis_string(self, coordinates_data):
        """Test to_gis_string method returns correct PostGIS format."""
        coords = Coordinates(**coordinates_data)
        result = coords.to_gis_string()
        assert result == f"POINT({coordinates_data['long']} {coordinates_data['lat']})"

    def test_from_geojson_valid(self, geojson_point, coordinates_data):
        """Test from_geojson method with valid GeoJSON."""
        coords = Coordinates.from_geojson(geojson_point)
        assert coords.lat == coordinates_data["lat"]
        assert coords.long == coordinates_data["long"]

    def test_from_geojson_invalid(self):
        """Test from_geojson method with invalid GeoJSON."""
        invalid_geojson = {"type": "LineString", "coordinates": [[0, 0], [1, 1]]}
        with pytest.raises(ValueError, match="Invalid GeoJSON format"):
            Coordinates.from_geojson(invalid_geojson)

    def test_from_postgis_binary_valid(self, postgis_hex):
        """Test from_postgis_binary method with valid hex string."""
        with patch("binascii.unhexlify") as mock_unhex:
            mock_bytes = b"mock_bytes"
            mock_unhex.return_value = mock_bytes

            with patch("shapely.wkb.loads") as mock_loads:
                mock_point = MagicMock(spec=Point)
                mock_point.x = -122.4194
                mock_point.y = 37.7749
                mock_loads.return_value = mock_point

                coords = Coordinates.from_postgis_binary(postgis_hex)

                mock_unhex.assert_called_once_with(postgis_hex)
                mock_loads.assert_called_once_with(mock_bytes)
                assert coords.lat == 37.7749
                assert coords.long == -122.4194

    def test_from_postgis_binary_invalid(self):
        """Test from_postgis_binary method with invalid hex string."""
        with patch("binascii.unhexlify", side_effect=binascii.Error("Invalid hex")):
            with pytest.raises(ValueError, match="Invalid Postgis binary format"):
                Coordinates.from_postgis_binary("invalid_hex")


class TestBaseWithCoordinates:
    """Test suite for BaseWithCoordinates class."""

    def test_init_with_none(self):
        """Test initialization with None coordinates."""
        model = BaseWithCoordinates(coordinates=None)
        assert model.coordinates is None

    def test_init_with_coordinates_object(self, coordinates_data):
        """Test initialization with Coordinates object."""
        coords = Coordinates(**coordinates_data)
        model = BaseWithCoordinates(coordinates=coords)
        assert model.coordinates == coords

    def test_init_with_postgis_binary(self, postgis_hex):
        """Test initialization with PostGIS binary string."""
        with patch(
            "server.services.db.models.gis.Coordinates.from_postgis_binary"
        ) as mock_from_postgis:
            mock_coords = Coordinates(lat=37.7749, long=-122.4194)
            mock_from_postgis.return_value = mock_coords

            model = BaseWithCoordinates(coordinates=postgis_hex)

            mock_from_postgis.assert_called_once_with(postgis_hex)
            assert model.coordinates == mock_coords

    def test_init_with_dict(self, coordinates_data):
        """Test initialization with dictionary."""
        model = BaseWithCoordinates(coordinates=coordinates_data)
        assert isinstance(model.coordinates, Coordinates)
        assert model.coordinates.lat == coordinates_data["lat"]
        assert model.coordinates.long == coordinates_data["long"]

    def test_init_with_geojson(self, geojson_point):
        """Test initialization with GeoJSON."""
        with patch(
            "server.services.db.models.gis.Coordinates.from_geojson"
        ) as mock_from_geojson:
            mock_coords = Coordinates(lat=37.7749, long=-122.4194)
            mock_from_geojson.return_value = mock_coords

            model = BaseWithCoordinates(coordinates=geojson_point)

            mock_from_geojson.assert_called_once_with(geojson_point)
            assert model.coordinates == mock_coords

    def test_init_with_invalid_format(self):
        """Test initialization with invalid format returns None."""
        model = BaseWithCoordinates(coordinates=[1, 2, 3])  # Invalid format
        assert model.coordinates is None

    def test_init_with_invalid_postgis_binary(self):
        """Test that an invalid PostGIS binary string returns None"""
        invalid_hex = "invalid_hex"
        model = BaseWithCoordinates(coordinates=invalid_hex)
        assert model.coordinates is None


class TestCoordinatesInsert:
    """Test suite for CoordinatesInsert class."""

    def test_model_dump_with_coordinates(self, coordinates_data):
        """Test model_dump method with coordinates."""

        class TestModel(BaseWithCoordinates, CoordinatesInsert):
            name: str

        coords = Coordinates(**coordinates_data)
        model = TestModel(name="test", coordinates=coords)

        result = model.model_dump()

        assert "coordinates" in result
        assert result["coordinates"] == coords.to_gis_string()
        assert result["name"] == "test"

    def test_model_dump_without_coordinates(self):
        """Test model_dump method without coordinates."""

        class TestModel(CoordinatesInsert):
            name: str

        model = TestModel(name="test")

        result = model.model_dump()

        assert "coordinates" not in result
        assert result["name"] == "test"

    def test_model_dump_with_non_coordinates_object(self):
        """Test model_dump method with non-Coordinates object."""

        class TestModel(CoordinatesInsert):
            name: str
            coordinates: dict

        model = TestModel(name="test", coordinates={"lat": 1, "long": 2})

        result = model.model_dump()

        assert "coordinates" in result
        assert result["coordinates"] == {"lat": 1, "long": 2}
        assert result["name"] == "test"
