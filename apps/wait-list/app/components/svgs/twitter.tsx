import {cn} from '@/lib/cn.ts'

type Props = {
  className?: string
}
export const TwitterSvg = ({
  className = 'lg:w-6 lg:h-6 md:h-6 md:w-6 w-5 h-5 xl:w-6 xl:h-6 ',
}: Props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className, 'icon icon-tabler icon-tabler-brand-x')}
      width="44"
      height="44"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="#2c3e50"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
    </svg>
  )
}
