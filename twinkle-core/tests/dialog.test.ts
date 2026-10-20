import './test_base';

import { Dialog } from '../src/Dialog';

describe('dialog', () => {
	test('dialog', () => {
		let dialog = new Dialog(400, 400);
		expect(dialog).toBeInstanceOf(Morebits.simpleWindow);
		// TODO: make test more meaningful
	});
});
