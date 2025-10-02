import {
  pgTable,
  integer,
  bigint,
  pgSchema,
  uuid,
  text,
  timestamp,
  uniqueIndex,
  index,
  check,
  varchar,
  jsonb,
  boolean,
  smallint,
  json,
  foreignKey,
  bigserial,
  inet,
  pgPolicy,
  unique,
  date,
  time,
  primaryKey,
  pgView,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const auth = pgSchema("auth");
export const aalLevelInAuth = auth.enum("aal_level", ["aal1", "aal2", "aal3"]);
export const codeChallengeMethodInAuth = auth.enum("code_challenge_method", [
  "s256",
  "plain",
]);
export const factorStatusInAuth = auth.enum("factor_status", [
  "unverified",
  "verified",
]);
export const factorTypeInAuth = auth.enum("factor_type", [
  "totp",
  "webauthn",
  "phone",
]);
export const oauthRegistrationTypeInAuth = auth.enum(
  "oauth_registration_type",
  ["dynamic", "manual"],
);
export const oneTimeTokenTypeInAuth = auth.enum("one_time_token_type", [
  "confirmation_token",
  "reauthentication_token",
  "recovery_token",
  "email_change_token_new",
  "email_change_token_current",
  "phone_change_token",
]);
export const adminRole = pgEnum("admin_role", [
  "admin",
  "super_admin",
  "volunteer",
]);
export const adminStatus = pgEnum("admin_status", [
  "active",
  "inactive",
  "suspended",
]);
export const parkingState = pgEnum("parking_state", ["Yes", "No", "Not sure"]);
export const status = pgEnum("status", [
  "confirmed",
  "pending",
  "waitlisted",
  "denied",
  "declined",
]);
export const yearOfStudy = pgEnum("year_of_study", [
  "1st",
  "2nd",
  "3rd",
  "4th+",
  "Recent Grad",
]);

export const confirmedCount = pgTable("confirmed_count", {
  id: integer().default(1).primaryKey().notNull(),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  count: bigint({ mode: "number" }).notNull(),
});

export const instancesInAuth = auth.table("instances", {
  id: uuid().notNull(),
  uuid: uuid(),
  rawBaseConfig: text("raw_base_config"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
});

export const usersInAuth = auth.table(
  "users",
  {
    instanceId: uuid("instance_id"),
    id: uuid().notNull(),
    aud: varchar({ length: 255 }),
    role: varchar({ length: 255 }),
    email: varchar({ length: 255 }),
    encryptedPassword: varchar("encrypted_password", { length: 255 }),
    emailConfirmedAt: timestamp("email_confirmed_at", {
      withTimezone: true,
      mode: "string",
    }),
    invitedAt: timestamp("invited_at", { withTimezone: true, mode: "string" }),
    confirmationToken: varchar("confirmation_token", { length: 255 }),
    confirmationSentAt: timestamp("confirmation_sent_at", {
      withTimezone: true,
      mode: "string",
    }),
    recoveryToken: varchar("recovery_token", { length: 255 }),
    recoverySentAt: timestamp("recovery_sent_at", {
      withTimezone: true,
      mode: "string",
    }),
    emailChangeTokenNew: varchar("email_change_token_new", { length: 255 }),
    emailChange: varchar("email_change", { length: 255 }),
    emailChangeSentAt: timestamp("email_change_sent_at", {
      withTimezone: true,
      mode: "string",
    }),
    lastSignInAt: timestamp("last_sign_in_at", {
      withTimezone: true,
      mode: "string",
    }),
    rawAppMetaData: jsonb("raw_app_meta_data"),
    rawUserMetaData: jsonb("raw_user_meta_data"),
    isSuperAdmin: boolean("is_super_admin"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
    phone: text().default(sql`NULL`),
    phoneConfirmedAt: timestamp("phone_confirmed_at", {
      withTimezone: true,
      mode: "string",
    }),
    phoneChange: text("phone_change").default(""),
    phoneChangeToken: varchar("phone_change_token", { length: 255 }).default(
      "",
    ),
    phoneChangeSentAt: timestamp("phone_change_sent_at", {
      withTimezone: true,
      mode: "string",
    }),
    confirmedAt: timestamp("confirmed_at", {
      withTimezone: true,
      mode: "string",
    }).generatedAlwaysAs(sql`LEAST(email_confirmed_at, phone_confirmed_at)`),
    emailChangeTokenCurrent: varchar("email_change_token_current", {
      length: 255,
    }).default(""),
    emailChangeConfirmStatus: smallint("email_change_confirm_status").default(
      0,
    ),
    bannedUntil: timestamp("banned_until", {
      withTimezone: true,
      mode: "string",
    }),
    reauthenticationToken: varchar("reauthentication_token", {
      length: 255,
    }).default(""),
    reauthenticationSentAt: timestamp("reauthentication_sent_at", {
      withTimezone: true,
      mode: "string",
    }),
    isSsoUser: boolean("is_sso_user").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
    isAnonymous: boolean("is_anonymous").default(false).notNull(),
  },
  (table) => [
    uniqueIndex("confirmation_token_idx")
      .using("btree", table.confirmationToken.asc().nullsLast().op("text_ops"))
      .where(sql`((confirmation_token)::text !~ '^[0-9 ]*$'::text)`),
    uniqueIndex("email_change_token_current_idx")
      .using(
        "btree",
        table.emailChangeTokenCurrent.asc().nullsLast().op("text_ops"),
      )
      .where(sql`((email_change_token_current)::text !~ '^[0-9 ]*$'::text)`),
    uniqueIndex("email_change_token_new_idx")
      .using(
        "btree",
        table.emailChangeTokenNew.asc().nullsLast().op("text_ops"),
      )
      .where(sql`((email_change_token_new)::text !~ '^[0-9 ]*$'::text)`),
    uniqueIndex("reauthentication_token_idx")
      .using(
        "btree",
        table.reauthenticationToken.asc().nullsLast().op("text_ops"),
      )
      .where(sql`((reauthentication_token)::text !~ '^[0-9 ]*$'::text)`),
    uniqueIndex("recovery_token_idx")
      .using("btree", table.recoveryToken.asc().nullsLast().op("text_ops"))
      .where(sql`((recovery_token)::text !~ '^[0-9 ]*$'::text)`),
    uniqueIndex("users_email_partial_key")
      .using("btree", table.email.asc().nullsLast().op("text_ops"))
      .where(sql`(is_sso_user = false)`),
    index("users_instance_id_email_idx").using(
      "btree",
      sql`instance_id`,
      sql`lower((email)::text)`,
    ),
    index("users_instance_id_idx").using(
      "btree",
      table.instanceId.asc().nullsLast().op("uuid_ops"),
    ),
    index("users_is_anonymous_idx").using(
      "btree",
      table.isAnonymous.asc().nullsLast().op("bool_ops"),
    ),
    check(
      "users_email_change_confirm_status_check",
      sql`(email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)`,
    ),
  ],
);

export const auditLogEntriesInAuth = auth.table(
  "audit_log_entries",
  {
    instanceId: uuid("instance_id"),
    id: uuid().notNull(),
    payload: json(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
    ipAddress: varchar("ip_address", { length: 64 }).default("").notNull(),
  },
  (table) => [
    index("audit_logs_instance_id_idx").using(
      "btree",
      table.instanceId.asc().nullsLast().op("uuid_ops"),
    ),
  ],
);

export const samlRelayStatesInAuth = auth.table(
  "saml_relay_states",
  {
    id: uuid().notNull(),
    ssoProviderId: uuid("sso_provider_id").notNull(),
    requestId: text("request_id").notNull(),
    forEmail: text("for_email"),
    redirectTo: text("redirect_to"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
    flowStateId: uuid("flow_state_id"),
  },
  (table) => [
    index("saml_relay_states_created_at_idx").using(
      "btree",
      table.createdAt.desc().nullsFirst().op("timestamptz_ops"),
    ),
    index("saml_relay_states_for_email_idx").using(
      "btree",
      table.forEmail.asc().nullsLast().op("text_ops"),
    ),
    index("saml_relay_states_sso_provider_id_idx").using(
      "btree",
      table.ssoProviderId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.ssoProviderId],
      foreignColumns: [ssoProvidersInAuth.id],
      name: "saml_relay_states_sso_provider_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.flowStateId],
      foreignColumns: [flowStateInAuth.id],
      name: "saml_relay_states_flow_state_id_fkey",
    }).onDelete("cascade"),
    check("request_id not empty", sql`char_length(request_id) > 0`),
  ],
);

export const refreshTokensInAuth = auth.table(
  "refresh_tokens",
  {
    instanceId: uuid("instance_id"),
    id: bigserial({ mode: "bigint" }).notNull(),
    token: varchar({ length: 255 }),
    userId: varchar("user_id", { length: 255 }),
    revoked: boolean(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
    parent: varchar({ length: 255 }),
    sessionId: uuid("session_id"),
  },
  (table) => [
    index("refresh_tokens_instance_id_idx").using(
      "btree",
      table.instanceId.asc().nullsLast().op("uuid_ops"),
    ),
    index("refresh_tokens_instance_id_user_id_idx").using(
      "btree",
      table.instanceId.asc().nullsLast().op("text_ops"),
      table.userId.asc().nullsLast().op("text_ops"),
    ),
    index("refresh_tokens_parent_idx").using(
      "btree",
      table.parent.asc().nullsLast().op("text_ops"),
    ),
    index("refresh_tokens_session_id_revoked_idx").using(
      "btree",
      table.sessionId.asc().nullsLast().op("bool_ops"),
      table.revoked.asc().nullsLast().op("bool_ops"),
    ),
    index("refresh_tokens_updated_at_idx").using(
      "btree",
      table.updatedAt.desc().nullsFirst().op("timestamptz_ops"),
    ),
    foreignKey({
      columns: [table.sessionId],
      foreignColumns: [sessionsInAuth.id],
      name: "refresh_tokens_session_id_fkey",
    }).onDelete("cascade"),
  ],
);

export const sessionsInAuth = auth.table(
  "sessions",
  {
    id: uuid().notNull(),
    userId: uuid("user_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
    factorId: uuid("factor_id"),
    aal: aalLevelInAuth(),
    notAfter: timestamp("not_after", { withTimezone: true, mode: "string" }),
    refreshedAt: timestamp("refreshed_at", { mode: "string" }),
    userAgent: text("user_agent"),
    ip: inet(),
    tag: text(),
  },
  (table) => [
    index("sessions_not_after_idx").using(
      "btree",
      table.notAfter.desc().nullsFirst().op("timestamptz_ops"),
    ),
    index("sessions_user_id_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
    ),
    index("user_id_created_at_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
      table.createdAt.asc().nullsLast().op("timestamptz_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [usersInAuth.id],
      name: "sessions_user_id_fkey",
    }).onDelete("cascade"),
  ],
);

export const ssoDomainsInAuth = auth.table(
  "sso_domains",
  {
    id: uuid().notNull(),
    ssoProviderId: uuid("sso_provider_id").notNull(),
    domain: text().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
  },
  (table) => [
    uniqueIndex("sso_domains_domain_idx").using("btree", sql`lower(domain)`),
    index("sso_domains_sso_provider_id_idx").using(
      "btree",
      table.ssoProviderId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.ssoProviderId],
      foreignColumns: [ssoProvidersInAuth.id],
      name: "sso_domains_sso_provider_id_fkey",
    }).onDelete("cascade"),
    check("domain not empty", sql`char_length(domain) > 0`),
  ],
);

export const mfaAmrClaimsInAuth = auth.table(
  "mfa_amr_claims",
  {
    sessionId: uuid("session_id").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    authenticationMethod: text("authentication_method").notNull(),
    id: uuid().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.sessionId],
      foreignColumns: [sessionsInAuth.id],
      name: "mfa_amr_claims_session_id_fkey",
    }).onDelete("cascade"),
  ],
);

export const samlProvidersInAuth = auth.table(
  "saml_providers",
  {
    id: uuid().notNull(),
    ssoProviderId: uuid("sso_provider_id").notNull(),
    entityId: text("entity_id").notNull(),
    metadataXml: text("metadata_xml").notNull(),
    metadataUrl: text("metadata_url"),
    attributeMapping: jsonb("attribute_mapping"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
    nameIdFormat: text("name_id_format"),
  },
  (table) => [
    index("saml_providers_sso_provider_id_idx").using(
      "btree",
      table.ssoProviderId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.ssoProviderId],
      foreignColumns: [ssoProvidersInAuth.id],
      name: "saml_providers_sso_provider_id_fkey",
    }).onDelete("cascade"),
    check("metadata_xml not empty", sql`char_length(metadata_xml) > 0`),
    check(
      "metadata_url not empty",
      sql`(metadata_url = NULL::text) OR (char_length(metadata_url) > 0)`,
    ),
    check("entity_id not empty", sql`char_length(entity_id) > 0`),
  ],
);

export const flowStateInAuth = auth.table(
  "flow_state",
  {
    id: uuid().notNull(),
    userId: uuid("user_id"),
    authCode: text("auth_code").notNull(),
    codeChallengeMethod: codeChallengeMethodInAuth(
      "code_challenge_method",
    ).notNull(),
    codeChallenge: text("code_challenge").notNull(),
    providerType: text("provider_type").notNull(),
    providerAccessToken: text("provider_access_token"),
    providerRefreshToken: text("provider_refresh_token"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
    authenticationMethod: text("authentication_method").notNull(),
    authCodeIssuedAt: timestamp("auth_code_issued_at", {
      withTimezone: true,
      mode: "string",
    }),
  },
  (table) => [
    index("flow_state_created_at_idx").using(
      "btree",
      table.createdAt.desc().nullsFirst().op("timestamptz_ops"),
    ),
    index("idx_auth_code").using(
      "btree",
      table.authCode.asc().nullsLast().op("text_ops"),
    ),
    index("idx_user_id_auth_method").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
      table.authenticationMethod.asc().nullsLast().op("uuid_ops"),
    ),
  ],
);

export const identitiesInAuth = auth.table(
  "identities",
  {
    providerId: text("provider_id").notNull(),
    userId: uuid("user_id").notNull(),
    identityData: jsonb("identity_data").notNull(),
    provider: text().notNull(),
    lastSignInAt: timestamp("last_sign_in_at", {
      withTimezone: true,
      mode: "string",
    }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
    email: text().generatedAlwaysAs(
      sql`lower((identity_data ->> 'email'::text))`,
    ),
    id: uuid().defaultRandom().notNull(),
  },
  (table) => [
    index("identities_email_idx").using(
      "btree",
      table.email.asc().nullsLast().op("text_pattern_ops"),
    ),
    index("identities_user_id_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [usersInAuth.id],
      name: "identities_user_id_fkey",
    }).onDelete("cascade"),
  ],
);

export const oneTimeTokensInAuth = auth.table(
  "one_time_tokens",
  {
    id: uuid().notNull(),
    userId: uuid("user_id").notNull(),
    tokenType: oneTimeTokenTypeInAuth("token_type").notNull(),
    tokenHash: text("token_hash").notNull(),
    relatesTo: text("relates_to").notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("one_time_tokens_relates_to_hash_idx").using(
      "hash",
      table.relatesTo.asc().nullsLast().op("text_ops"),
    ),
    index("one_time_tokens_token_hash_hash_idx").using(
      "hash",
      table.tokenHash.asc().nullsLast().op("text_ops"),
    ),
    uniqueIndex("one_time_tokens_user_id_token_type_key").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
      table.tokenType.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [usersInAuth.id],
      name: "one_time_tokens_user_id_fkey",
    }).onDelete("cascade"),
    check("one_time_tokens_token_hash_check", sql`char_length(token_hash) > 0`),
  ],
);

export const mfaFactorsInAuth = auth.table(
  "mfa_factors",
  {
    id: uuid().notNull(),
    userId: uuid("user_id").notNull(),
    friendlyName: text("friendly_name"),
    factorType: factorTypeInAuth("factor_type").notNull(),
    status: factorStatusInAuth().notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    secret: text(),
    phone: text(),
    lastChallengedAt: timestamp("last_challenged_at", {
      withTimezone: true,
      mode: "string",
    }),
    webAuthnCredential: jsonb("web_authn_credential"),
    webAuthnAaguid: uuid("web_authn_aaguid"),
  },
  (table) => [
    index("factor_id_created_at_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("timestamptz_ops"),
      table.createdAt.asc().nullsLast().op("uuid_ops"),
    ),
    uniqueIndex("mfa_factors_user_friendly_name_unique")
      .using(
        "btree",
        table.friendlyName.asc().nullsLast().op("text_ops"),
        table.userId.asc().nullsLast().op("uuid_ops"),
      )
      .where(sql`(TRIM(BOTH FROM friendly_name) <> ''::text)`),
    index("mfa_factors_user_id_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
    ),
    uniqueIndex("unique_phone_factor_per_user").using(
      "btree",
      table.userId.asc().nullsLast().op("text_ops"),
      table.phone.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [usersInAuth.id],
      name: "mfa_factors_user_id_fkey",
    }).onDelete("cascade"),
  ],
);

export const mfaChallengesInAuth = auth.table(
  "mfa_challenges",
  {
    id: uuid().notNull(),
    factorId: uuid("factor_id").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    verifiedAt: timestamp("verified_at", {
      withTimezone: true,
      mode: "string",
    }),
    ipAddress: inet("ip_address").notNull(),
    otpCode: text("otp_code"),
    webAuthnSessionData: jsonb("web_authn_session_data"),
  },
  (table) => [
    index("mfa_challenge_created_at_idx").using(
      "btree",
      table.createdAt.desc().nullsFirst().op("timestamptz_ops"),
    ),
    foreignKey({
      columns: [table.factorId],
      foreignColumns: [mfaFactorsInAuth.id],
      name: "mfa_challenges_auth_factor_id_fkey",
    }).onDelete("cascade"),
  ],
);

export const ssoProvidersInAuth = auth.table(
  "sso_providers",
  {
    id: uuid().notNull(),
    resourceId: text("resource_id"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
    disabled: boolean(),
  },
  (table) => [
    uniqueIndex("sso_providers_resource_id_idx").using(
      "btree",
      sql`lower(resource_id)`,
    ),
    index("sso_providers_resource_id_pattern_idx").using(
      "btree",
      table.resourceId.asc().nullsLast().op("text_pattern_ops"),
    ),
    check(
      "resource_id not empty",
      sql`(resource_id = NULL::text) OR (char_length(resource_id) > 0)`,
    ),
  ],
);

export const oauthClientsInAuth = auth.table(
  "oauth_clients",
  {
    id: uuid().notNull(),
    clientId: text("client_id").notNull(),
    clientSecretHash: text("client_secret_hash").notNull(),
    registrationType:
      oauthRegistrationTypeInAuth("registration_type").notNull(),
    redirectUris: text("redirect_uris").notNull(),
    grantTypes: text("grant_types").notNull(),
    clientName: text("client_name"),
    clientUri: text("client_uri"),
    logoUri: text("logo_uri"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
  },
  (table) => [
    index("oauth_clients_client_id_idx").using(
      "btree",
      table.clientId.asc().nullsLast().op("text_ops"),
    ),
    index("oauth_clients_deleted_at_idx").using(
      "btree",
      table.deletedAt.asc().nullsLast().op("timestamptz_ops"),
    ),
    check(
      "oauth_clients_client_name_length",
      sql`char_length(client_name) <= 1024`,
    ),
    check(
      "oauth_clients_client_uri_length",
      sql`char_length(client_uri) <= 2048`,
    ),
    check("oauth_clients_logo_uri_length", sql`char_length(logo_uri) <= 2048`),
  ],
);

export const admins = pgTable(
  "admins",
  {
    id: uuid().primaryKey().notNull(),
    email: varchar({ length: 255 }).notNull(),
    isAdminOnly: boolean("is_admin_only").default(true),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    fName: varchar("f_name", { length: 100 }),
    lName: varchar("l_name", { length: 100 }),
    role: adminRole().default("admin").notNull(),
    status: adminStatus().default("active").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_admins_email").using(
      "btree",
      table.email.asc().nullsLast().op("text_ops"),
    ),
    index("idx_admins_role").using(
      "btree",
      table.role.asc().nullsLast().op("enum_ops"),
    ),
    index("idx_admins_status").using(
      "btree",
      table.status.asc().nullsLast().op("enum_ops"),
    ),
    foreignKey({
      columns: [table.id],
      foreignColumns: [usersInAuth.id],
      name: "admins_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.id],
      foreignColumns: [usersInAuth.id],
      name: "admins_id_users_id_fk",
    }),
    pgPolicy("admin_delete", {
      as: "permissive",
      for: "delete",
      to: ["authenticated"],
      using: sql`(is_super_admin() AND (auth.uid() <> id))`,
    }),
    pgPolicy("admin_insert", {
      as: "permissive",
      for: "insert",
      to: ["authenticated"],
    }),
    pgPolicy("admin_update", {
      as: "permissive",
      for: "update",
      to: ["authenticated"],
    }),
    pgPolicy("admin_view_own", {
      as: "permissive",
      for: "select",
      to: ["authenticated"],
    }),
  ],
);

export const dietaryRestrictions = pgTable(
  "dietary_restrictions",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity({
      name: "dietary_restrictions_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    restriction: varchar({ length: 255 }).notNull(),
  },
  (table) => [
    unique("dietary_restrictions_restriction_unique").on(table.restriction),
    pgPolicy("dietary_restrictions_select_all", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`true`,
    }),
  ],
);

export const experienceTypes = pgTable(
  "experience_types",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity({
      name: "experience_types_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    experience: varchar({ length: 255 }).notNull(),
  },
  (table) => [
    unique("experience_types_experience_unique").on(table.experience),
    pgPolicy("experience_types_select_all", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`true`,
    }),
  ],
);

export const gender = pgTable(
  "gender",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity({
      name: "gender_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    gender: varchar({ length: 255 }).notNull(),
  },
  (table) => [
    unique("gender_gender_unique").on(table.gender),
    pgPolicy("gender_select_all", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`true`,
    }),
  ],
);

export const interests = pgTable(
  "interests",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity({
      name: "interests_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    interest: varchar({ length: 255 }).notNull(),
  },
  (table) => [
    unique("interests_interest_unique").on(table.interest),
    pgPolicy("interests_select_all", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`true`,
    }),
  ],
);

export const majors = pgTable(
  "majors",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity({
      name: "majors_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    major: varchar({ length: 255 }).notNull(),
  },
  (table) => [
    unique("majors_major_unique").on(table.major),
    pgPolicy("majors_insert_authenticated", {
      as: "permissive",
      for: "insert",
      to: ["authenticated"],
      withCheck: sql`true`,
    }),
    pgPolicy("majors_select_all", {
      as: "permissive",
      for: "select",
      to: ["public"],
    }),
  ],
);

export const marketingTypes = pgTable(
  "marketing_types",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity({
      name: "marketing_types_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    marketing: varchar({ length: 255 }).notNull(),
  },
  (table) => [
    unique("marketing_types_marketing_unique").on(table.marketing),
    pgPolicy("marketing_types_select_all", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`true`,
    }),
  ],
);

export const mktgPreferences = pgTable(
  "mktg_preferences",
  {
    id: uuid().primaryKey().notNull(),
    sendEmails: boolean("send_emails").default(true).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.id],
      foreignColumns: [users.id],
      name: "mktg_preferences_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.id],
      foreignColumns: [users.id],
      name: "mktg_preferences_id_users_id_fk",
    }),
    pgPolicy("Admins can view all marketing preferences", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`(EXISTS ( SELECT 1
   FROM admins
  WHERE ((admins.id = auth.uid()) AND (admins.status = 'active'::admin_status))))`,
    }),
    pgPolicy("Users can delete own marketing preferences", {
      as: "permissive",
      for: "delete",
      to: ["public"],
    }),
    pgPolicy("Users can insert own marketing preferences", {
      as: "permissive",
      for: "insert",
      to: ["public"],
    }),
    pgPolicy("Users can update own marketing preferences", {
      as: "permissive",
      for: "update",
      to: ["public"],
    }),
    pgPolicy("Users can view own marketing preferences", {
      as: "permissive",
      for: "select",
      to: ["public"],
    }),
  ],
);

export const parkingInfo = pgTable(
  "parking_info",
  {
    id: uuid().primaryKey().notNull(),
    licensePlate: varchar("license_plate", { length: 8 }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.id],
      foreignColumns: [users.id],
      name: "parking_info_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.id],
      foreignColumns: [users.id],
      name: "parking_info_id_users_id_fk",
    }),
    pgPolicy("Admins can update parking info", {
      as: "permissive",
      for: "update",
      to: ["public"],
      using: sql`(EXISTS ( SELECT 1
   FROM admins
  WHERE ((admins.id = auth.uid()) AND (admins.status = 'active'::admin_status))))`,
    }),
    pgPolicy("Admins can view all parking info", {
      as: "permissive",
      for: "select",
      to: ["public"],
    }),
    pgPolicy("Users can delete own parking info", {
      as: "permissive",
      for: "delete",
      to: ["public"],
    }),
    pgPolicy("Users can insert own parking info", {
      as: "permissive",
      for: "insert",
      to: ["public"],
    }),
    pgPolicy("Users can update own parking info", {
      as: "permissive",
      for: "update",
      to: ["public"],
    }),
    pgPolicy("Users can view own parking info", {
      as: "permissive",
      for: "select",
      to: ["public"],
    }),
  ],
);

export const profile = pgTable(
  "profile",
  {
    id: uuid().primaryKey().notNull(),
    email: varchar({ length: 255 }).notNull(),
    fName: varchar("f_name", { length: 255 }),
    lName: varchar("l_name", { length: 255 }),
    marketingEmails: boolean("marketing_emails").default(false),
    parking: varchar({ length: 10 }).default("Not sure"),
    licensePlate: varchar("license_plate", { length: 20 }),
    pendingEmail: text("pending_email"),
    emailChangeRequestedAt: timestamp("email_change_requested_at", {
      withTimezone: true,
      mode: "string",
    }),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.id],
      foreignColumns: [usersInAuth.id],
      name: "profile_auth_user_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.id],
      foreignColumns: [usersInAuth.id],
      name: "profile_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.id],
      foreignColumns: [usersInAuth.id],
      name: "profile_id_users_id_fk",
    }),
    pgPolicy("Users can delete their own profile", {
      as: "permissive",
      for: "delete",
      to: ["public"],
      using: sql`(auth.uid() = id)`,
    }),
    pgPolicy("users_insert_own_profile", {
      as: "permissive",
      for: "insert",
      to: ["authenticated"],
    }),
    pgPolicy("users_update_own_profile", {
      as: "permissive",
      for: "update",
      to: ["authenticated"],
    }),
    pgPolicy("users_view_own_profile", {
      as: "permissive",
      for: "select",
      to: ["authenticated"],
    }),
    check(
      "profile_parking_check",
      sql`(parking)::text = ANY (ARRAY[('Yes'::character varying)::text, ('No'::character varying)::text, ('Not sure'::character varying)::text])`,
    ),
  ],
);

export const universities = pgTable(
  "universities",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity({
      name: "universities_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    uni: varchar({ length: 255 }).notNull(),
  },
  (table) => [
    unique("universities_uni_unique").on(table.uni),
    pgPolicy("universities_insert_authenticated", {
      as: "permissive",
      for: "insert",
      to: ["authenticated"],
      withCheck: sql`true`,
    }),
    pgPolicy("universities_select_all", {
      as: "permissive",
      for: "select",
      to: ["public"],
    }),
  ],
);

export const workshopRegistrations = pgTable(
  "workshop_registrations",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    workshopId: uuid("workshop_id").notNull(),
    registeredAt: timestamp("registered_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    fName: varchar("f_name", { length: 255 }),
    lName: varchar("l_name", { length: 255 }),
    yearOfStudy: varchar({ length: 50 }),
    gender: varchar({ length: 50 }),
    major: varchar({ length: 255 }),
  },
  (table) => [
    index("idx_workshop_registrations_user").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
    ),
    index("idx_workshop_registrations_workshop").using(
      "btree",
      table.workshopId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [usersInAuth.id],
      name: "workshop_registrations_user_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [usersInAuth.id],
      name: "workshop_registrations_user_id_users_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.workshopId],
      foreignColumns: [workshops.id],
      name: "workshop_registrations_workshop_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.workshopId],
      foreignColumns: [workshops.id],
      name: "workshop_registrations_workshop_id_workshops_id_fk",
    }).onDelete("cascade"),
    unique("workshop_registrations_user_id_workshop_id_key").on(
      table.userId,
      table.workshopId,
    ),
    pgPolicy("Allow admin read access to registrations", {
      as: "permissive",
      for: "select",
      to: ["authenticated"],
      using: sql`true`,
    }),
    pgPolicy("Authenticated users can read registrations", {
      as: "permissive",
      for: "select",
      to: ["authenticated"],
    }),
    pgPolicy("Users can register for workshops", {
      as: "permissive",
      for: "insert",
      to: ["public"],
    }),
    pgPolicy("Users can unregister from workshops", {
      as: "permissive",
      for: "delete",
      to: ["public"],
    }),
    pgPolicy("Users can view their own registrations", {
      as: "permissive",
      for: "select",
      to: ["public"],
    }),
  ],
);

export const workshops = pgTable(
  "workshops",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    title: varchar({ length: 255 }).notNull(),
    description: text(),
    eventName: varchar("event_name", { length: 255 }).notNull(),
    date: date().notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    location: varchar({ length: 255 }),
    maxCapacity: integer("max_capacity").default(0),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    index("idx_workshops_date").using(
      "btree",
      table.date.asc().nullsLast().op("date_ops"),
    ),
    index("idx_workshops_event_date").using(
      "btree",
      table.eventName.asc().nullsLast().op("date_ops"),
      table.date.asc().nullsLast().op("date_ops"),
    ),
    pgPolicy("Authenticated users can delete workshops", {
      as: "permissive",
      for: "delete",
      to: ["authenticated"],
      using: sql`true`,
    }),
    pgPolicy("Authenticated users can insert workshops", {
      as: "permissive",
      for: "insert",
      to: ["authenticated"],
    }),
    pgPolicy("Authenticated users can update workshops", {
      as: "permissive",
      for: "update",
      to: ["authenticated"],
    }),
    pgPolicy("Only authenticated users can view workshops", {
      as: "permissive",
      for: "select",
      to: ["public"],
    }),
    pgPolicy("Workshops are viewable by everyone", {
      as: "permissive",
      for: "select",
      to: ["public"],
    }),
  ],
);

export const schemaMigrationsInAuth = auth.table("schema_migrations", {
  version: varchar({ length: 255 }).notNull(),
});

export const preReg = pgTable("pre_reg", {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
    name: "pre_reg_id_seq",
    startWith: 1,
    increment: 1,
    minValue: 1,
    maxValue: 9223372036854775807,
    cache: 1,
  }),
  time: timestamp({ withTimezone: true, mode: "string" }).notNull(),
  email: text().notNull(),
});

export const users = pgTable(
  "users",
  {
    id: uuid().primaryKey().notNull(),
    fName: varchar("f_name", { length: 255 }).notNull(),
    lName: varchar("l_name", { length: 255 }).notNull(),
    gender: integer().notNull(),
    university: integer().notNull(),
    prevAttendance: boolean("prev_attendance").notNull(),
    major: integer().notNull(),
    parking: parkingState().notNull(),
    email: varchar({ length: 255 }).notNull(),
    yearOfStudy: yearOfStudy().notNull(),
    experience: integer().notNull(),
    accommodations: text().notNull(),
    marketing: integer().notNull(),
    timestamp: timestamp({ mode: "string" }),
    status: status().default("waitlisted").notNull(),
    checkedIn: boolean("checked_in").default(false),
    resumeUrl: text("resume_url"),
    resumeFilename: varchar("resume_filename", { length: 255 }),
    pendingEmail: text("pending_email"),
    emailChangeRequestedAt: timestamp("email_change_requested_at", {
      withTimezone: true,
      mode: "string",
    }),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    index("idx_users_experience").using(
      "btree",
      table.experience.asc().nullsLast().op("int4_ops"),
    ),
    index("idx_users_gender").using(
      "btree",
      table.gender.asc().nullsLast().op("int4_ops"),
    ),
    index("idx_users_major").using(
      "btree",
      table.major.asc().nullsLast().op("int4_ops"),
    ),
    index("idx_users_marketing").using(
      "btree",
      table.marketing.asc().nullsLast().op("int4_ops"),
    ),
    index("idx_users_resume_url")
      .using("btree", table.resumeUrl.asc().nullsLast().op("text_ops"))
      .where(sql`(resume_url IS NOT NULL)`),
    index("idx_users_university").using(
      "btree",
      table.university.asc().nullsLast().op("int4_ops"),
    ),
    foreignKey({
      columns: [table.id],
      foreignColumns: [table.id],
      name: "users_auth_user_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.experience],
      foreignColumns: [experienceTypes.id],
      name: "users_experience_experience_types_id_fk",
    }),
    foreignKey({
      columns: [table.gender],
      foreignColumns: [gender.id],
      name: "users_gender_gender_id_fk",
    }),
    foreignKey({
      columns: [table.id],
      foreignColumns: [table.id],
      name: "users_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.id],
      foreignColumns: [table.id],
      name: "users_id_users_id_fk",
    }),
    foreignKey({
      columns: [table.major],
      foreignColumns: [majors.id],
      name: "users_major_majors_id_fk",
    }),
    foreignKey({
      columns: [table.marketing],
      foreignColumns: [marketingTypes.id],
      name: "users_marketing_marketing_types_id_fk",
    }),
    foreignKey({
      columns: [table.university],
      foreignColumns: [universities.id],
      name: "users_university_universities_id_fk",
    }),
    pgPolicy("Users can delete their own registrations", {
      as: "permissive",
      for: "delete",
      to: ["public"],
      using: sql`(auth.uid() = id)`,
    }),
    pgPolicy("users_insert_own", {
      as: "permissive",
      for: "insert",
      to: ["authenticated"],
    }),
    pgPolicy("users_select_own", {
      as: "permissive",
      for: "select",
      to: ["authenticated"],
    }),
    pgPolicy("users_update_own", {
      as: "permissive",
      for: "update",
      to: ["authenticated"],
    }),
  ],
);

export const userDietRestrictions = pgTable(
  "user_diet_restrictions",
  {
    id: uuid().notNull(),
    restriction: integer().notNull(),
  },
  (table) => [
    index("idx_user_diet_restrictions_restriction_id").using(
      "btree",
      table.restriction.asc().nullsLast().op("int4_ops"),
    ),
    index("idx_user_diet_restrictions_user_id").using(
      "btree",
      table.id.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.id],
      foreignColumns: [users.id],
      name: "user_diet_restrictions_id_users_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.restriction],
      foreignColumns: [dietaryRestrictions.id],
      name: "user_diet_restrictions_restriction_dietary_restrictions_id_fk",
    }),
    foreignKey({
      columns: [table.id],
      foreignColumns: [users.id],
      name: "user_diet_restrictions_user_fkey",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.id, table.restriction],
      name: "user_diet_restrictions_pkey",
    }),
    pgPolicy("user_restrictions_insert_own", {
      as: "permissive",
      for: "insert",
      to: ["authenticated"],
      withCheck: sql`(auth.uid() = id)`,
    }),
    pgPolicy("user_restrictions_select_own", {
      as: "permissive",
      for: "select",
      to: ["authenticated"],
    }),
  ],
);

export const userInterests = pgTable(
  "user_interests",
  {
    id: uuid().notNull(),
    interest: integer().notNull(),
  },
  (table) => [
    index("idx_user_interests_interest_id").using(
      "btree",
      table.interest.asc().nullsLast().op("int4_ops"),
    ),
    index("idx_user_interests_user_id").using(
      "btree",
      table.id.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.id],
      foreignColumns: [users.id],
      name: "user_interests_id_users_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.interest],
      foreignColumns: [interests.id],
      name: "user_interests_interest_interests_id_fk",
    }),
    foreignKey({
      columns: [table.id],
      foreignColumns: [users.id],
      name: "user_interests_user_fkey",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.id, table.interest],
      name: "user_interests_pkey",
    }),
    pgPolicy("user_interests_insert_own", {
      as: "permissive",
      for: "insert",
      to: ["authenticated"],
      withCheck: sql`(auth.uid() = id)`,
    }),
    pgPolicy("user_interests_select_own", {
      as: "permissive",
      for: "select",
      to: ["authenticated"],
    }),
  ],
);
export const rsvpableUsers = pgView("rsvpable_users", { id: uuid() }).as(
  sql`SELECT u.id FROM users u LEFT JOIN pre_reg p ON p.email = u.email::text LEFT JOIN auth.users ON users.id = u.id WHERE u.status = ANY (ARRAY['pending'::status, 'waitlisted'::status]) ORDER BY (p.email IS NOT NULL) DESC, users.created_at LIMIT 500 - (( SELECT count(*) AS count FROM users users_1 WHERE users_1.status = 'confirmed'::status))`,
);

export const adminManagementView = pgView("admin_management_view", {
  id: uuid(),
  email: varchar({ length: 255 }),
  role: adminRole(),
  status: adminStatus(),
  firstName: varchar({ length: 100 }),
  lastName: varchar({ length: 100 }),
  isAdminOnly: boolean("is_admin_only"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
  lastSignInAt: timestamp("last_sign_in_at", {
    withTimezone: true,
    mode: "string",
  }),
  emailConfirmedAt: timestamp("email_confirmed_at", {
    withTimezone: true,
    mode: "string",
  }),
}).as(
  sql`SELECT a.id, a.email, a.role, a.status, a.f_name AS "firstName", a.l_name AS "lastName", a.is_admin_only, a.created_at, a.updated_at, u.last_sign_in_at, u.email_confirmed_at FROM admins a JOIN auth.users u ON a.id = u.id ORDER BY a.created_at DESC`,
);
