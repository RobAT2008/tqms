export interface WizardFormData {
  firstName: string;
  lastName: string;
  fatherName: string;
  fin: string;
  birthDate: string;
  personalPhone: string;

  father: { fullName: string; phone: string; workplace: string };
  mother: { fullName: string; phone: string; workplace: string };
  relative: { fullName: string; phone: string; relationType: string };

  registrationAddress: { regionId: string; districtId: string; street: string; building: string };
  actualAddress: { regionId: string; districtId: string; street: string; building: string };
  sameAsRegistration: boolean;

  educationLevel: string;
  institutionRegionId: string;
  institutionDistrictId: string;
  educationInstitutionId: string;
  graduationYear: number | string;

  consentGiven: boolean;
}

export interface RegionOption {
  id: string;
  name: string;
  isCity: boolean;
  districts: { id: string; name: string }[];
}

export const STEP_TITLES = [
  "Şəxsi məlumatlar",
  "Əlaqə məlumatları",
  "Ünvan",
  "Təhsil",
  "Yoxlama",
];
