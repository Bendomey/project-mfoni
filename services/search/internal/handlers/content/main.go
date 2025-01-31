package contenthandler

import (
	"github.com/Bendomey/project-mfoni/services/search/internal/protos/content_proto"
	"github.com/Bendomey/project-mfoni/services/search/internal/services"
	"github.com/Bendomey/project-mfoni/services/search/pkg/lib"
	"github.com/sirupsen/logrus"
)

func InitHandler(ctx lib.MfoniSearchContext, services services.Services) {
	logrus.Info("Initializing content handler...")

	contentServer := Handler{
		AppContext: ctx,
		Services:   services,
	}

	content_proto.RegisterSearchContentServiceServer(ctx.GrpcServer, &contentServer)
}
