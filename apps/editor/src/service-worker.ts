/// <reference no-default-lib="true"/>
/// <reference lib="ES2015" />
/// <reference lib="webworker" />

import { createResolvablePromise, logger, splitPath } from '@notarium/common';

const [p, resolve] = createResolvablePromise();

const log = logger('sw');

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
	log('received message', { promises, msg });
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
	if (
		u.pathname.endsWith('.jpg') ||
		u.pathname.endsWith('.png') ||
		u.pathname.endsWith('.webp' || u.pathname.endsWith('.gif'))
	) {
		const fileId = splitPath(u.pathname.replace(u.search, '')).join('/').replace('edit/', '');

		if (fileId in dataStore) {
			log('intercepting with cache', { fileId, dataStore });
			return event.respondWith(
				new Response(dataStore[fileId], { headers: { 'content-type': 'image/jpg' } })
			);
		}

		if (!(fileId in promises)) {
			log('intercepting without cache', { fileId, dataStore });
			const timeout = setTimeout(() => {
				log('request timed out', { fileId });
				promises[fileId][1](new Response('/placeholder.jpg'));
			}, 2000);
			promises[fileId] = createResolvablePromise();
			promises[fileId][0].then((response: Response) => {
				log('got data from server', response);
				clearTimeout(timeout);
			});
			log('post to channel', { fileId });
			channel.postMessage({ type: 'request', url: fileId });
		}

		return event.respondWith(
			promises[fileId][0].then(
				(data: Uint8Array) => new Response(data, { headers: { 'content-type': 'image/jpg' } })
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
