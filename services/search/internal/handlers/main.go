package handlers

import (
	contenthandler "github.com/Bendomey/project-mfoni/services/search/internal/handlers/content"
	"github.com/Bendomey/project-mfoni/services/search/internal/services"
	"github.com/Bendomey/project-mfoni/services/search/pkg/lib"
	"github.com/sirupsen/logrus"
)

// Initialize all handlers/controllers.
func Factory(context lib.MfoniSearchContext, services services.Services) {
	logrus.Info("Initializing handlers...")
	contenthandler.InitHandler(context, services)
}
