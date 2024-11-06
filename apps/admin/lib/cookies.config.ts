import Cookies from 'js-cookie'

class Auth {
  getCipher(key: string) {
      const token = Cookies.get(key)
      return token != undefined ? JSON.parse(token) : null
  }

  setCipher<T>(key: string, data: T) {
      Cookies.set(key, JSON.stringify(data), {
        expires: 1, // 1 day
      })
  }

  clearCipher(key: string) {
    Cookies.remove(key)
  }
}

export const auth = new Auth()
