package contenthandler

import (
	"errors"

	"github.com/Bendomey/project-mfoni/services/search/internal/protos/content_proto"
	contentservice "github.com/Bendomey/project-mfoni/services/search/internal/services/content"
)

func cleanUpSearchInput(in *content_proto.SearchRequest) contentservice.SearchContentInput {
	input := contentservice.SearchContentInput{
		Keyword: in.GetKeyword(),
		Take:    in.GetTake(),
		Skip:    in.GetSkip(),
	}

	if input.Take == 0 {
		input.Take = 50
	}

	if input.Skip == 0 {
		input.Skip = 0
	}

	return input
}

func cleanUpUpdateContentInput(input *content_proto.UpdateRequest) (*contentservice.UpdateContentInput, error) {
	if input.GetContentId() == "" {
		return nil, errors.New("ContentID is required")
	}

	res := contentservice.UpdateContentInput{
		ContentID:    input.GetContentId(),
		Type:         input.Type,
		Title:        input.Title,
		IsVisible:    input.IsVisible,
		IsSearchable: input.IsSearchable,
		IsFree:       input.IsFree,
		Status:       input.Status,
		Orientation:  input.Orientation,
		Tags:         input.GetTags(),
		Collections:  input.GetCollections(),
	}

	return &res, nil
}
