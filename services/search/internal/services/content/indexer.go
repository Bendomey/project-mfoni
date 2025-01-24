package contentservice

import (
	"errors"

	"github.com/sirupsen/logrus"
)

type UpdateContentInput struct {
	ContentID    string
	Type         string
	Title        string
	IsVisible    bool
	IsSearchable bool
	IsFree       bool
	Status       string
	Orientation  string
	Tags         []string
	Collections  []string
}

// Updates content in the index.
func (context *IContext) UpdateBase(input UpdateContentInput) (bool, error) {
	cleanedUpInput, errorCleaningUpInput := cleanUpUpdateContentInput(input)

	if errorCleaningUpInput != nil {
		return false, errorCleaningUpInput
	}

	logrus.Info("Updating(Base) content with ID: ", cleanedUpInput.ContentID)

	return true, nil
}

func (context *IContext) Update(input UpdateContentInput) (bool, error) {
	cleanedUpInput, errorCleaningUpInput := cleanUpUpdateContentInput(input)

	if errorCleaningUpInput != nil {
		return false, errorCleaningUpInput
	}

	logrus.Info("Updating content with ID: ", cleanedUpInput.ContentID)

	return true, nil
}

// TODO: move to a top level package
func cleanUpUpdateContentInput(input UpdateContentInput) (*UpdateContentInput, error) {
	if input.ContentID == "" {
		return nil, errors.New("ContentID is required")
	}

	if input.Type == "" {
		return nil, errors.New("ContentID is required")
	}

	return &input, nil
}
