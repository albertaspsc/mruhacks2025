/**
 * Static lookup table data
 * This data is generated from the database and should not be modified manually.
 */

// Complete university and major mappings - single source of truth
export const universityMappings = {
  // Current/clean entries
  15: "SAIT",
  16: "Athabasca",
  34: "University of Calgary",
  35: "University of Waterloo",
  36: "Bowvalley College",
  37: "University of Toronto",
  39: "University of Saskatchewan",
  40: "University of Victoria",
  42: "Mount Royal University",
  43: "University of British Columbia",
  44: "Stanford University",

  // Legacy entries that map to current ones
  1: "Mount Royal University", // MRU
  2: "University of Calgary", // U of C
  30: "University of British Columbia", // UBC
  32: "Mount Royal University", // Mount Royal University
  33: "Mount Royal University", // Mount Royal University (with trailing space)
  38: "University of Calgary", // University of Calgary (with trailing space)
  41: "Mount Royal University", // Mount royal university (lowercase)
  45: "Mount Royal University", // Mount Royal
  46: "Mount Royal University", // Mount Royal university (with trailing space)
  47: "Mount Royal University", // Mount royal (lowercase)
  48: "Mount Royal University", // MountRoyalUniversity
  49: "Mount Royal University", // mount royal (lowercase)
  50: "Mount Royal University", // Mount Royal (with trailing space)
} as const;

export const majorMappings = {
  // Current/clean entries
  1: "Computer Information Systems",
  2: "Data Science",
  3: "Computer Science",
  4: "Mathematics",
  29: "Accounting",
  44: "Data Analytics",
  47: "Software Development",
  48: "Software Engineering",
  52: "Geology",
  54: "University Entrance Option",
  56: "Open Studies",
  60: "Criminal Justice",
  61: "Natural Science (Concentration in CS and Math)",
  64: "Information Design",
  66: "BCom",
  67: "Business Administration",
  68: "BSc. General Science",
  69: "Electrical Engineering",
  76: "Mechanical Engineering",
  77: "Science",

  // Legacy entries that map to current ones
  46: "Software Development", // Software development
  49: "Computer Information Systems", // Computer Information systems
  50: "Computer Information Systems", // BCIS
  51: "Computer Science", // Computer science (with space)
  53: "Computer Science", // Comp Sci
  55: "Computer Information Systems", // Bcis
  57: "Computer Science", // Comp Science (with space)
  58: "Computer Science", // Computer science
  59: "Computer Science", // B.Sc. Computer Science
  62: "Computer Information Systems", // Computer information systems
  63: "Computer Information Systems", // B.Sc. Computer info systems
  65: "Computer Science", // Computer Science (with space)
  70: "Information Design", // Information Design
  71: "Computer Science", // Computer science- Bsc
  72: "Computer Science", // computer science (with space)
  73: "Computer Science", // CS
  74: "Computer Information Systems", // Computer Information System (with space)
  75: "Computer Information Systems", // Computer Info Systems
  78: "Computer Science", // CIS
  79: "Mechanical Engineering", // Mechanical engineering
  80: "Computer Information Systems", // Bachelor of Computer information systems
  81: "Computer Science", // Batchlor of science, Computer science
  82: "Computer Science", // Computer scoencw (typo)
  83: "University Entrance Option", // University Entrance Option
  84: "Computer Science", // computer science
} as const;

// Helper functions to get display values for any ID (including legacy)
export function getUniversityDisplayValue(id: number): string {
  return (
    universityMappings[id as keyof typeof universityMappings] ||
    "Unknown University"
  );
}

export function getMajorDisplayValue(id: number): string {
  return majorMappings[id as keyof typeof majorMappings] || "Unknown Major";
}

// Helper functions to get clean options for dropdowns (only current IDs)
export function getCleanUniversityOptions() {
  return Object.entries(universityMappings)
    .filter(([id]) => {
      const numId = parseInt(id);
      // Only include current IDs (not legacy ones)
      return [15, 16, 34, 35, 36, 37, 39, 40, 42, 43, 44].includes(numId);
    })
    .map(([id, name]) => ({ id: parseInt(id), uni: name }));
}

export function getCleanMajorOptions() {
  return Object.entries(majorMappings)
    .filter(([id]) => {
      const numId = parseInt(id);
      // Only include current IDs (not legacy ones)
      return [
        1, 2, 3, 4, 29, 44, 47, 48, 52, 54, 56, 60, 61, 64, 66, 67, 68, 69, 76,
        77,
      ].includes(numId);
    })
    .map(([id, name]) => ({ id: parseInt(id), major: name }));
}

export const lookupTables = {
  genders: [
    { id: 1, gender: "Male" },
    { id: 2, gender: "Female" },
    { id: 3, gender: "Non-binary" },
    { id: 4, gender: "Prefer not to say" },
    { id: 5, gender: "Other" },
  ],
  universities: getCleanUniversityOptions(),
  majors: getCleanMajorOptions(),
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
  experienceTypes: [
    { id: 1, experience: "Beginner" },
    { id: 2, experience: "Intermediate" },
    { id: 3, experience: "Advanced" },
    { id: 4, experience: "Expert" },
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
export type ExperienceTypeOption =
  (typeof lookupTables.experienceTypes)[number];

export type AllLookupOptions = {
  genders: GenderOption[];
  universities: UniversityOption[];
  majors: MajorOption[];
  interests: InterestOption[];
  dietaryRestrictions: DietaryRestrictionOption[];
  marketingTypes: MarketingTypeOption[];
  experienceTypes: ExperienceTypeOption[];
};
