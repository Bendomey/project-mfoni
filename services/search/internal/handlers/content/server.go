package contenthandler

import (
	"context"
	"errors"

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

func (s *Handler) Search(
	ctx context.Context,
	input *content_proto.SearchRequest,
) (*content_proto.SearchResponse, error) {
	// verify token
	isTokenValid := lib.VerifyAuthToken(ctx, s.AppContext.Config)

	if !isTokenValid {
		return nil, errors.New("Unauthorized")
	}

	contents, contentsErr := s.Services.ContentService.Search(ctx, cleanUpSearchInput(input))

	if contentsErr != nil {
		logrus.Error("Error searching for content: ", contentsErr)
		return nil, contentsErr
	}

	return &content_proto.SearchResponse{
		Contents: *contents,
	}, nil
}
