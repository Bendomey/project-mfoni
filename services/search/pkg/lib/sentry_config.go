package lib

import (
	"log"
	"time"

	"github.com/getsentry/raven-go"
	"github.com/getsentry/sentry-go"
	"github.com/spf13/viper"
)

// Sentry starts.
func InitSentry(config *viper.Viper) {
	dsn := config.GetString("sentry.dsn")

	err := sentry.Init(sentry.ClientOptions{
		// Either set your DSN here or set the SENTRY_DSN environment variable.
		Dsn: dsn,

		// Either set environment and release here or set the SENTRY_ENVIRONMENT
		// and SENTRY_RELEASE environment variables.
		Environment: config.GetString("sentry.environment"),
		Release:     "mfoni-search-service@1.0.0",

		// Enable printing of SDK debug messages.
		// Useful when getting started or trying to figure something out.
		Debug: config.GetBool("sentry.debug"),
	})
	if err != nil {
		log.Fatalf("sentry.Init: %s", err)
	}
	// Flush buffered events before the program terminates.
	// Set the timeout to the maximum duration the program can afford to wait.
	defer sentry.Flush(2 * time.Second)

	setDSNError := raven.SetDSN(dsn)
	if setDSNError != nil {
		log.Fatalf("raven.SetDSN: %s", setDSNError)
	}
}
