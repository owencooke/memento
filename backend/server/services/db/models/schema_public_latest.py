from __future__ import annotations

import datetime

from pydantic import UUID4, BaseModel, Field

# CUSTOM CLASSES
# Note: These are custom model classes for defining common features among
# Pydantic Base Schema.


class CustomModel(BaseModel):
	"""Base model class with common features."""



class CustomModelInsert(CustomModel):
	"""Base model for insert operations with common features."""



class CustomModelUpdate(CustomModel):
	"""Base model for update operations with common features."""



# BASE CLASSES
# Note: These are the base Row models that include all fields.


class CollectionBaseSchema(CustomModel):
	"""Collection Base Schema."""

	# Primary Keys
	id: int

	# Columns
	caption: str | None = Field(default=None)
	coordinates: str | None = Field(default=None)
	date: datetime.date | None = Field(default=None)
	location: str | None = Field(default=None)
	title: str
	user_id: UUID4


class HasMementoBaseSchema(CustomModel):
	"""HasMemento Base Schema."""

	# Primary Keys
	collection_id: int
	memento_id: int


class ImageBaseSchema(CustomModel):
	"""Image Base Schema."""

	# Primary Keys
	id: int
	memento_id: int

	# Columns
	coordinates: str | None = Field(default=None)
	date: datetime.date | None = Field(default=None)
	detected_text: str | None = Field(default=None)
	filename: str
	image_label: str | None = Field(default=None)
	mime_type: str | None = Field(default=None)
	order_index: int


class MementoBaseSchema(CustomModel):
	"""Memento Base Schema."""

	# Primary Keys
	id: int

	# Columns
	caption: str | None = Field(default=None)
	coordinates: str | None = Field(default=None)
	date: datetime.date | None = Field(default=None)
	location: str | None = Field(default=None)
	user_id: UUID4


class MementosWithImagesBaseSchema(CustomModel):
	"""MementosWithImages Base Schema."""

	# Columns
	caption: str | None = Field(default=None)
	coordinates: str | None = Field(default=None)
	date: datetime.date | None = Field(default=None)
	detected_text: str | None = Field(default=None)
	id: int | None = Field(default=None)
	location: str | None = Field(default=None)
	user_id: UUID4 | None = Field(default=None)


class UserInfoBaseSchema(CustomModel):
	"""UserInfo Base Schema."""

	# Primary Keys
	id: UUID4

	# Columns
	birthday: datetime.date | None = Field(default=None)
# INSERT CLASSES
# Note: These models are used for insert operations. Auto-generated fields
# (like IDs and timestamps) are optional.


class CollectionInsert(CustomModelInsert):
	"""Collection Insert Schema."""

	# Primary Keys


	# Field properties:
	# caption: nullable
	# coordinates: nullable
	# date: nullable
	# location: nullable
	# user_id: has default value

	# Required fields
	title: str

		# Optional fields
	caption: str | None = Field(default=None)
	coordinates: str | None = Field(default=None)
	date: datetime.date | None = Field(default=None)
	location: str | None = Field(default=None)
	user_id: UUID4 | None = Field(default=None)


class HasMementoInsert(CustomModelInsert):
	"""HasMemento Insert Schema."""

	# Primary Keys
	collection_id: int
	memento_id: int


class ImageInsert(CustomModelInsert):
	"""Image Insert Schema."""

	# Primary Keys



	# Field properties:
	# coordinates: nullable
	# date: nullable
	# detected_text: nullable
	# image_label: nullable
	# mime_type: nullable

	# Required fields
	filename: str
	order_index: int

		# Optional fields
	coordinates: str | None = Field(default=None)
	date: datetime.date | None = Field(default=None)
	detected_text: str | None = Field(default=None)
	image_label: str | None = Field(default=None)
	mime_type: str | None = Field(default=None)


class MementoInsert(CustomModelInsert):
	"""Memento Insert Schema."""

	# Primary Keys


	# Field properties:
	# caption: nullable
	# coordinates: nullable
	# date: nullable
	# location: nullable
	# user_id: has default value

		# Optional fields
	caption: str | None = Field(default=None)
	coordinates: str | None = Field(default=None)
	date: datetime.date | None = Field(default=None)
	location: str | None = Field(default=None)
	user_id: UUID4 | None = Field(default=None)


class MementosWithImagesInsert(CustomModelInsert):
	"""MementosWithImages Insert Schema."""

	# Field properties:
	# caption: nullable
	# coordinates: nullable
	# date: nullable
	# detected_text: nullable
	# id: nullable
	# location: nullable
	# user_id: nullable

		# Optional fields
	caption: str | None = Field(default=None)
	coordinates: str | None = Field(default=None)
	date: datetime.date | None = Field(default=None)
	detected_text: str | None = Field(default=None)
	id: int | None = Field(default=None)
	location: str | None = Field(default=None)
	user_id: UUID4 | None = Field(default=None)


class UserInfoInsert(CustomModelInsert):
	"""UserInfo Insert Schema."""

	# Primary Keys
	id: UUID4 | None = Field(default=None)  # has default value

	# Field properties:
	# birthday: nullable

		# Optional fields
	birthday: datetime.date | None = Field(default=None)
# UPDATE CLASSES
# Note: These models are used for update operations. All fields are optional.


class CollectionUpdate(CustomModelUpdate):
	"""Collection Update Schema."""

	# Primary Keys


	# Field properties:
	# caption: nullable
	# coordinates: nullable
	# date: nullable
	# location: nullable
	# user_id: has default value

		# Optional fields
	caption: str | None = Field(default=None)
	coordinates: str | None = Field(default=None)
	date: datetime.date | None = Field(default=None)
	location: str | None = Field(default=None)
	title: str | None = Field(default=None)
	user_id: UUID4 | None = Field(default=None)


class HasMementoUpdate(CustomModelUpdate):
	"""HasMemento Update Schema."""

	# Primary Keys
	collection_id: int | None = Field(default=None)
	memento_id: int | None = Field(default=None)


class ImageUpdate(CustomModelUpdate):
	"""Image Update Schema."""

	# Primary Keys



	# Field properties:
	# coordinates: nullable
	# date: nullable
	# detected_text: nullable
	# image_label: nullable
	# mime_type: nullable

		# Optional fields
	coordinates: str | None = Field(default=None)
	date: datetime.date | None = Field(default=None)
	detected_text: str | None = Field(default=None)
	filename: str | None = Field(default=None)
	image_label: str | None = Field(default=None)
	mime_type: str | None = Field(default=None)
	order_index: int | None = Field(default=None)


class MementoUpdate(CustomModelUpdate):
	"""Memento Update Schema."""

	# Primary Keys


	# Field properties:
	# caption: nullable
	# coordinates: nullable
	# date: nullable
	# location: nullable
	# user_id: has default value

		# Optional fields
	caption: str | None = Field(default=None)
	coordinates: str | None = Field(default=None)
	date: datetime.date | None = Field(default=None)
	location: str | None = Field(default=None)
	user_id: UUID4 | None = Field(default=None)


class MementosWithImagesUpdate(CustomModelUpdate):
	"""MementosWithImages Update Schema."""

	# Field properties:
	# caption: nullable
	# coordinates: nullable
	# date: nullable
	# detected_text: nullable
	# id: nullable
	# location: nullable
	# user_id: nullable

		# Optional fields
	caption: str | None = Field(default=None)
	coordinates: str | None = Field(default=None)
	date: datetime.date | None = Field(default=None)
	detected_text: str | None = Field(default=None)
	id: int | None = Field(default=None)
	location: str | None = Field(default=None)
	user_id: UUID4 | None = Field(default=None)


class UserInfoUpdate(CustomModelUpdate):
	"""UserInfo Update Schema."""

	# Primary Keys
	id: UUID4 | None = Field(default=None)

	# Field properties:
	# birthday: nullable

		# Optional fields
	birthday: datetime.date | None = Field(default=None)


# OPERATIONAL CLASSES


class Collection(CollectionBaseSchema):
	"""Collection Schema for Pydantic.

	Inherits from CollectionBaseSchema. Add any customization here.
	"""

	# Foreign Keys
	ids: list[HasMemento] | None = Field(default=None)


class HasMemento(HasMementoBaseSchema):
	"""HasMemento Schema for Pydantic.

	Inherits from HasMementoBaseSchema. Add any customization here.
	"""

	# Foreign Keys
	collection_ids: list[Collection] | None = Field(default=None)
	memento_ids: list[Memento] | None = Field(default=None)


class Image(ImageBaseSchema):
	"""Image Schema for Pydantic.

	Inherits from ImageBaseSchema. Add any customization here.
	"""

	# Foreign Keys
	memento_ids: list[Memento] | None = Field(default=None)


class Memento(MementoBaseSchema):
	"""Memento Schema for Pydantic.

	Inherits from MementoBaseSchema. Add any customization here.
	"""

	# Foreign Keys
	ids: list[HasMemento] | None = Field(default=None)
	ids: list[Image] | None = Field(default=None)


class MementosWithImages(MementosWithImagesBaseSchema):
	"""MementosWithImages Schema for Pydantic.

	Inherits from MementosWithImagesBaseSchema. Add any customization here.
	"""



class UserInfo(UserInfoBaseSchema):
	"""UserInfo Schema for Pydantic.

	Inherits from UserInfoBaseSchema. Add any customization here.
	"""

