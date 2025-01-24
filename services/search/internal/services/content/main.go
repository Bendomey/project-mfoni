package contentservice

import (
	"github.com/Bendomey/project-mfoni/services/search/pkg/lib"
	"github.com/sirupsen/logrus"
)

type ContentService interface {
	Search(input SearchContentInput) ([]string, error)
	UpdateBase(input UpdateContentInput) (bool, error)
	Update(input UpdateContentInput) (bool, error)
}

type IContext struct {
	AppContext lib.MfoniSearchContext
}

func NewContentSvc(appContext lib.MfoniSearchContext) ContentService {
	logrus.Info("Initializing content service...")

	return &IContext{
		AppContext: appContext,
	}
}
