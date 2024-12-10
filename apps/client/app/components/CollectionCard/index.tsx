import { ContentItemImages } from "./content-item.tsx";

interface Props {
    collection: Collection
}

export function CollectionCard({ collection }: Props) {
    return (
        <div className="h-52">
            <ContentItemImages
                collectionName={collection.name}
                contents={collection.contentItems ?? []}
            />
        </div>
    )
}