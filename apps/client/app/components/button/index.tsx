import {Link} from '@remix-run/react'
import {useCallback, useMemo} from 'react'

interface Props
  extends Omit<
    React.DetailedHTMLProps<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    >,
    'type'
  > {
  isLink?: boolean
  href?: string
  variant?: 'outline' | 'solid' | 'ghost' | 'unstyled'
  color?:
    | 'primary'
    | 'secondary'
    | 'danger'
    | 'success'
    | 'warning'
    | 'info'
    | 'light'
    | 'dark'
    | 'link'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  type?: 'button' | 'submit' | 'reset'
  externalClassName?: string
  children: React.ReactNode
}

export const Button = ({
  children,
  variant: propVariant = 'solid',
  color: propColor = 'primary',
  size: propSize = 'md',
  isLink,
  type = 'button',
  externalClassName = '',
  disabled,
  ...props
}: Props) => {
  const getSize = useCallback(() => {
    if (propSize === 'sm') {
      return 'px-3 py-1 text-xs'
    } else if (propSize === 'lg') {
      return 'px-6 py-3 text-lg'
    } else if (propSize === 'xl') {
      return 'px-8 py-2 md:py-4 text-lg md:text-xl'
    }

    return 'px-4 py-2 text-sm'
  }, [propSize])

  const getColor = useCallback(() => {
    if (propColor === 'primary') {
      return 'blue'
    } else if (propColor === 'secondary') {
      return 'gray'
    } else if (propColor === 'danger') {
      return 'red'
    } else if (propColor === 'success') {
      return 'green'
    } else if (propColor === 'warning') {
      return 'yellow'
    } else if (propColor === 'info') {
      return 'indigo'
    } else if (propColor === 'light') {
      return 'gray'
    } else if (propColor === 'dark') {
      return 'gray'
    }

    return 'blue'
  }, [propColor])

  const getVariantClassName = useCallback(
    (color: string, size: string) => {
      if (propVariant === 'outline') {
        return `rounded-md bg-white ${size} font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 ${
          disabled ? 'cursor-not-allowed bg-gray-200 hover:bg-gray-200' : ''
        }`
      } else if (propVariant === 'solid') {
        return `rounded-md bg-${color}-600 ${size} text-sm font-semibold text-white hover:bg-${color}-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-${color}-600 ${
          disabled ? `cursor-not-allowed bg-${color}-300` : ''
        }`
      } else if (propVariant === 'ghost') {
        return `rounded-md bg-white/10 ${size} text-sm font-semibold text-white hover:bg-white/20 ${
          disabled ? 'cursor-not-allowed bg-gray-200' : ''
        }`
      }

      return ''
    },
    [disabled, propVariant],
  )

  const className = useMemo(() => {
    const color = getColor()
    const size = getSize()
    return getVariantClassName(color, size)
  }, [getColor, getSize, getVariantClassName])

  if (isLink) {
    return (
      <Link
        to={props.href || '/'}
        className={`${className} ${externalClassName}`}
      >
        {children}
      </Link>
    )
  }

  return (
    <button
      {...props}
      type={type}
      disabled={disabled}
      className={`${className} ${externalClassName}`}
    >
      {children}
    </button>
  )
}
