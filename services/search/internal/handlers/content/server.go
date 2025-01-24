package contenthandler

import (
	"context"

	"github.com/Bendomey/project-mfoni/services/search/internal/protos/content_proto"
	"github.com/Bendomey/project-mfoni/services/search/internal/services"
	contentservice "github.com/Bendomey/project-mfoni/services/search/internal/services/content"
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
	products, productsErr := s.Services.ContentService.Search(contentservice.SearchContentInput{
		Keyword: in.GetKeyword(),
		Take:    in.GetTake(),
		Skip:    in.GetSkip(),
	})

	if productsErr != nil {
		return nil, productsErr
	}

	return &content_proto.SearchResponse{
		Products: products,
	}, nil
}

func (s *Handler) Update(ctx context.Context, in *content_proto.UpdateRequest) (*content_proto.UpdateResponse, error) {
	logrus.Info("Search request received", ctx.Value("request_id"), in.GetContentId())

	return &content_proto.UpdateResponse{
		Update: true,
	}, nil
}
