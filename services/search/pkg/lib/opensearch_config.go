package lib

import (
	"crypto/tls"
	"net/http"

	"github.com/getsentry/raven-go"
	"github.com/opensearch-project/opensearch-go"
	logger "github.com/sirupsen/logrus"
	"github.com/spf13/viper"
)

func InitOpenSearch(config *viper.Viper) *opensearch.Client {
	client, connectionErr := opensearch.NewClient(opensearch.Config{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
		Addresses: []string{config.GetString("openSearch.url")},
	})

	if connectionErr != nil {
		raven.CaptureError(connectionErr, nil)
		logger.Fatal(connectionErr)
		logger.Info("[OpenSearch] :: Not Connected")

		return nil
	}

	// TODO: Create indices if they do not exist.

	return client

}
