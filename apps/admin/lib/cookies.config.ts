import Cookies from 'js-cookie'

class Auth {
  getCipher(key: string) {
    try {
      const token = Cookies.get(key)
      return token != undefined ? JSON.parse(token) : null
    } catch (_) {}
  }

  setCipher<T>(key: string, data: T) {
    try {
      Cookies.set(key, JSON.stringify(data), {
        expires: 1, // 1 day
      })
    } catch (error) {}
  }

  clearCipher(key: string) {
    Cookies.remove(key)
  }
}

export const auth = new Auth()
