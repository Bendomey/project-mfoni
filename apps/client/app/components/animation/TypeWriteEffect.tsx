'use client'

import {classNames} from '@/lib/classNames.ts'
import {motion} from 'framer-motion'

export const TypewriterEffectSmooth = ({
  words,
  className,
  cursorClassName,
  wordClassName = 'text-2xl sm:text-2xl md:text-2xl lg:text:3xl xl:text-4xl font-bold',
}: {
  words: {
    text: string
    className?: string
  }[]
  className?: string
  cursorClassName?: string
  wordClassName?: string
}) => {
  // split text inside of words into array of characters
  const wordsArray = words.map(word => {
    return {
      ...word,
      text: word.text.split(''),
    }
  })
  const renderWords = () => {
    return (
      <div className="inline">
        {wordsArray.map((word, idx) => {
          return (
            <div key={`word-${idx}`} className="inline-block">
              {word.text.map((char, index) => (
                <span
                  key={`char-${index}`}
                  className={classNames(word.className, ` text-black `)}
                >
                  {char}
                </span>
              ))}
              &nbsp;
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={classNames(className, 'flex space-x-1')}>
      <motion.div
        className="overflow-hidden"
        initial={{
          width: '0%',
        }}
        whileInView={{
          width: 'fit-content',
        }}
        transition={{
          duration: 2,
          ease: 'linear',
          delay: 1,
        }}
      >
        <div
          className={wordClassName}
          style={{
            whiteSpace: 'nowrap',
          }}
        >
          {renderWords()}{' '}
        </div>{' '}
      </motion.div>
      <motion.span
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
        className={classNames(
          cursorClassName,
          'block rounded-sm w-[4px]  h-8 sm:h-6 xl:h-12 bg-blue-600',
        )}
      />
    </div>
  )
}
