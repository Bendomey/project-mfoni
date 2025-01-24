package content

import (
	"github.com/Bendomey/project-mfoni/services/search/internal/protos/content_proto"
	"github.com/Bendomey/project-mfoni/services/search/pkg/lib"
)

func InitHandler(ctx lib.MfoniSearchContext) {
	contentServer := Handler{
		AppContext: ctx,
	}

	content_proto.RegisterSearchContentServiceServer(ctx.GrpcServer, &contentServer)
}
