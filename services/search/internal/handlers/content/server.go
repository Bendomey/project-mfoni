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

func (s *Handler) Search(_ context.Context, in *content_proto.SearchRequest) (*content_proto.SearchResponse, error) {
	products, productsErr := s.Services.ContentService.Search(cleanUpSearchInput(in))

	if productsErr != nil {
		return nil, productsErr
	}

	return &content_proto.SearchResponse{
		Products: products,
	}, nil
}

func (s *Handler) Update(ctx context.Context, input *content_proto.UpdateRequest) (*content_proto.UpdateResponse, error) {
	cleanedInput, cleanedInputErr := cleanUpUpdateContentInput(input)
	if cleanedInputErr != nil {
		return nil, cleanedInputErr
	}

	logrus.Info("Search request received", ctx.Value("request_id"), cleanedInput.ContentID)

	return &content_proto.UpdateResponse{
		Update: true,
	}, nil
}
