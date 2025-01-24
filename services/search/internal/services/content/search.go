package contentservice

import "github.com/sirupsen/logrus"

type SearchContentInput struct {
	Keyword string
	Take    int64
	Skip    int64
}

// Runs a search in the content index.
func (context *IContext) Search(input SearchContentInput) ([]string, error) {
	cleanedUpInput := cleanUpSearchInput(input)

	logrus.Info("Searching for content with keyword: ", cleanedUpInput.Keyword)
	return make([]string, 0), nil
}

// TODO: move to a top level package
func cleanUpSearchInput(input SearchContentInput) SearchContentInput {
	if input.Take == 0 {
		input.Take = 50
	}

	if input.Skip == 0 {
		input.Skip = 0
	}

	return input
}
