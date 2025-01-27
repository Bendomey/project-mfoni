package contenthandler

import (
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
