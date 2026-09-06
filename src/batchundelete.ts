import { BatchUndeleteCore } from './core';

export class BatchUndelete extends BatchUndeleteCore {

    // Liên kết cuối cửa sổ công cụ
    footerLinks = {
        'Trợ giúp Twinkle': 'WP:TW/DOC#batchundelete',
        'Để lại phản hồi': 'WT:TW',
    };

    // Kiểm tra quyền BQV hay ĐPV
	constructor() {
		super();

		// Core constructor đã gọi addMenu() cho sysop rồi.
		// Ở đây chỉ xử lý trường hợp bổ sung: eliminator không phải sysop.
		if (
			!Morebits.userIsSysop &&
			Morebits.userIsInGroup('eliminator') &&
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