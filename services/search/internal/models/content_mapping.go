package models

// nolint: gochecknoglobals
var ContentMapping = map[string]interface{}{
	"content_id": map[string]string{
		"type": "keyword",
	},
	"type": map[string]string{
		"type": "text",
	},
	"title": map[string]string{
		"type": "text",
	},
	"is_visible": map[string]string{
		"type": "boolean",
	},
	"is_searchable": map[string]string{
		"type": "boolean",
	},
	"is_free": map[string]string{
		"type": "boolean",
	},
	"status": map[string]string{
		"type": "text",
	},
	"orientation": map[string]string{
		"type": "text",
	},
	"tags": map[string]string{
		"type": "text", // An array of tags.
	},
	"collections": map[string]string{
		"type": "text", // An array of collections.
	},
}
