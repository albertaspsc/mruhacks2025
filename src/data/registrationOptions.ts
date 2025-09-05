/**
 * Single source of truth for all registration form options
 * This replaces database lookup tables for static options that don't change often
 */

// Gender options
export const GENDER_OPTIONS = [
  { value: "1", label: "Male" },
  { value: "2", label: "Female" },
  { value: "3", label: "Other" },
  { value: "4", label: "Prefer not to say" },
] as const;

export type GenderOption = (typeof GENDER_OPTIONS)[number];

// Year of study options
export const YEAR_OF_STUDY_OPTIONS = [
  "1st",
  "2nd",
  "3rd",
  "4th+",
  "Recent Grad",
] as const;

export type YearOfStudy = (typeof YEAR_OF_STUDY_OPTIONS)[number];

// Programming experience options
export const EXPERIENCE_OPTIONS = [
  "Beginner – What is a computer?",
  "Intermediate – My spaghetti code is made out of tagliatelle.",
  "Advanced – Firewalls disabled, mainframes bypassed.",
  "Expert – I know what a computer is.",
] as const;

export type ExperienceOption = (typeof EXPERIENCE_OPTIONS)[number];

// Interest options (max 3 selections)
export const INTEREST_OPTIONS = [
  "Mobile App Development",
  "Web Development",
  "Data Science and ML",
  "Design and User Experience (UX/UI)",
  "Game Development",
  "Cybersecurity",
  "Artificial Intelligence",
  "Cloud Computing",
  "DevOps",
  "Blockchain",
  "IoT (Internet of Things)",
  "AR/VR Development",
  "Machine Learning",
  "Full Stack Development",
  "Frontend Development",
  "Backend Development",
  "Mobile Development",
  "Desktop Applications",
  "API Development",
  "Database Design",
] as const;

export type InterestOption = (typeof INTEREST_OPTIONS)[number];

// Dietary restriction options
export const DIETARY_RESTRICTION_OPTIONS = [
  "Kosher",
  "Vegetarian",
  "Vegan",
  "Halal",
  "Gluten-free",
  "Peanuts & Treenuts allergy",
  "Dairy-free",
  "Lactose intolerant",
  "Nut allergy",
  "Shellfish allergy",
  "Soy allergy",
  "Egg allergy",
  "None",
] as const;

export type DietaryRestrictionOption =
  (typeof DIETARY_RESTRICTION_OPTIONS)[number];

// Marketing source options
export const MARKETING_OPTIONS = [
  "Poster",
  "Social Media",
  "Word of Mouth",
  "Website/Googling it",
  "Attended the event before",
  "Other",
] as const;

export type MarketingOption = (typeof MARKETING_OPTIONS)[number];

// Parking options
export const PARKING_OPTIONS = ["Yes", "No", "Not sure"] as const;

export type ParkingOption = (typeof PARKING_OPTIONS)[number];

// Previous attendance options
export const PREVIOUS_ATTENDANCE_OPTIONS = [
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
] as const;

export type PreviousAttendanceOption =
  (typeof PREVIOUS_ATTENDANCE_OPTIONS)[number];

// Common Canadian universities (for autocomplete)
export const COMMON_UNIVERSITIES = [
  "University of Calgary",
  "University of Alberta",
  "University of British Columbia",
  "University of Toronto",
  "McGill University",
  "University of Waterloo",
  "McMaster University",
  "University of Ottawa",
  "Queen's University",
  "Western University",
  "University of Saskatchewan",
  "University of Manitoba",
  "Dalhousie University",
  "Memorial University of Newfoundland",
  "University of New Brunswick",
  "University of Prince Edward Island",
  "Acadia University",
  "Mount Allison University",
  "St. Francis Xavier University",
  "University of Guelph",
  "Carleton University",
  "Concordia University",
  "Ryerson University (Toronto Metropolitan University)",
  "York University",
  "University of Windsor",
  "Brock University",
  "Trent University",
  "Lakehead University",
  "Laurentian University",
  "Nipissing University",
  "University of Northern British Columbia",
  "Thompson Rivers University",
  "University of the Fraser Valley",
  "Simon Fraser University",
  "University of Victoria",
  "University of Regina",
  "Brandon University",
  "University of Winnipeg",
  "Cape Breton University",
  "St. Mary's University",
  "Mount Saint Vincent University",
  "Université de Montréal",
  "Université Laval",
  "Université de Sherbrooke",
  "Université du Québec à Montréal",
  "Université du Québec à Trois-Rivières",
  "Université du Québec à Chicoutimi",
  "Université du Québec à Rimouski",
  "Université du Québec en Outaouais",
  "Université du Québec à Hull",
  "Université du Québec à Rouyn-Noranda",
  "Université du Québec à Rimouski",
  "Université du Québec à Trois-Rivières",
  "Université du Québec à Chicoutimi",
  "Université du Québec à Rimouski",
  "Université du Québec en Outaouais",
  "Université du Québec à Hull",
  "Université du Québec à Rouyn-Noranda",
] as const;

export type CommonUniversity = (typeof COMMON_UNIVERSITIES)[number];

// Common majors/programs (for autocomplete)
export const COMMON_MAJORS = [
  "Computer Science",
  "Software Engineering",
  "Computer Engineering",
  "Information Technology",
  "Data Science",
  "Mathematics",
  "Statistics",
  "Physics",
  "Engineering",
  "Business Administration",
  "Commerce",
  "Economics",
  "Psychology",
  "Biology",
  "Chemistry",
  "Biochemistry",
  "Environmental Science",
  "Geology",
  "Geography",
  "Political Science",
  "International Relations",
  "History",
  "English Literature",
  "Philosophy",
  "Sociology",
  "Anthropology",
  "Linguistics",
  "Fine Arts",
  "Graphic Design",
  "Digital Media",
  "Film Studies",
  "Journalism",
  "Communications",
  "Public Relations",
  "Marketing",
  "Finance",
  "Accounting",
  "Human Resources",
  "Management",
  "Operations Management",
  "Supply Chain Management",
  "Project Management",
  "Health Sciences",
  "Nursing",
  "Medicine",
  "Pharmacy",
  "Dentistry",
  "Veterinary Medicine",
  "Kinesiology",
  "Physical Education",
  "Education",
  "Social Work",
  "Criminology",
  "Law",
  "Architecture",
  "Urban Planning",
  "Environmental Engineering",
  "Civil Engineering",
  "Mechanical Engineering",
  "Electrical Engineering",
  "Chemical Engineering",
  "Materials Engineering",
  "Aerospace Engineering",
  "Biomedical Engineering",
  "Industrial Engineering",
  "Systems Engineering",
  "Mining Engineering",
  "Petroleum Engineering",
  "Geological Engineering",
  "Environmental Engineering",
  "Agricultural Engineering",
  "Food Science",
  "Nutrition",
  "Culinary Arts",
  "Hospitality Management",
  "Tourism",
  "Event Management",
  "Sports Management",
  "Recreation Management",
  "Music",
  "Theatre",
  "Dance",
  "Visual Arts",
  "Art History",
  "Art Education",
  "Interior Design",
  "Fashion Design",
  "Textile Design",
  "Industrial Design",
  "Product Design",
  "User Experience Design",
  "User Interface Design",
  "Web Design",
  "Game Design",
  "Animation",
  "Digital Arts",
  "Photography",
  "Videography",
  "Broadcasting",
  "Radio and Television",
  "Media Studies",
  "Communication Studies",
  "Public Administration",
  "Public Policy",
  "International Development",
  "Development Studies",
  "Gender Studies",
  "Women's Studies",
  "Indigenous Studies",
  "Canadian Studies",
  "American Studies",
  "European Studies",
  "Asian Studies",
  "African Studies",
  "Latin American Studies",
  "Middle Eastern Studies",
  "Religious Studies",
  "Theology",
  "Classical Studies",
  "Medieval Studies",
  "Renaissance Studies",
  "Modern Languages",
  "French",
  "Spanish",
  "German",
  "Italian",
  "Portuguese",
  "Russian",
  "Chinese",
  "Japanese",
  "Korean",
  "Arabic",
  "Hebrew",
  "Latin",
  "Greek",
  "Other",
] as const;

export type CommonMajor = (typeof COMMON_MAJORS)[number];

// Helper functions for validation and mapping
export const getGenderById = (id: string): GenderOption | undefined => {
  return GENDER_OPTIONS.find((option) => option.value === id);
};

export const getExperienceMapping = (): Record<string, number> => {
  return {
    "Beginner – What is a computer?": 1,
    "Intermediate – My spaghetti code is made out of tagliatelle.": 2,
    "Advanced – Firewalls disabled, mainframes bypassed.": 3,
    "Expert – I know what a computer is.": 4,
    Beginner: 1,
    Intermediate: 2,
    Advanced: 3,
    Expert: 4,
  };
};

export const getMarketingMapping = (): Record<string, number> => {
  return {
    Poster: 1,
    "Social Media": 2,
    "Word of Mouth": 3,
    "Website/Googling it": 4,
    "Attended the event before": 5,
    Other: 6,
  };
};

// Validation helpers
export const isValidInterest = (interest: string): boolean => {
  return INTEREST_OPTIONS.includes(interest as InterestOption);
};

export const isValidDietaryRestriction = (restriction: string): boolean => {
  return DIETARY_RESTRICTION_OPTIONS.includes(
    restriction as DietaryRestrictionOption,
  );
};

export const isValidMarketingOption = (marketing: string): boolean => {
  return MARKETING_OPTIONS.includes(marketing as MarketingOption);
};

export const isValidYearOfStudy = (year: string): boolean => {
  return YEAR_OF_STUDY_OPTIONS.includes(year as YearOfStudy);
};

export const isValidParkingOption = (parking: string): boolean => {
  return PARKING_OPTIONS.includes(parking as ParkingOption);
};
