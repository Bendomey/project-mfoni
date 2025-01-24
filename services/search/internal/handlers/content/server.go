package content

import (
	"context"

	"github.com/Bendomey/project-mfoni/services/search/internal/protos/content_proto"
	"github.com/Bendomey/project-mfoni/services/search/pkg/lib"
	"github.com/sirupsen/logrus"
)

type Handler struct {
	AppContext lib.MfoniSearchContext

	// satisfy the interface: services/search/internal/protos/content_proto/search_content_grpc.pb.go
	content_proto.UnimplementedSearchContentServiceServer
}

func (s *Handler) Search(ctx context.Context, in *content_proto.SearchRequest) (*content_proto.SearchResponse, error) {
	logrus.Info("Search request received", ctx.Value("request_id"), in.GetKeyword())

	return &content_proto.SearchResponse{
		Products: make([]string, 0),
	}, nil
}

func (s *Handler) Update(ctx context.Context, in *content_proto.UpdateRequest) (*content_proto.UpdateResponse, error) {
	logrus.Info("Search request received", ctx.Value("request_id"), in.GetContentId())

	return &content_proto.UpdateResponse{
		Update: true,
	}, nil
}
