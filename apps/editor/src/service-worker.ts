import { createResolvablePromise } from '@notarium/common';

const [p, resolve] = createResolvablePromise();
const channel = new BroadcastChannel('sw-messages');

function getClient() {
	return self.clients
		.matchAll({
			includeUncontrolled: true,
			type: 'window'
		})
		.then((clients) => {
			if (clients && clients.length) {
				// Send a response - the clients
				// array is ordered by last focused
				return clients[0];
			}
		});
}

self.addEventListener('fetch', async function (event) {
	const url = event.request.url;
	if (url.endsWith('.jpg') || url.endsWith('.png')) {
		await p;
		channel.postMessage({ type: 'request', url });
		event.respondWith(caches.match('/placeholder.jpg'));
	}
});

self.addEventListener('install', (e) => {
	resolve(true);
	self.skipWaiting();
	e.waitUntil(
		caches.open('precache').then((cache) => {
			cache.add('/placeholder.jpg');
		})
	);
});
