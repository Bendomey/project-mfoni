export const classNames = (...classes: (string | undefined)[]) => {
  return classes.filter(Boolean).join(' ')
}
