import fs from '$lib/fs';

export default function createBinaryHandler(channel: BroadcastChannel) {
	channel.addEventListener('message', async (event) => {
		const { type, url } = event.data;
		console.table({ type, url });
		if (type === 'request') {
			const f = fs.findFile(url);

			if (!f) return;

			const file = fs.openFile(url);
			const data = await file.load();

			if (data) {
				channel.postMessage({
					url,
					data
				});
			}
		}
	});
}
