import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'

dayjs.extend(localizedFormat)

export const localizedDayjs = dayjs

export const convertFromMinutes = (minutes: number) => {
  if (minutes === 0) {
    return {
      hours: 0,
      minutes: 0,
    }
  }

  return {
    hours: Math.trunc(minutes / 60),
    minutes: minutes % 60,
  }
}

export const convertToMinutes = (hours: number, minutes: number) =>
  hours * 60 + minutes
