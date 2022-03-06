import { createBinaryBackend } from '@notarium/data';
import { P2PClient, IDBAdapter } from '@notarium/adapters';

export default function createBinaryHandler(channel: BroadcastChannel) {
	channel.addEventListener('message', async (event) => {
		const { type, url } = event.data;
		if (type === 'request') {
			const cleanUrl = url.replace(`${window.location.origin}/api/content/`, '');
			const backend = createBinaryBackend(cleanUrl, {
				persistanceAdapterFactory: IDBAdapter,
				messageAdapter: P2PClient
			});
			console.log('URL:REQUEST', cleanUrl);

			await backend.load();
		}
	});
}
