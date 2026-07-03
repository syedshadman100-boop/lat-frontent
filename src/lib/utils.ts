export function formatErrorMessage(msg: string): string {
  if (!msg || typeof msg !== 'string') return 'An unexpected error occurred. Please try again.';

  // Strip NestJS Exception prefixes (e.g. ConflictException:, BadRequestException:, InternalServerErrorException:)
  let cleaned = msg.replace(/^[a-zA-Z]+Exception:\s*/, '');
  
  // Format specific common cases to be extremely friendly
  if (cleaned.toLowerCase().includes('already exists')) {
    if (cleaned.toLowerCase().includes('roll number')) {
      return 'A student with this Roll Number is already registered in the selected Class/Section.';
    }
    if (cleaned.toLowerCase().includes('email')) {
      return 'A student with this email address is already registered.';
    }
    return 'This student record already exists.';
  }

  if (cleaned.toLowerCase().includes('no valid student rows found')) {
    return 'The uploaded template file is empty or does not contain any valid student data rows matching the required columns.';
  }

  // Capitalize first letter and return
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}
