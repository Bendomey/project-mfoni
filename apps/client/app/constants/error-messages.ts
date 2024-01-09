export const errorMessagesWrapper = (error: string) => {
    switch (error) {
        case "UserAlreadyExistsWithAnotherProvider":
            return "We're sorry, but it looks like you've already signed up with another social. Try again with that social."
        default:
            return "Something went wrong. Please try again later."
    }
}