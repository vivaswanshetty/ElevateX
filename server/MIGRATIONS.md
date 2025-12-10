# Database Migrations

## Overview
This system automatically runs database migrations on server startup to ensure all users have the latest schema fields.

## How It Works

### Automatic Migrations
- ✅ Migrations run **automatically** every time the server starts
- ✅ Each migration runs **only once** (tracked in the `migrations` collection)
- ✅ Safe to restart server - already-applied migrations are skipped
- ✅ Server continues if migration fails (with warning)

### Current Migrations

#### `add_user_social_features_2025`
Adds the following fields to existing users:
- `followers` - Array of user IDs
- `following` - Array of user IDs
- `followRequests` - Array of pending follow request IDs
- `isPrivate` - Boolean for private account setting
- `socials` - Object with Twitter, LinkedIn, GitHub, Website links
- `work` - Array of work experience
- `education` - Array of education history
- `bio` - User biography text
- `xp` - Experience points (gamification)
- `coins` - Virtual currency balance
- `avatar` - Auto-generated unique avatar

## Adding New Migrations

### Method 1: Update Existing Migration (Recommended for now)
1. Edit `/server/scripts/migrateUsers.js`
2. Add your new field checks in the migration function
3. Restart the server - it will apply to all users

### Method 2: Create New Migration (For future major updates)
1. Create a new file: `/server/scripts/migrate_your_feature_name.js`
2. Copy the structure from `migrateUsers.js`
3. Change `MIGRATION_NAME` to something unique
4. Import and run it in `/server/index.js`

## Manual Migration
You can also run migrations manually:

```bash
cd server
node scripts/migrateUsers.js
```

## Migration Tracking
All completed migrations are stored in the `migrations` collection with:
- `name` - Unique migration identifier
- `appliedAt` - Timestamp of when it was applied

## Best Practices

1. **New Fields in Schema**: Always add default values
   ```javascript
   newField: { type: String, default: 'default_value' }
   ```

2. **Test First**: Run migration manually before deploying
   ```bash
   node server/scripts/migrateUsers.js
   ```

3. **Never Delete**: Old migration code should stay - it's documentation of schema evolution

4. **Idempotent**: Migrations should be safe to run multiple times (they check if field exists)

## Status
- ✅ Automatic migration system active
- ✅ Current migration: `add_user_social_features_2025`
- ✅ All existing users updated
- ✅ New users automatically get all fields via schema defaults
