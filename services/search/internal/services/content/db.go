package contentservice

import (
	"context"
	"fmt"

	"github.com/Bendomey/project-mfoni/services/search/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const (
	PublicVisibility = "PUBLIC"
)

type DBContent struct {
	ID         string  `bson:"_id"`
	Type       string  `bson:"type"`
	Title      string  `bson:"title"`
	Visibility string  `bson:"visibility"`
	Amount     int64   `bson:"amount"`
	Status     string  `bson:"status"`
	Media      DBMedia `bson:"media"`
	// TODO: add is searchable field after added to main content model.
}

type DBMedia struct {
	Orientation string `bson:"orientation"`
}

func (context *IContext) FindOne(requestCtx context.Context, contentID string) (*models.Content, error) {
	contentCollection := context.AppContext.MongoClient.
		Database(context.AppContext.Config.GetString("mongo.database_name")).
		Collection(context.AppContext.Config.GetString("mongo.content_collection"))

	contentObjID, convertContentIDErr := objectIDFromHex(contentID)
	if convertContentIDErr != nil {
		return nil, fmt.Errorf("error converting content ID: %w", convertContentIDErr)
	}

	filter := bson.M{"_id": contentObjID}

	var result DBContent
	if getFindErr := contentCollection.FindOne(requestCtx, filter).Decode(&result); getFindErr != nil {
		return nil, fmt.Errorf("error finding content: %w", getFindErr)
	}

	var isVisible = false
	if result.Visibility == PublicVisibility {
		isVisible = true
	}

	var IsSearchable = true

	var isFree = false
	if result.Amount == 0 {
		isFree = true
	}

	return &models.Content{
		ContentID:    contentID,
		Type:         &result.Type,
		Title:        &result.Title,
		IsVisible:    &isVisible,
		IsSearchable: &IsSearchable,
		IsFree:       &isFree,
		Status:       &result.Status,
		Orientation:  &result.Media.Orientation,
	}, nil
}

type TagContent struct {
	Tag Tag `bson:"tag"`
}

type Tag struct {
	Name string `bson:"name"`
}

func (context *IContext) FindTags(requestCtx context.Context, contentID string) (*[]string, error) {
	contentTagsCollection := context.AppContext.MongoClient.
		Database(context.AppContext.Config.GetString("mongo.database_name")).
		Collection(context.AppContext.Config.GetString("mongo.content_tags_collection"))

	contentObjID, convertContentIDErr := objectIDFromHex(contentID)
	if convertContentIDErr != nil {
		return nil, fmt.Errorf("error converting content ID: %w", convertContentIDErr)
	}

	pipeline := mongo.Pipeline{
		bson.D{{"$match", bson.D{{"content_id", contentObjID}}}},
		bson.D{
			{"$lookup",
				bson.D{
					{"from", context.AppContext.Config.GetString("mongo.tag_collection")},
					{"localField", "tag_id"},
					{"foreignField", "_id"},
					{"as", "tag"},
				},
			},
		},
		bson.D{
			{"$unwind",
				bson.D{
					{"path", "$tag"},
					{"preserveNullAndEmptyArrays", true},
				},
			},
		},
	}

	cursor, err := contentTagsCollection.Aggregate(requestCtx, pipeline)
	if err != nil {
		return nil, fmt.Errorf("error aggregating tags: %w", err)
	}

	defer cursor.Close(requestCtx)

	var results = []string{}

	for cursor.Next(requestCtx) {
		var result TagContent
		if err := cursor.Decode(&result); err != nil {
			return nil, fmt.Errorf("error decoding tags: %w", err)
		}

		results = append(results, result.Tag.Name)
	}

	if err := cursor.Err(); err != nil {
		return nil, fmt.Errorf("error iterating tags: %w", err)
	}

	return &results, nil
}

type CollectionContent struct {
	Collection Collection `bson:"collection"`
}

type Collection struct {
	Name       string `bson:"name"`
	Visibility string `bson:"visibility"`
}

func (context *IContext) FindCollections(requestCtx context.Context, contentID string) (*[]string, error) {
	contentCollectionsCollection := context.AppContext.MongoClient.
		Database(context.AppContext.Config.GetString("mongo.database_name")).
		Collection(context.AppContext.Config.GetString("mongo.content_collections_collection"))

	contentObjID, convertContentIDErr := objectIDFromHex(contentID)
	if convertContentIDErr != nil {
		return nil, fmt.Errorf("error converting content ID: %w", convertContentIDErr)
	}

	pipeline := mongo.Pipeline{
		bson.D{{"$match", bson.D{{"content_id", contentObjID}}}},
		bson.D{
			{"$lookup",
				bson.D{
					{"from", context.AppContext.Config.GetString("mongo.collections_collection")},
					{"localField", "collection_id"},
					{"foreignField", "_id"},
					{"as", "collection"},
				},
			},
		},
		bson.D{
			{"$unwind",
				bson.D{
					{"path", "$collection"},
					{"preserveNullAndEmptyArrays", true},
				},
			},
		},
	}

	cursor, err := contentCollectionsCollection.Aggregate(requestCtx, pipeline)
	if err != nil {
		return nil, fmt.Errorf("error aggregating collections: %w", err)
	}

	defer cursor.Close(requestCtx)

	var results = []string{}

	for cursor.Next(requestCtx) {
		var result CollectionContent
		if err := cursor.Decode(&result); err != nil {
			return nil, fmt.Errorf("error decoding collections: %w", err)
		}

		if result.Collection.Visibility == PublicVisibility {
			results = append(results, result.Collection.Name)
		}
	}

	if err := cursor.Err(); err != nil {
		return nil, fmt.Errorf("error iterating collections: %w", err)
	}

	return &results, nil
}

func (context *IContext) FindMany(requestCtx context.Context, skip int64, limit int64) (*[]models.Content, error) {
	contentCollection := context.AppContext.MongoClient.
		Database(context.AppContext.Config.GetString("mongo.database_name")).
		Collection(context.AppContext.Config.GetString("mongo.content_collection"))

	cursor, getFindErr := contentCollection.Find(requestCtx, bson.M{}, &options.FindOptions{
		Limit: &limit,
		Skip:  &skip,
	})

	if getFindErr != nil {
		return nil, fmt.Errorf("error finding content: %w", getFindErr)
	}

	var rawResults []DBContent
	if err := cursor.All(requestCtx, &rawResults); err != nil {
		panic(err)
	}

	var results = []models.Content{}

	for _, result := range rawResults {
		var isVisible = false
		if result.Visibility == PublicVisibility {
			isVisible = true
		}

		var IsSearchable = true

		var isFree = false
		if result.Amount == 0 {
			isFree = true
		}

		results = append(results, models.Content{
			ContentID:    result.ID,
			Type:         &result.Type,
			Title:        &result.Title,
			IsVisible:    &isVisible,
			IsSearchable: &IsSearchable,
			IsFree:       &isFree,
			Status:       &result.Status,
			Orientation:  &result.Media.Orientation,
		})
	}

	return &results, nil
}

func objectIDFromHex(hex string) (*primitive.ObjectID, error) {
	objectID, err := primitive.ObjectIDFromHex(hex)
	if err != nil {
		return nil, err
	}
	return &objectID, nil
}
