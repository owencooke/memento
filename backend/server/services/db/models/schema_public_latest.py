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


class CollectionsBaseSchema(CustomModel):
	"""Collections Base Schema."""

	# Primary Keys
	id: int

	# Columns
	caption: str | None = Field(default=None)
	created_at: datetime.datetime
	title: str
	updated_at: datetime.datetime
	user_id: UUID4


class UserInfoBaseSchema(CustomModel):
	"""UserInfo Base Schema."""

	# Primary Keys
	id: UUID4

	# Columns
	birthday: datetime.date | None = Field(default=None)
# INSERT CLASSES
# Note: These models are used for insert operations. Auto-generated fields
# (like IDs and timestamps) are optional.


class CollectionsInsert(CustomModelInsert):
	"""Collections Insert Schema."""

	# Primary Keys


	# Field properties:
	# caption: nullable
	# created_at: has default value
	# updated_at: has default value
	# user_id: has default value

	# Required fields
	title: str

		# Optional fields
	caption: str | None = Field(default=None)
	created_at: datetime.datetime | None = Field(default=None)
	updated_at: datetime.datetime | None = Field(default=None)
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


class CollectionsUpdate(CustomModelUpdate):
	"""Collections Update Schema."""

	# Primary Keys


	# Field properties:
	# caption: nullable
	# created_at: has default value
	# updated_at: has default value
	# user_id: has default value

		# Optional fields
	caption: str | None = Field(default=None)
	created_at: datetime.datetime | None = Field(default=None)
	title: str | None = Field(default=None)
	updated_at: datetime.datetime | None = Field(default=None)
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


class Collections(CollectionsBaseSchema):
	"""Collections Schema for Pydantic.

	Inherits from CollectionsBaseSchema. Add any customization here.
	"""

	# Foreign Keys
	user_ids: list[UserInfo] | None = Field(default=None)


class UserInfo(UserInfoBaseSchema):
	"""UserInfo Schema for Pydantic.

	Inherits from UserInfoBaseSchema. Add any customization here.
	"""

	# Foreign Keys
	ids: list[Collections] | None = Field(default=None)
