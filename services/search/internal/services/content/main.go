package contentservice

import (
	"context"

	"github.com/Bendomey/project-mfoni/services/search/internal/models"
	"github.com/Bendomey/project-mfoni/services/search/pkg/lib"
	"github.com/sirupsen/logrus"
)

type ContentService interface {
	Index(requestCtx context.Context, input models.Content) (bool, error)
	Get(requestCtx context.Context, contentID string) (*models.Content, error)
	Search(requestCtx context.Context, input SearchContentInput) ([]string, error)
	UpdateBase(requestCtx context.Context, input models.Content) (bool, error)
	Update(requestCtx context.Context, input models.Content) (bool, error)
	Purge(requestCtx context.Context, contentID string) (bool, error)
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
