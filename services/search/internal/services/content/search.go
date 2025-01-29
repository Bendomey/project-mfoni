package contentservice

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/Bendomey/project-mfoni/services/search/internal/models"
	"github.com/Bendomey/project-mfoni/services/search/pkg/lib"
	"github.com/opensearch-project/opensearch-go/v2/opensearchapi"
	"github.com/sirupsen/logrus"
)

type SearchContentInput struct {
	Keyword string
	Take    int64
	Skip    int64
}

type SearchResponse struct {
	Hits Hit `json:"hits"`
}

type Hit struct {
	Total Total `json:"total"`
	// nolint: tagliatelle
	MaxScore float64   `json:"max_score"`
	Hits     []HitItem `json:"hits"`
}

type Total struct {
	Value int64 `json:"value"`
}

type HitItem struct {
	// nolint: tagliatelle
	ID string `json:"_id"`
	// nolint: tagliatelle
	Source models.Content `json:"_source"`
}

// Runs a search in the content index.
func (context *IContext) Search(
	requestCtx context.Context,
	input SearchContentInput,
) (*[]string, error) {
	logrus.Info("Searching for content with keyword: ", input.Keyword)
	searchRequestBody := map[string]interface{}{
		"query": map[string]interface{}{
			"bool": map[string]interface{}{
				"filter": []map[string]interface{}{
					{
						"term": map[string]interface{}{
							"is_searchable": map[string]interface{}{
								"value": true,
							},
						},
					},
					{
						"term": map[string]interface{}{
							"is_visible": map[string]interface{}{
								"value": true,
							},
						},
					},
				},
				"must": []map[string]interface{}{
					{
						"multi_match": map[string]interface{}{
							"query": input.Keyword,
							"fields": []string{
								"title^2",
								"orientation",
								"tags",
								"collections",
							},
							"operator":  "or",
							"fuzziness": "AUTO",
						},
					},
					{
						"match": map[string]interface{}{
							"status": "DONE",
						},
					},
				},
			},
		},
		"size": input.Take,
		"from": input.Skip,
	}

	jsonData, jsonDataConvErr := json.Marshal(searchRequestBody)
	if jsonDataConvErr != nil {
		return nil, jsonDataConvErr
	}

	document := strings.NewReader(string(jsonData))

	searchRequest := opensearchapi.SearchRequest{
		Index: []string{lib.ContentsIndexName},
		Body:  document,
	}

	searchResponse, searchResponseErr := searchRequest.Do(requestCtx, context.AppContext.OpenSearchClient)

	if searchResponseErr != nil {
		return nil, searchResponseErr
	}

	defer searchResponse.Body.Close()

	if searchResponse.StatusCode != http.StatusOK {
		var responseBody map[string]interface{}
		if err := json.NewDecoder(searchResponse.Body).Decode(&responseBody); err != nil {
			return nil, err
		}

		return nil, fmt.Errorf("error searching content: %s", responseBody["error"])
	}

	var response SearchResponse
	if err := json.NewDecoder(searchResponse.Body).Decode(&response); err != nil {
		return nil, err
	}

	contentIDs := []string{}
	for _, hit := range response.Hits.Hits {
		contentIDs = append(contentIDs, hit.ID)
	}

	return &contentIDs, nil
}
