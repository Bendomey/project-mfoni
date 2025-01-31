package models

type Content struct {
	// nolint: tagliatelle
	ContentID string  `json:"content_id"`
	Type      *string `json:"type"`
	Title     *string `json:"title"`
	// nolint: tagliatelle
	IsVisible *bool `json:"is_visible"`
	// nolint: tagliatelle
	IsSearchable *bool `json:"is_searchable"`
	// nolint: tagliatelle
	IsFree      *bool    `json:"is_free"`
	Status      *string  `json:"status"`
	Orientation *string  `json:"orientation"`
	Tags        []string `json:"tags"`
	Collections []string `json:"collections"`
}
