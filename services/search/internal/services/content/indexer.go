package contentservice

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/Bendomey/project-mfoni/services/search/internal/models"
	"github.com/Bendomey/project-mfoni/services/search/pkg/lib"
	"github.com/opensearch-project/opensearch-go/v2"
	"github.com/opensearch-project/opensearch-go/v2/opensearchapi"
	"github.com/sirupsen/logrus"
)

// Updates content in the index.
func (context *IContext) UpdateBase(requestCtx context.Context, input models.Content) (bool, error) {
	logrus.Info("Updating(Base) content with ID: ", input.ContentID)

	response, responseErr := _get(requestCtx, context.AppContext.OpenSearchClient, input.ContentID)

	if responseErr != nil {
		return false, responseErr
	}

	input.Tags = response.Tags
	input.Collections = response.Collections

	return _update(requestCtx, context.AppContext.OpenSearchClient, input)
}

func (context *IContext) UpdateTags(requestCtx context.Context, contentID string, tags []string) (bool, error) {
	logrus.Info("Updating(Tags) content with ID: ", contentID)

	response, responseErr := _get(requestCtx, context.AppContext.OpenSearchClient, contentID)

	if responseErr != nil {
		return false, responseErr
	}

	updatedContent := models.Content{
		ContentID:    contentID,
		Tags:         tags,
		Type:         response.Type,
		Title:        response.Title,
		IsVisible:    response.IsVisible,
		IsSearchable: response.IsSearchable,
		IsFree:       response.IsFree,
		Status:       response.Status,
		Orientation:  response.Orientation,
		Collections:  response.Collections,
	}

	return _update(requestCtx, context.AppContext.OpenSearchClient, updatedContent)
}

func (context *IContext) UpdateCollections(
	requestCtx context.Context,
	contentID string,
	collections []string,
) (bool, error) {
	logrus.Info("Updating(Collections) content with ID: ", contentID)

	response, responseErr := _get(requestCtx, context.AppContext.OpenSearchClient, contentID)

	if responseErr != nil {
		return false, responseErr
	}

	updatedContent := models.Content{
		ContentID:    contentID,
		Collections:  collections,
		Type:         response.Type,
		Title:        response.Title,
		IsVisible:    response.IsVisible,
		IsSearchable: response.IsSearchable,
		IsFree:       response.IsFree,
		Status:       response.Status,
		Orientation:  response.Orientation,
		Tags:         response.Tags,
	}

	return _update(requestCtx, context.AppContext.OpenSearchClient, updatedContent)
}

func (context *IContext) Index(requestCtx context.Context, input models.Content) (bool, error) {
	logrus.Info("Creating content with ID: ", input.ContentID)

	response, responseErr := _get(requestCtx, context.AppContext.OpenSearchClient, input.ContentID)

	if responseErr == nil || response != nil {
		return false, fmt.Errorf("content with ID %s already exists", input.ContentID)
	}

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

	if !(insertResponse.StatusCode >= 200 && insertResponse.StatusCode < 300) {
		var responseBody map[string]interface{}
		if err := json.NewDecoder(insertResponse.Body).Decode(&responseBody); err != nil {
			return false, err
		}

		return false, fmt.Errorf("error inserting content: %s", responseBody["error"])
	}

	return true, nil
}

func _update(requestCtx context.Context, openSearchClient *opensearch.Client, input models.Content) (bool, error) {
	updateDoc := map[string]interface{}{
		"doc": input,
	}

	jsonData, jsonDataConvErr := json.Marshal(updateDoc)
	if jsonDataConvErr != nil {
		return false, jsonDataConvErr
	}

	document := strings.NewReader(string(jsonData))

	req := opensearchapi.UpdateRequest{
		Index:      lib.ContentsIndexName,
		DocumentID: input.ContentID,
		Body:       document,
	}

	updateResponse, updateResponseErr := req.Do(requestCtx, openSearchClient)

	if updateResponseErr != nil {
		return false, updateResponseErr
	}

	defer updateResponse.Body.Close()

	if !(updateResponse.StatusCode >= 200 && updateResponse.StatusCode < 300) {
		var responseBody map[string]interface{}
		if err := json.NewDecoder(updateResponse.Body).Decode(&responseBody); err != nil {
			return false, err
		}

		return false, fmt.Errorf("error updating content: %s", responseBody["error"])
	}

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

	if !(deleteResponse.StatusCode >= 200 && deleteResponse.StatusCode < 300) {
		var responseBody map[string]interface{}
		if err := json.NewDecoder(deleteResponse.Body).Decode(&responseBody); err != nil {
			return false, err
		}

		return false, fmt.Errorf("error deleting content: %s", responseBody["error"])
	}

	return true, nil
}
