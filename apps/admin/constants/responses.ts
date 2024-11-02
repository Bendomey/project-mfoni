export const MISC_RESPONSES = {
  SOMETHING_HAPPENEND: 'Oops, something happened. Try again later!',
}

/**
 * API_RESPONSES
 *
 * @param response - response from backend
 */
export const API_RESPONSES = (response: string) => {
  switch (response) {
    case 'CredentialsInvalid':
      return 'Your Credentials Are Invalid'

    default:
      return MISC_RESPONSES.SOMETHING_HAPPENEND
  }
}
