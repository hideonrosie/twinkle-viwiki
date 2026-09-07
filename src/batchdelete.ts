import { BatchDeleteCore } from './core';

export class BatchDelete extends BatchDeleteCore {

	footerLinks = {
		'Trợ giúp Twinkle': 'WP:TW/DOC#batchundelete',
		'Báo cáo lỗi TW2026': 'Thảo luận Wikipedia:Twinkle/Twinkle2026',
	};

	// Nếu là ĐPV, bật mô đun này. BQV không cần hàm này
	constructor() {
		super();

		if (Morebits.userIsInGroup('eliminator') &&
			(
				(mw.config.get('wgCurRevisionId') && mw.config.get('wgNamespaceNumber') > 0) ||
				mw.config.get('wgCanonicalSpecialPageName') === 'Prefixindex'
			)
		) {
			this.addMenu();
		}
	}

	getMetadata(page: any): string[] {
		const metadata: string[] = [];

		if (page.redirect) {
			metadata.push('redirect');
		}

		const editProtection = page.protection?.find(
			(protection: any) =>
				protection.type === 'edit' &&
				protection.level === 'sysop'
		);

		if (editProtection) {
			metadata.push(
				'fully protected' +
				(
					editProtection.expiry === 'infinity'
						? ' indefinitely'
						: ', expires ' +
						new Morebits.date(editProtection.expiry).calendar('utc') +
						' (UTC)'
				)
			);
		}

		if (page.ns === 6) {
			metadata.push('uploader: ' + page.imageinfo?.[0]?.user);
			metadata.push('last edit from: ' + page.revisions?.[0]?.user);
		} else {
			metadata.push(mw.language.convertNumber(page.revisions?.[0]?.size) + ' bytes');
		}

		return metadata;
	}
}