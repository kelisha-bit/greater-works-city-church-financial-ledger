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

// ===== EMAIL UTILITY FUNCTIONS =====

/**
 * Normalizes an email address for consistent comparison and storage
 * - Converts to lowercase
 * - Trims whitespace
 * - Returns undefined for empty strings
 */
export const normalizeEmail = (email?: string): string | undefined => {
  if (!email || typeof email !== 'string') return undefined;
  
  const trimmed = email.trim();
  if (trimmed === '') return undefined;
  
  return trimmed.toLowerCase();
};

/**
 * Validates email format using a comprehensive regex pattern
 */
export const isValidEmailFormat = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
};

/**
 * Finds a member by email address (case-insensitive)
 */
export const findMemberByEmail = (members: Member[], email: string): Member | undefined => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return undefined;
  
  return members.find(member => {
    const memberEmail = normalizeEmail(member.email);
    return memberEmail === normalizedEmail;
  });
};

/**
 * Checks if an email address is already associated with a member
 */
export const isEmailTaken = (members: Member[], email: string, excludeMemberId?: string): boolean => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return false;
  
  return members.some(member => {
    if (excludeMemberId && member.id === excludeMemberId) return false;
    const memberEmail = normalizeEmail(member.email);
    return memberEmail === normalizedEmail;
  });
};

/**
 * Gets all members with email addresses
 */
export const getMembersWithEmails = (members: Member[]): Member[] => {
  return members.filter(member => member.email && normalizeEmail(member.email));
};

/**
 * Finds duplicate email addresses across members
 */
export const findDuplicateEmails = (members: Member[]): Array<{
  email: string;
  members: Member[];
}> => {
  const emailGroups = new Map<string, Member[]>();
  
  members.forEach(member => {
    const normalizedEmail = normalizeEmail(member.email);
    if (normalizedEmail) {
      if (!emailGroups.has(normalizedEmail)) {
        emailGroups.set(normalizedEmail, []);
      }
      emailGroups.get(normalizedEmail)!.push(member);
    }
  });
  
  // Return only groups with more than one member
  return Array.from(emailGroups.entries())
    .filter(([_, memberList]) => memberList.length > 1)
    .map(([email, memberList]) => ({ email, members: memberList }));
};

/**
 * Validates email uniqueness across members
 */
export const validateEmailUniqueness = (
  members: Member[], 
  email: string, 
  excludeMemberId?: string
): { isValid: boolean; message?: string } => {
  const normalizedEmail = normalizeEmail(email);
  
  if (!normalizedEmail) {
    return { isValid: true }; // Empty emails are allowed
  }
  
  if (!isValidEmailFormat(normalizedEmail)) {
    return { isValid: false, message: 'Invalid email format' };
  }
  
  if (isEmailTaken(members, normalizedEmail, excludeMemberId)) {
    return { isValid: false, message: 'Email address is already associated with another member' };
  }
  
  return { isValid: true };
};

/**
 * Suggests email-based member matches for profile association
 * Useful for linking user accounts to member profiles
 */
export const suggestMemberMatches = (
  members: Member[], 
  userEmail: string, 
  userName?: string
): Member[] => {
  const normalizedUserEmail = normalizeEmail(userEmail);
  if (!normalizedUserEmail) return [];
  
  const matches: Member[] = [];
  
  // Exact email match (highest priority)
  const exactMatch = findMemberByEmail(members, normalizedUserEmail);
  if (exactMatch) {
    matches.push(exactMatch);
  }
  
  // If no exact email match and userName provided, look for name similarities
  if (matches.length === 0 && userName) {
    const nameMatches = members.filter(member => {
      const memberName = member.name.toLowerCase().trim();
      const searchName = userName.toLowerCase().trim();
      
      // Check if names contain each other or have significant overlap
      return memberName.includes(searchName) || 
             searchName.includes(memberName) ||
             memberName.split(' ').some(part => searchName.includes(part));
    });
    
    matches.push(...nameMatches);
  }
  
  return matches;
};

/**
 * Prepares member data for email-based operations
 * Ensures email is properly normalized before saving
 */
export const prepareMemberEmailData = (memberData: Partial<Member>): Partial<Member> => {
  const prepared = { ...memberData };
  
  if (prepared.email !== undefined) {
    prepared.email = normalizeEmail(prepared.email);
  }
  
  return prepared;
};
