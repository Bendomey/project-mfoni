/* eslint-disable react/no-unstable-nested-components */
import { useEffect, useRef, useState } from 'react'
import { useMediaQuery } from '@uidotdev/usehooks'
import { useContentUpload } from '../context.tsx'
import { AddNewContentButton } from './add-new-content.tsx'
import { ContentSideViewer } from './content-side-viewer.tsx'
import { Footer } from './footer.tsx'
import { ContentEditor } from './content-editor/index.tsx'
import { classNames } from '@/lib/classNames.ts'

const HeaderDetails = () => {
  const { maxFiles } = useContentUpload()
  return (
    <div className="flex flex-col justify-center items-center w-full">
      <h1 className="font-bold text-3xl md:text-3xl xl:text-4xl w-3/3 md:w-full text-center mt-5 px-5 md:px-0">
        Make your photos easy to find and be seen.
      </h1>
      <p className="text-center w-full md:w-5/6 mt-5 text-lg md:text-base xl:text-lg px-3 md:px-0">
        The way hashtags make your content discoverable in social media, tags
        will make it easier to find on mfoni.{' '}
        <b>Add some keywords that describe your photo and what is in it</b>.
      </p>
      <h1 className={
        classNames(
          "font-bold  md:text-2xl mt-5",
          maxFiles === 0 ? 'text-red-600' : 'text-blue-600',
        )
      }>
        You have {maxFiles} uploads left
      </h1>
    </div>
  )
}

export const ContentManager = () => {
  const { contents } = useContentUpload()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeContent, setActiveContent] = useState<number>(0)
  const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)')

  useEffect(() => {
    if (!isSmallDevice && scrollRef.current) {
      const element = Array.from(scrollRef.current.children)[activeContent]
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
  }, [activeContent, isSmallDevice])

  function scrollToPosition(contentIdx: number) {
    if (scrollRef.current) {
      const element = Array.from(scrollRef.current.children)[contentIdx]
      if (element && !isSmallDevice) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
      setActiveContent(contentIdx)
    }
  }

  return (
    <div className=" pt-0 md:pt-5">
      <div className="block md:hidden">
        <HeaderDetails />
      </div>
      <div className="grid grid-cols-8 gap-4 items-start mt-4 md:mt-0">
        <div className="md:sticky md:top-20 col-span-8 md:col-span-1">
          <div className="max-h-[87vh] overflow-y-auto md:pb-40 md:pl-5 scrollContainer">
            <div className=" flex flex-row md:flex-col justify-start md:justify-center items-center gap-2 md:gap-4">
              <AddNewContentButton />
              {Object.values(contents).map((content, contentIdx) => (
                <ContentSideViewer
                  activeContent={activeContent === contentIdx}
                  onSelect={() => scrollToPosition(contentIdx)}
                  content={content}
                  key={contentIdx}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="col-span-8 md:col-span-7">
          <div className="pb-10 md:pb-40 md:pr-10 ">
            <div className="hidden md:block">
              <HeaderDetails />
            </div>
            <div ref={scrollRef} className="mt-10 flex flex-col gap-4">
              {Object.entries(contents).map(([contentId], contentIdx) =>
                isSmallDevice ? (
                  activeContent == contentIdx ? (
                    <ContentEditor contentId={contentId} key={contentIdx} />
                  ) : null
                ) : (
                  <ContentEditor contentId={contentId} key={contentIdx} />
                ),
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer contents={Object.values(contents)} />
    </div>
  )
}
