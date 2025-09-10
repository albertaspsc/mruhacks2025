import { relations } from "drizzle-orm/relations";
import {
  usersInAuth,
  users,
  experienceTypes,
  gender,
  majors,
  marketingTypes,
  universities,
  admins,
  mktgPreferences,
  parkingInfo,
  profile,
  userDietRestrictions,
  dietaryRestrictions,
  userInterests,
  interests,
  workshopRegistrations,
  workshops,
} from "./schema";

export const usersRelations = relations(users, ({ one, many }) => ({
  usersInAuth_id: one(usersInAuth, {
    fields: [users.id],
    references: [usersInAuth.id],
    relationName: "users_id_usersInAuth_id",
  }),
  experienceType: one(experienceTypes, {
    fields: [users.experience],
    references: [experienceTypes.id],
  }),
  gender: one(gender, {
    fields: [users.gender],
    references: [gender.id],
  }),
  usersInAuth_id: one(usersInAuth, {
    fields: [users.id],
    references: [usersInAuth.id],
    relationName: "users_id_usersInAuth_id",
  }),
  usersInAuth_id: one(usersInAuth, {
    fields: [users.id],
    references: [usersInAuth.id],
    relationName: "users_id_usersInAuth_id",
  }),
  major: one(majors, {
    fields: [users.major],
    references: [majors.id],
  }),
  marketingType: one(marketingTypes, {
    fields: [users.marketing],
    references: [marketingTypes.id],
  }),
  university: one(universities, {
    fields: [users.university],
    references: [universities.id],
  }),
  mktgPreferences_id: many(mktgPreferences, {
    relationName: "mktgPreferences_id_users_id",
  }),
  mktgPreferences_id: many(mktgPreferences, {
    relationName: "mktgPreferences_id_users_id",
  }),
  parkingInfos_id: many(parkingInfo, {
    relationName: "parkingInfo_id_users_id",
  }),
  parkingInfos_id: many(parkingInfo, {
    relationName: "parkingInfo_id_users_id",
  }),
  userDietRestrictions_id: many(userDietRestrictions, {
    relationName: "userDietRestrictions_id_users_id",
  }),
  userDietRestrictions_id: many(userDietRestrictions, {
    relationName: "userDietRestrictions_id_users_id",
  }),
  userInterests_id: many(userInterests, {
    relationName: "userInterests_id_users_id",
  }),
  userInterests_id: many(userInterests, {
    relationName: "userInterests_id_users_id",
  }),
}));

export const usersInAuthRelations = relations(usersInAuth, ({ many }) => ({
  users_id: many(users, {
    relationName: "users_id_usersInAuth_id",
  }),
  users_id: many(users, {
    relationName: "users_id_usersInAuth_id",
  }),
  users_id: many(users, {
    relationName: "users_id_usersInAuth_id",
  }),
  admins_id: many(admins, {
    relationName: "admins_id_usersInAuth_id",
  }),
  admins_id: many(admins, {
    relationName: "admins_id_usersInAuth_id",
  }),
  profiles_id: many(profile, {
    relationName: "profile_id_usersInAuth_id",
  }),
  profiles_id: many(profile, {
    relationName: "profile_id_usersInAuth_id",
  }),
  profiles_id: many(profile, {
    relationName: "profile_id_usersInAuth_id",
  }),
  workshopRegistrations_userId: many(workshopRegistrations, {
    relationName: "workshopRegistrations_userId_usersInAuth_id",
  }),
  workshopRegistrations_userId: many(workshopRegistrations, {
    relationName: "workshopRegistrations_userId_usersInAuth_id",
  }),
}));

export const experienceTypesRelations = relations(
  experienceTypes,
  ({ many }) => ({
    users: many(users),
  }),
);

export const genderRelations = relations(gender, ({ many }) => ({
  users: many(users),
}));

export const majorsRelations = relations(majors, ({ many }) => ({
  users: many(users),
}));

export const marketingTypesRelations = relations(
  marketingTypes,
  ({ many }) => ({
    users: many(users),
  }),
);

export const universitiesRelations = relations(universities, ({ many }) => ({
  users: many(users),
}));

export const adminsRelations = relations(admins, ({ one }) => ({
  usersInAuth_id: one(usersInAuth, {
    fields: [admins.id],
    references: [usersInAuth.id],
    relationName: "admins_id_usersInAuth_id",
  }),
  usersInAuth_id: one(usersInAuth, {
    fields: [admins.id],
    references: [usersInAuth.id],
    relationName: "admins_id_usersInAuth_id",
  }),
}));

export const mktgPreferencesRelations = relations(
  mktgPreferences,
  ({ one }) => ({
    user_id: one(users, {
      fields: [mktgPreferences.id],
      references: [users.id],
      relationName: "mktgPreferences_id_users_id",
    }),
    user_id: one(users, {
      fields: [mktgPreferences.id],
      references: [users.id],
      relationName: "mktgPreferences_id_users_id",
    }),
  }),
);

export const parkingInfoRelations = relations(parkingInfo, ({ one }) => ({
  user_id: one(users, {
    fields: [parkingInfo.id],
    references: [users.id],
    relationName: "parkingInfo_id_users_id",
  }),
  user_id: one(users, {
    fields: [parkingInfo.id],
    references: [users.id],
    relationName: "parkingInfo_id_users_id",
  }),
}));

export const profileRelations = relations(profile, ({ one }) => ({
  usersInAuth_id: one(usersInAuth, {
    fields: [profile.id],
    references: [usersInAuth.id],
    relationName: "profile_id_usersInAuth_id",
  }),
  usersInAuth_id: one(usersInAuth, {
    fields: [profile.id],
    references: [usersInAuth.id],
    relationName: "profile_id_usersInAuth_id",
  }),
  usersInAuth_id: one(usersInAuth, {
    fields: [profile.id],
    references: [usersInAuth.id],
    relationName: "profile_id_usersInAuth_id",
  }),
}));

export const userDietRestrictionsRelations = relations(
  userDietRestrictions,
  ({ one }) => ({
    user_id: one(users, {
      fields: [userDietRestrictions.id],
      references: [users.id],
      relationName: "userDietRestrictions_id_users_id",
    }),
    dietaryRestriction: one(dietaryRestrictions, {
      fields: [userDietRestrictions.restriction],
      references: [dietaryRestrictions.id],
    }),
    user_id: one(users, {
      fields: [userDietRestrictions.id],
      references: [users.id],
      relationName: "userDietRestrictions_id_users_id",
    }),
  }),
);

export const dietaryRestrictionsRelations = relations(
  dietaryRestrictions,
  ({ many }) => ({
    userDietRestrictions: many(userDietRestrictions),
  }),
);

export const userInterestsRelations = relations(userInterests, ({ one }) => ({
  user_id: one(users, {
    fields: [userInterests.id],
    references: [users.id],
    relationName: "userInterests_id_users_id",
  }),
  interest: one(interests, {
    fields: [userInterests.interest],
    references: [interests.id],
  }),
  user_id: one(users, {
    fields: [userInterests.id],
    references: [users.id],
    relationName: "userInterests_id_users_id",
  }),
}));

export const interestsRelations = relations(interests, ({ many }) => ({
  userInterests: many(userInterests),
}));

export const workshopRegistrationsRelations = relations(
  workshopRegistrations,
  ({ one }) => ({
    usersInAuth_userId: one(usersInAuth, {
      fields: [workshopRegistrations.userId],
      references: [usersInAuth.id],
      relationName: "workshopRegistrations_userId_usersInAuth_id",
    }),
    usersInAuth_userId: one(usersInAuth, {
      fields: [workshopRegistrations.userId],
      references: [usersInAuth.id],
      relationName: "workshopRegistrations_userId_usersInAuth_id",
    }),
    workshop_workshopId: one(workshops, {
      fields: [workshopRegistrations.workshopId],
      references: [workshops.id],
      relationName: "workshopRegistrations_workshopId_workshops_id",
    }),
    workshop_workshopId: one(workshops, {
      fields: [workshopRegistrations.workshopId],
      references: [workshops.id],
      relationName: "workshopRegistrations_workshopId_workshops_id",
    }),
  }),
);

export const workshopsRelations = relations(workshops, ({ many }) => ({
  workshopRegistrations_workshopId: many(workshopRegistrations, {
    relationName: "workshopRegistrations_workshopId_workshops_id",
  }),
  workshopRegistrations_workshopId: many(workshopRegistrations, {
    relationName: "workshopRegistrations_workshopId_workshops_id",
  }),
}));
