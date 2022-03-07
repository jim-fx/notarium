/// <reference no-default-lib="true"/>
/// <reference lib="ES2015" />
/// <reference lib="webworker" />

import { createResolvablePromise, splitPath } from '@notarium/common';

const [p, resolve] = createResolvablePromise();

function getClient() {
	return self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then((clients) => {
		if (clients && clients.length) {
			// Send a response - the clients
			// array is ordered by last focused
			return clients[0];
		}
	});
}

const channel = new BroadcastChannel('sw-messages');
const dataStore = {};
const promises: Record<string, ReturnType<typeof createResolvablePromise>> = {};
channel.addEventListener('message', ({ data: msg }) => {
	console.log('PROM', { promises, msg });
	const { data, url } = msg;
	if (url in promises) {
		dataStore[url] = data;
		promises[url][1](data);
	}
});

self.addEventListener('fetch', async function (event: FetchEvent) {
	const url = event.request.url;
	const u = new URL(url);
	if (u.search.includes('nosw')) return;
	if (u.hash.includes('text')) return;
	if (u.host !== self.location.host) return;
	if (u.pathname.endsWith('.jpg') || u.pathname.endsWith('.png')) {
		const fileId = splitPath(u.pathname.replace(u.search, '')).join('/').replace('edit/', '');

		if (fileId in dataStore) {
			return event.respondWith(
				new Response(dataStore[fileId], {
					headers: {
						'content-type': 'image/jpg'
					}
				})
			);
		}

		if (!(fileId in promises)) {
			const timeout = setTimeout(() => {
				promises[fileId][1](new Response('/placeholder.jpg'));
			}, 2000);
			promises[fileId] = createResolvablePromise();
			promises[fileId][0].then((response: Response) => {
				console.log(response);
				clearTimeout(timeout);
			});
			channel.postMessage({ type: 'request', url: fileId });
		}

		return event.respondWith(
			promises[fileId][0].then(
				(data) =>
					new Response(data, {
						headers: {
							'content-type': 'image/jpg'
						}
					})
			)
		);
	}
});

self.addEventListener('install', (e) => {
	resolve();
	self.skipWaiting();
	e.waitUntil(
		caches.open('precache').then((cache) => {
			cache.add('/placeholder.jpg');
		})
	);
});
