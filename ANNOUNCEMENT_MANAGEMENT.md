# Announcement Management Feature

## Overview
The announcement management feature allows administrators to clear old announcements from the system to maintain database performance and reduce clutter.

## Features

### Clear Old Announcements
- **Date-based filtering**: Clear announcements older than a specified number of days
- **Status filtering**: Filter by announcement status (draft, published, archived)
- **Audience filtering**: Filter by target audience (all, members, specific)
- **Preview mode**: See what will be affected before making changes
- **Archive option**: Archive announcements instead of permanently deleting them

### Access Control
- Only users with `ADMIN` role can access announcement management features
- All operations require authentication

## Usage

### Accessing the Feature
1. Navigate to the Announcements page
2. Look for the "Announcement Management" section (visible only to admins)
3. Click "Clear Old Announcements" button

### Clearing Process
1. **Set Criteria**:
   - Choose how many days old announcements should be (default: 30 days)
   - Select status filter (optional)
   - Select audience filter (optional)
   - Choose to archive instead of delete (recommended)

2. **Preview**: Click "Preview" to see what announcements will be affected

3. **Execute**: Click "Clear" to perform the operation

### Safety Features
- **Preview Mode**: Always shows what will be affected before making changes
- **Archive Option**: Default to archiving instead of permanent deletion
- **Confirmation**: Clear confirmation dialog with detailed information
- **Error Handling**: Proper error messages and rollback on failure

## API Reference

### `clearOldAnnouncements(options)`

Clears old announcements based on specified criteria.

**Parameters:**
- `olderThanDays` (number, optional): Clear announcements older than this many days (default: 30)
- `status` (string, optional): Filter by status ('draft', 'published', 'archived')
- `audience` (string, optional): Filter by audience ('all', 'members', 'specific')
- `dryRun` (boolean, optional): If true, only returns what would be affected without making changes
- `archiveInstead` (boolean, optional): If true, archives announcements instead of deleting them

**Returns:**
- `Promise<{ deleted: number; announcements: Announcement[] }>`
  - `deleted`: Number of announcements affected
  - `announcements`: Array of affected announcement objects

**Example:**
```typescript
// Preview what would be archived (30+ days old, published status)
const result = await clearOldAnnouncements({
  olderThanDays: 30,
  status: 'published',
  archiveInstead: true,
  dryRun: true
});

// Actually archive old published announcements
const result = await clearOldAnnouncements({
  olderThanDays: 60,
  status: 'published',
  archiveInstead: true,
  dryRun: false
});
```

## Best Practices

1. **Always Preview First**: Use the preview feature to see what will be affected
2. **Archive Instead of Delete**: Use the archive option to maintain data integrity
3. **Start Conservative**: Begin with longer time periods (e.g., 90+ days)
4. **Monitor Usage**: Check announcement creation patterns before setting automated cleanup
5. **Backup Important Data**: Consider backing up important announcements before bulk operations

## Security

- All operations require admin authentication
- User permissions are validated on both client and server side
- All database operations are logged with user information
- Firestore security rules prevent unauthorized access

## Error Handling

The system handles various error scenarios:
- Network connectivity issues
- Permission denied errors
- Database constraint violations
- Invalid filter criteria

All errors are logged and user-friendly error messages are displayed.
