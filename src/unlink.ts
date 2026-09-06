import { UnlinkCore } from './core';

export class Unlink extends UnlinkCore {

	footerLinks = {
		'Trợ giúp Twinkle': 'WP:TW/DOC#unlink',
		'Báo cáo lỗi TWV3': 'Thảo luận Wikipedia:Twinkle/TwinkleV3',
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
