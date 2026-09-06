import { Api, makeOptoutLink, Page, Twinkle, TwinkleModule, getPref } from './core';
import { hatnoteRegex, makeFindSourcesDiv, optoutTemplates } from './common';

export class Prod extends TwinkleModule {
	moduleName = 'prod';
	static moduleName = 'prod';

	portletName = 'Đề nghị xóa';
	portletId = 'twinkle-prod';
	portletTooltip = 'Đề nghị xóa theo [[WP:PROD]]';

	constructor() {
		super();
		if (
			([0, 6, 108].indexOf(mw.config.get('wgNamespaceNumber')) === -1 &&
				(mw.config.get('wgNamespaceNumber') !== 2 ||
					(mw.config.get('wgCategories') || []).indexOf('Wikipedia books (user books)') === -1)) ||
			!mw.config.get('wgCurRevisionId') ||
			Morebits.isPageRedirect()
		) {
			return;
		}
		this.addMenu();
	}

	// initially set in evaluate(), and
	// modified in various callback functions
	params: {
		usertalk?: boolean;
		reason?: string;
		blp?: boolean;
		book?: boolean;
		initialContrib?: string;
		logInitialContrib?: string;
		creation?: string; // creation timestamp
		oldProdPresent?: boolean;
		logEndorsing?: boolean;
	} = {};

	// Used in edit summaries, for comparisons, etc.
	namespace: 'article' | 'file' | 'book' = 'article';

	defaultReason = getPref('prodReasonDefault');

	makeWindow() {
		switch (mw.config.get('wgNamespaceNumber')) {
			case 0:
				this.namespace = 'article';
				break;
			case 6:
				this.namespace = 'file';
				break;
			case 2:
			case 108:
				this.namespace = 'book';
				break;
			// no default
		}

		var Window = new Morebits.simpleWindow(800, 410);
		Window.setTitle('Đề nghị xóa (PROD)');
		Window.setScriptName('Twinkle');

		var form = new Morebits.quickForm(this.evaluate.bind(this));

		if (this.namespace === 'article') {
			Window.addFooterLink('Quy định đề nghị xóa', 'WP:PROD');
			Window.addFooterLink('Quy định đề nghị xóa tiểu sử người còn sống', 'WP:BLPPROD');
		} else if (this.namespace === 'file') {
			Window.addFooterLink('Quy định đề nghị xóa tập tin', 'WP:PROD');
		} else {
			// if book
			Window.addFooterLink('Quy định đề nghị xóa sách', 'WP:BOOKPROD');
		}

		var field = form.append({
			type: 'field',
			label: 'Dạng đề nghị xóa',
			id: 'prodtype_fieldset',
		});

		field.append({
			type: 'div',
			label: '', // Added later by Twinkle.makeFindSourcesDiv()
			id: 'twinkle-prod-findsources',
			style: 'margin-bottom: 5px; margin-top: -5px;',
		});

		field.append({
			type: 'radio',
			name: 'prodtype',
			event: this.prodtypechanged.bind(this),
			list: [
				{
					label: 'PROD (đề nghị xóa)',
					value: 'prod',
					checked: true,
					tooltip: 'Đề nghị xóa thông thường theo [[WP:PROD]]',
				},
				{
					label: 'BLP PROD (đề nghị xóa tiểu sử người còn sống không nguồn)',
					value: 'prodblp',
					tooltip: 'Đề nghị xóa tiểu sử mới tạo, hoàn toàn không có nguồn về người còn sống theo [[WP:BLPPROD]]',
				},
			],
		});

		// Placeholder fieldset to be replaced in Prod.prodtypechanged
		form.append({
			type: 'field',
			name: 'parameters',
		});

		Window.addFooterLink('Tùy chọn PROD', 'WP:TW/PREF#prod');
		Window.addFooterLink('Trợ giúp Twinkle', 'WP:TW/DOC#prod');
		Window.addFooterLink('Phản hồi', 'WT:TW');

		form.append({ type: 'submit', label: 'Đề nghị xóa' });

		var result = form.render();
		Window.setContent(result);
		Window.display();

		// Hide fieldset for File and Book PROD types since only normal PROD is allowed
		if (this.namespace !== 'article') {
			$(result).find('#prodtype_fieldset').hide();
		}

		// Fake a change event on the first prod type radio, to initialize the type-dependent controls
		var evt = document.createEvent('Event');
		evt.initEvent('change', true, true);
		result.prodtype[0].dispatchEvent(evt);
	}

	prodtypechanged(event: any) {
		// prepare frame for prod type dependant controls
		var field = new Morebits.quickForm.element({
			type: 'field',
			label: 'Các tham số',
			name: 'parameters',
		});
		// create prod type dependant controls
		switch (event.target.values) {
			case 'prod':
				field.append({
					type: 'checkbox',
					list: [
						{
							label: 'Thông báo cho người tạo trang nếu có thể',
							value: 'notify',
							name: 'notify',
							tooltip: 'Nếu chọn, một bản mẫu thông báo sẽ được đặt trên trang thảo luận của người tạo trang.',
							checked: true,
						},
					],
				});
				field.append({
					type: 'textarea',
					name: 'reason',
						label: 'Lý do đề nghị xóa:',
					value: this.defaultReason,
				});
				break;

			case 'prodblp':
				// first, remember the prod value that the user entered in the textarea, in case they want to switch back. We can abuse the config field for that.
				if (event.target.form.reason) {
					this.defaultReason = event.target.form.reason.value;
				}

				field.append({
					type: 'checkbox',
					list: [
						{
							label: 'Thông báo cho người tạo trang nếu có thể',
							value: 'notify',
							name: 'notify',
							tooltip: 'Bắt buộc phải thông báo cho người tạo bài viết.',
							checked: true,
							disabled: true,
						},
					],
				});
				// temp warning, can be removed down the line once BLPPROD is more established. Amalthea, May 2010.
				var boldtext = document.createElement('b');
				boldtext.appendChild(
					document.createTextNode(
						'Xin lưu ý rằng chỉ tiểu sử người còn sống không có nguồn mới đủ điều kiện dùng thẻ này, theo nghĩa hẹp.'
					)
				);
				field.append({
					type: 'div',
					label: boldtext,
				});
				break;

			default:
				break;
		}

		makeFindSourcesDiv('#twinkle-prod-findsources');

		event.target.form.replaceChild(field.render(), $(event.target.form).find('fieldset[name="parameters"]')[0]);
	}

	checkPriors() {
		var talk_title = new mw.Title(mw.config.get('wgPageName')).getTalkPage()!.getPrefixedText();
		// Talk page templates for PROD-able discussions
		var blocking_templates =
			'Template:Old XfD multi|Template:Old MfD|Template:Oldffdfull|' + // Common prior XfD talk page templates
			'Template:Oldpuffull|' + // Legacy prior XfD template
			'Template:Olddelrev|' + // Prior DRV template
			'Template:Old prod';
		var query = {
			action: 'query',
			titles: talk_title,
			prop: 'templates',
			tltemplates: blocking_templates,
			format: 'json',
		};

		var wikipedia_api = new Api('Kiểm tra trang thảo luận để tìm đề cử trước đó', query);
		return wikipedia_api.post().then((apiobj) => {
			var statelem = apiobj.getStatusElement();

			// Check talk page for templates indicating prior XfD or PROD
			var templates = apiobj.getResponse().query.pages[0].templates;
			var numTemplates = templates && templates.length;
			if (numTemplates) {
				var template = templates[0].title;
				if (numTemplates === 1 && template === 'Template:Old prod') {
					this.params.oldProdPresent = true; // Mark for reference later, when deciding if to endorse
					// if there are multiple templates, at least one of them would be a prior xfd template
				} else {
					statelem.warn('Đã tìm thấy bản mẫu XfD trước đó trên trang thảo luận, hủy quy trình');
					return $.Deferred().reject();
				}
			}
		});
	}

	fetchCreationInfo() {
		var params = this.params;
		var ts = new Page(mw.config.get('wgPageName'), 'Đang tìm người tạo trang');
		ts.setFollowRedirect(true); // for NPP, and also because redirects are ineligible for PROD
		ts.setLookupNonRedirectCreator(true); // Look for author of first non-redirect revision
		return ts.lookupCreation().then(() => {
			params.initialContrib = ts.getCreator();
			params.creation = ts.getCreationTimestamp();
			ts.getStatusElement().info('Đã tìm thấy người tạo: ' + params.initialContrib);
		});
	}

	taggingPage() {
		var def = $.Deferred();
		var params = this.params;

		var pageobj = new Page(mw.config.get('wgPageName'), 'Đang gắn thẻ trang');
		pageobj.setFollowRedirect(true); // for NPP, and also because redirects are ineligible for PROD
		return pageobj.load().then(() => {
			var statelem = pageobj.getStatusElement();

			if (!pageobj.exists()) {
				statelem.error('Có vẻ trang không tồn tại. Có lẽ trang đã bị xóa.');
				// reject, so that all dependent actions like notifyAuthor() and
				// addToLog() are cancelled
				return def.reject();
			}

			var text = pageobj.getPageText();

			// Check for already existing deletion tags
			var tag_re = /{{(?:db-?|delete|article for deletion\/dated|AfDM|ffd\b)|#invoke:Redirect for discussion/i;
			if (tag_re.test(text)) {
				statelem.warn('Trang đã có bản mẫu xóa, hủy quy trình');
				return def.reject();
			}

			// Remove tags that become superfluous with this action
			text = text.replace(
				/{{\s*(userspace draft|mtc|(copy|move) to wikimedia commons|(copy |move )?to ?commons)\s*(\|(?:{{[^{}]*}}|[^{}])*)?}}\s*/gi,
				''
			);
			var prod_re = /{{\s*(?:Prod blp|Proposed deletion|book-prod)\/dated(?: files)?\s*\|(?:{{[^{}]*}}|[^{}])*}}/i;
			var summaryText;

			if (!prod_re.test(text)) {
				// Page previously PROD-ed
				if (params.oldProdPresent) {
					if (params.blp) {
						if (
							!confirm('Đã tìm thấy đề cử PROD trước đó trên trang thảo luận. Bạn vẫn muốn tiếp tục áp dụng BLPPROD?')
						) {
							statelem.warn('Đã tìm thấy PROD trước đó trên trang thảo luận, người dùng đã hủy');
							return def.reject();
						}
						statelem.info('Đã tìm thấy PROD trước đó trên trang thảo luận, tiếp tục');
					} else {
						statelem.warn('Đã tìm thấy PROD trước đó trên trang thảo luận, hủy quy trình');
						return def.reject();
					}
				}

				// Alert if article is at least three days old, not in Category:Living people, and BLPPROD is selected
				if (params.blp) {
					var isMoreThan3DaysOld = new Morebits.date(params.creation || '')
						.add(3, 'days')
						.isAfter(new Date(pageobj.getLoadTime()));
					var blpcheck_re = /\[\[Category:Living people\]\]/i;
					if (!blpcheck_re.test(text) && isMoreThan3DaysOld) {
						if (
							!confirm(
								'Xin lưu ý bài viết không thuộc Thể loại:Người còn sống nên có thể không đủ điều kiện BLPPROD. Bạn có chắc muốn tiếp tục?\n\nBạn có thể thêm thể loại này nếu tiếp tục, trừ khi bài viết nói về người mới qua đời.'
							)
						) {
							return def.reject();
						}
					}
				}

				var tag;
				if (params.blp) {
					summaryText = 'Đề nghị xóa bài viết theo [[WP:BLPPROD]].';
					tag = '{{subst:prod blp' + (params.usertalk ? '|help=off' : '') + '}}';
				} else if (params.book) {
					summaryText = 'Đề nghị xóa sách theo [[WP:BOOKPROD]].';
					tag =
						'{{subst:book-prod|1=' +
							Morebits.string.formatReasonText(params.reason || '') +
						(params.usertalk ? '|help=off' : '') +
						'}}';
				} else {
					summaryText = 'Đề nghị xóa ' + (this.namespace === 'article' ? 'bài viết' : 'tập tin') + ' theo [[WP:PROD]].';
					tag =
						'{{subst:prod|1=' +
						Morebits.string.formatReasonText(params.reason || '') +
						(params.usertalk ? '|help=off' : '') +
						'}}';
				}

				// Insert tag after short description or any hatnotes
				var wikipage = new Morebits.wikitext.page(text);
				text = wikipage.insertAfterTemplates(tag + '\n', hatnoteRegex).getText();
			} else {
				// already tagged for PROD, so try endorsing it
				var prod2_re = /{{(?:Proposed deletion endorsed|prod-?2).*?}}/i;
				if (prod2_re.test(text)) {
					statelem.warn(
						'Trang đã có cả bản mẫu {{proposed deletion}} và {{proposed deletion endorsed}}, hủy quy trình'
					);
					return def.reject();
				}
				var confirmtext =
					'Đã tìm thấy thẻ {{proposed deletion}} trên trang này.\nBạn có muốn thêm thẻ {{proposed deletion endorsed}} kèm lý do của mình không?';
				if (params.blp && !/{{\s*Prod blp\/dated/.test(text)) {
					confirmtext =
						'Đã tìm thấy thẻ {{proposed deletion}} không phải BLP trên bài viết này.\nBạn có muốn thêm thẻ {{proposed deletion endorsed}} với lý do "bài viết là tiểu sử người còn sống không có nguồn" không?';
				}
				if (!confirm(confirmtext)) {
					statelem.warn('Đã hủy theo yêu cầu người dùng');
					return def.reject();
				}

				summaryText =
					'Xác nhận đề nghị xóa theo [[WP:' + (params.blp ? 'BLP' : params.book ? 'BOOK' : '') + 'PROD]].';
				text = text.replace(
					prod_re,
					text.match(prod_re) +
						'\n{{Proposed deletion endorsed|1=' +
						(params.blp
							? 'article is a [[WP:BLPPROD|biography of a living person with no sources]]'
							: Morebits.string.formatReasonText(params.reason || '')) +
						'}}\n'
				);

				params.logEndorsing = true;
			}

			// curate/patrol the page
			if (getPref('markProdPagesAsPatrolled')) {
				pageobj.triage();
			}

			pageobj.setPageText(text);
			pageobj.setEditSummary(summaryText);
			pageobj.setWatchlist(getPref('watchProdPages'));
			pageobj.setCreateOption('nocreate');
			return pageobj.save();
		});
	}

	addOldProd() {
		if (this.params.oldProdPresent) {
			return $.Deferred().resolve();
		}

		// Add {{Old prod}} to the talk page
		var oldprodfull = '{{Old prod|nom=' + mw.config.get('wgUserName') + '|nomdate={{subst:#time: Y-m-d}}}}\n';
		var talktitle = new mw.Title(mw.config.get('wgPageName')).getTalkPage()!.getPrefixedText();
		var talkpage = new Page(talktitle, 'Đặt {{Old prod}} trên trang thảo luận');
		talkpage.setPrependText(oldprodfull);
		talkpage.setEditSummary('Thêm {{Old prod}}');
		talkpage.setFollowRedirect(true); // match behavior for page tagging
		talkpage.setCreateOption('recreate');
		return talkpage.prepend();
	}

	notifyAuthor() {
		var def = $.Deferred();
		var params = this.params;

		if (!params.blp && !params.usertalk) {
			return def.resolve();
		}

		// Disallow warning yourself
		if (params.initialContrib === mw.config.get('wgUserName')) {
			Morebits.status.info(
				'Đang thông báo cho người tạo',
				'Bạn (' + params.initialContrib + ') đã tạo trang này; bỏ qua thông báo'
			);
			return def.resolve();
		}
		// [[Template:Proposed deletion notify]] supports File namespace
		var notifyTemplate;
		if (params.blp) {
			notifyTemplate = 'prodwarningBLP';
		} else if (params.book) {
			notifyTemplate = 'bprodwarning';
		} else {
			notifyTemplate = 'proposed deletion notify';
		}
		var notifytext =
			'\n{{subst:' + notifyTemplate + '|1=' + Morebits.pageNameNorm + '|concern=' + params.reason + '}} ~~~~';

		var user = new Morebits.wiki.user(
			params.initialContrib || '',
			'Đang thông báo cho người đóng góp đầu tiên (' + params.initialContrib + ')'
		);
		user.setMessage(notifytext);
		user.setReason('Thông báo: đề nghị xóa [[:' + Morebits.pageNameNorm + ']].');
		user.setChangeTags(Twinkle.changeTags);
		// Notify everyone for BLPPROD, allow optouts otherwise
		if (params.blp) {
			user.setNotifyBots(true);
			user.setNotifyIndef(true);
		} else {
			user.setNotifySkips(makeOptoutLink('prod'), optoutTemplates);
		}
		user.notify(function onNotifySuccess() {
			// add nomination to the userspace log, if the user has enabled it
			params.logInitialContrib = params.initialContrib;
			def.resolve();
		}, def.resolve); // resolves even if notification was unsuccessful

		return def;
	}

	addToLog() {
		if (!getPref('logProdPages')) {
			return $.Deferred().resolve();
		}
		var params = this.params;
		var usl = new Morebits.userspaceLogger(getPref('prodLogPageName'));
		usl.initialText =
			"Đây là nhật ký tất cả thẻ [[WP:PROD|đề nghị xóa]] được người dùng này gắn hoặc xác nhận bằng mô-đun PROD của [[WP:TW|Twinkle]].\n\n" +
			'Nếu không muốn giữ nhật ký này, bạn có thể tắt trong [[Wikipedia:Twinkle/Preferences|bảng tùy chọn]], rồi ' +
			'đề nghị xóa nhanh trang này theo [[WP:TCXN#TV1|TV1]].\n';

		var logText = '# [[:' + Morebits.pageNameNorm + ']]';
		var summaryText;
		// If a logged file is deleted but exists on commons, the wikilink will be blue, so provide a link to the log
		logText +=
			this.namespace === 'file'
				? ' ([{{fullurl:Special:Log|page=' + mw.util.wikiUrlencode(mw.config.get('wgPageName')) + '}} log]): '
				: ': ';
		if (params.logEndorsing) {
			logText += 'đã xác nhận ' + (params.blp ? 'BLP ' : params.book ? 'BOOK ' : '') + 'PROD. ~~~~~';
			if (params.reason) {
				logText += "\n#* '''Lý do''': " + params.reason + '\n';
			}
			summaryText = 'Ghi nhật ký xác nhận đề nghị xóa (PROD) [[:' + Morebits.pageNameNorm + ']].';
		} else {
			logText += (params.blp ? 'BLP ' : params.book ? 'BOOK' : '') + 'PROD';
			if (params.logInitialContrib) {
				logText += '; đã thông báo {{user|' + params.logInitialContrib + '}}';
			}
			logText += ' ~~~~~\n';
			if (!params.blp && params.reason) {
				logText += "#* '''Lý do''': " + Morebits.string.formatReasonForLog(params.reason) + '\n';
			}
			summaryText = 'Ghi nhật ký đề nghị xóa (PROD) [[:' + Morebits.pageNameNorm + ']].';
		}
		usl.changeTags = Twinkle.changeTags;

		return usl.log(logText, summaryText);
	}

	evaluate(e: any) {
		var form = e.target;
		var input = Morebits.quickForm.getInputData(form);

		this.params = {
			usertalk: (input.notify as boolean) || input.prodtype === 'prodblp',
			blp: input.prodtype === 'prodblp',
			book: this.namespace === 'book',
			reason: (input.reason as string) || '', // using an empty string here as fallback will help with prod-2.
		};

		if (!this.params.blp && !this.params.reason) {
			if (!confirm('Bạn đã để trống lý do. Bạn có thực sự muốn tiếp tục mà không cung cấp lý do không?')) {
				return;
			}
		}

		Morebits.simpleWindow.setButtonsEnabled(false);
		Morebits.status.init(form);

		var tm = new Morebits.taskManager(this);

		// Disable Morebits.wiki.numberOfActionsLeft system
		Morebits.wiki.numberOfActionsLeft = 1000;

		// checkPriors() and fetchCreationInfo() have no dependencies, they'll run first
		tm.add(this.checkPriors, []);
		tm.add(this.fetchCreationInfo, []);
		// tag the page once we're clear of the pre-requisites
		tm.add(this.taggingPage, [this.checkPriors]);
		// notify the author once we know who's the author, and also wait for the
		// taggingPage() as we don't need to notify if tagging was not done, such as
		// there was already a tag and the user chose not to endorse.
		tm.add(this.notifyAuthor, [this.fetchCreationInfo, this.taggingPage]);
		// oldProd needs to be added only if there wasn't one before, so need to wait
		// for checkPriors() to finish. Also don't add oldProd if tagging itself was
		// aborted or unsuccessful
		tm.add(this.addOldProd, [this.taggingPage, this.checkPriors]);
		// add to log only after notifying author so that the logging can be adjusted if
		// notification wasn't successful. Also, don't run if tagging was not done.
		tm.add(this.addToLog, [this.notifyAuthor, this.taggingPage]);
		// All set, go!
		tm.execute().then(() => {
			Morebits.status.actionCompleted('Gắn thẻ hoàn tất');
			setTimeout(() => {
				window.location.href = mw.util.getUrl(mw.config.get('wgPageName'));
			}, Morebits.wiki.actionCompleted.timeOut);
		});
	}
}