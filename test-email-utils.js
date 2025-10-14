// Simple test to verify email utility functions
// Run this with: node test-email-utils.js

// Mock member data for testing
const mockMembers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '123-456-7890'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'JANE.SMITH@EXAMPLE.COM',
    phone: '098-765-4321'
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: '',
    phone: '555-123-4567'
  },
  {
    id: '4',
    name: 'Alice Brown',
    email: 'alice.brown@example.com',
    phone: '444-555-6666'
  }
];

// Email utility functions (simplified for testing)
function normalizeEmail(email) {
  if (!email || typeof email !== 'string') return '';
  return email.toLowerCase().trim();
}

function findMemberByEmail(members, email) {
  if (!email) return null;
  const normalizedEmail = normalizeEmail(email);
  return members.find(member => 
    member.email && normalizeEmail(member.email) === normalizedEmail
  ) || null;
}

function isEmailTaken(members, email, excludeMemberId) {
  if (!email) return false;
  const normalizedEmail = normalizeEmail(email);
  return members.some(member => 
    member.id !== excludeMemberId && 
    member.email && 
    normalizeEmail(member.email) === normalizedEmail
  );
}

function getMembersWithEmails(members) {
  return members.filter(member => member.email && member.email.trim() !== '');
}

function findDuplicateEmails(members) {
  const emailCounts = {};
  const duplicates = [];
  
  members.forEach(member => {
    if (member.email && member.email.trim() !== '') {
      const normalizedEmail = normalizeEmail(member.email);
      if (!emailCounts[normalizedEmail]) {
        emailCounts[normalizedEmail] = [];
      }
      emailCounts[normalizedEmail].push(member);
    }
  });
  
  Object.values(emailCounts).forEach(memberGroup => {
    if (memberGroup.length > 1) {
      duplicates.push(...memberGroup);
    }
  });
  
  return duplicates;
}

// Run tests
console.log('🧪 Testing Email Utility Functions\n');

console.log('1. Testing normalizeEmail:');
console.log('  normalizeEmail("JOHN.DOE@EXAMPLE.COM") =>', normalizeEmail("JOHN.DOE@EXAMPLE.COM"));
console.log('  normalizeEmail("  jane@test.com  ") =>', normalizeEmail("  jane@test.com  "));
console.log('  normalizeEmail("") =>', normalizeEmail(""));
console.log('  normalizeEmail(null) =>', normalizeEmail(null));

console.log('\n2. Testing findMemberByEmail:');
console.log('  Finding "john.doe@example.com":', findMemberByEmail(mockMembers, "john.doe@example.com"));
console.log('  Finding "JANE.SMITH@EXAMPLE.COM":', findMemberByEmail(mockMembers, "JANE.SMITH@EXAMPLE.COM"));
console.log('  Finding "nonexistent@example.com":', findMemberByEmail(mockMembers, "nonexistent@example.com"));

console.log('\n3. Testing isEmailTaken:');
console.log('  Is "john.doe@example.com" taken?', isEmailTaken(mockMembers, "john.doe@example.com"));
console.log('  Is "new.email@example.com" taken?', isEmailTaken(mockMembers, "new.email@example.com"));
console.log('  Is "john.doe@example.com" taken (excluding member 1)?', isEmailTaken(mockMembers, "john.doe@example.com", "1"));

console.log('\n4. Testing getMembersWithEmails:');
const membersWithEmails = getMembersWithEmails(mockMembers);
console.log('  Members with emails:', membersWithEmails.map(m => ({ name: m.name, email: m.email })));

console.log('\n5. Testing findDuplicateEmails:');
// Add a duplicate for testing
const testMembers = [...mockMembers, { id: '5', name: 'John Duplicate', email: 'john.doe@example.com' }];
const duplicates = findDuplicateEmails(testMembers);
console.log('  Duplicate emails found:', duplicates.map(m => ({ name: m.name, email: m.email })));

console.log('\n✅ All tests completed!');