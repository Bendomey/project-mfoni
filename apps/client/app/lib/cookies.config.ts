import Cookies from 'js-cookie'

class Auth {
  getCipher(key: string) {
    const token = Cookies.get(key)
    return token == undefined ? null : JSON.parse(token)
  }

  setCipher(key: string, data: string) {
    Cookies.set(key, JSON.stringify(data))
  }

  clearCipher(key: string) {
    Cookies.remove(key)
  }
}

export const auth = new Auth()
