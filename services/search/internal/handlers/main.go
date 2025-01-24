package handlers

import (
	"github.com/Bendomey/project-mfoni/services/search/internal/handlers/content"
	"github.com/Bendomey/project-mfoni/services/search/pkg/lib"
)

// Initialize all handlers/controllers.
func Factory(context *lib.MfoniSearchContext) {
	content.InitHandler(*context)
}
