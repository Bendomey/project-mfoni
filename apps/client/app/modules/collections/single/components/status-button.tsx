import { Button } from "@/components/button/index.tsx"

interface Props {
    collection: Collection
}
export function StatusButton({ collection }: Props) {
    if (collection.visibility === 'PRIVATE') {
        return <Button>Publish</Button>
    }

    return <Button>Hide</Button>
}
