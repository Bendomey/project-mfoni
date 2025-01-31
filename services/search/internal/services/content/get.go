package contentservice

import (
	"context"
	"encoding/json"
	"fmt"

	// nolint: staticcheck
	"io/ioutil"
	"net/http"

	"github.com/Bendomey/project-mfoni/services/search/internal/models"
	"github.com/Bendomey/project-mfoni/services/search/pkg/lib"
	"github.com/opensearch-project/opensearch-go/v2"
	"github.com/opensearch-project/opensearch-go/v2/opensearchapi"
	"github.com/sirupsen/logrus"
)

type OpenSearchGetOutput struct {
	// nolint: tagliatelle
	Source models.Content `json:"_source"`
}

func _get(requestCtx context.Context, client *opensearch.Client, contentID string) (*models.Content, error) {
	getRequest := opensearchapi.GetRequest{
		Index:      lib.ContentsIndexName,
		DocumentID: contentID,
	}

	getResponse, getResponseErr := getRequest.Do(requestCtx, client)

	if getResponseErr != nil {
		logrus.Error("Error getting content: ", getResponseErr)
		return nil, getResponseErr
	}
	defer getResponse.Body.Close()

	// Know if the content does not exist.
	if getResponse.StatusCode == http.StatusNotFound {
		return nil, &GetContentError{Message: "Document not found", Type: "NOT_FOUND"}
	} else if getResponse.StatusCode == http.StatusOK {
		// Parse and handle the response.
		var responseBody OpenSearchGetOutput
		if err := json.NewDecoder(getResponse.Body).Decode(&responseBody); err != nil {
			return nil, &GetContentError{
				Message: fmt.Sprintf("Error parsing response body: %s", err),
				Type:    "INTERNAL_SERVER_ERROR",
			}
		}

		return &responseBody.Source, nil
	}

	// Some other error occurred.
	body, _ := ioutil.ReadAll(getResponse.Body)
	errorMessage := fmt.Sprintf("Error: %s\nResponse: %s\n", getResponse.Status(), string(body))
	logrus.Error(errorMessage)

	return nil, &GetContentError{Message: errorMessage, Type: "INTERNAL_SERVER_ERROR"}
}

// GetContentError represents error associated with getting contents from opensearch.
type GetContentError struct {
	Message string
	Type    string // NOT_FOUND, INTERNAL_SERVER_ERROR
}

func (e *GetContentError) Error() string {
	return e.Message
}
