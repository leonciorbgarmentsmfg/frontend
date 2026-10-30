self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    await self.clients.claim()
    const subscription = await self.registration.pushManager.getSubscription()
    if (subscription) await subscription.unsubscribe()
    await self.registration.unregister()
  })())
})

self.addEventListener('push', (event) => {
  event.waitUntil(Promise.resolve())
})
