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


class UserInfoBaseSchema(CustomModel):
	"""UserInfo Base Schema."""

	# Primary Keys
	id: UUID4

	# Columns
	birthday: datetime.date | None = Field(default=None)
# INSERT CLASSES
# Note: These models are used for insert operations. Auto-generated fields
# (like IDs and timestamps) are optional.


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


class UserInfoUpdate(CustomModelUpdate):
	"""UserInfo Update Schema."""

	# Primary Keys
	id: UUID4 | None = Field(default=None)

	# Field properties:
	# birthday: nullable

		# Optional fields
	birthday: datetime.date | None = Field(default=None)


# OPERATIONAL CLASSES


class UserInfo(UserInfoBaseSchema):
	"""UserInfo Schema for Pydantic.

	Inherits from UserInfoBaseSchema. Add any customization here.
	"""

