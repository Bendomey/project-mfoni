package lib

import (
	"bytes"
	"context"
	"crypto/tls"
	"encoding/json"
	"net/http"

	"github.com/Bendomey/project-mfoni/services/search/internal/models"
	"github.com/getsentry/raven-go"
	"github.com/opensearch-project/opensearch-go/v2"
	"github.com/opensearch-project/opensearch-go/v2/opensearchapi"
	logger "github.com/sirupsen/logrus"
	"github.com/spf13/viper"
)

func InitOpenSearch(config *viper.Viper) *opensearch.Client {
	client, connectionErr := opensearch.NewClient(opensearch.Config{
		Transport: &http.Transport{
			// nolint: gosec
			TLSClientConfig: &tls.Config{InsecureSkipVerify: false},
		},
		Username:  config.GetString("openSearch.username"),
		Password:  config.GetString("openSearch.password"),
		Addresses: []string{config.GetString("openSearch.url")},
	})

	if connectionErr != nil {
		raven.CaptureError(connectionErr, nil)
		logger.Fatal("[OpenSearch]:: Not Connected. Error: ", connectionErr)

		return nil
	}

	logger.Info("[OpenSearch]:: Connected successfully...")

	// Create indices if they do not exist.
	createIndicesIfNotExists(client, config)

	return client
}

func createIndicesIfNotExists(client *opensearch.Client, config *viper.Viper) {
	var indicesConfig = []map[string]interface{}{
		{
			"name": ContentsIndexName,
			"settings": map[string]interface{}{
				"index": map[string]interface{}{
					"number_of_shards":   config.GetString("openSearch.number_of_shards"),
					"number_of_replicas": config.GetString("openSearch.number_of_replicas"),
				},
			},
			"mappings": map[string]interface{}{
				"properties": models.ContentMapping,
			},
		},
	}

	for _, index := range indicesConfig {
		resolveIndex(index, client)
	}
}

func resolveIndex(index map[string]interface{}, client *opensearch.Client) {
	indexNameCheck, indexNameOk := index["name"].(string)
	settingsCheck, settingsOk := index["settings"].(map[string]interface{})
	mappingsCheck, mappingsOk := index["mappings"].(map[string]interface{})

	var indexName string
	var settings, mappings map[string]interface{}

	if indexNameOk {
		indexName = indexNameCheck
	} else {
		logger.Error("[OpenSearch]:: Index name not found in config: ", index)
	}

	if settingsOk {
		settings = settingsCheck
	} else {
		logger.Error("[OpenSearch]:: Index settings not found in config: ", index)
	}

	if mappingsOk {
		mappings = mappingsCheck
	} else {
		logger.Error("[OpenSearch]:: Index mappings not found in config: ", index)
	}

	logger.Info("[OpenSearch]:: Checking if index exists: ", indexName)

	indexExistsRequest := opensearchapi.IndicesExistsRequest{
		Index: []string{indexName},
	}

	indexExistResponse, indexExistErr := indexExistsRequest.Do(context.Background(), client)

	if indexExistErr != nil {
		logger.Error("[OpenSearch]:: Error checking if index exists: ", indexExistErr)
		return
	}

	defer indexExistResponse.Body.Close()

	switch indexExistResponse.StatusCode {
	case http.StatusOK:
		logger.Info("[OpenSearch]:: Index already exists: ", indexName)
	case http.StatusNotFound:
		logger.Info("Creating index: ", indexName)
		createIndex(indexName, settings, mappings, client)
	default:
		logger.Error("[OpenSearch]:: Unexpected response: ", indexExistResponse.String())
	}
}

func createIndex(
	indexName string,
	settings map[string]interface{},
	mappings map[string]interface{},
	client *opensearch.Client,
) {
	body := map[string]interface{}{
		"settings": settings,
		"mappings": mappings,
	}

	mappingsJSON, err := json.Marshal(body)
	if err != nil {
		logger.Error("[OpenSearch]:: Error marshalling index mappings: ", err)
		return
	}

	createIndexRequest := opensearchapi.IndicesCreateRequest{
		Index: indexName,
		Body:  bytes.NewReader(mappingsJSON),
	}

	createIndexResponse, createIndexErr := createIndexRequest.Do(context.Background(), client)

	if createIndexErr != nil {
		logger.Error("[OpenSearch]:: Error creating index: ", err)
		return
	}

	defer createIndexResponse.Body.Close()

	if createIndexResponse.IsError() {
		logger.Error("[OpenSearch]:: Error creating index: ", createIndexResponse.String())
	} else {
		logger.Info("[OpenSearch]:: Index created: ", indexName)
	}
}
