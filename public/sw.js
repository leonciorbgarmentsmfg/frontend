self.addEventListener('push', (event) => {
  let notification = {}
  try {
    notification = event.data?.json() || {}
  } catch {
    notification = { body: event.data?.text() || 'An order has advanced.' }
  }
  event.waitUntil(self.registration.showNotification(notification.title || 'BPSMS order update', {
    body: notification.body || 'An order has advanced to the next stage.',
    tag: notification.tag,
    data: { url: notification.url || '/' },
  }))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = new URL(event.notification.data?.url || '/', self.location.origin).href
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
    const appWindow = windows.find((client) => new URL(client.url).origin === self.location.origin)
    if (appWindow) {
      appWindow.navigate(targetUrl)
      return appWindow.focus()
    }
    return self.clients.openWindow(targetUrl)
  }))
})
