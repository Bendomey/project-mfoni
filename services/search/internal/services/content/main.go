package contentservice

import (
	"context"

	"github.com/Bendomey/project-mfoni/services/search/internal/models"
	"github.com/Bendomey/project-mfoni/services/search/pkg/lib"
	"github.com/sirupsen/logrus"
)

type ContentService interface {
	Index(requestCtx context.Context, input models.Content) (bool, error)
	Search(requestCtx context.Context, input SearchContentInput) (*[]string, error)
	UpdateBase(requestCtx context.Context, input models.Content) (bool, error)
	UpdateTags(requestCtx context.Context, contentID string, tags []string) (bool, error)
	UpdateCollections(requestCtx context.Context, contentID string, collections []string) (bool, error)
	Purge(requestCtx context.Context, contentID string) (bool, error)

	// DB operations.
	FindOne(requestCtx context.Context, contentID string) (*models.Content, error)
	FindTags(requestCtx context.Context, contentID string) (*[]string, error)
	FindCollections(requestCtx context.Context, contentID string) (*[]string, error)
	FindMany(requestCtx context.Context, skip int64, limit int64) (*[]models.Content, error)
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
