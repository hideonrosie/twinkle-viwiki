import { UnlinkCore } from './core';

export class Unlink extends UnlinkCore {

	footerLinks = {
		'Trợ giúp Twinkle': 'WP:TW/DOC#unlink',
		'Để lại phản hồi': 'WT:TW',
	};

	isUsable(): boolean {
		return (
			super.isUsable() ||
			(
				mw.config.get('wgNamespaceNumber') >= 0 &&
				mw.config.get('wgPageName') !== 'Trợ giúp:Chỗ thử' &&
				// Kiểm tra xem thành viên sử dụng có thuộc nhóm "eliminator" hay không
				Morebits.userIsInGroup('eliminator')
			)
		);
	}
}
