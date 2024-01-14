import {Fragment} from 'react'
import {Content} from '@/components/Content/index.tsx'
import {imageUrls} from '@/modules/index.tsx'

export const ProfileMuse = () => {
  return (
    <div className="columns-1 gap-2 sm:columns-2 sm:gap-4 md:columns-3 lg:columns-4 [&>img:not(:first-child)]:mt-8 ">
      {imageUrls.map((url, index) => (
        <Fragment key={index}>
          <Content content={{url}} />
        </Fragment>
      ))}
    </div>
  )
}