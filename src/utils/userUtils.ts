/**
 * User-related utility functions
 */

/**
 * Get user initials from name or email
 * @param name - User's display name
 * @param email - User's email address
 * @returns Two-letter initials
 */
export function getUserInitials(name: string, email: string): string {
  if (name && name !== "Anonymous") {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

/**
 * Extract first name from full name or email
 * @param displayName - User's full name
 * @param email - User's email address
 * @returns First name, capitalized
 */
export function getFirstName(displayName?: string, email?: string): string {
  if (displayName) {
    return displayName.split(" ")[0];
  }
  if (email) {
    const username = email.split("@")[0];
    const firstName = username.split(".")[0];
    return firstName.charAt(0).toUpperCase() + firstName.slice(1);
  }
  return "Student";
}
