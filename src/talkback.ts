import { Twinkle, TwinkleModule, getPref, addPortletLink } from './core';
import { optoutTemplates } from './common';

export class Talkback extends TwinkleModule {
	moduleName = 'talkback';
	static moduleName = 'talkback';

	constructor() {
		super();
		if (!mw.config.exists('wgRelevantUserName') || Morebits.ip.isRange(mw.config.get('wgRelevantUserName'))) {
			return;
		}
		addPortletLink(Talkback.callback, 'Hồi âm', 'friendly-talkback', 'Để lại lời nhắn hồi âm');
	}

	static callback() {
		if (
			mw.config.get('wgRelevantUserName') === mw.config.get('wgUserName') &&
			!confirm("Bạn thật sự muốn hồi âm chính mình?")
		) {
			return;
		}

		var Window = new Morebits.simpleWindow(600, 350);
		Window.setTitle('Talkback');
		Window.setScriptName('Twinkle');
		Window.addFooterLink('Tùy chọn hồi âm', 'WP:TW/PREF#talkback');
		Window.addFooterLink('Trợ giúp Twinkle', 'WP:TW/DOC#talkback');
		Window.addFooterLink('Báo cáo lỗi TW2026', 'Thảo luận Wikipedia:Twinkle/Twinkle2026');

		var form = new Morebits.quickForm(Talkback.evaluate);

		form.append({
			type: 'radio',
			name: 'tbtarget',
			list: [
				{
					label: 'Hồi âm',
					value: 'talkback',
					checked: true,
				},
				{
					label: 'Vui lòng xem',
					value: 'see',
				},
				{
					label: 'Thông báo trên TNCBQV',
					value: 'notice',
				},
				{
					label: "Bạn có thư",
					value: 'mail',
				},
			],
			event: Talkback.changeTarget,
		});

		form.append({
			type: 'field',
			label: 'Khu vực nhập liệu',
			name: 'work_area',
		});

		var previewlink = document.createElement('a');
		$(previewlink).click(function () {
			Talkback.callbacks.preview(result); // |result| is defined below
		});
		previewlink.style.cursor = 'pointer';
		previewlink.textContent = 'Xem trước';
		form.append({ type: 'div', id: 'talkbackpreview', label: [previewlink] });
		form.append({ type: 'div', id: 'friendlytalkback-previewbox', style: 'display: none' });

		form.append({ type: 'submit' });

		var result = form.render();
		Window.setContent(result);
		Window.display();
		result.previewer = new Morebits.wiki.preview($(result).find('div#friendlytalkback-previewbox').last()[0]);

		// We must init the
		var evt = document.createEvent('Event');
		evt.initEvent('change', true, true);
		result.tbtarget[0].dispatchEvent(evt);

		// Check whether the user has opted out from talkback
		var user = new Morebits.wiki.user(mw.config.get('wgRelevantUserName'), 'Truy xuất trạng thái opt-out');
		user.setNotifySkips('userjs.invalid/noTalkback', optoutTemplates);
		user.load(Talkback.optoutStatus);
	}

	static optout = '';

	static optoutStatus(userobj) {
		var tl = userobj.getTalkTemplates();
		if (tl && tl.length) {
			Talkback.optout =
				mw.config.get('wgRelevantUserName') + ' đang nhúng {{' + tl[0] + '}}, vì vậy việc hồi âm có thể không hữu ích';
		} else {
			var el = userobj.getTalkLinks();
			if (el && el.length) {
				Talkback.optout = mw.config.get('wgRelevantUserName') + ' lựa chọn không nhận tin nhắn hồi âm';
				var url = el[0].url;
				var reason = mw.util.getParamValue('reason', url);
				Talkback.optout += reason ? ': ' + reason : '.';
			}
		}
		$('#twinkle-talkback-optout-message').text(Talkback.optout);
	}

	static prev_page = '';
	static prev_section = '';
	static prev_message = '';

	static changeTarget(e) {
		var value = e.target.values;
		var root = e.target.form;

		var old_area = Morebits.quickForm.getElements(root, 'work_area')[0];

		if (root.section) {
			Talkback.prev_section = root.section.value;
		}
		if (root.message) {
			Talkback.prev_message = root.message.value;
		}
		if (root.page) {
			Talkback.prev_page = root.page.value;
		}

		var work_area = new Morebits.quickForm.element({
			type: 'field',
			label: 'Thông tin hồi âm',
			name: 'work_area',
		});

		root.previewer.closePreview();

		switch (value) {
			case 'talkback':
			/* falls through */
			default:
				work_area.append({
					type: 'div',
					label: '',
					style: 'color: red',
					id: 'twinkle-talkback-optout-message',
				});

				work_area.append({
					type: 'input',
					name: 'page',
					label: 'Tên trang của cuộc thảo luận',
					tooltip:
						"Tên trang nơi cuộc thảo luận đang diễn ra. Ví dụ: 'Thảo luận Thành viên:Jimbo Wales' hoặc Thảo luận Wikipedia:Twinkle'. Giới hạn cho tất cả các trang thảo luận, không gian Wikipedia, và không gian Bản mẫu.",
					value: Talkback.prev_page || 'Thảo luận Thành viên:' + mw.config.get('wgUserName'),
				});
				work_area.append({
					type: 'input',
					name: 'section',
					label: 'Tiêu đề mục liên kết (tùy chọn)',
					tooltip: "Tiêu đề mục nơi cuộc thảo luận đang diễn ra. Ví dụ: 'Đề nghị hợp nhất'.",
					value: Talkback.prev_section,
				});
				break;
			case 'notice':
				var noticeboard = work_area.append({
					type: 'select',
					name: 'noticeboard',
					label: 'Kênh tin nhắn:',
					event: function (e) {
						if (e.target.value === 'afchd') {
							Morebits.quickForm.overrideElementLabel(root.section, 'Title of draft (excluding the prefix): ');
							Morebits.quickForm.setElementTooltipVisibility(root.section, false);
						} else {
							Morebits.quickForm.resetElementLabel(root.section);
							Morebits.quickForm.setElementTooltipVisibility(root.section, true);
						}
					},
				});

				$.each(Talkback.noticeboards, function (value, data) {
					noticeboard.append({
						type: 'option',
						label: data.label,
						value: value,
						selected: !!data.defaultSelected,
					});
				});

				work_area.append({
					type: 'input',
					name: 'section',
					label: 'Đề mục thảo luận được liên kết',
					tooltip: 'Tên của đề mục thảo luận có nhắc đến trên trang tin nhắn được chọn.',
					value: Talkback.prev_section,
				});
				break;
			case 'mail':
				work_area.append({
					type: 'input',
					name: 'section',
					label: 'Chủ đề của email (tùy chọn)',
					tooltip: 'Chủ đề của thư điện tử bạn đã gửi.',
				});
				break;
		}

		if (value !== 'notice') {
			work_area.append({
				type: 'textarea',
				label: 'Tin nhắn bổ sung (tùy chọn):',
				name: 'message',
				tooltip:
					'Tin nhắn bổ sung mà bạn muốn ghi vào lời nhắn. Chữ ký sẽ được thêm tự động.',
			});
		}

		var rendered_area = work_area.render() as HTMLElement;
		root.replaceChild(rendered_area, old_area);
		if (root.message) {
			root.message.value = Talkback.prev_message;
		}

		$('#twinkle-talkback-optout-message').text(Talkback.optout);
	}

	static noticeboards: Record<
		string,
		{ label: string; text: string; editSummary: string; defaultSelected?: boolean }
	> = {
			tncbqv: {
				label: "WP:TNCBQV (Tin nhắn cho bảo quản viên)",
				text: '{{subst:AN-notice|thread=$SECTION}} ~~~~',
				editSummary: "Thông báo về một cuộc thảo luận có liên quan đến bạn tại [[Wikipedia:Tin nhắn cho bảo quản viên]]",
			},
			dtnd: {
				label: "WP:DTND (Đổi tên người dùng)",
				text: '{{subst:Chú ý DTND|chữ ký=có}}',
				editSummary: "Thông báo: Vui lòng kiểm tra và phản hồi tại [[Wikipedia:Đổi tên người dùng]]",
			},
			// an: {
			// 	label: "WP:AN (Administrators' noticeboard)",
			// 	text: '{{subst:AN-notice|thread=$SECTION}} ~~~~',
			// 	editSummary: "Notice of discussion at [[Wikipedia:Administrators' noticeboard]]",
			// },
			// an3: {
			// 	label: "WP:AN3 (Administrators' noticeboard/Edit warring)",
			// 	text: '{{subst:An3-notice|$SECTION}} ~~~~',
			// 	editSummary: "Notice of discussion at [[Wikipedia:Administrators' noticeboard/Edit warring]]",
			// },
			// ani: {
			// 	label: "WP:ANI (Administrators' noticeboard/Incidents)",
			// 	text:
			// 		"== Notice of Administrators' noticeboard/Incidents discussion ==\n" +
			// 		'{{subst:ANI-notice|thread=$SECTION}} ~~~~',
			// 	editSummary: "Notice of discussion at [[Wikipedia:Administrators' noticeboard/Incidents]]",
			// 	defaultSelected: true,
			// },
			// // let's keep AN and its cousins at the top
			// afchd: {
			// 	label: 'WP:AFCHD (Articles for creation/Help desk)',
			// 	text: '{{subst:AFCHD/u|$SECTION}} ~~~~',
			// 	editSummary: 'You have replies at the [[Wikipedia:AFCHD|Articles for Creation Help Desk]]',
			// },
			// blpn: {
			// 	label: 'WP:BLPN (Biographies of living persons noticeboard)',
			// 	text: '{{subst:BLPN-notice|thread=$SECTION}} ~~~~',
			// 	editSummary: 'Notice of discussion at [[Wikipedia:Biographies of living persons/Noticeboard]]',
			// },
			// coin: {
			// 	label: 'WP:COIN (Conflict of interest noticeboard)',
			// 	text: '{{subst:Coin-notice|thread=$SECTION}} ~~~~',
			// 	editSummary: 'Notice of discussion at [[Wikipedia:Conflict of interest/Noticeboard]]',
			// },
			// drn: {
			// 	label: 'WP:DRN (Dispute resolution noticeboard)',
			// 	text: '{{subst:DRN-notice|thread=$SECTION}} ~~~~',
			// 	editSummary: 'Notice of discussion at [[Wikipedia:Dispute resolution noticeboard]]',
			// },
			// effp: {
			// 	label: 'WP:EFFP/R (Edit filter false positive report)',
			// 	text: '{{EFFPReply|1=$SECTION|2=~~~~}}',
			// 	editSummary:
			// 		'You have replies to your [[Wikipedia:Edit filter/False positives/Reports|edit filter false positive report]]',
			// },
			// eln: {
			// 	label: 'WP:ELN (External links noticeboard)',
			// 	text: '{{subst:ELN-notice|thread=$SECTION}} ~~~~',
			// 	editSummary: 'Notice of discussion at [[Wikipedia:External links/Noticeboard]]',
			// },
			// ftn: {
			// 	label: 'WP:FTN (Fringe theories noticeboard)',
			// 	text: '{{subst:Ftn-notice|thread=$SECTION}} ~~~~',
			// 	editSummary: 'Notice of discussion at [[Wikipedia:Fringe theories/Noticeboard]]',
			// },
			// hd: {
			// 	label: 'WP:HD (Help desk)',
			// 	text: '== Your question at the Help desk ==\n' + '{{helpdeskreply|1=$SECTION|ts=~~~~~}}',
			// 	editSummary: 'You have replies at the [[Wikipedia:Help desk|Wikipedia help desk]]',
			// },
			// norn: {
			// 	label: 'WP:NORN (Reliable sources noticeboard)',
			// 	text: '{{subst:Norn-notice|thread=$SECTION}} ~~~~',
			// 	editSummary: 'Notice of discussion at [[Wikipedia:Reliable sources/Noticeboard]]',
			// },
			// npovn: {
			// 	label: 'WP:NPOVN (Neutral point of view noticeboard)',
			// 	text: '{{subst:NPOVN-notice|thread=$SECTION}} ~~~~',
			// 	editSummary: 'Notice of discussion at [[Wikipedia:Neutral point of view/Noticeboard]]',
			// },
			// rsn: {
			// 	label: 'WP:RSN (Reliable sources noticeboard)',
			// 	text: '{{subst:RSN-notice|thread=$SECTION}} ~~~~',
			// 	editSummary: 'Notice of discussion at [[Wikipedia:Reliable sources/Noticeboard]]',
			// },
			// th: {
			// 	label: 'WP:THQ (Teahouse question forum)',
			// 	text:
			// 		"== Teahouse talkback: you've got messages! ==\n{{WP:Teahouse/Teahouse talkback|WP:Teahouse/Questions|$SECTION|ts=~~~~}}",
			// 	editSummary: 'You have replies at the [[Wikipedia:Teahouse/Questions|Teahouse question board]]',
			// },
			// otrs: {
			// 	label: 'WP:OTRS/N (OTRS noticeboard)',
			// 	text: '{{OTRSreply|1=$SECTION|2=~~~~}}',
			// 	editSummary: 'You have replies at the [[Wikipedia:OTRS noticeboard|OTRS noticeboard]]',
			// },
		};

	static evaluate(e) {
		var input = Morebits.quickForm.getInputData(e.target);

		var fullUserTalkPageName = new mw.Title(mw.config.get('wgRelevantUserName'), 3).toText();
		var talkpage = new Morebits.wiki.page(fullUserTalkPageName, 'Đang thêm lời nhắn hồi âm');

		Morebits.simpleWindow.setButtonsEnabled(false);
		Morebits.status.init(e.target);

		Morebits.wiki.actionCompleted.redirect = fullUserTalkPageName;
		Morebits.wiki.actionCompleted.notice = 'Lời nhắn hồi âm đã hoàn thành; đang tải lại trang thảo luận trong vài giây';

		switch (input.tbtarget) {
			case 'notice':
				talkpage.setEditSummary(Talkback.noticeboards[input.noticeboard as string].editSummary);
				break;
			case 'mail':
				talkpage.setEditSummary("Thông báo: Bạn có thư");
				break;
			case 'see':
				input.page = Talkback.callbacks.normalizeTalkbackPage(input.page);
				talkpage.setEditSummary(
					'Vui lòng kiểm tra cuộc thảo luận tại [[:' + input.page + (input.section ? '#' + input.section : '') + ']]'
				);
				break;
			default:
				// talkback
				input.page = Talkback.callbacks.normalizeTalkbackPage(input.page);
				talkpage.setEditSummary('Lời nhắn hồi âm ([[:' + input.page + (input.section ? '#' + input.section : '') + ']])');
				break;
		}

		talkpage.setAppendText('\n\n' + Talkback.callbacks.getNoticeWikitext(input));
		talkpage.setChangeTags(Twinkle.changeTags);
		talkpage.setCreateOption('recreate');
		talkpage.setMinorEdit(getPref('markTalkbackAsMinor'));
		talkpage.setFollowRedirect(true);
		talkpage.append();
	}

	static callbacks = {
		// Not used for notice or mail, default to user page
		normalizeTalkbackPage: function (page) {
			page = page || mw.config.get('wgUserName');

			// Assume no prefix is a username, convert to user talk space
			var normal = mw.Title.newFromText(page, 3);
			// Normalize erroneous or likely mis-entered items
			if (normal) {
				// Only allow talks and WPspace, as well as Template-space for DYK
				if (normal.namespace !== 4 && normal.namespace !== 10) {
					normal = normal.getTalkPage();
				}
				page = normal.getPrefixedText();
			}
			return page;
		},

		preview: function (form) {
			var input = Morebits.quickForm.getInputData(form);

			if (input.tbtarget === 'talkback' || input.tbtarget === 'see') {
				input.page = Talkback.callbacks.normalizeTalkbackPage(input.page);
			}

			var noticetext = Talkback.callbacks.getNoticeWikitext(input);
			form.previewer.beginRender(noticetext, 'Thảo luận Thành viên:' + mw.config.get('wgRelevantUserName')); // Force wikitext/correct username
		},

		getNoticeWikitext: function (input) {
			var text;

			switch (input.tbtarget) {
				case 'notice':
					text = Morebits.string.safeReplace(Talkback.noticeboards[input.noticeboard].text, '$SECTION', input.section);
					break;
				case 'mail':
					text = '==' + getPref('mailHeading') + '==\n' + "{{Bạn có thư|subject=" + input.section + '|ts=~~~~~}}';

					if (input.message) {
						text += '\n' + input.message + '  ~~~~';
					} else if (getPref('insertTalkbackSignature')) {
						text += '\n~~~~';
					}
					break;
				case 'see':
					// clean talkback heading: strip section header markers that were erroneously suggested in the documentation
					var heading = getPref('talkbackHeading').replace(/^\s*=+\s*(.*?)\s*=+$\s*/, '$1');
					text =
						'{{subst:Please see|location=' +
						input.page +
						(input.section ? '#' + input.section : '') +
						'|more=' +
						input.message +
						'|heading=' +
						heading +
						'}}';
					break;
				default:
					// talkback
					// clean talkback heading: strip section header markers that were erroneously suggested in the documentation
					text =
						'==' +
						getPref('talkbackHeading').replace(/^\s*=+\s*(.*?)\s*=+$\s*/, '$1') +
						'==\n' +
						'{{talkback|' +
						input.page +
						(input.section ? '|' + input.section : '') +
						'|ts=~~~~~}}';

					if (input.message) {
						text += '\n' + input.message + ' ~~~~';
					} else if (getPref('insertTalkbackSignature')) {
						text += '\n~~~~';
					}
			}
			return text;
		},
	};
}