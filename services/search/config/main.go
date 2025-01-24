package config

import (
	"log"
	"os"
	"strings"

	// For loading environment variables.
	_ "github.com/heroku/x/hmetrics/onload"
	"github.com/spf13/viper"
)

// nolint: gochecknoglobals
var config *viper.Viper

// Init is an exported method that takes the environment and starts the viper
// (external lib) and returns the configuration struct.
func Init(env string) {
	var err error

	log.Print("This is the environment: ", env)

	config = viper.New()
	config.SetConfigType("yaml")
	config.SetConfigName(env)
	config.AddConfigPath("config/")
	// config.AddConfigPath(".") // used for docker
	// config.AddConfigPath("../../config/") // used for unit tests
	config.AutomaticEnv()

	err = config.ReadInConfig()
	if err != nil {
		log.Fatalf("error on parsing configuration file: %s", err)
	}

	log.Println("Config loaded successfully...")

	for _, k := range config.AllKeys() {
		value := config.GetString(k)
		if strings.HasPrefix(value, "${") && strings.HasSuffix(value, "}") {
			config.Set(k, getEnvOrPanic(strings.TrimSuffix(strings.TrimPrefix(value, "${"), "}")))
		}
	}
}

func GetConfig() *viper.Viper {
	return config
}

func getEnvOrPanic(env string) string {
	res := os.Getenv(env)

	return res
}
