import { blurDataURL } from '@/constants/index.ts';
import { useValidateImage } from '@/hooks/use-validate-image.tsx';
import { classNames } from '@/lib/classNames.ts';
import { safeString } from '@/lib/strings.ts';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { Image } from 'remix-image';


interface ContentItemImageProps {
    content?: Nullable<Content>;
    contentAlt: string;
    contentsLength: number;
    styles: string;
}

export function ContentItemImage({
    content,
    contentAlt,
    styles,
}: ContentItemImageProps) {
    const isValidImageUrl = useValidateImage(safeString(content?.media.url));

    if (!isValidImageUrl || !content?.media.url) {
        return (
            <div aria-label={contentAlt} className={classNames('flex justify-center items-center bg-zinc-100', styles)}>
                <PhotoIcon className='size-10 text-zinc-300' />
            </div>
        );
    }

    return (
        <Image
            alt={contentAlt}
            blurDataURL={blurDataURL}
            className={styles}
            src={content.media.url}
        />
    );
}
