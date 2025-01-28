package processors

import (
	"github.com/Bendomey/project-mfoni/services/search/internal/services"
	"github.com/Bendomey/project-mfoni/services/search/pkg/lib"
	"github.com/sirupsen/logrus"
)

// Initialize all processors.
func Factory(context lib.MfoniSearchContext, services services.Services) {
	logrus.Info("Initializing processors...")

	go ProcessContent(context, services)
}
