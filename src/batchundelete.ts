import { BatchUndeleteCore } from './core';

export class BatchUndelete extends BatchUndeleteCore {

	footerLinks = {
		'Trợ giúp Twinkle': 'WP:TW/DOC#batchundelete',
		'Báo cáo lỗi TW2026': 'Thảo luận Wikipedia:Twinkle/Twinkle2026',
	};

	// Nếu là ĐPV, bật mô đun này. BQV không cần hàm này
	constructor() {
		super();

		if (Morebits.userIsInGroup('eliminator') &&
			mw.config.get('wgArticleId') &&
			(
				mw.config.get('wgNamespaceNumber') ===
				mw.config.get('wgNamespaceIds').user ||
				mw.config.get('wgNamespaceNumber') ===
				mw.config.get('wgNamespaceIds').project
			)
		) {
			this.addMenu();
		}
	}
}