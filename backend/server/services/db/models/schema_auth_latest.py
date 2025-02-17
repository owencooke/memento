from __future__ import annotations

import datetime
from ipaddress import IPv4Address, IPv6Address

from pydantic import UUID4, BaseModel, Field, Json

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


class AuditLogEntriesBaseSchema(CustomModel):
	"""AuditLogEntries Base Schema."""

	# Primary Keys
	id: UUID4

	# Columns
	created_at: datetime.datetime | None = Field(default=None)
	instance_id: UUID4 | None = Field(default=None)
	ip_address: str
	payload: dict | Json | None = Field(default=None)


class FlowStateBaseSchema(CustomModel):
	"""FlowState Base Schema."""

	# Primary Keys
	id: UUID4

	# Columns
	auth_code: str
	auth_code_issued_at: datetime.datetime | None = Field(default=None)
	authentication_method: str
	code_challenge: str
	code_challenge_method: str
	created_at: datetime.datetime | None = Field(default=None)
	provider_access_token: str | None = Field(default=None)
	provider_refresh_token: str | None = Field(default=None)
	provider_type: str
	updated_at: datetime.datetime | None = Field(default=None)
	user_id: UUID4 | None = Field(default=None)


class IdentitiesBaseSchema(CustomModel):
	"""Identities Base Schema."""

	# Primary Keys
	id: UUID4

	# Columns
	created_at: datetime.datetime | None = Field(default=None)
	email: str | None = Field(default=None)
	identity_data: dict | Json
	last_sign_in_at: datetime.datetime | None = Field(default=None)
	provider: str
	provider_id: str
	updated_at: datetime.datetime | None = Field(default=None)
	user_id: UUID4


class InstancesBaseSchema(CustomModel):
	"""Instances Base Schema."""

	# Primary Keys
	id: UUID4

	# Columns
	created_at: datetime.datetime | None = Field(default=None)
	raw_base_config: str | None = Field(default=None)
	updated_at: datetime.datetime | None = Field(default=None)
	uuid: UUID4 | None = Field(default=None)


class MfaAmrClaimsBaseSchema(CustomModel):
	"""MfaAmrClaims Base Schema."""

	# Primary Keys
	id: UUID4

	# Columns
	authentication_method: str
	created_at: datetime.datetime
	session_id: UUID4
	updated_at: datetime.datetime


class MfaChallengesBaseSchema(CustomModel):
	"""MfaChallenges Base Schema."""

	# Primary Keys
	id: UUID4

	# Columns
	created_at: datetime.datetime
	factor_id: UUID4
	ip_address: IPv4Address | IPv6Address
	otp_code: str | None = Field(default=None)
	verified_at: datetime.datetime | None = Field(default=None)
	web_authn_session_data: dict | Json | None = Field(default=None)


class MfaFactorsBaseSchema(CustomModel):
	"""MfaFactors Base Schema."""

	# Primary Keys
	id: UUID4

	# Columns
	created_at: datetime.datetime
	factor_type: str
	friendly_name: str | None = Field(default=None)
	last_challenged_at: datetime.datetime | None = Field(default=None)
	phone: str | None = Field(default=None)
	secret: str | None = Field(default=None)
	status: str
	updated_at: datetime.datetime
	user_id: UUID4
	web_authn_aaguid: UUID4 | None = Field(default=None)
	web_authn_credential: dict | Json | None = Field(default=None)


class OneTimeTokensBaseSchema(CustomModel):
	"""OneTimeTokens Base Schema."""

	# Primary Keys
	id: UUID4

	# Columns
	created_at: datetime.datetime
	relates_to: str
	token_hash: str
	token_type: str
	updated_at: datetime.datetime
	user_id: UUID4


class RefreshTokensBaseSchema(CustomModel):
	"""RefreshTokens Base Schema."""

	# Primary Keys
	id: int

	# Columns
	created_at: datetime.datetime | None = Field(default=None)
	instance_id: UUID4 | None = Field(default=None)
	parent: str | None = Field(default=None)
	revoked: bool | None = Field(default=None)
	session_id: UUID4 | None = Field(default=None)
	token: str | None = Field(default=None)
	updated_at: datetime.datetime | None = Field(default=None)
	user_id: str | None = Field(default=None)


class SamlProvidersBaseSchema(CustomModel):
	"""SamlProviders Base Schema."""

	# Primary Keys
	id: UUID4

	# Columns
	attribute_mapping: dict | Json | None = Field(default=None)
	created_at: datetime.datetime | None = Field(default=None)
	entity_id: str
	metadata_url: str | None = Field(default=None)
	metadata_xml: str
	name_id_format: str | None = Field(default=None)
	sso_provider_id: UUID4
	updated_at: datetime.datetime | None = Field(default=None)


class SamlRelayStatesBaseSchema(CustomModel):
	"""SamlRelayStates Base Schema."""

	# Primary Keys
	id: UUID4

	# Columns
	created_at: datetime.datetime | None = Field(default=None)
	flow_state_id: UUID4 | None = Field(default=None)
	for_email: str | None = Field(default=None)
	redirect_to: str | None = Field(default=None)
	request_id: str
	sso_provider_id: UUID4
	updated_at: datetime.datetime | None = Field(default=None)


class SchemaMigrationsBaseSchema(CustomModel):
	"""SchemaMigrations Base Schema."""

	# Primary Keys
	version: str


class SessionsBaseSchema(CustomModel):
	"""Sessions Base Schema."""

	# Primary Keys
	id: UUID4

	# Columns
	aal: str | None = Field(default=None)
	created_at: datetime.datetime | None = Field(default=None)
	factor_id: UUID4 | None = Field(default=None)
	ip: IPv4Address | IPv6Address | None = Field(default=None)
	not_after: datetime.datetime | None = Field(default=None)
	refreshed_at: datetime.datetime | None = Field(default=None)
	tag: str | None = Field(default=None)
	updated_at: datetime.datetime | None = Field(default=None)
	user_agent: str | None = Field(default=None)
	user_id: UUID4


class SsoDomainsBaseSchema(CustomModel):
	"""SsoDomains Base Schema."""

	# Primary Keys
	id: UUID4

	# Columns
	created_at: datetime.datetime | None = Field(default=None)
	domain: str
	sso_provider_id: UUID4
	updated_at: datetime.datetime | None = Field(default=None)


class SsoProvidersBaseSchema(CustomModel):
	"""SsoProviders Base Schema."""

	# Primary Keys
	id: UUID4

	# Columns
	created_at: datetime.datetime | None = Field(default=None)
	resource_id: str | None = Field(default=None)
	updated_at: datetime.datetime | None = Field(default=None)


class UsersBaseSchema(CustomModel):
	"""Users Base Schema."""

	# Primary Keys
	id: UUID4

	# Columns
	aud: str | None = Field(default=None)
	banned_until: datetime.datetime | None = Field(default=None)
	confirmation_sent_at: datetime.datetime | None = Field(default=None)
	confirmation_token: str | None = Field(default=None)
	confirmed_at: datetime.datetime | None = Field(default=None)
	created_at: datetime.datetime | None = Field(default=None)
	deleted_at: datetime.datetime | None = Field(default=None)
	email: str | None = Field(default=None)
	email_change: str | None = Field(default=None)
	email_change_confirm_status: int | None = Field(default=None)
	email_change_sent_at: datetime.datetime | None = Field(default=None)
	email_change_token_current: str | None = Field(default=None)
	email_change_token_new: str | None = Field(default=None)
	email_confirmed_at: datetime.datetime | None = Field(default=None)
	encrypted_password: str | None = Field(default=None)
	instance_id: UUID4 | None = Field(default=None)
	invited_at: datetime.datetime | None = Field(default=None)
	is_anonymous: bool
	is_sso_user: bool
	is_super_admin: bool | None = Field(default=None)
	last_sign_in_at: datetime.datetime | None = Field(default=None)
	phone: str | None = Field(default=None)
	phone_change: str | None = Field(default=None)
	phone_change_sent_at: datetime.datetime | None = Field(default=None)
	phone_change_token: str | None = Field(default=None)
	phone_confirmed_at: datetime.datetime | None = Field(default=None)
	raw_app_meta_data: dict | Json | None = Field(default=None)
	raw_user_meta_data: dict | Json | None = Field(default=None)
	reauthentication_sent_at: datetime.datetime | None = Field(default=None)
	reauthentication_token: str | None = Field(default=None)
	recovery_sent_at: datetime.datetime | None = Field(default=None)
	recovery_token: str | None = Field(default=None)
	role: str | None = Field(default=None)
	updated_at: datetime.datetime | None = Field(default=None)
# INSERT CLASSES
# Note: These models are used for insert operations. Auto-generated fields
# (like IDs and timestamps) are optional.


class AuditLogEntriesInsert(CustomModelInsert):
	"""AuditLogEntries Insert Schema."""

	# Primary Keys
	id: UUID4

	# Field properties:
	# created_at: nullable
	# instance_id: nullable
	# ip_address: has default value
	# payload: nullable

		# Optional fields
	created_at: datetime.datetime | None = Field(default=None)
	instance_id: UUID4 | None = Field(default=None)
	ip_address: str | None = Field(default=None)
	payload: dict | Json | None = Field(default=None)


class FlowStateInsert(CustomModelInsert):
	"""FlowState Insert Schema."""

	# Primary Keys
	id: UUID4

	# Field properties:
	# auth_code_issued_at: nullable
	# created_at: nullable
	# provider_access_token: nullable
	# provider_refresh_token: nullable
	# updated_at: nullable
	# user_id: nullable

	# Required fields
	auth_code: str
	authentication_method: str
	code_challenge: str
	code_challenge_method: str
	provider_type: str

		# Optional fields
	auth_code_issued_at: datetime.datetime | None = Field(default=None)
	created_at: datetime.datetime | None = Field(default=None)
	provider_access_token: str | None = Field(default=None)
	provider_refresh_token: str | None = Field(default=None)
	updated_at: datetime.datetime | None = Field(default=None)
	user_id: UUID4 | None = Field(default=None)


class IdentitiesInsert(CustomModelInsert):
	"""Identities Insert Schema."""

	# Primary Keys
	id: UUID4 | None = Field(default=None)  # has default value

	# Field properties:
	# created_at: nullable
	# email: nullable
	# last_sign_in_at: nullable
	# updated_at: nullable

	# Required fields
	identity_data: dict | Json
	provider: str
	provider_id: str
	user_id: UUID4

		# Optional fields
	created_at: datetime.datetime | None = Field(default=None)
	email: str | None = Field(default=None)
	last_sign_in_at: datetime.datetime | None = Field(default=None)
	updated_at: datetime.datetime | None = Field(default=None)


class InstancesInsert(CustomModelInsert):
	"""Instances Insert Schema."""

	# Primary Keys
	id: UUID4

	# Field properties:
	# created_at: nullable
	# raw_base_config: nullable
	# updated_at: nullable
	# uuid: nullable

		# Optional fields
	created_at: datetime.datetime | None = Field(default=None)
	raw_base_config: str | None = Field(default=None)
	updated_at: datetime.datetime | None = Field(default=None)
	uuid: UUID4 | None = Field(default=None)


class MfaAmrClaimsInsert(CustomModelInsert):
	"""MfaAmrClaims Insert Schema."""

	# Primary Keys
	id: UUID4

# Required fields
	authentication_method: str
	created_at: datetime.datetime
	session_id: UUID4
	updated_at: datetime.datetime


class MfaChallengesInsert(CustomModelInsert):
	"""MfaChallenges Insert Schema."""

	# Primary Keys
	id: UUID4

	# Field properties:
	# otp_code: nullable
	# verified_at: nullable
	# web_authn_session_data: nullable

	# Required fields
	created_at: datetime.datetime
	factor_id: UUID4
	ip_address: IPv4Address | IPv6Address

		# Optional fields
	otp_code: str | None = Field(default=None)
	verified_at: datetime.datetime | None = Field(default=None)
	web_authn_session_data: dict | Json | None = Field(default=None)


class MfaFactorsInsert(CustomModelInsert):
	"""MfaFactors Insert Schema."""

	# Primary Keys
	id: UUID4

	# Field properties:
	# friendly_name: nullable
	# last_challenged_at: nullable
	# phone: nullable
	# secret: nullable
	# web_authn_aaguid: nullable
	# web_authn_credential: nullable

	# Required fields
	created_at: datetime.datetime
	factor_type: str
	status: str
	updated_at: datetime.datetime
	user_id: UUID4

		# Optional fields
	friendly_name: str | None = Field(default=None)
	last_challenged_at: datetime.datetime | None = Field(default=None)
	phone: str | None = Field(default=None)
	secret: str | None = Field(default=None)
	web_authn_aaguid: UUID4 | None = Field(default=None)
	web_authn_credential: dict | Json | None = Field(default=None)


class OneTimeTokensInsert(CustomModelInsert):
	"""OneTimeTokens Insert Schema."""

	# Primary Keys
	id: UUID4

	# Field properties:
	# created_at: has default value
	# updated_at: has default value

	# Required fields
	relates_to: str
	token_hash: str
	token_type: str
	user_id: UUID4

		# Optional fields
	created_at: datetime.datetime | None = Field(default=None)
	updated_at: datetime.datetime | None = Field(default=None)


class RefreshTokensInsert(CustomModelInsert):
	"""RefreshTokens Insert Schema."""

	# Primary Keys
	id: int | None = Field(default=None)  # has default value, auto-generated

	# Field properties:
	# created_at: nullable
	# instance_id: nullable
	# parent: nullable
	# revoked: nullable
	# session_id: nullable
	# token: nullable
	# updated_at: nullable
	# user_id: nullable

		# Optional fields
	created_at: datetime.datetime | None = Field(default=None)
	instance_id: UUID4 | None = Field(default=None)
	parent: str | None = Field(default=None)
	revoked: bool | None = Field(default=None)
	session_id: UUID4 | None = Field(default=None)
	token: str | None = Field(default=None)
	updated_at: datetime.datetime | None = Field(default=None)
	user_id: str | None = Field(default=None)


class SamlProvidersInsert(CustomModelInsert):
	"""SamlProviders Insert Schema."""

	# Primary Keys
	id: UUID4

	# Field properties:
	# attribute_mapping: nullable
	# created_at: nullable
	# metadata_url: nullable
	# name_id_format: nullable
	# updated_at: nullable

	# Required fields
	entity_id: str
	metadata_xml: str
	sso_provider_id: UUID4

		# Optional fields
	attribute_mapping: dict | Json | None = Field(default=None)
	created_at: datetime.datetime | None = Field(default=None)
	metadata_url: str | None = Field(default=None)
	name_id_format: str | None = Field(default=None)
	updated_at: datetime.datetime | None = Field(default=None)


class SamlRelayStatesInsert(CustomModelInsert):
	"""SamlRelayStates Insert Schema."""

	# Primary Keys
	id: UUID4

	# Field properties:
	# created_at: nullable
	# flow_state_id: nullable
	# for_email: nullable
	# redirect_to: nullable
	# updated_at: nullable

	# Required fields
	request_id: str
	sso_provider_id: UUID4

		# Optional fields
	created_at: datetime.datetime | None = Field(default=None)
	flow_state_id: UUID4 | None = Field(default=None)
	for_email: str | None = Field(default=None)
	redirect_to: str | None = Field(default=None)
	updated_at: datetime.datetime | None = Field(default=None)


class SchemaMigrationsInsert(CustomModelInsert):
	"""SchemaMigrations Insert Schema."""

	# Primary Keys
	version: str


class SessionsInsert(CustomModelInsert):
	"""Sessions Insert Schema."""

	# Primary Keys
	id: UUID4

	# Field properties:
	# aal: nullable
	# created_at: nullable
	# factor_id: nullable
	# ip: nullable
	# not_after: nullable
	# refreshed_at: nullable
	# tag: nullable
	# updated_at: nullable
	# user_agent: nullable

	# Required fields
	user_id: UUID4

		# Optional fields
	aal: str | None = Field(default=None)
	created_at: datetime.datetime | None = Field(default=None)
	factor_id: UUID4 | None = Field(default=None)
	ip: IPv4Address | IPv6Address | None = Field(default=None)
	not_after: datetime.datetime | None = Field(default=None)
	refreshed_at: datetime.datetime | None = Field(default=None)
	tag: str | None = Field(default=None)
	updated_at: datetime.datetime | None = Field(default=None)
	user_agent: str | None = Field(default=None)


class SsoDomainsInsert(CustomModelInsert):
	"""SsoDomains Insert Schema."""

	# Primary Keys
	id: UUID4

	# Field properties:
	# created_at: nullable
	# updated_at: nullable

	# Required fields
	domain: str
	sso_provider_id: UUID4

		# Optional fields
	created_at: datetime.datetime | None = Field(default=None)
	updated_at: datetime.datetime | None = Field(default=None)


class SsoProvidersInsert(CustomModelInsert):
	"""SsoProviders Insert Schema."""

	# Primary Keys
	id: UUID4

	# Field properties:
	# created_at: nullable
	# resource_id: nullable
	# updated_at: nullable

		# Optional fields
	created_at: datetime.datetime | None = Field(default=None)
	resource_id: str | None = Field(default=None)
	updated_at: datetime.datetime | None = Field(default=None)


class UsersInsert(CustomModelInsert):
	"""Users Insert Schema."""

	# Primary Keys
	id: UUID4

	# Field properties:
	# aud: nullable
	# banned_until: nullable
	# confirmation_sent_at: nullable
	# confirmation_token: nullable
	# confirmed_at: nullable
	# created_at: nullable
	# deleted_at: nullable
	# email: nullable
	# email_change: nullable
	# email_change_confirm_status: nullable, has default value
	# email_change_sent_at: nullable
	# email_change_token_current: nullable, has default value
	# email_change_token_new: nullable
	# email_confirmed_at: nullable
	# encrypted_password: nullable
	# instance_id: nullable
	# invited_at: nullable
	# is_anonymous: has default value
	# is_sso_user: has default value
	# is_super_admin: nullable
	# last_sign_in_at: nullable
	# phone: nullable, has default value
	# phone_change: nullable, has default value
	# phone_change_sent_at: nullable
	# phone_change_token: nullable, has default value
	# phone_confirmed_at: nullable
	# raw_app_meta_data: nullable
	# raw_user_meta_data: nullable
	# reauthentication_sent_at: nullable
	# reauthentication_token: nullable, has default value
	# recovery_sent_at: nullable
	# recovery_token: nullable
	# role: nullable
	# updated_at: nullable

		# Optional fields
	aud: str | None = Field(default=None)
	banned_until: datetime.datetime | None = Field(default=None)
	confirmation_sent_at: datetime.datetime | None = Field(default=None)
	confirmation_token: str | None = Field(default=None)
	confirmed_at: datetime.datetime | None = Field(default=None)
	created_at: datetime.datetime | None = Field(default=None)
	deleted_at: datetime.datetime | None = Field(default=None)
	email: str | None = Field(default=None)
	email_change: str | None = Field(default=None)
	email_change_confirm_status: int | None = Field(default=None)
	email_change_sent_at: datetime.datetime | None = Field(default=None)
	email_change_token_current: str | None = Field(default=None)
	email_change_token_new: str | None = Field(default=None)
	email_confirmed_at: datetime.datetime | None = Field(default=None)
	encrypted_password: str | None = Field(default=None)
	instance_id: UUID4 | None = Field(default=None)
	invited_at: datetime.datetime | None = Field(default=None)
	is_anonymous: bool | None = Field(default=None)
	is_sso_user: bool | None = Field(default=None)
	is_super_admin: bool | None = Field(default=None)
	last_sign_in_at: datetime.datetime | None = Field(default=None)
	phone: str | None = Field(default=None)
	phone_change: str | None = Field(default=None)
	phone_change_sent_at: datetime.datetime | None = Field(default=None)
	phone_change_token: str | None = Field(default=None)
	phone_confirmed_at: datetime.datetime | None = Field(default=None)
	raw_app_meta_data: dict | Json | None = Field(default=None)
	raw_user_meta_data: dict | Json | None = Field(default=None)
	reauthentication_sent_at: datetime.datetime | None = Field(default=None)
	reauthentication_token: str | None = Field(default=None)
	recovery_sent_at: datetime.datetime | None = Field(default=None)
	recovery_token: str | None = Field(default=None)
	role: str | None = Field(default=None)
	updated_at: datetime.datetime | None = Field(default=None)
# UPDATE CLASSES
# Note: These models are used for update operations. All fields are optional.


class AuditLogEntriesUpdate(CustomModelUpdate):
	"""AuditLogEntries Update Schema."""

	# Primary Keys
	id: UUID4 | None = Field(default=None)

	# Field properties:
	# created_at: nullable
	# instance_id: nullable
	# ip_address: has default value
	# payload: nullable

		# Optional fields
	created_at: datetime.datetime | None = Field(default=None)
	instance_id: UUID4 | None = Field(default=None)
	ip_address: str | None = Field(default=None)
	payload: dict | Json | None = Field(default=None)


class FlowStateUpdate(CustomModelUpdate):
	"""FlowState Update Schema."""

	# Primary Keys
	id: UUID4 | None = Field(default=None)

	# Field properties:
	# auth_code_issued_at: nullable
	# created_at: nullable
	# provider_access_token: nullable
	# provider_refresh_token: nullable
	# updated_at: nullable
	# user_id: nullable

		# Optional fields
	auth_code: str | None = Field(default=None)
	auth_code_issued_at: datetime.datetime | None = Field(default=None)
	authentication_method: str | None = Field(default=None)
	code_challenge: str | None = Field(default=None)
	code_challenge_method: str | None = Field(default=None)
	created_at: datetime.datetime | None = Field(default=None)
	provider_access_token: str | None = Field(default=None)
	provider_refresh_token: str | None = Field(default=None)
	provider_type: str | None = Field(default=None)
	updated_at: datetime.datetime | None = Field(default=None)
	user_id: UUID4 | None = Field(default=None)


class IdentitiesUpdate(CustomModelUpdate):
	"""Identities Update Schema."""

	# Primary Keys
	id: UUID4 | None = Field(default=None)

	# Field properties:
	# created_at: nullable
	# email: nullable
	# last_sign_in_at: nullable
	# updated_at: nullable

		# Optional fields
	created_at: datetime.datetime | None = Field(default=None)
	email: str | None = Field(default=None)
	identity_data: dict | Json | None = Field(default=None)
	last_sign_in_at: datetime.datetime | None = Field(default=None)
	provider: str | None = Field(default=None)
	provider_id: str | None = Field(default=None)
	updated_at: datetime.datetime | None = Field(default=None)
	user_id: UUID4 | None = Field(default=None)


class InstancesUpdate(CustomModelUpdate):
	"""Instances Update Schema."""

	# Primary Keys
	id: UUID4 | None = Field(default=None)

	# Field properties:
	# created_at: nullable
	# raw_base_config: nullable
	# updated_at: nullable
	# uuid: nullable

		# Optional fields
	created_at: datetime.datetime | None = Field(default=None)
	raw_base_config: str | None = Field(default=None)
	updated_at: datetime.datetime | None = Field(default=None)
	uuid: UUID4 | None = Field(default=None)


class MfaAmrClaimsUpdate(CustomModelUpdate):
	"""MfaAmrClaims Update Schema."""

	# Primary Keys
	id: UUID4 | None = Field(default=None)

	# Optional fields
	authentication_method: str | None = Field(default=None)
	created_at: datetime.datetime | None = Field(default=None)
	session_id: UUID4 | None = Field(default=None)
	updated_at: datetime.datetime | None = Field(default=None)


class MfaChallengesUpdate(CustomModelUpdate):
	"""MfaChallenges Update Schema."""

	# Primary Keys
	id: UUID4 | None = Field(default=None)

	# Field properties:
	# otp_code: nullable
	# verified_at: nullable
	# web_authn_session_data: nullable

		# Optional fields
	created_at: datetime.datetime | None = Field(default=None)
	factor_id: UUID4 | None = Field(default=None)
	ip_address: IPv4Address | IPv6Address | None = Field(default=None)
	otp_code: str | None = Field(default=None)
	verified_at: datetime.datetime | None = Field(default=None)
	web_authn_session_data: dict | Json | None = Field(default=None)


class MfaFactorsUpdate(CustomModelUpdate):
	"""MfaFactors Update Schema."""

	# Primary Keys
	id: UUID4 | None = Field(default=None)

	# Field properties:
	# friendly_name: nullable
	# last_challenged_at: nullable
	# phone: nullable
	# secret: nullable
	# web_authn_aaguid: nullable
	# web_authn_credential: nullable

		# Optional fields
	created_at: datetime.datetime | None = Field(default=None)
	factor_type: str | None = Field(default=None)
	friendly_name: str | None = Field(default=None)
	last_challenged_at: datetime.datetime | None = Field(default=None)
	phone: str | None = Field(default=None)
	secret: str | None = Field(default=None)
	status: str | None = Field(default=None)
	updated_at: datetime.datetime | None = Field(default=None)
	user_id: UUID4 | None = Field(default=None)
	web_authn_aaguid: UUID4 | None = Field(default=None)
	web_authn_credential: dict | Json | None = Field(default=None)


class OneTimeTokensUpdate(CustomModelUpdate):
	"""OneTimeTokens Update Schema."""

	# Primary Keys
	id: UUID4 | None = Field(default=None)

	# Field properties:
	# created_at: has default value
	# updated_at: has default value

		# Optional fields
	created_at: datetime.datetime | None = Field(default=None)
	relates_to: str | None = Field(default=None)
	token_hash: str | None = Field(default=None)
	token_type: str | None = Field(default=None)
	updated_at: datetime.datetime | None = Field(default=None)
	user_id: UUID4 | None = Field(default=None)


class RefreshTokensUpdate(CustomModelUpdate):
	"""RefreshTokens Update Schema."""

	# Primary Keys
	id: int | None = Field(default=None)

	# Field properties:
	# created_at: nullable
	# instance_id: nullable
	# parent: nullable
	# revoked: nullable
	# session_id: nullable
	# token: nullable
	# updated_at: nullable
	# user_id: nullable

		# Optional fields
	created_at: datetime.datetime | None = Field(default=None)
	instance_id: UUID4 | None = Field(default=None)
	parent: str | None = Field(default=None)
	revoked: bool | None = Field(default=None)
	session_id: UUID4 | None = Field(default=None)
	token: str | None = Field(default=None)
	updated_at: datetime.datetime | None = Field(default=None)
	user_id: str | None = Field(default=None)


class SamlProvidersUpdate(CustomModelUpdate):
	"""SamlProviders Update Schema."""

	# Primary Keys
	id: UUID4 | None = Field(default=None)

	# Field properties:
	# attribute_mapping: nullable
	# created_at: nullable
	# metadata_url: nullable
	# name_id_format: nullable
	# updated_at: nullable

		# Optional fields
	attribute_mapping: dict | Json | None = Field(default=None)
	created_at: datetime.datetime | None = Field(default=None)
	entity_id: str | None = Field(default=None)
	metadata_url: str | None = Field(default=None)
	metadata_xml: str | None = Field(default=None)
	name_id_format: str | None = Field(default=None)
	sso_provider_id: UUID4 | None = Field(default=None)
	updated_at: datetime.datetime | None = Field(default=None)


class SamlRelayStatesUpdate(CustomModelUpdate):
	"""SamlRelayStates Update Schema."""

	# Primary Keys
	id: UUID4 | None = Field(default=None)

	# Field properties:
	# created_at: nullable
	# flow_state_id: nullable
	# for_email: nullable
	# redirect_to: nullable
	# updated_at: nullable

		# Optional fields
	created_at: datetime.datetime | None = Field(default=None)
	flow_state_id: UUID4 | None = Field(default=None)
	for_email: str | None = Field(default=None)
	redirect_to: str | None = Field(default=None)
	request_id: str | None = Field(default=None)
	sso_provider_id: UUID4 | None = Field(default=None)
	updated_at: datetime.datetime | None = Field(default=None)


class SchemaMigrationsUpdate(CustomModelUpdate):
	"""SchemaMigrations Update Schema."""

	# Primary Keys
	version: str | None = Field(default=None)


class SessionsUpdate(CustomModelUpdate):
	"""Sessions Update Schema."""

	# Primary Keys
	id: UUID4 | None = Field(default=None)

	# Field properties:
	# aal: nullable
	# created_at: nullable
	# factor_id: nullable
	# ip: nullable
	# not_after: nullable
	# refreshed_at: nullable
	# tag: nullable
	# updated_at: nullable
	# user_agent: nullable

		# Optional fields
	aal: str | None = Field(default=None)
	created_at: datetime.datetime | None = Field(default=None)
	factor_id: UUID4 | None = Field(default=None)
	ip: IPv4Address | IPv6Address | None = Field(default=None)
	not_after: datetime.datetime | None = Field(default=None)
	refreshed_at: datetime.datetime | None = Field(default=None)
	tag: str | None = Field(default=None)
	updated_at: datetime.datetime | None = Field(default=None)
	user_agent: str | None = Field(default=None)
	user_id: UUID4 | None = Field(default=None)


class SsoDomainsUpdate(CustomModelUpdate):
	"""SsoDomains Update Schema."""

	# Primary Keys
	id: UUID4 | None = Field(default=None)

	# Field properties:
	# created_at: nullable
	# updated_at: nullable

		# Optional fields
	created_at: datetime.datetime | None = Field(default=None)
	domain: str | None = Field(default=None)
	sso_provider_id: UUID4 | None = Field(default=None)
	updated_at: datetime.datetime | None = Field(default=None)


class SsoProvidersUpdate(CustomModelUpdate):
	"""SsoProviders Update Schema."""

	# Primary Keys
	id: UUID4 | None = Field(default=None)

	# Field properties:
	# created_at: nullable
	# resource_id: nullable
	# updated_at: nullable

		# Optional fields
	created_at: datetime.datetime | None = Field(default=None)
	resource_id: str | None = Field(default=None)
	updated_at: datetime.datetime | None = Field(default=None)


class UsersUpdate(CustomModelUpdate):
	"""Users Update Schema."""

	# Primary Keys
	id: UUID4 | None = Field(default=None)

	# Field properties:
	# aud: nullable
	# banned_until: nullable
	# confirmation_sent_at: nullable
	# confirmation_token: nullable
	# confirmed_at: nullable
	# created_at: nullable
	# deleted_at: nullable
	# email: nullable
	# email_change: nullable
	# email_change_confirm_status: nullable, has default value
	# email_change_sent_at: nullable
	# email_change_token_current: nullable, has default value
	# email_change_token_new: nullable
	# email_confirmed_at: nullable
	# encrypted_password: nullable
	# instance_id: nullable
	# invited_at: nullable
	# is_anonymous: has default value
	# is_sso_user: has default value
	# is_super_admin: nullable
	# last_sign_in_at: nullable
	# phone: nullable, has default value
	# phone_change: nullable, has default value
	# phone_change_sent_at: nullable
	# phone_change_token: nullable, has default value
	# phone_confirmed_at: nullable
	# raw_app_meta_data: nullable
	# raw_user_meta_data: nullable
	# reauthentication_sent_at: nullable
	# reauthentication_token: nullable, has default value
	# recovery_sent_at: nullable
	# recovery_token: nullable
	# role: nullable
	# updated_at: nullable

		# Optional fields
	aud: str | None = Field(default=None)
	banned_until: datetime.datetime | None = Field(default=None)
	confirmation_sent_at: datetime.datetime | None = Field(default=None)
	confirmation_token: str | None = Field(default=None)
	confirmed_at: datetime.datetime | None = Field(default=None)
	created_at: datetime.datetime | None = Field(default=None)
	deleted_at: datetime.datetime | None = Field(default=None)
	email: str | None = Field(default=None)
	email_change: str | None = Field(default=None)
	email_change_confirm_status: int | None = Field(default=None)
	email_change_sent_at: datetime.datetime | None = Field(default=None)
	email_change_token_current: str | None = Field(default=None)
	email_change_token_new: str | None = Field(default=None)
	email_confirmed_at: datetime.datetime | None = Field(default=None)
	encrypted_password: str | None = Field(default=None)
	instance_id: UUID4 | None = Field(default=None)
	invited_at: datetime.datetime | None = Field(default=None)
	is_anonymous: bool | None = Field(default=None)
	is_sso_user: bool | None = Field(default=None)
	is_super_admin: bool | None = Field(default=None)
	last_sign_in_at: datetime.datetime | None = Field(default=None)
	phone: str | None = Field(default=None)
	phone_change: str | None = Field(default=None)
	phone_change_sent_at: datetime.datetime | None = Field(default=None)
	phone_change_token: str | None = Field(default=None)
	phone_confirmed_at: datetime.datetime | None = Field(default=None)
	raw_app_meta_data: dict | Json | None = Field(default=None)
	raw_user_meta_data: dict | Json | None = Field(default=None)
	reauthentication_sent_at: datetime.datetime | None = Field(default=None)
	reauthentication_token: str | None = Field(default=None)
	recovery_sent_at: datetime.datetime | None = Field(default=None)
	recovery_token: str | None = Field(default=None)
	role: str | None = Field(default=None)
	updated_at: datetime.datetime | None = Field(default=None)


# OPERATIONAL CLASSES


class AuditLogEntries(AuditLogEntriesBaseSchema):
	"""AuditLogEntries Schema for Pydantic.

	Inherits from AuditLogEntriesBaseSchema. Add any customization here.
	"""



class FlowState(FlowStateBaseSchema):
	"""FlowState Schema for Pydantic.

	Inherits from FlowStateBaseSchema. Add any customization here.
	"""

	# Foreign Keys
	ids: list[SamlRelayStates] | None = Field(default=None)


class Identities(IdentitiesBaseSchema):
	"""Identities Schema for Pydantic.

	Inherits from IdentitiesBaseSchema. Add any customization here.
	"""

	# Foreign Keys
	user_ids: list[Users] | None = Field(default=None)


class Instances(InstancesBaseSchema):
	"""Instances Schema for Pydantic.

	Inherits from InstancesBaseSchema. Add any customization here.
	"""



class MfaAmrClaims(MfaAmrClaimsBaseSchema):
	"""MfaAmrClaims Schema for Pydantic.

	Inherits from MfaAmrClaimsBaseSchema. Add any customization here.
	"""

	# Foreign Keys
	session_ids: list[Sessions] | None = Field(default=None)


class MfaChallenges(MfaChallengesBaseSchema):
	"""MfaChallenges Schema for Pydantic.

	Inherits from MfaChallengesBaseSchema. Add any customization here.
	"""

	# Foreign Keys
	factor_ids: list[MfaFactors] | None = Field(default=None)


class MfaFactors(MfaFactorsBaseSchema):
	"""MfaFactors Schema for Pydantic.

	Inherits from MfaFactorsBaseSchema. Add any customization here.
	"""

	# Foreign Keys
	user_ids: list[Users] | None = Field(default=None)
	ids: list[MfaChallenges] | None = Field(default=None)


class OneTimeTokens(OneTimeTokensBaseSchema):
	"""OneTimeTokens Schema for Pydantic.

	Inherits from OneTimeTokensBaseSchema. Add any customization here.
	"""

	# Foreign Keys
	user_ids: list[Users] | None = Field(default=None)


class RefreshTokens(RefreshTokensBaseSchema):
	"""RefreshTokens Schema for Pydantic.

	Inherits from RefreshTokensBaseSchema. Add any customization here.
	"""

	# Foreign Keys
	session_ids: list[Sessions] | None = Field(default=None)


class SamlProviders(SamlProvidersBaseSchema):
	"""SamlProviders Schema for Pydantic.

	Inherits from SamlProvidersBaseSchema. Add any customization here.
	"""

	# Foreign Keys
	sso_provider_ids: list[SsoProviders] | None = Field(default=None)


class SamlRelayStates(SamlRelayStatesBaseSchema):
	"""SamlRelayStates Schema for Pydantic.

	Inherits from SamlRelayStatesBaseSchema. Add any customization here.
	"""

	# Foreign Keys
	flow_state_ids: list[FlowState] | None = Field(default=None)
	sso_provider_ids: list[SsoProviders] | None = Field(default=None)


class SchemaMigrations(SchemaMigrationsBaseSchema):
	"""SchemaMigrations Schema for Pydantic.

	Inherits from SchemaMigrationsBaseSchema. Add any customization here.
	"""



class Sessions(SessionsBaseSchema):
	"""Sessions Schema for Pydantic.

	Inherits from SessionsBaseSchema. Add any customization here.
	"""

	# Foreign Keys
	user_ids: list[Users] | None = Field(default=None)
	id: MfaAmrClaims | None = Field(default=None)
	ids: list[RefreshTokens] | None = Field(default=None)


class SsoDomains(SsoDomainsBaseSchema):
	"""SsoDomains Schema for Pydantic.

	Inherits from SsoDomainsBaseSchema. Add any customization here.
	"""

	# Foreign Keys
	sso_provider_ids: list[SsoProviders] | None = Field(default=None)


class SsoProviders(SsoProvidersBaseSchema):
	"""SsoProviders Schema for Pydantic.

	Inherits from SsoProvidersBaseSchema. Add any customization here.
	"""

	# Foreign Keys
	ids: list[SamlProviders] | None = Field(default=None)
	ids: list[SamlRelayStates] | None = Field(default=None)
	ids: list[SsoDomains] | None = Field(default=None)


class Users(UsersBaseSchema):
	"""Users Schema for Pydantic.

	Inherits from UsersBaseSchema. Add any customization here.
	"""

	# Foreign Keys
	ids: list[Identities] | None = Field(default=None)
	ids: list[MfaFactors] | None = Field(default=None)
	ids: list[OneTimeTokens] | None = Field(default=None)
	ids: list[Sessions] | None = Field(default=None)
