package lib

import (
	"context"
	"errors"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"github.com/spf13/viper"
	"google.golang.org/grpc/metadata"
)

func VerifyAuthToken(requestCtx context.Context, config *viper.Viper) bool {
	// Extract headers.
	tokenWithBearer, extractAuthorizationHeader := getAuthorizationHeader(requestCtx)
	if extractAuthorizationHeader != nil {
		return false
	}

	tokenString, extractTokenWithError := extractToken(*tokenWithBearer)
	if extractTokenWithError != nil {
		return false
	}

	// Parse and verify the signature.
	token, parseErr := jwt.Parse(*tokenString, func(_ *jwt.Token) (interface{}, error) {
		return []byte(config.GetString("jwt.secret_key")), nil
	}, jwt.WithIssuer(config.GetString("jwt.issuer")), jwt.WithValidMethods([]string{"HS256"}))

	if parseErr != nil {
		return false
	}

	if token == nil {
		return false
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return false
	}

	// Check if the token is valid.
	if !token.Valid {
		return false
	}

	// Check if the app is authorized.
	authorizedApps := strings.Split(config.GetString("jwt.authorized_apps"), ",")

	sub, subOk := claims["sub"].(string)
	if !subOk {
		return false
	}

	return contains(authorizedApps, sub)
}

func getAuthorizationHeader(ctx context.Context) (*string, error) {
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return nil, errors.New("no metadata found")
	}

	values, authOk := md["authorization"]

	if !authOk {
		return nil, errors.New("authorization header not found")
	}

	return &values[0], nil
}

func extractToken(token string) (*string, error) {
	if len(token) > 7 && token[:7] == "Bearer " {
		tokenWithoutBearer := token[7:]

		return &tokenWithoutBearer, nil
	}

	return nil, errors.New("invalid token")
}

func contains(arr []string, str string) bool {
	for _, v := range arr {
		if v == str {
			return true
		}
	}
	return false
}
