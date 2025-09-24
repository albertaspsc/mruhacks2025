/**
 * Static lookup table data
 * This data is generated from the database and should not be modified manually.
 */

export const lookupTables = {
  genders: [
    { id: 1, gender: "Male" },
    { id: 2, gender: "Female" },
    { id: 3, gender: "Non-binary" },
    { id: 4, gender: "Prefer not to say" },
    { id: 5, gender: "Other" },
  ],
  universities: [
    { id: 15, uni: "SAIT" },
    { id: 16, uni: "Athabasca" },
    { id: 34, uni: "University of Calgary" },
    { id: 35, uni: "University of Waterloo" },
    { id: 36, uni: "Bowvalley College" },
    { id: 37, uni: "University of Toronto" },
    { id: 39, uni: "University of Saskatchewan" },
    { id: 40, uni: "University of Victoria" },
    { id: 42, uni: "Mount Royal University" },
    { id: 43, uni: "University of British Columbia" },
    { id: 44, uni: "Stanford University" },
  ],
  majors: [
    { id: 1, major: "Computer Information Systems" },
    { id: 2, major: "Data Science" },
    { id: 3, major: "Computer Science" },
    { id: 4, major: "Mathematics" },
    { id: 29, major: "Accounting" },
    { id: 44, major: "Data Analytics" },
    { id: 47, major: "Software Development" },
    { id: 48, major: "Software Engineering" },
    { id: 52, major: "Geology" },
    { id: 54, major: "University Entrance Option" },
    { id: 56, major: "Open Studies" },
    { id: 60, major: "Criminal Justice" },
    { id: 61, major: "Natural Science (Concentration in CS and Math)" },
    { id: 64, major: "Information Design" },
    { id: 66, major: "BCom" },
    { id: 67, major: "Business Administration" },
    { id: 68, major: "BSc. General Science" },
    { id: 69, major: "Electrical Engineering" },
    { id: 73, major: "CS" },
    { id: 76, major: "Mechanical Engineering" },
    { id: 77, major: "Science" },
  ],
  interests: [
    { id: 1, interest: "Mobile App Development" },
    { id: 2, interest: "Web Development" },
    { id: 3, interest: "Data Science and ML" },
    { id: 4, interest: "Design and User Experience (UX/UI)" },
    { id: 5, interest: "Game Development" },
  ],
  dietaryRestrictions: [
    { id: 1, restriction: "Kosher" },
    { id: 2, restriction: "Vegetarian" },
    { id: 3, restriction: "Vegan" },
    { id: 4, restriction: "Halal" },
    { id: 5, restriction: "Gluten-free" },
    { id: 6, restriction: "Peanuts and Treenuts allergy" },
  ],
  marketingTypes: [
    { id: 1, marketing: "Poster" },
    { id: 2, marketing: "Social Media" },
    { id: 3, marketing: "Word of Mouth" },
    { id: 4, marketing: "Website/Googling it" },
    { id: 5, marketing: "Attended the event before" },
    { id: 6, marketing: "Other" },
  ],
} as const;

// Type definitions for the lookup tables
export type GenderOption = (typeof lookupTables.genders)[number];
export type UniversityOption = (typeof lookupTables.universities)[number];
export type MajorOption = (typeof lookupTables.majors)[number];
export type InterestOption = (typeof lookupTables.interests)[number];
export type DietaryRestrictionOption =
  (typeof lookupTables.dietaryRestrictions)[number];
export type MarketingTypeOption = (typeof lookupTables.marketingTypes)[number];

export type AllLookupOptions = {
  genders: GenderOption[];
  universities: UniversityOption[];
  majors: MajorOption[];
  interests: InterestOption[];
  dietaryRestrictions: DietaryRestrictionOption[];
  marketingTypes: MarketingTypeOption[];
};
