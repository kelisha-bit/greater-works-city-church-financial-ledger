import { Member } from '../types';

/**
 * Generates a unique tithe/envelope number for new members
 * Format: ENV-YYYY-NNNN (e.g., ENV-2024-0001)
 */
export const generateTitheNumber = (existingMembers: Member[]): string => {
  const currentYear = new Date().getFullYear();

  // Filter existing tithe numbers for the current year
  const currentYearTitheNumbers = existingMembers
    .map(member => member.titheNumber)
    .filter((titheNumber): titheNumber is string => {
      return titheNumber !== undefined &&
             titheNumber.startsWith('ENV-') &&
             titheNumber.includes(`-${currentYear}-`);
    })
    .map(titheNumber => {
      // Extract the number part (last 4 digits)
      const parts = titheNumber.split('-');
      return parseInt(parts[2], 10);
    })
    .filter(num => !isNaN(num));

  // Find the next available number for this year
  let nextNumber = 1;
  while (currentYearTitheNumbers.includes(nextNumber)) {
    nextNumber++;
  }

  // Format with leading zeros
  const formattedNumber = nextNumber.toString().padStart(4, '0');
  return `ENV-${currentYear}-${formattedNumber}`;
};

/**
 * Generates a unique giving ID for new members
 * Format: GID-YYYY-NNNN (e.g., GID-2024-0001)
 */
export const generateGivingId = (existingMembers: Member[]): string => {
  const currentYear = new Date().getFullYear();

  // Filter existing giving IDs for the current year
  const currentYearGivingIds = existingMembers
    .map(member => member.givingId)
    .filter((givingId): givingId is string => {
      return givingId !== undefined &&
             givingId.startsWith('GID-') &&
             givingId.includes(`-${currentYear}-`);
    })
    .map(givingId => {
      // Extract the number part (last 4 digits)
      const parts = givingId.split('-');
      return parseInt(parts[2], 10);
    })
    .filter(num => !isNaN(num));

  // Find the next available number for this year
  let nextNumber = 1;
  while (currentYearGivingIds.includes(nextNumber)) {
    nextNumber++;
  }

  // Format with leading zeros
  const formattedNumber = nextNumber.toString().padStart(4, '0');
  return `GID-${currentYear}-${formattedNumber}`;
};

/**
 * Generates both tithe number and giving ID for a new member
 */
export const generateMemberIdentifiers = (existingMembers: Member[]): {
  titheNumber: string;
  givingId: string;
} => {
  return {
    titheNumber: generateTitheNumber(existingMembers),
    givingId: generateGivingId(existingMembers)
  };
};
