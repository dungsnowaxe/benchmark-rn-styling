export type ValidationState = 'error' | 'warning' | 'success' | 'disabled' | 'focused' | 'filled';

export type FormValidationRow = {
  id: string;
  label: string;
  value: string;
  helperText: string;
  state: ValidationState;
};

const FIELD_LABELS = [
  'Username',
  'Email',
  'Password',
  'Confirm Password',
  'Full Name',
  'Phone',
  'Address',
  'City',
  'State',
  'Zip Code',
  'Country',
  'Company',
  'Job Title',
  'Website',
  'Bio',
  'Twitter',
  'LinkedIn',
  'GitHub',
  'Portfolio',
  'Referral',
  'Coupon Code',
  'Notes',
  'Preferred Contact',
  'Timezone',
  'Age',
  'Gender',
  'Income',
  'Education',
  'Experience',
  'Skills',
  'Languages',
  'Certifications',
  'Projects',
  'Publications',
  'Awards',
  'Interests',
  'Goals',
  'Challenges',
  'Achievements',
  'References',
  'Availability',
  'Rate',
  'Currency',
  'Payment Method',
  'Bank Name',
  'Account Number',
  'Routing Number',
  'Tax ID',
  'Signature',
  'Date of Birth',
  'Nationality',
  'Passport',
  'Visa',
  'Work Authorization',
];

const VALIDATION_STATES: ValidationState[] = [
  'error',
  'warning',
  'success',
  'disabled',
  'focused',
  'filled',
];

function seededRandom(seed: number): number {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export function makeFormValidationRows(count: number): FormValidationRow[] {
  const rows: FormValidationRow[] = [];
  for (let i = 0; i < count; i++) {
    const seed = i * 54321;
    const stateIndex = Math.floor(seededRandom(seed) * VALIDATION_STATES.length);
    rows.push({
      id: `form-${i}`,
      label: FIELD_LABELS[i % FIELD_LABELS.length],
      value: seededRandom(seed + 1) > 0.3 ? 'Sample value' : '',
      helperText: getHelperText(VALIDATION_STATES[stateIndex]),
      state: VALIDATION_STATES[stateIndex],
    });
  }
  return rows;
}

function getHelperText(state: ValidationState): string {
  switch (state) {
    case 'error':
      return 'This field is required';
    case 'warning':
      return 'This may affect your application';
    case 'success':
      return 'Looks good!';
    case 'disabled':
      return 'This field is disabled';
    case 'focused':
      return 'Enter your information';
    case 'filled':
      return 'Completed';
    default:
      return '';
  }
}

export function cycleFormValidationStates(
  prev: FormValidationRow[],
  seed: number,
): FormValidationRow[] {
  return prev.map((row, idx) => {
    const rand = seededRandom(seed + idx * 100);
    const stateIndex = Math.floor(rand * VALIDATION_STATES.length);
    return {
      ...row,
      state: VALIDATION_STATES[stateIndex],
      helperText: getHelperText(VALIDATION_STATES[stateIndex]),
    };
  });
}
