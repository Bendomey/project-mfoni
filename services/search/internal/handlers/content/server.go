package contenthandler

import (
	"context"

	"github.com/Bendomey/project-mfoni/services/search/internal/protos/content_proto"
	"github.com/Bendomey/project-mfoni/services/search/internal/services"
	"github.com/Bendomey/project-mfoni/services/search/pkg/lib"
	"github.com/sirupsen/logrus"
)

type Handler struct {
	AppContext lib.MfoniSearchContext
	Services   services.Services

	// satisfy the interface: services/search/internal/protos/content_proto/search_content_grpc.pb.go
	content_proto.UnimplementedSearchContentServiceServer
}

func (s *Handler) Search(ctx context.Context, in *content_proto.SearchRequest) (*content_proto.SearchResponse, error) {
	contents, contentsErr := s.Services.ContentService.Search(ctx, cleanUpSearchInput(in))

	if contentsErr != nil {
		logrus.Error("Error searching for content: ", contentsErr)
		return nil, contentsErr
	}

	return &content_proto.SearchResponse{
		Contents: *contents,
	}, nil
}
