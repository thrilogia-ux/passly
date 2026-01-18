-- ============================================
-- Test Database Connection and User
-- Execute this in Supabase SQL Editor
-- ============================================

-- Test 1: Check if user exists
SELECT 
  'User exists' as test,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ YES'
    ELSE '❌ NO'
  END as result
FROM "User" 
WHERE email = 'admin@passly.com';

-- Test 2: Check password hash format
SELECT 
  'Password hash format' as test,
  email,
  LENGTH(password) as hash_length,
  LEFT(password, 7) as hash_start,
  CASE 
    WHEN password LIKE '$2b$10$%' AND LENGTH(password) = 60 THEN '✅ CORRECT'
    ELSE '❌ INCORRECT'
  END as result
FROM "User" 
WHERE email = 'admin@passly.com';

-- Test 3: Show user details (without password)
SELECT 
  id,
  email,
  name,
  role,
  "organizationId",
  "createdAt"
FROM "User" 
WHERE email = 'admin@passly.com';

-- Test 4: Count total users
SELECT 
  'Total users in database' as test,
  COUNT(*) as count
FROM "User";
