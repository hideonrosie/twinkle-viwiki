import { Twinkle } from '../twinkle';
import { makeArray, obj_entries } from '../utils';
import { Page } from '../Page';
import { Api } from '../Api';
import { Dialog } from '../Dialog';
import { Preference, getPref, Config } from '../Config';
import { TwinkleModule } from '../twinkleModule';

// TODO: still quite a bit of enwiki specific logic here

export interface criterion extends quickFormElementData {
	value: string; // made compulsory
	code: string;
	subgroup?: criteriaSubgroup | criteriaSubgroup[];

	showInNamespaces?: number[];
	hideInNamespaces?: number[];

	// These are booleans, but `true` is used instead of `boolean` because
	// when the value should be false, the prop should be omitted.
	redactContents?: true; // used for attack pages
	hideWhenMultiple?: true;
	hideWhenSingle?: true;
	hideWhenUser?: true;
	hideWhenSysop?: true;
	hideSubgroupWhenUser?: true;
	hideSubgroupWhenSingle?: true;
	hideSubgroupWhenMultiple?: true;
	hideSubgroupWhenSysop?: true;
	hideWhenRedirect?: true;
}

export interface criteriaSubgroup extends quickFormElementData {
	parameter?: string;
	utparam?: string;
	log?: string | null;
}

/**
 * Module for tagging pages for speedy deletion and for admins to delete pages.
 * Can also delete the talk page, delete redirects, and unlink backlinks while
 * deleting.
 */
export abstract class SpeedyCore extends TwinkleModule {
	static moduleName = 'CSD';

	dialog: Dialog;
	form: Morebits.quickForm;
	result: HTMLFormElement;
	hasCSD: boolean;
	flatObject: Record<string, criterion>;
	params: Record<string, any>;
	namespace: number;
	mode: { isSysop: boolean; isMultiple: boolean; isRadioClick: boolean };
	isRedirect: boolean;
	abstract criteriaLists: Array<{ label: string; visible: (self: SpeedyCore) => boolean; list: Array<criterion> }>;

	portletName = 'Xóa nhanh';
	portletId = 'twinkle-csd';
	portletTooltip = (Morebits.userIsSysop || Morebits.userIsInGroup('eliminator'))
		? 'Xóa nhanh trang này theo WP:XN'
		: 'Đề xuất xóa nhanh trang này theo WP:XN';
	windowTitle = 'Chọn tiêu chí xóa nhanh';

	constructor() {
		super();
		this.addMenu();
	}

	makeWindow() {
		this.dialog = new Dialog(getPref('speedyWindowWidth'), getPref('speedyWindowHeight'));
		this.dialog.setTitle(this.windowTitle);
		this.dialog.setFooterLinks(this.footerlinks);

		this.hasCSD = !!$('#delete-reason').length;
		this.makeFlatObject();

		let form = new Morebits.quickForm(
			(e) => this.evaluate(e),
			getPref('speedySelectionStyle') === 'radioClick' ? 'change' : null
		);
		this.form = form;

		if (Morebits.userIsSysop || Morebits.userIsInGroup('eliminator')) {
			form.append({
				type: 'checkbox',
				list: [
					{
						label: "Chỉ gán thẻ, không xóa",
						value: 'tag_only',
						name: 'tag_only',
						tooltip: 'Chỉ gán thẻ xóa nhanh, không xóa trang',
						checked: !(this.hasCSD || getPref('deleteSysopDefaultToDelete')),
						event: (event) => {
							let cForm = event.target.form;
							let cChecked = event.target.checked;
							// enable talk page checkbox
							if (cForm.deleteTalkPage) {
								cForm.deleteTalkPage.checked = !cChecked && getPref('deleteTalkPageOnDelete');
							}
							// enable redirects checkbox
							cForm.deleteRedirects.checked = !cChecked;
							// enable delete multiple
							cForm.delmultiple.checked = false;
							// enable notify checkbox
							cForm.notify.checked = cChecked;
							// enable deletion notification checkbox
							cForm.warnusertalk.checked = !cChecked && !this.hasCSD;
							// enable multiple
							cForm.multiple.checked = false;
							// enable requesting creation protection
							cForm.requestsalt.checked = false;

							this.modeChanged(cForm);

							event.stopPropagation();
						},
					},
				],
			});

			let deleteOptions = form.append({
				type: 'div',
				name: 'delete_options',
			});
			deleteOptions.append({
				type: 'header',
				label: 'Lựa chọn liên quan đến xóa',
			});
			if (
				mw.config.get('wgNamespaceNumber') % 2 === 0 &&
				(mw.config.get('wgNamespaceNumber') !== 2 || /\//.test(mw.config.get('wgTitle')))
			) {
				// hide option for user pages, to avoid accidentally deleting user talk page
				deleteOptions.append({
					type: 'checkbox',
					list: [
						{
							label: 'Xóa cả trang thảo luận',
							value: 'deleteTalkPage',
							name: 'deleteTalkPage',
							tooltip:
								"Xóa thêm trang thảo luận. Lựa chọn này sẽ bị bỏ qua nếu bạn chọn tiêu chí TT8 (đã chuyển sang Wikimedia Commons).",
							checked: getPref('deleteTalkPageOnDelete'),
							event: (event) => event.stopPropagation(),
						},
					],
				});
			}
			deleteOptions.append({
				type: 'checkbox',
				list: [
					{
						label: 'Xóa tất cả trang đổi hướng',
						value: 'deleteRedirects',
						name: 'deleteRedirects',
						tooltip:
							'Xóa thêm các trang đổi hướng đến trang này. Tránh sử dụng tùy chọn này khi xóa trang theo quy trình (ví dụ: xóa trang do di chuyển/hợp nhất).',
						checked: getPref('deleteRedirectsOnDelete'),
						event: (event) => event.stopPropagation(),
					},
					{
						label: 'Xóa với nhiều tiêu chí',
						value: 'delmultiple',
						name: 'delmultiple',
						tooltip:
							'When selected, you can select several criteria that apply to the page. For example, G11 and A7 are a common combination for articles.',
						event: (event) => {
							this.modeChanged(event.target.form);
							event.stopPropagation();
						},
					},
					{
						label: 'Thông báo cho người tạo trang',
						value: 'warnusertalk',
						name: 'warnusertalk',
						tooltip:
							'Một bản mẫu thông báo sẽ được đặt trên trang thảo luận của người tạo, NẾU bạn đã bật thông báo trong tùy chọn Twinkle ' +
							'cho tiêu chí bạn chọn VÀ mục này được chọn. Người tạo cũng có thể được chào mừng.',
						checked: !this.hasCSD,
						event: (event) => event.stopPropagation(),
					},
				],
			});
		}

		let tagOptions = form.append({
			type: 'div',
			name: 'tag_options',
		});

		if (Morebits.userIsSysop || Morebits.userIsInGroup('eliminator')) {
			tagOptions.append({
				type: 'header',
				label: 'Tùy chọn gán thẻ trang',
			});
		}

		tagOptions.append({
			type: 'checkbox',
			list: [
				{
					label: 'Thông báo cho người tạo trang nếu có thể',
					value: 'notify',
					name: 'notify',
					tooltip:
						'Thông báo sẽ được gửi đến người tạo trang nếu bạn kích hoạt chức năng này',
					checked: !(Morebits.userIsSysop || Morebits.userIsInGroup('eliminator')) || !(this.hasCSD || getPref('deleteSysopDefaultToDelete')),
					event: (event) => event.stopPropagation(),
				},
				{
					label: 'Đánh dấu để yêu cầu khóa khởi tạo trang',
					value: 'requestsalt',
					name: 'requestsalt',
					tooltip:
						'Khi được chọn, thẻ xóa nhanh sẽ được kèm theo một thẻ {{salt}} yêu cầu bảo quản viên hoặc điều phối viên áp dụng khóa khởi tạo trang. Chỉ chọn nếu trang này đã được tạo lại nhiều lần.',
					event: (event) => event.stopPropagation(),
				},
				{
					label: 'Đánh dấu với nhiều tiêu chí',
					value: 'multiple',
					name: 'multiple',
					tooltip:
						'Khi được chọn, bạn có thể chọn nhiều tiêu chí áp dụng cho trang. ',
					event: (event) => {
						this.modeChanged(event.target.form);
						event.stopPropagation();
					},
				},
			],
		});

		form.append({
			type: 'div',
			id: 'prior-deletion-count',
			style: 'font-style: italic',
		});

		form.append({
			type: 'div',
			name: 'work_area',
			label: 'Lỗi khởi tạo mô đun xóa trang. Hãy thử lại hoặc báo cáo với nhà phát triển.',
		});

		if (getPref('speedySelectionStyle') !== 'radioClick') {
			form.append({ type: 'submit', className: 'tw-speedy-submit' }); // Renamed in modeChanged
		}

		this.result = form.render();
		this.dialog.setContent(this.result);
		this.dialog.display();

		this.modeChanged(this.result);

		// Check for prior deletions.  Just once, upon init
		this.priorDeletionCount();
	}

	priorDeletionCount() {
		let query = {
			action: 'query',
			format: 'json',
			list: 'logevents',
			letype: 'delete',
			leaction: 'delete/delete', // Just pure page deletion, no redirect overwrites or revdel
			letitle: mw.config.get('wgPageName'),
			leprop: '', // We're just counting we don't actually care about the entries
			lelimit: 5, // A little bit goes a long way
		};

		new Api('Kiểm tra các lần xóa trước', query).post().then((apiobj) => {
			let response = apiobj.getResponse();
			let delCount = response.query.logevents.length;
			if (delCount) {
				let message = 'Trang này đã từng bị xóa ' + delCount + ' lần trước đó';
				if (delCount > 1) {
					message += 's';
					if (response.continue) {
						message = 'Hơn ' + message;
					}

					// 3+ seems problematic
					if (delCount >= 3) {
						$('#prior-deletion-count').css('color', 'red');
					}
				}

				// Provide a link to page logs (CSD templates have one for sysops)
				let link = Morebits.htmlNode('a', '(xem nhật trình)');
				link.setAttribute('href', mw.util.getUrl('Special:Log', { page: mw.config.get('wgPageName') }));
				link.setAttribute('target', '_blank');

				$('#prior-deletion-count').text(message + ' '); // Space before log link
				$('#prior-deletion-count').append(link);
			}
		});
	}

	getMode() {
		let form = this.result;
		return (this.mode = {
			isSysop: !!form.tag_only && !form.tag_only.checked,
			isMultiple: form.tag_only && !form.tag_only.checked ? form.delmultiple.checked : form.multiple.checked,
			isRadioClick: getPref('speedySelectionStyle') === 'radioClick',
		});
	}

	modeChanged(form: HTMLFormElement) {
		// first figure out what mode we're in
		this.getMode();

		$('[name=delete_options]').toggle(this.mode.isSysop);
		$('[name=tag_options]').toggle(!this.mode.isSysop);
		$('button.tw-speedy-submit').text(this.mode.isSysop ? 'Xóa trang' : 'Gán thẻ trang');

		let work_area = new Morebits.quickForm.element({
			type: 'div',
			name: 'work_area',
		});

		if (this.mode.isMultiple && this.mode.isRadioClick) {
			work_area.append({
				type: 'div',
				label: 'Khi chọn xong tiêu chí, nhấn:',
			});
			work_area.append({
				type: 'button',
				name: 'submit-multiple',
				label: this.mode.isSysop ? 'Xóa trang' : 'Gán thẻ trang',
				event: (event) => {
					this.evaluate(event);
					event.stopPropagation();
				},
			});
		}

		this.appendCriteriaLists(work_area);

		$(form).find('[name=work_area]').replaceWith(work_area.render());

		// if sysop, check if CSD is already on the page and fill in custom rationale
		if (this.mode.isSysop && this.hasCSD) {
			let customOption = $('input[name=csd][value=reason]')[0];
			if (customOption) {
				if (getPref('speedySelectionStyle') !== 'radioClick') {
					// force listeners to re-init
					customOption.click();
				}
				let deleteReason = decodeURIComponent($('#delete-reason').text()).replace(/\+/g, ' ');
				$('input[name="csd.reason_1"]').val(deleteReason);
			}
		}
	}

	appendCriteriaLists(work_area: Morebits.quickForm.element) {
		this.namespace = mw.config.get('wgNamespaceNumber');
		this.isRedirect = Morebits.isPageRedirect();

		let inputType = (this.mode.isMultiple ? 'checkbox' : 'radio') as 'radio' | 'checkbox';

		this.criteriaLists.forEach((criteriaList) => {
			if (criteriaList.visible(this)) {
				work_area.append({ type: 'header', label: criteriaList.label });
				work_area.append({ type: inputType, name: 'csd', list: this.generateCsdList(criteriaList.list) });
			}
		});
	}

	generateCsdList(list: Array<criterion>) {
		let mode = this.mode;
		let openSubgroupHandler = (e) => {
			$(e.target.form).find('input').prop('disabled', true);
			$(e.target.form).children().css('color', 'gray');
			$(e.target).parent().css('color', 'black').find('input').prop('disabled', false);
			$(e.target).parent().find('input:text')[0].focus();
			e.stopPropagation();
		};
		let submitSubgroupHandler = (e) => {
			let evaluateType = mode.isSysop ? 'evaluateSysop' : 'evaluateUser';
			this[evaluateType](e);
			e.stopPropagation();
		};

		return list
			.map((critElement) => {
				let criterion = $.extend({}, critElement);

				if (mode.isMultiple) {
					if (criterion.hideWhenMultiple) {
						return null;
					}
					if (criterion.hideSubgroupWhenMultiple) {
						criterion.subgroup = null;
					}
				} else {
					if (criterion.hideWhenSingle) {
						return null;
					}
					if (criterion.hideSubgroupWhenSingle) {
						criterion.subgroup = null;
					}
				}

				if (mode.isSysop) {
					if (criterion.hideWhenSysop) {
						return null;
					}
					if (criterion.hideSubgroupWhenSysop) {
						criterion.subgroup = null;
					}
				} else {
					if (criterion.hideWhenUser) {
						return null;
					}
					if (criterion.hideSubgroupWhenUser) {
						criterion.subgroup = null;
					}
				}

				if (Morebits.isPageRedirect() && criterion.hideWhenRedirect) {
					return null;
				}

				if (criterion.showInNamespaces && criterion.showInNamespaces.indexOf(this.namespace) < 0) {
					return null;
				}
				if (criterion.hideInNamespaces && criterion.hideInNamespaces.indexOf(this.namespace) > -1) {
					return null;
				}

				if (criterion.subgroup && !mode.isMultiple && mode.isRadioClick) {
					criterion.subgroup = makeArray(criterion.subgroup).concat({
						type: 'button',
						name: 'submit', // ends up being called "csd.submit" so this is OK
						label: mode.isSysop ? 'Xóa trang' : 'Gán thẻ trang',
						event: submitSubgroupHandler,
					});
					// FIXME: does this do anything?
					criterion.event = openSubgroupHandler;
				}

				return criterion;
			})
			.filter((e) => e); // don't include items that have been made null
	}

	makeFlatObject() {
		this.flatObject = {};
		this.criteriaLists.forEach((criteria) => {
			criteria.list.forEach((criterion) => {
				this.flatObject[criterion.value] = criterion;
			});
		});
	}

	// UI creation ends here!

	evaluate(e: QuickFormEvent | FormSubmitEvent) {
		if (e.target.type === 'checkbox' || e.target.type === 'text' || e.target.type === 'select') {
			return;
		}
		this.params = Morebits.quickForm.getInputData(this.result);
		if (!this.params.csd || !this.params.csd.length) {
			return alert('Please select a criterion!');
		}
		this.preprocessParams();
		let validationMessage = this.validateInputs();
		if (validationMessage) {
			return alert(validationMessage);
		}

		Morebits.simpleWindow.setButtonsEnabled(false);
		Morebits.status.init(this.result);

		let tm = new Morebits.taskManager(this);
		tm.add(this.fetchCreatorInfo, []);
		if (this.mode.isSysop) {
			// Sysop mode deletion
			tm.add(this.parseDeletionReason, []);
			tm.add(this.deletePage, [this.parseDeletionReason]);
			tm.add(this.deleteTalk, [this.deletePage]);
			tm.add(this.deleteRedirects, [this.deletePage]);
			tm.add(this.noteToCreator, [this.deletePage, this.fetchCreatorInfo]);
		} else {
			// Tagging
			tm.add(this.checkPage, []);
			tm.add(this.tagPage, [this.checkPage]); // checkPage passes pageobj to tagPage
			tm.add(this.patrolPage, [this.checkPage]);
			tm.add(this.noteToCreator, [this.checkPage, this.fetchCreatorInfo]);
			tm.add(this.addToLog, [this.noteToCreator]);
		}

		tm.execute().then(() => {
			Morebits.status.actionCompleted(this.mode.isSysop ? 'Đã xóa trang' : 'Đã gán thẻ trang');
			setTimeout(() => {
				window.location.href = mw.util.getUrl(Morebits.pageNameNorm);
			}, 50000);
		});
	}

	preprocessParams() {
		let params = this.params;
		params.csd = makeArray(params.csd);
		params.normalizeds = params.csd.map((critValue) => {
			return this.flatObject[critValue].code;
		});
		this.getTemplateParameters();
		this.getMode(); // likely not needed

		if (this.mode.isSysop) {
			params.promptForSummary = params.normalizeds.some((norm) => {
				return getPref('promptForSpeedyDeletionSummary').indexOf(norm) !== -1;
			});
			params.warnUser =
				params.warnusertalk &&
				params.normalizeds.some((norm, index) => {
					return (
						getPref('warnUserOnSpeedyDelete').indexOf(norm) !== -1 &&
						!(norm === 'g6' && params.values[index] !== 'copypaste')
					);
				});
		} else {
			params.notifyUser =
				params.notify &&
				params.normalizeds.some(function (norm, index) {
					return (
						getPref('notifyUserOnSpeedyDeletionNomination').indexOf(norm) !== -1 &&
						!(norm === 'g6' && params.csd[index] !== 'copypaste')
					);
				});
			params.redactContents = params.csd.some((csd) => {
				return this.flatObject[csd].redactContents;
			});
		}
		params.watch = params.normalizeds.some(function (norm) {
			return getPref('watchSpeedyPages').indexOf(norm) !== -1 && getPref('watchSpeedyExpiry');
		});
		params.welcomeuser =
			(params.notifyUser || params.warnUser) &&
			params.normalizeds.some((norm) => {
				return getPref('welcomeUserOnSpeedyDeletionNotification').indexOf(norm) !== -1;
			});

		this.preprocessParamInputs();
	}

	preprocessParamInputs() { }

	/**
	 * Creates this.params.templateParams, an array of objects each object
	 * representing the template parameters for a criterion.
	 */
	getTemplateParameters() {
		this.params.templateParams = new Array(this.params.csd.length) as Array<Record<string, string>>;

		this.params.csd.forEach((value, idx) => {
			let crit = this.flatObject[value];
			let params: Record<string, string> = {};
			makeArray(crit.subgroup).forEach((subgroup) => {
				if (subgroup.parameter && this.params[subgroup.name]) {
					params[subgroup.parameter] = this.params[subgroup.name];
				}
			});
			this.params.templateParams[idx] = params;
		});
	}

	/**
	 * Gets wikitext of the tag to be added to the page being nominated.
	 * @returns {string}
	 */
	getTaggingCode() {
		let params = this.params;
		let code = '';

		if (params.normalizeds.length > 1) {
			code = '{{db-multiple';
			params.normalizeds.forEach((norm, idx) => {
				code += '|' + norm.toUpperCase();
				obj_entries(params.templateParams[idx]).forEach(([param, value]) => {
					// skip numeric parameters - {{db-multiple}} doesn't understand them
					if (!parseInt(param, 10)) {
						code += '|' + param + '=' + value;
					}
				});
			});
			code += '}}';
		} else {
			code = '{{db-' + params.csd[0];
			obj_entries(params.templateParams[0]).forEach(([param, value]) => {
				code += '|' + param + '=' + value;
			});
			if (params.notifyUser) {
				code += '|help=off';
			}
			code += '}}';
		}

		return code;
	}

	/**
	 * Creates this.params.utparams, object of parameters for the user notification
	 * template
	 */
	getUserTalkParameters() {
		let utparams: Record<string, string> = {};
		this.params.csd.forEach((csd) => {
			let subgroups = makeArray(this.flatObject[csd].subgroup);
			subgroups.forEach((subgroup, idx) => {
				if (subgroup.utparam && this.params[subgroup.name]) {
					// For {{db-csd-notice-custom}} (single criterion selected)
					utparams['key' + (idx + 1)] = subgroup.utparam;
					utparams['value' + (idx + 1)] = this.params[subgroup.name];
					// For {{db-notice-multiple}} (multiple criterion selected)
					utparams[subgroup.utparam] = this.params[subgroup.name];
				}
			});
		});
		this.params.utparams = utparams;
	}

	getUserNotificationText() {
		let params = this.params;
		let notifytext = '';
		// special cases: "db" and "db-multiple"
		if (params.normalizeds.length > 1) {
			notifytext = '\n{{subst:db-' + (params.warnUser ? 'deleted' : 'notice') + '-multiple|1=' + Morebits.pageNameNorm;
			params.normalizeds.forEach(function (norm, idx) {
				notifytext += '|' + (idx + 2) + '=' + norm.toUpperCase();
			});
		} else if (params.normalizeds[0] === 'db') {
			notifytext = '\n{{subst:db-reason-' + (params.warnUser ? 'deleted' : 'notice') + '|1=' + Morebits.pageNameNorm;
		} else {
			notifytext = '\n{{subst:db-csd-' + (params.warnUser ? 'deleted' : 'notice') + '-custom|1=';
			// Get rid of this by tweaking the template!
			if (params.csd[0] === 'copypaste') {
				notifytext += params.templateParams[0].sourcepage;
			} else {
				notifytext += Morebits.pageNameNorm;
			}
			notifytext += '|2=' + params.csd[0];
		}

		this.getUserTalkParameters();
		obj_entries(params.utparams).forEach(([key, value]) => {
			notifytext += '|' + key + '=' + value;
		});
		notifytext += (params.welcomeuser ? '' : '|nowelcome=yes') + '}} ~~~~';
		return notifytext;
	}

	fetchCreatorInfo() {
		// No user notification being made, no need to fetch creator
		if (!this.params.notifyUser && !this.params.warnUser) {
			return $.Deferred().resolve();
		}
		let thispage = new Page(Morebits.pageNameNorm, 'Truy xuất thông tin người khởi tạo');
		return thispage.lookupCreation().then(() => {
			this.params.initialContrib = thispage.getCreator();
			thispage.getStatusElement().info('Đã tìm thấy ' + thispage.getCreator());
		});
	}

	patrolPage() {
		if (getPref('markSpeedyPagesAsPatrolled')) {
			new Page(Morebits.pageNameNorm).triage();
		}
		return $.Deferred().resolve();
	}

	checkPage() {
		let pageobj = new Page(mw.config.get('wgPageName'), 'Đang gắn thẻ trang');
		pageobj.setChangeTags(Twinkle.changeTags);
		return pageobj.load().then(() => {
			let statelem = pageobj.getStatusElement();

			if (!pageobj.exists()) {
				statelem.error("Trang không tồn tại, có vẻ nó đã bị xóa");
				return $.Deferred().reject();
			}

			let text = pageobj.getPageText();

			statelem.status('Kiểm tra các thẻ trên trang...');

			// check for existing speedy deletion tags
			let tag = /(?:\{\{\s*(db|delete|db-.*?|speedy deletion-.*?)(?:\s*\||\s*\}\}))/.exec(text);
			// This won't make use of the db-multiple template but it probably should
			if (
				tag &&
				!confirm(
					'Trang này đã có thẻ xóa nhanh {{' +
					tag[1] +
					'}}. Bạn có muốn thêm một thẻ xóa nhanh khác?'
				)
			) {
				return $.Deferred().reject();
			}

			// check for existing XFD tags
			let xfd =
				/\{\{((?:article for deletion|proposed deletion|prod blp|template for discussion)\/dated|[cfm]fd\b)/i.exec(
					text
				) || /#invoke:(RfD)/.exec(text);
			if (
				xfd &&
				!confirm(
					'Trang này đã có một thẻ xóa {{' +
					xfd[1] +
					'}}. Bạn có muốn thêm thẻ xóa nhanh?'
				)
			) {
				return $.Deferred().reject();
			}

			return pageobj;
		});
	}

	tagPage(pageobj: Page) {
		let params = this.params;
		let text = pageobj.getPageText();
		let code = this.getTaggingCode();

		// Set the correct value for |ts= parameter in {{db-g13}}
		if (params.normalizeds.indexOf('g13') !== -1) {
			code = code.replace('$TIMESTAMP', pageobj.getLastEditTime());
		}
		if (params.requestsalt) {
			code = '{{salt}}\n' + code;
		}

		// Post on talk if it is not possible to tag
		if (
			!pageobj.canEdit() ||
			['wikitext', 'Scribunto', 'javascript', 'css', 'sanitized-css'].indexOf(pageobj.getContentModel()) === -1
		) {
			// Attempt to place on talk page
			let talkName = new mw.Title(pageobj.getPageName()).getTalkPage().toText();

			if (talkName === pageobj.getPageName()) {
				pageobj.getStatusElement().error('Trang đã bị khóa và không có nơi nào để thêm yêu cầu sửa đổi, đang hủy');
				return $.Deferred().reject();
			}

			pageobj.getStatusElement().warn('Không thể sửa trang, đang chuyển sang trang thảo luận');

			let talk_page = new Page(talkName, 'Đang gắn thẻ trang thảo luận');
			talk_page.setNewSectionTitle(pageobj.getPageName() + ' nominated for CSD, request deletion');
			talk_page.setNewSectionText(
				code + '\n\nKhông thể gắn thẻ trang ' + pageobj.getPageName() + ', xin hãy xóa nó. ~~~~'
			);
			talk_page.setCreateOption('recreate');
			talk_page.setFollowRedirect(true);
			talk_page.setWatchlist(params.watch);
			talk_page.setChangeTags(Twinkle.changeTags);
			return talk_page.newSection();
		}

		// Remove tags that become superfluous with this action
		text = text.replace(/\{\{\s*([Uu]serspace draft)\s*(\|(?:\{\{[^{}]*\}\}|[^{}])*)?\}\}\s*/g, '');
		if (mw.config.get('wgNamespaceNumber') === 6) {
			// remove "move to Commons" tag - deletion-tagged files cannot be moved to Commons
			text = text.replace(
				/\{\{(mtc|(copy |move )?to ?commons|move to wikimedia commons|copy to wikimedia commons)[^}]*\}\}/gi,
				''
			);
		}

		// Wrap SD template in noinclude tags if we are in template space.
		// Won't work with userboxes in userspace, or any other transcluded page outside template space
		if (mw.config.get('wgNamespaceNumber') === 10) {
			// Template:
			code = '<noinclude>' + code + '</noinclude>';
		}

		if (mw.config.get('wgPageContentModel') === 'Scribunto') {
			// Scribunto isn't parsed like wikitext, so CSD templates on modules need special handling to work
			let equals = '';
			while (code.indexOf(']' + equals + ']') !== -1) {
				equals += '=';
			}
			code = "require('Module:Module wikitext')._addText([" + equals + '[' + code + ']' + equals + ']);';
		} else if (['javascript', 'css', 'sanitized-css'].indexOf(mw.config.get('wgPageContentModel')) !== -1) {
			// Likewise for JS/CSS pages
			code = '/* ' + code + ' */';
		}

		// Generate edit summary for edit
		let editsummary;
		if (params.normalizeds[0] === 'db') {
			editsummary = 'Yêu cầu [[WP:XN|xóa nhanh]] với lý do "' + params.templateParams[0]['1'] + '".';
		} else {
			let criteriaText = params.normalizeds
				.map((norm) => {
					return '[[WP:XN#' + norm.toUpperCase() + '|XN ' + norm.toUpperCase() + ']]';
				})
				.join(', ');
			editsummary = 'Yêu cầu [[WP:XN|xóa nhanh]] (' + criteriaText + ').';
		}

		// Blank attack pages
		if (params.redactContents) {
			text = code;
		} else {
			text = this.insertTagText(code, text);
		}

		pageobj.setPageText(text);
		pageobj.setEditSummary(editsummary);
		pageobj.setWatchlist(params.watch);
		return pageobj.save();
	}

	/**
	 * Insert tag text on to the page.
	 * If they need to go at a location other than the very top of the page,
	 * override this function.
	 * @param code
	 * @param pageText
	 */
	insertTagText(code, pageText) {
		return code + '\n' + pageText;
	}

	noteToCreator() {
		let params = this.params;
		let initialContrib = params.initialContrib;

		// User notification not chosen
		if (!initialContrib) {
			return $.Deferred().resolve();

			// disallow notifying yourself
		} else if (initialContrib === mw.config.get('wgUserName')) {
			Morebits.status.warn('Ghi chú', 'Bạn (' + initialContrib + ') là người tạo trang, bỏ qua thông báo');
			initialContrib = null;

			// don't notify users when their user talk page is nominated/deleted
		} else if (initialContrib === mw.config.get('wgTitle') && mw.config.get('wgNamespaceNumber') === 3) {
			Morebits.status.warn(
				'Ghi chú',
				'Người tạo là người tạo trang của chính họ, bỏ qua thông báo'
			);
			initialContrib = null;

			// quick hack to prevent excessive unwanted notifications, per request. Should actually be configurable on recipient page...
		} else if (initialContrib === 'SongVĩ.Bot' && params.normalizeds[0] === 'f2') {
			Morebits.status.warn(
				'Ghi chú',
				'Người tạo là bot, bỏ qua thông báo'
			);
			initialContrib = null;

			// Check for already existing tags
		} else if (
			this.hasCSD &&
			params.warnUser &&
			!confirm(
				'Trang này đã có bản mẫu xóa được đặt trước đó, và nhiều khả năng thành viên tạo ra trang này đã được thông báo. Bạn có chắc muốn tiếp tục thông báo cho thành viên này?'
			)
		) {
			Morebits.status.info('Thông báo cho người tạo đầu tiên', 'người dùng đã hủy, đang bỏ qua.');
			initialContrib = null;
		}

		if (!initialContrib) {
			params.initialContrib = null;
			return $.Deferred().resolve();
		}

		let usertalkpage = new Page(
			'Thảo luận Thành viên:' + initialContrib,
			'Đang thông báo cho người khởi tạo đầu tiên (' + initialContrib + ')'
		);

		let editsummary = 'Thông báo: ' + (params.warnUser ? 'Đã xóa nhanh' : 'Đề nghị xóa nhanh');
		if (!params.redactContents) {
			// no article name in summary for attack page taggings
			editsummary += '[[:' + Morebits.pageNameNorm + ']].';
		} else {
			editsummary += 'trang tấn công.';
		}

		usertalkpage.setAppendText(this.getUserNotificationText());
		usertalkpage.setEditSummary(editsummary);
		usertalkpage.setChangeTags(Twinkle.changeTags);
		usertalkpage.setCreateOption('recreate');
		usertalkpage.setFollowRedirect(true, false);
		return usertalkpage.append();
	}

	parseWikitext(wikitext): JQuery.Promise<string> {
		let statusIndicator = new Morebits.status('Đang xây dựng tóm lược xóa');
		let api = new Api('Phân tích cú pháp bản mẫu xóa', {
			action: 'parse',
			prop: 'text',
			pst: 'true',
			text: wikitext,
			contentmodel: 'wikitext',
			title: mw.config.get('wgPageName'),
			disablelimitreport: true,
			format: 'json',
		});
		api.setStatusElement(statusIndicator);
		return api.post().then((apiobj) => {
			let reason = decodeURIComponent($(apiobj.getResponse().parse.text).find('#delete-reason').text()).replace(
				/\+/g,
				' '
			);
			if (!reason) {
				statusIndicator.warn('Không thể tạo tóm lược xóa từ bản mẫu xóa');
			} else {
				statusIndicator.info('Đã hoàn tất');
			}
			return reason;
		});
	}

	parseDeletionReason() {
		let params = this.params;
		if (!params.normalizeds.length && params.normalizeds[0] === 'db') {
			params.deleteReason = prompt(
				'Nhập lý do xóa để ghi vào nhật trình xóa:',
				''
			);
			return $.Deferred().resolve();
		} else {
			let code = this.getTaggingCode();
			return this.parseWikitext(code).then((reason) => {
				if (params.promptForSummary) {
					reason = prompt(
						'Nhập lý do xóa để ghi vào nhật trình xóa, hoặc nhấn OK để sử dụng lý do được tạo tự động.',
						reason
					);
				}
				params.deleteReason = reason;
			});
		}
	}

	deletePage() {
		let params = this.params;

		let thispage = new Page(mw.config.get('wgPageName'), 'Xóa trang');

		if (params.deleteReason === null) {
			Morebits.status.error('Đang hỏi lý do', 'Người dùng đã hủy');
			return $.Deferred().reject();
		} else if (!params.deleteReason || !params.deleteReason.trim()) {
			Morebits.status.error(
				'Đang hỏi lý do',
				"Bạn chưa cung cấp lý do. Tôi không biết... với những hành động thờ ơ của quản trị viên... Tôi bỏ cuộc..."
			);
			return $.Deferred().reject();
		}

		thispage.setEditSummary(params.deleteReason);
		thispage.setChangeTags(Twinkle.changeTags);
		thispage.setWatchlist(params.watch);
		return thispage.deletePage().then(() => {
			thispage.getStatusElement().info('done');
		});
	}

	deleteTalk() {
		let params = this.params;
		if (params.deleteTalkPage && document.getElementById('ca-talk').className !== 'new') {
			let talkpage = new Page(new mw.Title(Morebits.pageNameNorm).getTalkPage().toText(), 'Xóa trang thảo luận');
			talkpage.setEditSummary('[[WP:XN#C8|C8]]: Trang thảo luận của trang đã xóa "' + Morebits.pageNameNorm + '"');
			talkpage.setChangeTags(Twinkle.changeTags);
			return talkpage.deletePage().then(() => {
				talkpage.getStatusElement().info('Đã hoàn tất');
			});
		} else {
			return $.Deferred().resolve();
		}
	}

	deleteRedirects() {
		let def = $.Deferred();
		let params = this.params;
		if (params.deleteRedirects) {
			let wikipedia_api = new Api('getting list of redirects...', {
				action: 'query',
				titles: mw.config.get('wgPageName'),
				prop: 'redirects',
				rdlimit: 'max', // 500 is max for normal users, 5000 for bots and sysops
				format: 'json',
			});
			wikipedia_api.setStatusElement(new Morebits.status('Đang xóa trang đổi hướng'));
			wikipedia_api.post().then((apiobj) => {
				let response = apiobj.getResponse();

				let snapshot = response.query.pages[0].redirects || [];
				let total = snapshot.length;
				let statusIndicator = apiobj.getStatusElement();

				if (!total) {
					statusIndicator.status('Không tìm thấy trang đổi hướng');
					return;
				}

				statusIndicator.status('0%');

				let current = 0;
				let onsuccess = function (apiobjInner: Api) {
					let now = Math.round((100 * ++current) / total) + '%';
					statusIndicator.update(now);
					apiobjInner.getStatusElement().unlink();
					if (current >= total) {
						statusIndicator.info(now + ' (hoàn tất)');
						def.resolve();
						Morebits.wiki.removeCheckpoint();
					}
				};

				Morebits.wiki.addCheckpoint();

				snapshot.forEach(function (value) {
					let title = value.title;
					let page = new Page(title, 'Đang xóa trang đổi hướng "' + title + '"');
					page.setEditSummary('[[WP:XN#C8|C8]]: [[Wikipedia:Trang đổi hướng|Trang đổi hướng]] đến trang đã bị xóa "' + Morebits.pageNameNorm + '"');
					page.setChangeTags(Twinkle.changeTags);
					page.deletePage().then(onsuccess);
				});
			});
		} else {
			def.resolve();
		}

		// promote Unlink tool
		let $link, $bigtext;
		let isFile = mw.config.get('wgNamespaceNumber') === 6;
		$link = $('<a>', {
			href: '#',
			text: 'Nhấn vào đây để sử dụng công cụ gỡ liên kết',
			css: { fontSize: '130%', fontWeight: 'bold' },
			click: () => {
				Morebits.wiki.actionCompleted.redirect = null;
				this.dialog.close();
				// XXX
				Twinkle.unlink.makeWindow(
					isFile
						? 'Xóa/ẩn sử dụng tập tin đã bị xóa khỏi các trang ' + Morebits.pageNameNorm
						: 'Xóa liên kết đến trang bị xóa khỏi các trang ' + Morebits.pageNameNorm
				);
			},
		});
		$bigtext = $('<span>', {
			text: isFile ? 'To orphan backlinks and remove instances of file usage' : 'To orphan backlinks',
			css: { fontSize: '130%', fontWeight: 'bold' },
		});
		Morebits.status.info($bigtext[0], $link[0]);

		return def;
	}

	addToLog() {
		let params = this.params;
		let shouldLog =
			getPref('logSpeedyNominations') &&
			params.normalizeds.some(function (norm) {
				return getPref('noLogOnSpeedyNomination').indexOf(norm) === -1;
			});
		if (!shouldLog) {
			return $.Deferred().resolve();
		}

		let usl = new Morebits.userspaceLogger(getPref('speedyLogPageName'));
		usl.initialText =
			'Đây là nhật trình của tất cả đề nghị [[Wikipedia:Tiêu chí xóa nhanh|xóa nhanh]] được thực hiện bởi thành viên này bằng cách sử dụng mô đun CSD của [[WP:TW|Twinkle]].\n\n' +
			'Nếu bạn không muốn giữ nhật trình này nữa, bạn có thể tắt nó bằng cách sử dụng [[Wikipedia:Twinkle/Preferences|bảng cài đặt Twinkle]], và ' +
			'đề cử trang này để xóa nhanh chóng dưới dạng [[WP:TV1|XN TV1]].' +
			(Morebits.userIsSysop || Morebits.userIsInGroup('eliminator') ? '\n\nChú ý: Nhật trình này không theo dõi các thao tác xóa nhanh ngay lập tức được thực hiện bằng Twinkle.' : '');

		let extraInfo = '';

		// Nếu tập tin đã bị xóa nhưng vẫn còn trên Commons, wikilink sẽ có màu xanh, nên cung cấp liên kết đến nhật trình
		let fileLogLink =
			mw.config.get('wgNamespaceNumber') === 6
				? ' ([{{fullurl:Special:Log|page=' + mw.util.wikiUrlencode(mw.config.get('wgPageName')) + '}} nhật trình])'
				: '';

		let editsummary = 'Đang ghi nhật trình đề nghị xóa nhanh';

		let appendText = '# [[:' + Morebits.pageNameNorm;

		if (!params.redactContents) {
			// không hiển thị tên bài trong nhật trình khi gán thẻ trang tấn công
			appendText += ']]' + fileLogLink + ': ';
			editsummary += ' [[:' + Morebits.pageNameNorm + ']].';
		} else {
			appendText += '|Trang]] tấn công này' + fileLogLink + ': ';
			editsummary += ' một trang tấn công.';
		}

		if (params.normalizeds.length > 1) {
			let criteriaText = params.normalizeds
				.map((norm) => {
					return '[[WP:XN#' + norm.toUpperCase() + '|' + norm.toUpperCase() + ']]';
				})
				.join(', ');
			appendText += 'nhiều tiêu chí (' + criteriaText + ')';
		} else if (params.normalizeds[0] === 'db') {
			appendText += '{{tl|db-reason}}';
		} else {
			appendText +=
				'[[WP:XN#' +
				params.normalizeds[0].toUpperCase() +
				'|XN ' +
				params.normalizeds[0].toUpperCase() +
				']] ({{tl|db-' +
				params.csd[0] +
				'}})';
		}

		// Xử lý riêng lý do tùy chỉnh
		if (params.normalizeds[0] === 'db') {
			extraInfo += ` {Lý do tùy chỉnh: ${params.templateParams[0]['1']}}`;
		} else {
			params.csd.forEach((crit: string) => {
				let critObject = this.flatObject[crit];
				let critCode = critObject.code.toUpperCase();
				let subgroups = makeArray(critObject.subgroup);
				subgroups.forEach((subgroup) => {
					let value = params[subgroup.name];
					if (!value || !subgroup.parameter) {
						// không có giá trị được nhập, hoặc là trường ẩn
						return;
					}
					if (subgroup.log) {
						value = Morebits.string.safeReplace(subgroup.log, /\$1/g, value);
					} else if (subgroup.log === null) {
						// bỏ qua ghi nhật trình cho trường này
						return;
					}
					extraInfo += ` {${critCode} ${subgroup.parameter}: ${value}}`;
				});
			});
		}

		if (params.requestsalt) {
			appendText += '; đã yêu cầu ([[WP:SALT|khóa khả năng tạo trang]])';
		}
		if (extraInfo) {
			appendText += '; thông tin bổ sung:' + extraInfo;
		}
		if (params.initialContrib) {
			appendText += '; đã thông báo {{user|1=' + params.initialContrib + '}}';
		}
		appendText += ' ~~~~~\n';

		usl.changeTags = Twinkle.changeTags;
		return usl.log(appendText, editsummary);
	}

	/**
	 * If validation fails, returns a string to be shown to user via alert(), if validation
	 * succeeds, doesn't return anything.
	 */
	validateInputs(): string | void { }

	static userPreferences() {
		return {
			title: 'Xóa nhanh (CSD)',
			preferences: [
				{
					name: 'speedySelectionStyle',
					label: 'Khi nào nên chọn tiêu chí Xóa nhanh?',
					type: 'enum',
					enumValues: {
						buttonClick: 'Khi nhấn vào nút tiêu chí',
						radioClick: 'Khi nhấn vào nút tick (radio button)'
					},
					default: 'buttonClick'
				},
				{
					name: 'watchSpeedyPages',
					label: 'Thêm trang vào danh sách theo dõi khi sử dụng tiêu chí này',
					type: 'set',
					setValues: Config.commonSets.csdCriteria,
					default: ['g3', 'g5', 'g10', 'g11', 'g12']
				},
				{
					name: 'watchSpeedyExpiry',
					label: 'Thời gian theo dõi trang',
					type: 'enum',
					enumValues: Config.watchlistEnums,
					default: '1 month'
				},
				{
					name: 'markSpeedyPagesAsPatrolled',
					label: 'Đánh dấu tuần tra các trang được gắn thẻ Xóa nhanh',
					type: 'boolean',
					default: false
				},
				{
					name: 'promptForSpeedyDeletionSummary',
					label: 'Cho phép nhập lý do xóa tùy chỉnh khi sử dụng các tiêu chí này',
					type: 'set',
					setValues: Config.commonSets.csdCriteria,
					default: []
				},
				{
					name: 'warnUserOnSpeedyDelete',
					label: 'Thông báo cho người tạo trang khi tiến hành xóa trang bằng các tiêu chí này',
					type: 'set',
					setValues: Config.commonSets.csdCriteria,
					default: ['db', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c8', 'c9', 'c11', 'c12', 'c13', 'c14', 'c15', 'bv1', 'bv2', 'bv3', 'bv4', 'tt1', 'tt2', 'tt3', 'tt4', 'tt5', 'tt6', 'tt7', 'tt8', 'tt9', 'tt10', 'tt11', 'dh1', 'dh2', 'dh3', 'dh4', 'ctt1', 'ctt2', 'tv1', 'tv2', 'tv3', 'tl1', 'tl2', 'bm1', 'bm2', 'bm3']
				},
				{
					name: 'notifyUserOnSpeedyDeletionNomination',
					label: 'Thông báo cho người tạo trang khi gắn thẻ Xóa nhanh bằng các tiêu chí này',
					type: 'set',
					setValues: Config.commonSets.csdCriteria,
					default: ['db', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c8', 'c9', 'c11', 'c12', 'c13', 'c14', 'c15', 'bv1', 'bv2', 'bv3', 'bv4', 'tt1', 'tt2', 'tt3', 'tt4', 'tt5', 'tt6', 'tt7', 'tt8', 'tt9', 'tt10', 'tt11', 'dh1', 'dh2', 'dh3', 'dh4', 'ctt1', 'ctt2', 'tv1', 'tv2', 'tv3', 'tl1', 'tl2', 'bm1', 'bm2', 'bm3']
				},
				{
					name: 'welcomeUserOnSpeedyDeletionNotification',
					label: 'Hoan nghênh người tạo trang cùng lúc với việc thông báo Xóa nhanh cho các tiêu chí',
					type: 'set',
					setValues: Config.commonSets.csdCriteria,
					default: []
				},
				{
					name: 'logSpeedyNominations',
					label: 'Ghi lại đề nghị xóa nhanh vào nhật trình thành viên',
					type: 'boolean',
					default: true
				},
				{
					name: 'speedyLogPageName',
					label: 'Tên trang nhật trình đề nghị xóa nhanh (tính từ thư mục thành viên)',
					helptip: 'Ví dụ: "Nhật trình xóa nhanh". Đặt tên theo định dạng "Thành viên:<tên>/[tên bạn nhập ở đây]".',
					type: 'string',
					default: 'Nhật trình xóa nhanh'
				},
				{
					name: 'noLogOnSpeedyNomination',
					label: 'Không ghi nhật trình khi đề nghị xóa nhanh bằng các tiêu chí này',
					type: 'set',
					setValues: Config.commonSets.csdCriteria,
					default: []
				}
			] as Preference[],
		};
	}
}
