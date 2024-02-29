/* eslint-disable no-shadow */
import {useEffect, useMemo, useRef, useState} from 'react'
import {useInView} from 'framer-motion'
import {useAsyncImage} from '../../hooks/use-async-image.ts'
import clsx from 'clsx'

const photos = [
  {
    url: 'https://images.unsplash.com/photo-1522512115668-c09775d6f424?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8YmxhY2slMjB3b21lbnxlbnwwfDF8MHx8fDA%3D',
  },
  {
    url: 'https://images.unsplash.com/photo-1589156191108-c762ff4b96ab?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGJsYWNrJTIwd29tZW58ZW58MHwxfDB8fHww',
  },
  {
    url: 'https://images.unsplash.com/photo-1602618135005-165bc6b7e847?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Y2x1YiUyMHBhcnR5fGVufDB8MXwwfHx8MA%3D%3D',
  },
  {
    url: 'https://images.unsplash.com/photo-1627020730793-2ccb5cd55e99?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Y2x1YiUyMHBhcnR5fGVufDB8MXwwfHx8MA%3D%3D',
  },
  {
    url: 'https://images.unsplash.com/photo-1586893079425-9285c7fd5dc1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGNsdWIlMjBwYXJ0eXxlbnwwfDF8MHx8fDA%3D',
  },
  {
    url: 'https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGJsYWNrJTIwd29tZW58ZW58MHwxfDB8fHww',
  },
  {
    url: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGNsdWIlMjBwYXJ0eXxlbnwwfDF8MHx8fDA%3D',
  },
  {
    url: 'https://images.unsplash.com/photo-1599839619722-39751411ea63?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzB8fGNsdWIlMjBwYXJ0eXxlbnwwfDF8MHx8fDA%3D',
  },
  {
    url: 'https://images.unsplash.com/photo-1606241853208-e8be190ac116?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGJsYWNrJTIwd29tZW58ZW58MHwxfDB8fHww',
  },
  {
    url: 'https://images.unsplash.com/photo-1649730837657-95502fac2858?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTE1fHxjbHViJTIwcGFydHl8ZW58MHwxfDB8fHww',
  },
  {
    url: 'https://images.unsplash.com/photo-1558284484-e364d0bd7713?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzF8fGJsYWNrJTIwd29tZW58ZW58MHwxfDB8fHww',
  },
  {
    url: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YmxhY2slMjBtZW58ZW58MHwxfDB8fHww',
  },
  {
    url: 'https://images.unsplash.com/photo-1625019030820-e4ed970a6c95?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmxhY2slMjBtZW58ZW58MHwxfDB8fHww',
  },
  {
    url: 'https://images.unsplash.com/photo-1593351799227-75df2026356b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDB8fGJsYWNrJTIwd29tZW58ZW58MHwxfDB8fHww',
  },
  {
    url: 'https://images.unsplash.com/photo-1628749528992-f5702133b686?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGJsYWNrJTIwbWVufGVufDB8MXwwfHx8MA%3D%3D',
  },
  {
    url: 'https://images.unsplash.com/photo-1570158268183-d296b2892211?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGJsYWNrJTIwbWVufGVufDB8MXwwfHx8MA%3D%3D',
  },
  {
    url: 'https://images.unsplash.com/photo-1616543593547-8fa08ff11049?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDN8fGJsYWNrJTIwbWVufGVufDB8MXwwfHx8MA%3D%3D',
  },
  {
    url: 'https://images.unsplash.com/photo-1507592457003-ae93c692ccef?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OTB8fGJsYWNrJTIwbWVufGVufDB8MXwwfHx8MA%3D%3D',
  },
]

function PhotoFigure({url, className, ...props}) {
  const animationDelay = useMemo(() => {
    const possibleAnimationDelays = [
      '0s',
      '0.1s',
      '0.2s',
      '0.3s',
      '0.4s',
      '0.5s',
    ]
    return possibleAnimationDelays[
      Math.floor(Math.random() * possibleAnimationDelays.length)
    ]
  }, [])
  const {pending} = useAsyncImage(url)

  return (
    <figure
      className={clsx(
        'animate-fade-in rounded-3xl  opacity-0 shadow-md shadow-gray-900/5',
        className,
      )}
      style={{animationDelay}}
      {...props}
    >
      <div className="cursor-zoom-in mb-5 relative ">
        <img className="h-auto max-w-full rounded-lg" src={url} alt="" />
        {pending ? (
          <div className="bg-black/20 animate-pulse w-full h-[30dvh] md:h-[30vh] lg:h-[30vh] z-10 rounded-lg mb-5" />
        ) : null}
      </div>
    </figure>
  )
}

function splitArray(array, numParts) {
  const result = []
  for (let i = 0; i < array.length; i++) {
    const index = i % numParts
    if (!result[index]) {
      result[index] = []
    }
    result[index].push(array[i])
  }
  return result
}

function PhotoColumn({
  className,
  photos,
  photoClassName = () => {},
  msPerPixel = 0,
}) {
  const columnRef = useRef()
  const [columnHeight, setColumnHeight] = useState(0)
  const duration = `${columnHeight * msPerPixel}ms`

  useEffect(() => {
    const resizeObserver = new window.ResizeObserver(() => {
      setColumnHeight(columnRef.current.offsetHeight)
    })

    resizeObserver.observe(columnRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <div
      ref={columnRef}
      className={clsx('animate-marquee space-y-8 py-4', className)}
      style={{'--marquee-duration': duration}}
    >
      {photos.concat(photos).map((photo, photoIndex) => (
        <PhotoFigure
          key={photoIndex}
          aria-hidden={photoIndex >= photos.length}
          className={photoClassName(photoIndex % photos.length)}
          {...photo}
        />
      ))}
    </div>
  )
}

export function PhotoGrid() {
  const containerRef = useRef()
  const isInView = useInView(containerRef, {once: true, amount: 0.4})
  let columns = splitArray(photos, 5)
  columns = [
    columns[0],
    columns[1],
    splitArray(columns[2], 2),
    splitArray(columns[3], 3),
    splitArray(columns[4], 4),
  ]

  return (
    <div
      ref={containerRef}
      className="relative  grid h-[40dvh] md:h-[50vh] max-h-[40dvh] md:max-h-[50vh] grid-cols-1 items-start gap-8 overflow-hidden px-4 md:grid-cols-3 lg:grid-cols-5"
    >
      {isInView ? (
        <>
          <PhotoColumn
            photos={[...columns[0], ...columns[2].flat(), ...columns[1]]}
            photoClassName={photoIndex =>
              clsx(
                photoIndex >= columns[0].length + columns[2][0].length &&
                  'md:hidden',
                photoIndex >= columns[0].length && 'lg:hidden',
              )
            }
            msPerPixel={10}
          />
          <PhotoColumn
            photos={[...columns[1], ...columns[2][1]]}
            className="hidden md:block"
            photoClassName={photoIndex =>
              photoIndex >= columns[1].length && 'lg:hidden'
            }
            msPerPixel={15}
          />
          <PhotoColumn
            photos={columns[2].flat()}
            className="hidden md:block lg:block"
            msPerPixel={10}
          />
          <PhotoColumn
            photos={columns[3].flat()}
            className="hidden lg:block"
            msPerPixel={10}
          />
          <PhotoColumn
            photos={columns[4].flat()}
            className="hidden lg:block"
            msPerPixel={10}
          />
        </>
      ) : null}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-gray-50" />
      {/* <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-gray-50" /> */}
    </div>
  )
}
