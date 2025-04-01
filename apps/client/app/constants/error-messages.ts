export const errorMessagesWrapper = (error: string) => {
	switch (error) {
		case 'UserAlreadyExistsWithAnotherProvider':
			return "We're sorry, but it looks like you've already signed up with another social. Try again with that social."
		case 'UsernameAlreadyTaken':
			return "We're sorry, but it looks like that username is already taken. Try another."
		case 'PhoneNumberAlreadyExists':
			return 'Phone number already taken.'
		case 'PhoneNumberAlreadyVerified':
			return 'Phone number already verified.'
		case 'CodeIsIncorrectOrHasExpired':
			return 'Code is incorrect or has expired.'
		case 'ContentAlreadyPurchased':
			return 'Content is already purchased.'
		default:
			return 'Something went wrong. Please try again later.'
	}
}
