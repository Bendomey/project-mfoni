export const initiateTwitterAuth = async () => {
  const res = await fetch('/api/auth/twitter', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({callbackUrl: window.location.href}),
  })
  const data = await res.json()
  return data
}
