import { relations } from "drizzle-orm/relations";
import {
  users,
  gender,
  universities,
  majors,
  experienceTypes,
  marketingTypes,
  admins,
  mktgPreferences,
  parkingInfo,
  userInterests,
  interests,
  userDietRestrictions,
  dietaryRestrictions,
} from "./schema";
import { authUsers } from "./auth.tables";

export const usersRelations = relations(users, ({ one, many }) => ({
  usersInAuth: one(authUsers, {
    fields: [users.id],
    references: [authUsers.id],
  }),
  gender: one(gender, {
    fields: [users.gender],
    references: [gender.id],
  }),
  university: one(universities, {
    fields: [users.university],
    references: [universities.id],
  }),
  major: one(majors, {
    fields: [users.major],
    references: [majors.id],
  }),
  experienceType: one(experienceTypes, {
    fields: [users.experience],
    references: [experienceTypes.id],
  }),
  marketingType: one(marketingTypes, {
    fields: [users.marketing],
    references: [marketingTypes.id],
  }),
  admins: many(admins),
  mktgPreferences: many(mktgPreferences),
  parkingInfos: many(parkingInfo),
  userInterests: many(userInterests),
  userDietRestrictions: many(userDietRestrictions),
}));

export const usersInAuthRelations = relations(authUsers, ({ many }) => ({
  users: many(users),
}));

export const genderRelations = relations(gender, ({ many }) => ({
  users: many(users),
}));

export const universitiesRelations = relations(universities, ({ many }) => ({
  users: many(users),
}));

export const majorsRelations = relations(majors, ({ many }) => ({
  users: many(users),
}));

export const experienceTypesRelations = relations(
  experienceTypes,
  ({ many }) => ({
    users: many(users),
  }),
);

export const marketingTypesRelations = relations(
  marketingTypes,
  ({ many }) => ({
    users: many(users),
  }),
);

export const adminsRelations = relations(admins, ({ one }) => ({
  user: one(users, {
    fields: [admins.id],
    references: [users.id],
  }),
}));

export const mktgPreferencesRelations = relations(
  mktgPreferences,
  ({ one }) => ({
    user: one(users, {
      fields: [mktgPreferences.id],
      references: [users.id],
    }),
  }),
);

export const parkingInfoRelations = relations(parkingInfo, ({ one }) => ({
  user: one(users, {
    fields: [parkingInfo.id],
    references: [users.id],
  }),
}));

export const userInterestsRelations = relations(userInterests, ({ one }) => ({
  user: one(users, {
    fields: [userInterests.id],
    references: [users.id],
  }),
  interest: one(interests, {
    fields: [userInterests.interest],
    references: [interests.id],
  }),
}));

export const interestsRelations = relations(interests, ({ many }) => ({
  userInterests: many(userInterests),
}));

export const userDietRestrictionsRelations = relations(
  userDietRestrictions,
  ({ one }) => ({
    user: one(users, {
      fields: [userDietRestrictions.id],
      references: [users.id],
    }),
    dietaryRestriction: one(dietaryRestrictions, {
      fields: [userDietRestrictions.restriction],
      references: [dietaryRestrictions.id],
    }),
  }),
);

export const dietaryRestrictionsRelations = relations(
  dietaryRestrictions,
  ({ many }) => ({
    userDietRestrictions: many(userDietRestrictions),
  }),
);
