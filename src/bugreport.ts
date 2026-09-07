import { Twinkle, TwinkleModule, addPortletLink, Page } from './core';

export class BugReport extends TwinkleModule {
	moduleName = 'bugreport';
	static moduleName = 'bugreport';

	constructor() {
		super();
		addPortletLink(
			BugReport.callback,
			'Báo cáo lỗi',
			'tw-bugreport',
			'Báo cáo lỗi kỹ thuật cho công cụ Twinkle'
		);
	}

	static callback() {
		var Window = new Morebits.simpleWindow(600, 560);
		Window.setTitle('Báo cáo lỗi Twinkle');
		Window.setScriptName('Twinkle');
		Window.addFooterLink('Trợ giúp Twinkle', 'WP:TW/DOC');
		Window.addFooterLink('Báo cáo lỗi TW2026', 'Thảo luận Wikipedia:Twinkle/Twinkle2026');

		var form = new Morebits.quickForm(BugReport.evaluate);

		form.append({
			type: 'div',
			label:
				'Sử dụng hộp thoại này để gửi báo cáo lỗi cụ thể về Twinkle. ' +
				'Bạn bắt buộc phải ghi \'Tiêu đề tóm tắt\' cùng với mô tả ngắn về lỗi gặp phải. ' +
				'Nếu có thể, hãy cố gắng mô tả các bước thao tác gây ra lỗi và kết quả mong đợi. ',
			style: 'color: #555; margin-bottom: 8px;',
		});

		form.append({
			type: 'div',
			label: 'Lưu ý: Bạn có thể sử dụng mã wiki trong các hộp lớn dưới đây. Chữ ký của bạn sẽ được tự động chèn vào bản mẫu báo cáo.',
			style: 'color: #555; font-style: italic; margin-bottom: 8px;',
		});

		var field = form.append({
			type: 'field',
			label: 'Thông tin báo cáo lỗi',
		});

		field.append({
			type: 'input',
			name: 'title',
			label: 'Tiêu đề tóm tắt:',
			tooltip: 'Ghi tiêu đề tóm tắt ngắn gọn về lỗi gặp phải (bắt buộc)',
			required: true,
		});

		field.append({
			type: 'select',
			name: 'module',
			label: 'Mô đun gặp lỗi:',
			tooltip: 'Chọn mô đun Twinkle nơi xảy ra lỗi (hoặc chọn Tất cả / Khác)',
			list: [
				{ label: 'Tất cả / Không rõ / Khác', value: 'Tất cả / Khác', selected: true },
				{ label: 'Xóa nhanh (Speedy / CSD)', value: 'speedy' },
				{ label: 'Biểu quyết xóa (XfD)', value: 'xfd' },
				{ label: 'Đề nghị xóa (PROD)', value: 'prod' },
				{ label: 'Đề nghị xóa hình (DI)', value: 'image' },
				{ label: 'Gắn thẻ trang (Tag)', value: 'tag' },
				{ label: 'Khóa trang (Protect)', value: 'protect' },
				{ label: 'Cấm thành viên (Block)', value: 'block' },
				{ label: 'Cảnh báo thành viên (Warn)', value: 'warn' },
				{ label: 'Hồi sửa / Lùi lại (Fluff / Rollback)', value: 'fluff' },
				{ label: 'Báo cáo phá hoại (ARV)', value: 'arv' },
				{ label: 'Hoan nghênh (Welcome)', value: 'welcome' },
				{ label: 'Thư báo (Talkback)', value: 'talkback' },
				{ label: 'Hủy liên kết (Unlink)', value: 'unlink' },
				{ label: 'Xóa hàng loạt (BatchDelete)', value: 'batchdelete' },
				{ label: 'Phục hồi hàng loạt (BatchUndelete)', value: 'batchundelete' },
				{ label: 'Cấu hình / Tùy chọn (Preferences)', value: 'config' },
			],
		});

		field.append({
			type: 'input',
			name: 'page',
			label: 'Trang hoặc liên kết liên quan:',
			tooltip: 'Nhập tên trang hoặc liên kết liên quan (bất kỳ dạng nào, không bắt buộc)',
			value: mw.config.get('wgPageName') ? Morebits.pageNameNorm : '',
		});

		field.append({
			type: 'textarea',
			name: 'details',
			label: 'Chi tiết lỗi gặp phải:',
			tooltip: 'Mô tả chi tiết về lỗi gặp phải (bắt buộc)',
			required: true,
		});

		field.append({
			type: 'textarea',
			name: 'reproduce',
			label: 'Các bước tái tạo lỗi:',
			tooltip: 'Liệt kê các bước thao tác để gây ra lỗi (không bắt buộc)',
		});

		field.append({
			type: 'textarea',
			name: 'expected',
			label: 'Kết quả mong đợi:',
			tooltip: 'Mô tả kết quả bạn mong đợi nếu không xảy ra lỗi (không bắt buộc)',
		});

		form.append({ type: 'submit', label: 'Gửi báo cáo lỗi' });

		var result = form.render();
		Window.setContent(result);
		Window.display();
	}

	static evaluate(event: any) {
		var input = Morebits.quickForm.getInputData(event.target);

		if (!input.title || !input.title.trim()) {
			alert('Vui lòng nhập tiêu đề tóm tắt cho báo cáo lỗi.');
			return;
		}

		if (!input.details || !input.details.trim()) {
			alert('Vui lòng mô tả chi tiết lỗi gặp phải.');
			return;
		}

		var title = input.title.trim();
		var module = input.module || 'Tất cả / Khác';
		var page = input.page ? input.page.trim() : '';
		var details = input.details.trim();
		var reproduce = input.reproduce ? input.reproduce.trim() : '';
		var expected = input.expected ? input.expected.trim() : '';

		var reportText =
			`{{subst:Wikipedia:Twinkle/Twinkle2026/bug` +
			`| tiêu đề = ` + title +
			`| mô đun = ` + module +
			`| trang = ` + page +
			`| chi tiết lỗi = ` + details +
			`| cách tái tạo lỗi = ` + reproduce +
			`| kết quả mong đợi = ` + expected +
			`}}`;

		const targetPageName = 'Thảo luận Wikipedia:Twinkle/Twinkle2026';

		Morebits.simpleWindow.setButtonsEnabled(false);
		Morebits.status.init(event.target);

		Morebits.wiki.actionCompleted.redirect = targetPageName;
		Morebits.wiki.actionCompleted.notice = 'Gửi báo cáo lỗi thành công, hiện đang chuyển hướng đến trang thảo luận';

		Morebits.wiki.addCheckpoint();
		var reportPage = new Page(targetPageName, 'Đang gửi báo cáo lỗi');
		reportPage.setFollowRedirect(true);

		reportPage
			.load()
			.then(() => {
				var text = reportPage.getPageText();
				var newText = BugReport.insertBugReport(text, reportText);

				reportPage.setPageText(newText);
				reportPage.setEditSummary(`/* ${title} */ Báo cáo lỗi mới qua Twinkle.`);
				reportPage.setChangeTags(Twinkle.changeTags);
				reportPage.setCreateOption('recreate');
				return reportPage.save();
			})
			.then(
				() => Morebits.wiki.removeCheckpoint(),
				() => Morebits.wiki.removeCheckpoint()
			);
	}

	static insertBugReport(pageText: string, reportText: string): string {
		const featureHeaderRegex = /^=\s*Đề xuất tính năng\s*=/m;
		const bugHeaderRegex = /^=\s*Báo cáo lỗi\s*=/m;

		// 1. Ưu tiên chèn ngay phía trên đề mục = Đề xuất tính năng =
		if (featureHeaderRegex.test(pageText)) {
			return pageText.replace(featureHeaderRegex, (match) => reportText + '\n\n' + match);
		}

		// 2. Nếu không tìm thấy = Đề xuất tính năng =, tìm đề mục cấp 1 = Báo cáo lỗi =
		if (bugHeaderRegex.test(pageText)) {
			const bugHeaderMatch = bugHeaderRegex.exec(pageText);
			if (bugHeaderMatch) {
				const startIndex = bugHeaderMatch.index + bugHeaderMatch[0].length;
				const nextLevel1Regex = /^=\s*[^=]+\s*=/m;
				const remainingText = pageText.slice(startIndex);
				const nextMatch = nextLevel1Regex.exec(remainingText);
				if (nextMatch) {
					const insertPos = startIndex + nextMatch.index;
					return pageText.slice(0, insertPos) + reportText + '\n\n' + pageText.slice(insertPos);
				}
			}
		}

		// 3. Dự phòng: Nối vào cuối trang
		return pageText.trim() + '\n\n' + reportText;
	}
}
