package services

import (
	contentservice "github.com/Bendomey/project-mfoni/services/search/internal/services/content"
	"github.com/Bendomey/project-mfoni/services/search/pkg/lib"
	"github.com/sirupsen/logrus"
)

type Services struct {
	ContentService contentservice.ContentService
}

func InitServices(context lib.MfoniSearchContext) Services {
	logrus.Info("Initializing services...")

	contentService := contentservice.NewContentSvc(context)

	return Services{
		ContentService: contentService,
	}
}
