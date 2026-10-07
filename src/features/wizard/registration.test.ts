import {
  addSkill,
  emptyRegistration,
  isRegistration,
  isStepId,
  nextStep,
  previousStep,
  removeSkill,
} from './registration.ts';

describe('skills helpers', () => {
  it('adds trimmed skills and ignores blanks and case-insensitive duplicates', () => {
    const skills = addSkill([], '  React ');
    expect(skills).toEqual(['React']);
    expect(addSkill(skills, '   ')).toBe(skills);
    expect(addSkill(skills, 'react')).toBe(skills);
    expect(addSkill(skills, 'TypeScript')).toEqual(['React', 'TypeScript']);
  });

  it('removes a skill', () => {
    expect(removeSkill(['React', 'CSS'], 'React')).toEqual(['CSS']);
  });
});

describe('step navigation', () => {
  it('moves forward and back without leaving the step list', () => {
    expect(nextStep('personal')).toBe('address');
    expect(nextStep('review')).toBe('review');
    expect(previousStep('address')).toBe('personal');
    expect(previousStep('personal')).toBe('personal');
  });
});

describe('storage guards', () => {
  it('accepts a well-formed registration and step', () => {
    expect(isRegistration(emptyRegistration)).toBe(true);
    expect(isStepId('review')).toBe(true);
  });

  it('rejects malformed saved data', () => {
    expect(isRegistration(null)).toBe(false);
    expect(
      isRegistration({ ...emptyRegistration, preferences: { plan: 'gold', skills: [] } }),
    ).toBe(false);
    expect(isRegistration({ ...emptyRegistration, address: { country: 1 } })).toBe(false);
    expect(isStepId('done')).toBe(false);
  });
});
