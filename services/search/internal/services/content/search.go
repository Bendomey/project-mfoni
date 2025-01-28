package contentservice

import (
	"context"

	"github.com/sirupsen/logrus"
)

type SearchContentInput struct {
	Keyword string
	Take    int64
	Skip    int64
}

// Runs a search in the content index.
func (context *IContext) Search(_ context.Context, input SearchContentInput) ([]string, error) {
	logrus.Info("Searching for content with keyword: ", input.Keyword)
	return make([]string, 0), nil
}
