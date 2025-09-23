// Password encryption service using Web Crypto API
export async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'pashu_setu_salt_2024')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyPassword(password, hashedPassword) {
  const hashedInput = await hashPassword(password)
  return hashedInput === hashedPassword
}

// Generate secure random salt
export function generateSalt() {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Enhanced password hashing with salt
export async function hashPasswordWithSalt(password, salt = null) {
  if (!salt) salt = generateSalt()
  const encoder = new TextEncoder()
  const data = encoder.encode(password + salt)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return { hash, salt }
}

export async function verifyPasswordWithSalt(password, hash, salt) {
  const { hash: inputHash } = await hashPasswordWithSalt(password, salt)
  return inputHash === hash
}