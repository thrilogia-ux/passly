-- ============================================
-- Diagnose Login Issue - Execute in Supabase SQL Editor
-- ============================================

-- Step 1: Check if user exists
SELECT 
  id,
  email,
  name,
  role,
  LENGTH(password) as password_length,
  LEFT(password, 7) as hash_start,
  SUBSTRING(password, 1, 29) as hash_preview,
  "createdAt",
  "updatedAt"
FROM "User" 
WHERE email = 'admin@passly.com';

-- Step 2: Check password hash format
SELECT 
  email,
  CASE 
    WHEN password LIKE '$2b$10$%' THEN '✅ Hash format: CORRECT (bcrypt)'
    WHEN password LIKE '$2a$%' THEN '⚠️ Hash format: OLD (bcrypt $2a$)'
    WHEN password LIKE '$2y$%' THEN '⚠️ Hash format: OLD (bcrypt $2y$)'
    ELSE '❌ Hash format: INCORRECT - Not a valid bcrypt hash'
  END as hash_status,
  LENGTH(password) as hash_length,
  CASE 
    WHEN LENGTH(password) = 60 THEN '✅ Hash length: CORRECT (60 chars)'
    ELSE '❌ Hash length: INCORRECT (should be 60)'
  END as length_status
FROM "User" 
WHERE email = 'admin@passly.com';

-- Step 3: Show the full password hash (for debugging - DO NOT SHARE)
SELECT 
  email,
  password as full_hash
FROM "User" 
WHERE email = 'admin@passly.com';
