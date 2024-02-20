import {Fragment} from 'react'
import {Content} from '@/components/Content/index.tsx'
import {imageUrls} from '@/modules/index.ts'

export const ProfileMuse = () => {
  return (
    <div className="columns-1 gap-2 sm:columns-2 sm:gap-4 md:columns-2 lg:columns-3 [&>img:not(:first-child)]:mt-8 ">
      {imageUrls.map((url, index) => (
        <Fragment key={index}>
          <Content content={{url}} />
        </Fragment>
      ))}
    </div>
  )
}
