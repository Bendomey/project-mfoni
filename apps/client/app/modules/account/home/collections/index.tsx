import { FadeIn } from "@/components/animation/FadeIn.tsx";
import { CollectionCard } from "@/components/CollectionCard/index.tsx";


export function AccountCollectionsModule() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <FadeIn>
                <CollectionCard
                    collection={{
                        name: "Collection 1",
                        contentItems: []
                    }}
                />
            </FadeIn>
            <FadeIn>
                <CollectionCard
                    collection={{
                        name: "Collection 1",
                        contentItems: [
                            {
                                content: {
                                    media: {
                                        url: "https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-1.jpg"
                                    }
                                }
                            }
                        ]
                    }}
                />
            </FadeIn>
            <FadeIn>
                <CollectionCard
                    collection={{
                        name: "Collection 1",
                        contentItems: [
                            {
                                content: {
                                    media: {
                                        url: "https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-1.jpg"
                                    }
                                }
                            },
                            {
                                content: {
                                    media: {
                                        url: "https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-2.jpg"
                                    }
                                }
                            }
                        ]
                    }}
                />
            </FadeIn>
            <FadeIn>
                <CollectionCard
                    collection={{
                        name: "Collection 1",
                        contentItems: [
                            {
                                content: {
                                    media: {
                                        url: "https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-1.jpg"
                                    }
                                }
                            },
                            {
                                content: {
                                    media: {
                                        url: "https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-2.jpg"
                                    }
                                }
                            },
                            {
                                content: {
                                    media: {
                                        url: "https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-3.jpg"
                                    }
                                }
                            },
                        ]
                    }}
                />
            </FadeIn>
            <FadeIn>
                <CollectionCard
                    collection={{
                        name: "Collection 1",
                        contentItems: [
                            {
                                content: {
                                    media: {
                                        url: "https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-1.jpg"
                                    }
                                }
                            },
                            {
                                content: {
                                    media: {
                                        url: "https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-2.jpg"
                                    }
                                }
                            },
                            {
                                content: {
                                    media: {
                                        url: "https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-3.jpg"
                                    }
                                }
                            },
                            {
                                content: {
                                    media: {
                                        url: "https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-4.jpg"
                                    }
                                }
                            }
                        ]
                    }}
                />
            </FadeIn>
            <FadeIn>
                <CollectionCard
                    collection={{
                        name: "Collection 1",
                        contentItems: [
                            {
                                content: {
                                    media: {
                                        url: "https://flowbite.s3.amdfsfdazonaws.com/docs/gallery/masonry/image-1.jpg"
                                    }
                                }
                            },
                            {
                                content: {
                                    media: {
                                        url: "https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-2.jpg"
                                    }
                                }
                            },
                            {
                                content: {
                                    media: {
                                        url: "https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-3.jpg"
                                    }
                                }
                            },
                            {
                                content: {
                                    media: {
                                        url: "https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-4.jpg"
                                    }
                                }
                            }
                        ]
                    }}
                />
            </FadeIn>
        </div>
    )
}