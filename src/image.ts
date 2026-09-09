import { Twinkle, TwinkleModule, getPref, addPortletLink, Preference } from './core';

export class ImageModule extends TwinkleModule {
	moduleName = 'image';
	static moduleName = 'image';

	static userPreferences() {
		return {
			title: 'Đề nghị xóa hình (DI)',
			preferences: [
				{
					name: 'notifyUserOnDeli',
					label: 'Mặc định chọn checkbox "Thông báo cho người tải lên"',
					type: 'boolean',
					default: true,
				} as Preference,
				{
					name: 'markDeliPagesAsPatrolled',
					label: 'Đánh dấu tuần tra tập tin khi đề nghị xóa (DI)',
					type: 'boolean',
					default: true,
				} as Preference,
				{
					name: 'deliWatchPage',
					label: 'Thêm trang tập tin vào danh sách theo dõi khi gắn thẻ đề nghị xóa',
					type: 'enum',
					enumValues: {
						yes: 'Thêm vào danh sách theo dõi',
						no: 'Không thêm vào danh sách theo dõi',
						default: 'Theo tùy chỉnh trang của bạn',
					},
					default: 'default',
				} as Preference,
				{
					name: 'deliWatchUser',
					label: 'Thêm trang thảo luận người dùng vào danh sách theo dõi khi thông báo',
					type: 'enum',
					enumValues: {
						yes: 'Thêm vào danh sách theo dõi',
						no: 'Không thêm vào danh sách theo dõi',
						default: 'Theo tùy chỉnh trang của bạn',
					},
					default: 'default',
				} as Preference,
			],
		};
	}

	constructor() {
		super();
		if (
			mw.config.get('wgNamespaceNumber') === 6 &&
			mw.config.get('wgArticleId') &&
			!document.getElementById('mw-sharedupload') &&
			!Morebits.wiki.isPageRedirect()
		) {
			addPortletLink(
				ImageModule.callback,
				'Đề nghị xóa hình',
				'tw-di',
				'Xóa tập tin sau 7 ngày'
			);
		}
	}

	static callback() {
		var Window = new Morebits.simpleWindow(600, 330);
		Window.setTitle('Đề nghị xóa tập tin - Xóa sau 7 ngày');
		Window.setScriptName('Twinkle');
		Window.addFooterLink('Quy định xóa nhanh', 'WP:XN');
		Window.addFooterLink('Tùy chọn', 'WP:TW/PREF#image');
		Window.addFooterLink('Trợ giúp Twinkle', 'WP:TW/DOC#image');
		Window.addFooterLink('Báo cáo lỗi TW2026', 'Thảo luận Wikipedia:Twinkle/Twinkle2026');

		var checkList = [
			{
				label: 'Thông báo cho người tải lên',
				value: 'notify',
				name: 'notify',
				tooltip:
					'Đừng chọn mục này nếu có nhiều thông báo hình ảnh muốn gởi đến cùng một người tải lên, và để tránh tràn ngập các thông báo trên trang thảo luận của họ.',
				checked: getPref('notifyUserOnDeli'),
			},
		];

		if (Morebits.userIsSysop || Morebits.userIsInGroup('patroller')) {
			checkList.push({
				label: 'Đánh dấu tuần tra tập tin',
				value: 'patrol',
				name: 'patrol',
				tooltip: 'Đánh dấu tuần tra tập tin khi thêm bản mẫu đề nghị xóa',
				checked: getPref('markDeliPagesAsPatrolled'),
			});
		}

		form.append({
			type: 'checkbox',
			list: checkList,
		});
		var field = form.append({
			type: 'field',
			label: 'Tác vụ cần thực hiện',
		});
		field.append({
			type: 'radio',
			name: 'type',
			event: ImageModule.choice,
			list: [
				{
					label: 'Thiếu nguồn gốc (XN TT4)',
					value: 'thiếu nguồn gốc',
					checked: true,
					tooltip: 'Hình ảnh hoặc tập tin thiếu thông tin nguồn gốc',
				},
				{
					label: 'Thiếu giấy phép (XN TT4)',
					value: 'thiếu giấy phép',
					tooltip: 'Hình ảnh hoặc tập tin thiếu thông tin về giấy phép',
				},
				{
					label: 'Thiếu nguồn gốc lẫn giấy phép (XN TT4)',
					value: 'thiếu nguồn gốc lẫn giấy phép',
					tooltip: 'Hình ảnh hoặc tập tin thiếu thông tin về nguồn gốc lẫn giấy phép',
				},
				{
					label: 'Sử dụng hợp lý không sử dụng (XN TT5)',
					value: 'SDHL không SD',
					tooltip:
						'Hình ảnh hoặc tập tin không được cấp phép để dùng trên Wikipedia và chỉ cho phép dùng theo tuyên bố sử dụng hợp lý như quy định Wikipedia:Nội dung không tự do, nhưng không dùng trong bài viết nào cả',
				},
				{
					label: 'Thiếu cơ sở hợp lý (XN TT6)',
					value: 'thiếu sử dụng hợp lý',
					tooltip:
						'Hình ảnh hoặc tập tin được tuyên bố là dùng theo quy định sử dụng hợp lý của Wikipedia nhưng không có lời giải thích tại sao lại được cho phép dùng theo quy định đó',
				},
				{
					label: 'Cơ sở hợp lý gây tranh cãi (XN TT7)',
					value: 'lý do SDHL vô lý',
					tooltip: 'Hình ảnh hoặc tập tin có cơ sở hợp lý gây tranh cãi',
				},
				{
					label: 'Sử dụng hợp lý thay thế được (XN TT7)',
					value: 'SDHL thay thế được',
					tooltip:
						'Hình ảnh hoặc tập tin không thỏa mãn tiêu chí không tự do đầu tiên của Wikipedia tức là nó miêu tả sự vật mà rất có khả năng tìm được hoặc tạo được một hình tự do mà có lượng thông tin tương đương',
				},
				{
					label: 'Thiếu sự cho phép (XN TT11)',
					value: 'thiếu bằng chứng',
					tooltip: 'Hình ảnh hoặc tập tin không có bằng chứng là tác giả đồng ý cấp phép cho tập tin',
				},
			],
		});
		form.append({
			type: 'div',
			label: 'Work area',
			name: 'work_area',
		});
		form.append({ type: 'submit' });

		var result = form.render();
		Window.setContent(result);
		Window.display();

		// We must init the parameters
		var evt = document.createEvent('Event');
		evt.initEvent('change', true, true);
		(result as any).type[0].dispatchEvent(evt);
	}

	static choice(event: any) {
		var value = event.target.values;
		var root = event.target.form;
		var work_area = new Morebits.quickForm.element({
			type: 'div',
			name: 'work_area',
		});

		switch (value) {
			case 'thiếu nguồn gốc lẫn giấy phép':
			case 'thiếu nguồn gốc':
				work_area.append({
					type: 'checkbox',
					list: [
						{
							label: 'Không tự do',
							name: 'non_free',
							tooltip: 'Hình cấp phép theo tuyên bố sử dụng hợp lý',
						},
					],
				});
			/* falls through */
			case 'thiếu giấy phép':
				work_area.append({
					type: 'checkbox',
					list: [
						{
							name: 'derivative',
							label: 'Tác phẩm phái sinh không dẫn nguồn những tác phẩm nguyên gốc',
							tooltip: 'Tập tin là tác phẩm phái sinh của một hoặc nhiều tác phẩm khác mà không dẫn ra nguồn',
						},
					],
				});
				break;
			case 'thiếu bằng chứng':
				work_area.append({
					type: 'input',
					name: 'source',
					label: 'Nguồn: ',
				});
				break;
			case 'lý do SDHL vô lý':
				work_area.append({
					type: 'textarea',
					name: 'reason',
					label: 'Lý do: ',
				});
				break;
			case 'SDHL không SD':
				work_area.append({
					type: 'input',
					name: 'replacement',
					label: 'Thay thế được: ',
					tooltip: 'Tập tin có thể thay thế tập tin này, nếu có. Tiền tố "Tập tin:" là tùy chọn.',
				});
				break;
			case 'SDHL thay thế được':
				work_area.append({
					type: 'textarea',
					name: 'reason',
					label: 'Lý do: ',
				});
				break;
			default:
				break;
		}

		root.replaceChild(work_area.render(), $(root).find('div[name="work_area"]')[0]);
	}

	static evaluate(event: any) {
		var input = Morebits.quickForm.getInputData(event.target);
		if (input.replacement) {
			input.replacement = (/^(Image|File|Tập tin|Hình):/i.test(input.replacement) ? '' : 'File:') + input.replacement;
		}

		var csdcrit: string;
		switch (input.type) {
			case 'thiếu nguồn gốc lẫn giấy phép':
			case 'thiếu nguồn gốc':
			case 'thiếu giấy phép':
				csdcrit = 'TT4';
				break;
			case 'SDHL không SD':
				csdcrit = 'TT5';
				break;
			case 'thiếu sử dụng hợp lý':
				csdcrit = 'TT6';
				break;
			case 'lý do SDHL vô lý':
			case 'SDHL thay thế được':
				csdcrit = 'TT7';
				break;
			case 'thiếu bằng chứng':
				csdcrit = 'TT11';
				break;
			default:
				throw new Error('Twinkle.image.callback.evaluate: tiêu chí không rõ');
		}

		var lognomination =
			getPref('logSpeedyNominations') &&
			(getPref('noLogOnSpeedyNomination') as string[]).indexOf(csdcrit.toLowerCase()) === -1;
		var templatename = input.derivative ? 'ps ' + input.type : input.type;

		var params = $.extend(
			{
				templatename: templatename,
				normalized: csdcrit,
				lognomination: lognomination,
			},
			input
		);

		Morebits.simpleWindow.setButtonsEnabled(false);
		Morebits.status.init(event.target);

		Morebits.wiki.actionCompleted.redirect = mw.config.get('wgPageName');
		Morebits.wiki.actionCompleted.notice = 'Thêm thông báo hoàn tất';

		// Tagging image
		var wikipedia_page = new Morebits.wiki.page(mw.config.get('wgPageName'), 'Thêm bản mẫu xóa tập tin');
		wikipedia_page.setCallbackParameters(params);
		wikipedia_page.load((pageobj: any) => ImageModule.callbacks.taggingImage(pageobj));

		// Notifying uploader
		if (input.notify) {
			wikipedia_page.lookupCreation((pageobj: any) => ImageModule.callbacks.userNotification(pageobj));
		} else {
			// add to CSD log if desired
			if (lognomination) {
				params.fromDI = true;
				ImageModule.addToLog(params, null);
			}
			// No auto-notification, display what was going to be added.
			var noteData = document.createElement('pre');
			noteData.appendChild(
				document.createTextNode('{{subst:xh-' + templatename + '-tb|1=' + mw.config.get('wgTitle') + '}} ~~~~')
			);
			Morebits.status.info('Thông báo cho người tải lên', [
				'Dữ liệu sau đây/tương tự nên được gửi cho người tải lên:',
				document.createElement('br'),
				noteData,
			]);
		}
	}

	static callbacks = {
		taggingImage: (pageobj: any) => {
			var text = pageobj.getPageText();
			var params = pageobj.getCallbackParameters();

			// remove "move to Commons" tag - deletion-tagged files cannot be moved to Commons
			text = text.replace(/\{\{(mtc|(copy |move )?to ?commons|move to wikimedia commons|copy to wikimedia commons)[^}]*\}\}/gi, '');

			var tag = '{{xh-' + params.templatename + '|ngày={{subst:CURRENTDAY2}}|tháng={{subst:CURRENTMONTH}}|năm={{subst:CURRENTYEAR}}';
			switch (params.type) {
				case 'thiếu nguồn gốc lẫn giấy phép':
				case 'thiếu nguồn gốc':
					tag += params.non_free ? '|không tự do=có' : '';
					break;
				case 'thiếu bằng chứng':
					tag += params.source ? '|nguồn=' + params.source : '';
					break;
				case 'lý do SDHL vô lý':
					tag += params.reason ? '|lý do=' + params.reason : '';
					break;
				case 'SDHL không SD':
					tag += params.replacement ? '|thay thế=' + params.replacement : '';
					break;
				case 'SDHL thay thế được':
					tag += params.reason ? '|1=' + params.reason : '';
					break;
				default:
					break; // doesn't matter
			}
			tag += '|help=off}}\n';

			pageobj.setPageText(tag + text);
			pageobj.setEditSummary('Tập tin được đề nghị xóa theo [[WP:XN#' + params.normalized + '|XN ' + params.normalized + ']] (' + params.type + ').');
			pageobj.setChangeTags(Twinkle.changeTags);
			switch (getPref('deliWatchPage')) {
				case 'yes':
					pageobj.setWatchlist(true);
					break;
				case 'no':
					pageobj.setWatchlistFromPreferences(false);
					break;
				default:
					pageobj.setWatchlistFromPreferences(true);
					break;
			}
			pageobj.setCreateOption('nocreate');

			if (params.patrol) {
				pageobj.triage();
			}

			pageobj.save();
		},

		userNotification: (pageobj: any) => {
			var params = pageobj.getCallbackParameters();
			var initialContrib = pageobj.getCreator();

			// disallow warning yourself
			if (initialContrib === mw.config.get('wgUserName')) {
				pageobj.getStatusElement().warn('Bạn (' + initialContrib + ') đã tạo trang này; bỏ qua thông báo cho người tải lên');
			} else {
				var usertalkpage = new Morebits.wiki.page('Thảo luận Thành viên:' + initialContrib, 'Đang thông báo cho người tải lên đầu tiên (' + initialContrib + ')');
				var notifytext = '\n{{subst:xh-' + params.templatename + '-tb|1=' + mw.config.get('wgTitle');
				if (params.type === 'thiếu bằng chứng') {
					notifytext += params.source ? '|nguồn=' + params.source : '';
				}
				notifytext += '}} ~~~~';
				usertalkpage.setAppendText(notifytext);
				usertalkpage.setEditSummary('Thông báo: có đề nghị xóa [[:' + Morebits.pageNameNorm + ']].');
				usertalkpage.setChangeTags(Twinkle.changeTags);
				usertalkpage.setCreateOption('recreate');
				switch (getPref('deliWatchUser')) {
					case 'yes':
						usertalkpage.setWatchlist(true);
						break;
					case 'no':
						usertalkpage.setWatchlistFromPreferences(false);
						break;
					default:
						usertalkpage.setWatchlistFromPreferences(true);
						break;
				}
				usertalkpage.setFollowRedirect(true, false);
				usertalkpage.append();
			}

			// thêm đề nghị này vào nhật trình không gian thành viên, nếu thành viên có kích hoạt chức năng này
			if (params.lognomination) {
				params.fromDI = true;
				ImageModule.addToLog(params, initialContrib);
			}
		},
	};

	static addToLog(params: any, initialContrib: string | null) {
		if (!params.lognomination) {
			return;
		}
		var usl = new Morebits.userspaceLogger(getPref('speedyLogPageName'));
		usl.initialText =
			'Đây là nhật trình của tất cả đề nghị [[Wikipedia:Tiêu chí xóa nhanh|xóa nhanh]] được thực hiện bởi thành viên này bằng cách sử dụng mô đun CSD của [[WP:TW|Twinkle]].\n\n' +
			'Nếu bạn không muốn giữ nhật trình này nữa, bạn có thể tắt nó bằng cách sử dụng [[Wikipedia:Twinkle/Preferences|bảng cài đặt Twinkle]], và ' +
			'đề cử trang này để xóa nhanh chóng dưới dạng [[WP:TV1|XN TV1]].' +
			(Morebits.userIsSysop || Morebits.userIsInGroup('eliminator') ? '\n\nChú ý: Nhật trình này không theo dõi các thao tác xóa nhanh ngay lập tức được thực hiện bằng Twinkle.' : '');

		var fileLogLink = ' ([{{fullurl:Special:Log|page=' + mw.util.wikiUrlencode(mw.config.get('wgPageName')) + '}} nhật trình])';
		var editsummary = 'Đang ghi nhật trình đề nghị xóa nhanh [[:' + Morebits.pageNameNorm + ']].';
		var appendText = '# [[:' + Morebits.pageNameNorm + ']]' + fileLogLink + ': [[WP:XN#' + params.normalized + '|XN ' + params.normalized + ']] ({{tl|xh-' + params.templatename + '}})';

		if (initialContrib) {
			appendText += '; thông báo đến {{user|1=' + initialContrib + '}}';
		}
		appendText += ' ~~~~~\n';

		usl.changeTags = Twinkle.changeTags;
		usl.log(appendText, editsummary);
	}
}
