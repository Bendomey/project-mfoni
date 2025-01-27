package contentservice

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/Bendomey/project-mfoni/services/search/internal/models"
	"github.com/Bendomey/project-mfoni/services/search/pkg/lib"
	"github.com/opensearch-project/opensearch-go/opensearchapi"
	"github.com/sirupsen/logrus"
)

func (context *IContext) Get(requestCtx context.Context, contentID string) (*models.Content, error) {

	getRequest := opensearchapi.GetRequest{
		Index:      lib.ContentsIndexName,
		DocumentID: contentID,
	}

	getResponse, getResponseErr := getRequest.Do(requestCtx, context.AppContext.OpenSearchClient)

	if getResponseErr != nil {
		logrus.Error("Error getting content: ", getResponseErr)
		return nil, getResponseErr
	}
	defer getResponse.Body.Close()

	// Know if the content does not exist.
	if getResponse.StatusCode == http.StatusNotFound {
		return nil, &GetContentError{Message: "Document not found", Type: "NOT_FOUND"}
	} else if getResponse.StatusCode == http.StatusOK {

		// Parse and handle the response
		var responseBody models.Content
		if err := json.NewDecoder(getResponse.Body).Decode(&responseBody); err != nil {
			return nil, &GetContentError{Message: fmt.Sprintf("Error parsing response body: %s", err), Type: "INTERNAL_SERVER_ERROR"}
		}

		return &responseBody, nil
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
