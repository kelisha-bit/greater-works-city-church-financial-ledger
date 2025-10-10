# User Roles System Review

## 📋 Overview

The app implements a role-based access control (RBAC) system with three user roles, each with different permission levels.

---

## 👥 User Roles Defined

### 1. **Admin** (`admin`)
- **Full access** to all features
- Can manage budgets
- Can manage members
- Can view and edit all transactions
- Can delete records
- Can manage other users' roles

### 2. **Editor** (`editor`)
- **Moderate access** to most features
- Can view and edit transactions
- Can manage members
- Can view reports and analytics
- **Cannot** manage budgets
- **Cannot** delete records (restricted by Firestore rules)

### 3. **Viewer** (`viewer`)
- **Read-only access**
- Can view dashboard
- Can view transactions
- Can view reports
- **Cannot** edit or delete anything
- **Cannot** access member management
- **Cannot** access budget management

---

## 🔍 Current Implementation

### **1. Role Definition** (`types.ts`)
```typescript
export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}
```

### **2. Role Storage**
- Roles are stored in **Firestore** under `/users/{userId}/role`
- Default role: **ADMIN** (for demo/development purposes)
- Role is loaded when user authenticates

### **3. Role Management** (`AuthContext.tsx`)
- `loadUserRole()` - Fetches role from Firestore
- `setUserRole()` - Updates user role in Firestore
- Auto-creates user document with ADMIN role if not exists

---

## 🚨 Issues & Concerns

### **1. Security Issue: Default Admin Role**
**Problem:**
```typescript
const [userRole, setUserRoleState] = useState<UserRole>(UserRole.ADMIN);
```
- Every new user defaults to **ADMIN** role
- This is a **major security risk** in production
- New signups automatically get full access

**Recommendation:**
- Change default to `UserRole.VIEWER`
- Require manual role assignment by existing admin

### **2. Role Mismatch in Firestore Rules**
**Problem:**
```javascript
// In firestore.rules
function isAdminOrTreasurer() {
  return hasRole('Admin') || hasRole('Treasurer');
}
```
- Rules check for `'Admin'` and `'Treasurer'`
- App uses `'admin'` and `'editor'`
- **Case mismatch** and **role name mismatch**

**Recommendation:**
- Align role names between app and Firestore rules
- Use consistent casing (lowercase recommended)

### **3. Missing "Treasurer" Role**
**Problem:**
- Firestore rules reference `'Treasurer'` role
- App only defines `admin`, `editor`, `viewer`
- No "Treasurer" role in the app

**Recommendation:**
- Add Treasurer role to app
- Or remove Treasurer from Firestore rules

### **4. Limited UI Role Enforcement**
**Problem:**
- Only Header component checks roles for navigation
- Other components don't enforce role-based permissions
- Users could potentially bypass UI restrictions

**Current UI Restrictions:**
```typescript
// Members tab - only Editor and Admin
{(userRole === UserRole.EDITOR || userRole === UserRole.ADMIN) && (
  <button>Members</button>
)}

// Budgets tab - only Admin
{userRole === UserRole.ADMIN && (
  <button>Budgets</button>
)}
```

**Recommendation:**
- Add role checks to all sensitive components
- Disable edit/delete buttons for Viewers
- Show appropriate messages for restricted actions

### **5. No Role Management UI**
**Problem:**
- No interface for admins to manage user roles
- Must manually edit Firestore to change roles
- No way to see all users and their roles

**Recommendation:**
- Create User Management component
- Allow admins to view all users
- Allow admins to assign/change roles

---

## ✅ Recommended Improvements

### **Priority 1: Fix Security Issues**

#### 1.1 Change Default Role to Viewer
```typescript
// In AuthContext.tsx
const [userRole, setUserRoleState] = useState<UserRole>(UserRole.VIEWER);

// In loadUserRole function
setUserRoleState(UserRole.VIEWER); // Instead of ADMIN
```

#### 1.2 Fix Firestore Rules Role Names
```javascript
// In firestore.rules
function isAdminOrEditor() {
  return hasRole('admin') || hasRole('editor');
}

// Update delete permissions
allow delete: if isOwner(userId) && hasRole('admin');
```

### **Priority 2: Add Treasurer Role**

#### 2.1 Update types.ts
```typescript
export enum UserRole {
  ADMIN = 'admin',
  TREASURER = 'treasurer',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}
```

#### 2.2 Define Treasurer Permissions
- Full financial access (transactions, donations, reports)
- Can manage budgets
- **Cannot** manage members
- **Cannot** manage user roles

### **Priority 3: Create User Management Component**

Features needed:
- List all users with their roles
- Search/filter users
- Change user roles (admin only)
- View user activity/last login
- Disable/enable users

### **Priority 4: Enhance Role Enforcement**

Add role checks to:
- Transaction forms (disable for viewers)
- Member forms (disable for viewers)
- Delete buttons (hide for non-admins)
- Budget management (admin/treasurer only)
- Reports export (all roles)

---

## 📊 Recommended Role Permissions Matrix

| Feature | Admin | Treasurer | Editor | Viewer |
|---------|-------|-----------|--------|--------|
| **Dashboard** | ✅ Full | ✅ Full | ✅ Full | ✅ Read |
| **Transactions** | ✅ Full | ✅ Full | ✅ Full | ✅ Read |
| **Add Transaction** | ✅ | ✅ | ✅ | ❌ |
| **Edit Transaction** | ✅ | ✅ | ✅ | ❌ |
| **Delete Transaction** | ✅ | ✅ | ❌ | ❌ |
| **Donations** | ✅ Full | ✅ Full | ✅ Full | ✅ Read |
| **Members** | ✅ Full | ❌ | ✅ Full | ❌ |
| **Add Member** | ✅ | ❌ | ✅ | ❌ |
| **Edit Member** | ✅ | ❌ | ✅ | ❌ |
| **Delete Member** | ✅ | ❌ | ❌ | ❌ |
| **Budgets** | ✅ Full | ✅ Full | ❌ | ❌ |
| **Reports** | ✅ Full | ✅ Full | ✅ Full | ✅ Read |
| **Export Data** | ✅ | ✅ | ✅ | ✅ |
| **Backup/Restore** | ✅ | ❌ | ❌ | ❌ |
| **User Management** | ✅ | ❌ | ❌ | ❌ |
| **Settings** | ✅ | ⚠️ Limited | ❌ | ❌ |

---

## 🔧 Implementation Checklist

### Immediate Fixes (Critical):
- [ ] Change default role from ADMIN to VIEWER
- [ ] Fix Firestore rules role name mismatch
- [ ] Align role names (use lowercase consistently)
- [ ] Add role checks to delete operations in UI

### Short-term (High Priority):
- [ ] Add Treasurer role to the system
- [ ] Create User Management component
- [ ] Add role-based button disabling
- [ ] Show appropriate messages for restricted actions
- [ ] Add role change audit logging

### Medium-term (Enhancement):
- [ ] Add role-based dashboard widgets
- [ ] Implement permission-based menu system
- [ ] Add user activity tracking
- [ ] Create role assignment workflow
- [ ] Add email notifications for role changes

### Long-term (Advanced):
- [ ] Implement custom permissions (beyond roles)
- [ ] Add department-based access control
- [ ] Multi-church support with separate roles
- [ ] Role-based data filtering
- [ ] Advanced audit trail system

---

## 🔐 Security Best Practices

### 1. **Never Trust Client-Side Checks**
- Always enforce permissions in Firestore rules
- UI checks are for UX only, not security

### 2. **Principle of Least Privilege**
- Give users minimum permissions needed
- Start with Viewer, upgrade as needed

### 3. **Audit Trail**
- Log all role changes
- Track who made changes and when
- Store in separate audit collection

### 4. **Regular Review**
- Periodically review user roles
- Remove inactive users
- Audit admin access

### 5. **Role Assignment Process**
- Require approval for role upgrades
- Document why each user has their role
- Have a process for role requests

---

## 📝 Example: User Management Component

```typescript
// UserManagement.tsx (to be created)
interface UserManagementProps {
  // Component for admins to manage user roles
}

Features:
- List all users from Firestore
- Display current role for each user
- Dropdown to change roles (admin only)
- Search and filter users
- Last login timestamp
- Activity summary
```

---

## 🎯 Quick Wins

### 1. Add Role Badge to Profile
Show user's current role prominently in the UI

### 2. Disable Buttons Based on Role
```typescript
<button 
  disabled={userRole === UserRole.VIEWER}
  className={userRole === UserRole.VIEWER ? 'opacity-50 cursor-not-allowed' : ''}
>
  Edit
</button>
```

### 3. Show Permission Messages
```typescript
{userRole === UserRole.VIEWER && (
  <div className="bg-yellow-50 p-4 rounded">
    <p>You have read-only access. Contact an admin to request edit permissions.</p>
  </div>
)}
```

---

## 📞 Support & Questions

For role-related issues:
1. Check user document in Firestore: `/users/{userId}`
2. Verify role field exists and has correct value
3. Check browser console for role loading errors
4. Ensure Firestore rules are deployed

---

## Summary

**Current State:**
- ✅ Basic role system implemented
- ✅ Three roles defined (admin, editor, viewer)
- ✅ Firestore rules with role checks
- ⚠️ Security issues with default admin role
- ⚠️ Role name mismatches
- ❌ No user management UI
- ❌ Limited role enforcement in UI

**Recommended Priority:**
1. **Fix security issues** (default role, rule mismatches)
2. **Add Treasurer role** (referenced in rules)
3. **Create user management UI**
4. **Enhance role enforcement** throughout app

The role system has a good foundation but needs security fixes and UI enhancements before production use.
