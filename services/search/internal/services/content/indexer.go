package contentservice

import (
	"github.com/sirupsen/logrus"
)

type UpdateContentInput struct {
	ContentID    string
	Type         *string
	Title        *string
	IsVisible    *bool
	IsSearchable *bool
	IsFree       *bool
	Status       *string
	Orientation  *string
	Tags         []string
	Collections  []string
}

// Updates content in the index.
func (context *IContext) UpdateBase(input UpdateContentInput) (bool, error) {
	logrus.Info("Updating(Base) content with ID: ", input.ContentID)

	return true, nil
}

func (context *IContext) Update(input UpdateContentInput) (bool, error) {
	logrus.Info("Updating content with ID: ", input.ContentID)

	return true, nil
}
