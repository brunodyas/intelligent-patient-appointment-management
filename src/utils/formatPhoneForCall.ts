function formatPhoneForCall(phoneNumber: string) {
    const digits = phoneNumber.replace(/\D/g, '');
    switch (digits.length) {
      case 0:
        return "";
      case 1:
      case 2:
      case 3:
        return `(${digits})`;
      case 4:
      case 5:
      case 6:
        return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      case 7:
      case 8:
      case 9:
      case 10:
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
      default:
        return phoneNumber; // Shouldn't occur, but just in case
    }
}

export function formatPhoneNumber(input: string, countryCode: boolean=false): string {
  let cleaned = input.startsWith("+1") ? input.slice(2) : input
  cleaned = cleaned.replace(/\D/g, "")

  if (cleaned.length <= 3) {
    return cleaned;
  } else if (cleaned.length <= 6) {
    return `${countryCode ? "+1 " : ""}(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  } else {
    return `${countryCode ? "+1 " : ""}(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  }
}

export function unformatPhoneNumber(input: string): string {
  // Remove all non-numeric characters
  return `${input?.replace(/\D/g, "")}`;
}

export default formatPhoneForCall