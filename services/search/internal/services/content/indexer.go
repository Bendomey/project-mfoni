package contentservice

import (
	"context"
	"encoding/json"
	"errors"
	"strings"

	"github.com/Bendomey/project-mfoni/services/search/internal/models"
	"github.com/Bendomey/project-mfoni/services/search/pkg/lib"
	"github.com/opensearch-project/opensearch-go/opensearchapi"
	"github.com/sirupsen/logrus"
)

// Updates content in the index.
func (context *IContext) UpdateBase(requestCtx context.Context, input models.Content) (bool, error) {
	logrus.Info("Updating(Base) content with ID: ", input.ContentID)

	_, responseErr := context.Get(requestCtx, input.ContentID)

	if responseErr != nil {
		if errors.As(responseErr, &GetContentError{}) {
			if responseErr.(*GetContentError).Type == "NOT_FOUND" {
				return context.Index(requestCtx, input)
			}
		}

		return false, responseErr
	}

	return context.Update(requestCtx, input)
}

func (context *IContext) Index(requestCtx context.Context, input models.Content) (bool, error) {
	logrus.Info("Creating content with ID: ", input.ContentID)

	jsonData, jsonDataConvErr := json.Marshal(input)
	if jsonDataConvErr != nil {
		logrus.Printf("Error converting struct to JSON: %v", jsonDataConvErr)

		return false, jsonDataConvErr
	}

	document := strings.NewReader(string(jsonData))

	req := opensearchapi.IndexRequest{
		Index:      lib.ContentsIndexName,
		DocumentID: input.ContentID,
		Body:       document,
	}
	insertResponse, insertResponseErr := req.Do(requestCtx, context.AppContext.OpenSearchClient)

	if insertResponseErr != nil {
		logrus.Error("Error inserting content: ", insertResponseErr)
		return false, insertResponseErr
	}

	defer insertResponse.Body.Close()

	return true, nil
}

func (context *IContext) Update(requestCtx context.Context, input models.Content) (bool, error) {
	logrus.Info("Updating content with ID: ", input.ContentID)

	jsonData, jsonDataConvErr := json.Marshal(input)
	if jsonDataConvErr != nil {
		logrus.Printf("Error converting struct to JSON: %v", jsonDataConvErr)

		return false, jsonDataConvErr
	}

	document := strings.NewReader(string(jsonData))

	req := opensearchapi.UpdateRequest{
		Index:      lib.ContentsIndexName,
		DocumentID: input.ContentID,
		Body:       document,
	}

	updateResponse, updateResponseErr := req.Do(requestCtx, context.AppContext.OpenSearchClient)

	if updateResponseErr != nil {
		logrus.Error("Error updating content: ", updateResponseErr)
		return false, updateResponseErr
	}

	defer updateResponse.Body.Close()

	return true, nil
}

func (context *IContext) Purge(requestCtx context.Context, contentID string) (bool, error) {
	logrus.Info("Deleting content with ID: ", contentID)

	deleteRequest := opensearchapi.DeleteRequest{
		Index:      lib.ContentsIndexName,
		DocumentID: contentID,
	}

	deleteResponse, deleteResponseErr := deleteRequest.Do(requestCtx, context.AppContext.OpenSearchClient)

	if deleteResponseErr != nil {
		logrus.Error("Error deleting content: ", deleteResponseErr)
		return false, deleteResponseErr
	}

	defer deleteResponse.Body.Close()

	return true, nil
}
