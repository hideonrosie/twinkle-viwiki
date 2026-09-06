import { Twinkle, TwinkleModule, getPref, addPortletLink } from './core';

export class Arv extends TwinkleModule {
	moduleName = 'arv';
	static moduleName = 'arv';

	constructor() {
		super();
		var username = mw.config.get('wgRelevantUserName');
		if (!username || username === mw.config.get('wgUserName')) {
			return;
		}

		var isIP = mw.util.isIPAddress(username, true);
		// Ignore ranges wider than the CIDR limit
		if (Morebits.ip.isRange(username) && !Morebits.ip.validCIDR(username)) {
			return;
		}
		var userType = isIP ? 'IP' + (Morebits.ip.isRange(username) ? ' (dải)' : '') : 'người dùng';

		addPortletLink(
			function () {
				Arv.callback(username, isIP);
			},
			'Báo cáo phá hoại',
			'tw-arv',
			'Báo cáo ' + userType + ' này đến bảo quản viên'
		);
	}

	static callback(uid: string, isIP: boolean) {
		var Window = new Morebits.simpleWindow(600, 500);
		Window.setTitle('Báo cáo thành viên này đến bảo quản viên');
		Window.setScriptName('Twinkle');
		Window.addFooterLink('Xem TNCBQV', 'WP:TNCBQV');
		Window.addFooterLink('Xem YCKĐTK', 'Wikipedia:YCKĐTK');
		Window.addFooterLink('Tùy chọn', 'WP:TW/PREF#arv');
		Window.addFooterLink('Trợ giúp Twinkle', 'WP:TW/DOC#arv');
		Window.addFooterLink('Phản hồi', 'WT:TW');

		var form = new Morebits.quickForm(Arv.evaluate);
		var categories = form.append({
			type: 'select',
			name: 'category',
			label: 'Chọn loại báo cáo: ',
			event: Arv.changeCategory,
		});
		categories.append({
			type: 'option',
			label: 'Báo cáo phá hoại (WP:TNCBQV)',
			value: 'aiv',
		});
		categories.append({
			type: 'option',
			label: 'Vi phạm quy định về tên người dùng (WP:TNCBQV)',
			value: 'username',
			disabled: isIP,
		});
		categories.append({
			type: 'option',
			label: 'Người điều khiển rối (WP:YCKĐTK)',
			value: 'sock',
		});
		categories.append({
			type: 'option',
			label: 'Tài khoản con rối (WP:YCKĐTK)',
			value: 'puppet',
		});
		form.append({
			type: 'div',
			label: '',
			style: 'color: red',
			id: 'twinkle-arv-blockwarning',
		});

		form.append({
			type: 'field',
			label: 'Khu vực nhập liệu',
			name: 'work_area',
		});
		form.append({ type: 'submit' });
		form.append({
			type: 'hidden',
			name: 'uid',
			value: uid,
		});

		var result = form.render();
		Window.setContent(result);
		Window.display();

		// Check if the user is blocked, update notice
		new Morebits.wiki.user(uid, "Kiểm tra trạng thái cấm ").load(function (userobj: any) {
			if (userobj.isBlocked()) {
				var message =
					(isIP ? 'Địa chỉ IP này ' + (userobj.isIPRange() ? 'dải IP' : 'địa chỉ IP') : 'Tài khoản này') +
					' đã bị ' +
					(userobj.getPartial() ? 'cấm bán phần' : 'cấm');
				message += userobj.isRangeBlocked() ? ' theo diện cấm dải IP.' : '.';
				if (userobj.getPartial()) {
					$('#twinkle-arv-blockwarning').css('color', 'black'); // Less severe
				}
				$('#twinkle-arv-blockwarning').text(message);
			}
		});

		// We must init the
		var evt = document.createEvent('Event');
		evt.initEvent('change', true, true);
		result.category.dispatchEvent(evt);
	}

	/* Legacy changeCategory body retained below for reference while viwiki uses the implementation below.
	static changeCategory(e: any) {
		var value = e.target.value;
		var root = e.target.form;
		var old_area = Morebits.quickForm.getElements(root, 'work_area')[0];
		var work_area = null;

		switch (value) {
								'Disruptive usernames include outright trolling or personal attacks, or otherwise show a clear intent to disrupt Wikipedia.',
						},
					],
				});
				work_area.append({
					type: 'textarea',
					name: 'reason',
					label: 'Comment:',
				});
				work_area = work_area.render();
												' at <a href="' +
												mw.config.get('wgScript') +
												'?diff=' +
												rev.revid +
												'">' +
												new Morebits.date(rev.timestamp).calendar() +
												'</a></span>';
											$entry.append(comment).appendTo($field);
										}
									}

									// add free form input for resolves
									if (field === 'resolves') {
										var $free_entry = $('<div/>', {
											class: 'entry',
										});
										var $free_input = $('<input/>', {
											type: 'text',
											name: 's_resolves_free',
										});

										var $free_label = $('<label/>', {
											for: 's_resolves_free',
											html: 'Liên kết URL đến khác biệt kèm thảo luận bổ sung: ',
										});
										$free_entry.append($free_label).append($free_input).appendTo($field);
									}
								})
								.fail(function () {
									$('<span class="entry">API thất bại, hãy tải lại trang và thử lại</span>').appendTo($field);
								});
						};

						// warnings
						var uid = root.uid.value;
						getAN3Entries('warnings', mw.config.get('wgUserName'), 'User talk:' + uid);

						// diffs and resolves require a valid page
						var page = root.page.value;
						if (page) {
							// diffs
							getAN3Entries('diffs', uid, page);

							// resolutions
							var t = new mw.Title(page);
							var talk_page = t.getTalkPage().getPrefixedText();
							getAN3Entries('resolves', mw.config.get('wgUserName'), talk_page);
						} else {
							$(root).find('[name=diffs]').find('.entry').remove();
							$(root).find('[name=resolves]').find('.entry').remove();
						}
					},
				});
				work_area.append({
					type: 'field',
					name: 'diffs',
						label: 'Các lần hồi sửa của người dùng',
						tooltip: 'Chọn các chỉnh sửa mà bạn cho là lần hồi sửa',
				});
				work_area.append({
					type: 'field',
					name: 'warnings',
						label: 'Cảnh báo đã gửi cho đối tượng',
						tooltip: 'Bạn phải cảnh báo đối tượng trước khi báo cáo',
				});
				work_area.append({
					type: 'field',
					name: 'resolves',
						label: 'Nỗ lực giải quyết',
						tooltip: 'Trước tiên bạn nên cố gắng giải quyết vấn đề trên trang thảo luận',
				});

				work_area.append({
					type: 'textarea',
						label: 'Bình luận:',
					name: 'comment',
				});

				work_area = work_area.render();
				old_area.parentNode.replaceChild(work_area, old_area);
				break;
		}
	}

	} */

	static changeCategory(e: any) {
		var value = e.target.value;
		var root = e.target.form;
		var old_area = Morebits.quickForm.getElements(root, 'work_area')[0];
		var work_area: any = new Morebits.quickForm.element({ type: 'field', name: 'work_area' });

		if (value === 'aiv') {
			work_area = new Morebits.quickForm.element({ type: 'field', label: 'Báo cáo người dùng phá hoại', name: 'work_area' });
			work_area.append({ type: 'input', name: 'page', label: 'Trang liên kết chính: ', tooltip: 'Để trống nếu không liên kết đến trang trong báo cáo', value: mw.util.getParamValue('vanarticle') || '' });
			work_area.append({ type: 'input', name: 'badid', label: 'ID sửa đổi khi bị phá hoại: ', tooltip: 'Để trống nếu không có liên kết khác biệt', value: mw.util.getParamValue('vanarticlerevid') || '' });
			work_area.append({ type: 'input', name: 'goodid', label: 'ID sửa đổi tốt cuối cùng: ', tooltip: 'Để trống cho liên kết khác biệt với bản sửa đổi trước đó', value: mw.util.getParamValue('vanarticlegoodrevid') || '' });
			work_area.append({ type: 'checkbox', name: 'arvtype', list: [
				{ label: 'Phá hoại sau khi cảnh báo mức 4 được thiết lập', value: 'final' },
				{ label: 'Phá hoại sau khi bị cấm gần đây', value: 'postblock' },
				{ label: 'Rõ ràng là một tài khoản chỉ phá hoại', value: 'vandalonly', disabled: mw.util.isIPAddress(root.uid.value, true) },
				{ label: 'Tài khoản chỉ để quảng cáo', value: 'promoonly', disabled: mw.util.isIPAddress(root.uid.value, true) },
				{ label: 'Tài khoản là spambot hoặc bị xâm phạm', value: 'spambot' }
			] });
			work_area.append({ type: 'textarea', name: 'reason', label: 'Bình luận: ' });
		} else if (value === 'username') {
			work_area = new Morebits.quickForm.element({ type: 'field', label: 'Báo cáo vi phạm tên người dùng', name: 'work_area' });
			work_area.append({ type: 'checkbox', name: 'arvtype', list: [
				{ label: 'Tên người dùng gây hiểu lầm', value: 'gây hiểu lầm' },
				{ label: 'Tên người dùng mang tính quảng cáo', value: 'mang tính quảng cáo' },
				{ label: 'Tên người dùng ngụ ý sử dụng chung', value: 'dùng chung' },
				{ label: 'Tên người dùng mang tính phản cảm', value: 'phản cảm' },
				{ label: 'Tên người dùng gây rối', value: 'gây rối' }
			] });
			work_area.append({ type: 'textarea', name: 'reason', label: 'Bình luận: ' });
		} else if (value === 'puppet') {
			work_area = new Morebits.quickForm.element({ type: 'field', label: 'Báo cáo con rối đáng ngờ', name: 'work_area' });
			work_area.append({ type: 'input', name: 'sockmaster', label: 'Chủ rối' });
			work_area.append({ type: 'textarea', name: 'evidence', label: 'Bằng chứng: ' });
			work_area.append({ type: 'checkbox', list: [{ label: 'Yêu cầu Kiểm định Tài khoản (CheckUser)', name: 'checkuser' }, { label: 'Thông báo đến người dùng bị báo cáo', name: 'notify' }] });
		} else {
			work_area = new Morebits.quickForm.element({ type: 'field', label: 'Báo cáo chủ rối bị nghi ngờ', name: 'work_area' });
			work_area.append({ type: 'dyninput', name: 'sockpuppet', label: 'Các con rối', sublabel: 'Sock: ', min: 2 });
			work_area.append({ type: 'textarea', name: 'evidence', label: 'Bằng chứng: ' });
			work_area.append({ type: 'checkbox', list: [{ label: 'Yêu cầu Kiểm định Tài khoản (CheckUser)', name: 'checkuser' }, { label: 'Thông báo cho người dùng bị báo cáo', name: 'notify' }] });
		}

		work_area = work_area.render();
		old_area.parentNode!.replaceChild(work_area, old_area);
	}

	static evaluate(e: any) {
		var form = e.target;
		var reason = '';
		var comment = '';
		if (form.reason) {
			comment = form.reason.value;
		}
		var uid = form.uid.value;

		var types;
		switch (form.category.value) {
			// Report user for vandalism
			case 'aiv':
			/* falls through */
			default:
				types = form.getChecked('arvtype');
				if (!types.length && comment === '') {
					alert('Bạn phải nêu ít nhất một lý do');
					return;
				}

				types = types
					.map(function (v: string) {
						switch (v) {
							case 'final':
								return 'phá hoại sau cảnh báo cuối cùng';
							case 'postblock':
								return 'phá hoại sau khi vừa được gỡ cấm';
							case 'vandalonly':
								return 'hành động rõ ràng cho thấy đây là tài khoản chỉ phá hoại';
							case 'promoonly':
								return 'tài khoản chỉ được sử dụng cho mục đích quảng cáo';
							case 'spambot':
								return 'tài khoản rõ ràng là spambot hoặc đã bị xâm phạm';
							default:
								return 'lý do không xác định';
						}
					})
					.join('; ');

				if (form.page.value !== '') {
					// Allow links to redirects, files, and categories
					reason = 'Tại {{No redirect|:' + form.page.value + '}}';

					if (form.badid.value !== '') {
						reason += ' ({{diff|' + form.page.value + '|' + form.badid.value + '|' + form.goodid.value + '|diff}})';
					}
					reason += ':';
				}

				if (types) {
					reason += ' ' + types;
				}
				if (comment !== '') {
					reason += (reason === '' ? '' : '. ') + comment;
				}
				reason = reason.trim();
				if (!/[.?!;]$/.test(reason)) {
					reason += '.';
				}
				reason += ' ~~~~';
				reason = reason.replace(/\r?\n/g, '\n*:'); // indent newlines

				Morebits.simpleWindow.setButtonsEnabled(false);
				Morebits.status.init(form);

				Morebits.wiki.actionCompleted.redirect = 'Wikipedia:Tin nhắn cho bảo quản viên';
				Morebits.wiki.actionCompleted.notice = 'Báo cáo thành công';

				var aivPage = new Morebits.wiki.page(
					'Wikipedia:Tin nhắn cho bảo quản viên',
					'Đang xử lý yêu cầu'
				);
				aivPage.setFollowRedirect(true);

				aivPage.load(function () {
					var text = aivPage.getPageText();
					var $aivLink = '<a target="_blank" href="/wiki/WP:TNCBQV">WP:TNCBQV</a>';

					// check if user has already been reported
					if (
						new RegExp(
							'\\{\\{\\s*(?:(?:[Ii][Pp])?[Vv]andal|[Uu]serlinks)\\s*\\|\\s*(?:1=)?\\s*' +
								Morebits.string.escapeRegExp(uid) +
								'\\s*\\}\\}'
						).test(text)
					) {
						aivPage.getStatusElement().error('Đã báo cáo trước đó, sẽ không tiếp tục báo cáo');
						Morebits.status.printUserText(
							reason,
							'Trong trường hợp bạn muốn báo cáo thủ công, thì khung dưới đây là các bình luận bạn đã viết trước đó ' +
								$aivLink +
								':'
						);
						return;
					}

					// then check for any bot reports
					var tb2Page = new Morebits.wiki.page(
						'Wikipedia:Tin nhắn cho bảo quản viên',
						'Kiểm tra báo cáo từ bot'
					);
					tb2Page.load(function () {
						var tb2Text = tb2Page.getPageText();
						var tb2statelem = tb2Page.getStatusElement();

						if (
							new RegExp(
								'\\{\\{\\s*(?:(?:[Ii][Pp])?[Vv]andal|[Uu]serlinks)\\s*\\|\\s*(?:1=)?\\s*' +
									Morebits.string.escapeRegExp(uid) +
									'\\s*\\}\\}'
							).test(tb2Text)
						) {
							if (
								confirm(
									'Thành viên ' + uid + ' đã bị bot báo cáo rồi, bạn có muốn tiếp tục báo cáo không?'
								)
							) {
								tb2statelem.info('Tiếp tục báo cáo thủ công');
							} else {
								tb2statelem.error('Bot đã báo cáo thành viên này, sẽ không tiếp tục báo cáo');
								Morebits.status.printUserText(
									reason,
									'Trong trường hợp bạn muốn báo cáo thủ công, thì khung dưới đây là các bình luận bạn đã viết trước đó ' +
										$aivLink +
										':'
								);
								return;
							}
						} else {
							tb2statelem.info('Không có báo cáo xung đột nào');
						}

						aivPage.getStatusElement().status('Đang thêm báo cáo mới...');
						aivPage.setEditSummary('Báo cáo [[Đặc biệt:Đóng góp/' + uid + '|' + uid + ']].');
						aivPage.setChangeTags(Twinkle.changeTags);
							aivPage.setAppendText(
								'\n== Báo cáo phá hoại ==\n*{{' +
								(mw.util.isIPAddress(uid, true) ? 'IPvandal' : 'vandal') +
								'|' +
								(/=/.test(uid) ? '1=' : '') +
								uid +
								'}} &ndash; ' +
								reason
						);
						aivPage.append();
					});
				});
				break;

			// Report inappropriate username
			case 'username':
				types = form.getChecked('arvtype').map(Morebits.string.toLowerCaseFirstChar);

				var hasShared = types.indexOf('dùng chung') > -1;
				if (hasShared) {
					types.splice(types.indexOf('dùng chung'), 1);
				}

				if (types.length <= 2) {
					types = types.join(' và ');
				} else {
					types = [types.slice(0, -1).join(', '), types.slice(-1)].join(' và ');
				}
				reason = '*{{user-uaa|1=' + uid + '}} &ndash; ';
				if (types.length || hasShared) {
					reason +=
						'Vi phạm quy định về tên người dùng với tính chất ' +
						types +
						(hasShared ? ' và có dấu hiệu dùng chung. ' : '. ');
				}
				if (comment !== '') {
					reason += Morebits.string.toUpperCaseFirstChar(comment) + '. ';
				}
				reason += '~~~~';
				reason = reason.replace(/\r?\n/g, '\n*:'); // indent newlines

				Morebits.simpleWindow.setButtonsEnabled(false);
				Morebits.status.init(form);

				Morebits.wiki.actionCompleted.redirect = 'Wikipedia:Tin nhắn cho bảo quản viên';
				Morebits.wiki.actionCompleted.notice = 'Báo cáo thành công';

				var uaaPage = new Morebits.wiki.page(
					'Wikipedia:Tin nhắn cho bảo quản viên',
					'Đang xử lý yêu cầu'
				);
				uaaPage.setFollowRedirect(true);

				uaaPage.load(function () {
					var text = uaaPage.getPageText();

					// check if user has already been reported
					if (
						new RegExp(
							'\\{\\{\\s*user-uaa\\s*\\|\\s*(1\\s*=\\s*)?' + Morebits.string.escapeRegExp(uid) + '\\s*(\\||\\})'
						).test(text)
					) {
						uaaPage.getStatusElement().error('Đã báo cáo trước đó.');
						var $uaaLink = '<a target="_blank" href="/wiki/WP:UAA">WP:UAA</a>';
						Morebits.status.printUserText(
							reason,
							'Trong trường hợp bạn muốn báo cáo thủ công, khung dưới đây là các bình luận bạn đã viết trước đó ' +
								$uaaLink +
								':'
						);
						return;
					}
					uaaPage.getStatusElement().status('Đang thêm báo cáo mới...');
					uaaPage.setEditSummary('Báo cáo [[Đặc biệt:Đóng góp/' + uid + '|' + uid + ']].');
					uaaPage.setChangeTags(Twinkle.changeTags);

					uaaPage.setPageText(text + '\n== Báo cáo tên người dùng ==\n' + reason);
					uaaPage.save();
				});
				break;

			// WP:SPI
			case 'sock':
			/* falls through */
			case 'puppet':
				var sockParameters: any = {
					evidence: form.evidence.value.trim(),
					checkuser: form.checkuser.checked,
					notify: form.notify.checked,
				};

				var puppetReport = form.category.value === 'puppet';
				if (puppetReport && !form.sockmaster.value.trim()) {
					alert(
						'Bạn chưa nhập tài khoản chủ rối cho con rối này. Hãy cân nhắc báo cáo tài khoản này dưới dạng người điều khiển rối.'
					);
					return;
				} else if (!puppetReport && !form.sockpuppet[0].value.trim()) {
					alert(
						'Bạn chưa nhập tài khoản con rối nào cho người điều khiển rối này. Hãy cân nhắc báo cáo tài khoản này dưới dạng con rối.'
					);
					return;
				}

				sockParameters.uid = puppetReport ? form.sockmaster.value.trim() : uid;
				sockParameters.sockpuppets = puppetReport
					? [uid]
					: Morebits.array.uniq(
							$.map($('input:text[name=sockpuppet]', form), function (o) {
								return (o as HTMLInputElement).value || null;
							})
					  );

				Morebits.simpleWindow.setButtonsEnabled(false);
				Morebits.status.init(form);
				Arv.processSock(sockParameters);
				break;

			/* case 'an3':
				var diffs = $.map($('input:checkbox[name=s_diffs]:checked', form), function (o) {
					return $(o).data('revinfo');
				});

				if (
					diffs.length < 3 &&
					!confirm('You have selected fewer than three offending edits. Do you wish to make the report anyway?')
				) {
					return;
				}

				var warnings = $.map($('input:checkbox[name=s_warnings]:checked', form), function (o) {
					return $(o).data('revinfo');
				});

				if (
					!warnings.length &&
					!confirm(
						'You have not selected any edits where you warned the offender. Do you wish to make the report anyway?'
					)
				) {
					return;
				}

				var resolves = $.map($('input:checkbox[name=s_resolves]:checked', form), function (o) {
					return $(o).data('revinfo');
				});
				var free_resolves = $('input[name=s_resolves_free]').val() as string;

				var an3_next = function (free_resolves?) {
					if (
						!resolves.length &&
						!free_resolves &&
						!confirm(
							'You have not selected any edits where you tried to resolve the issue. Do you wish to make the report anyway?'
						)
					) {
						return;
					}

					var an3Parameters = {
						uid: uid,
						page: form.page.value.trim(),
						comment: form.comment.value.trim(),
						diffs: diffs,
						warnings: warnings,
						resolves: resolves,
						free_resolves: free_resolves,
					};

					Morebits.simpleWindow.setButtonsEnabled(false);
					Morebits.status.init(form);
					Arv.processAN3(an3Parameters);
				};

				if (free_resolves) {
					var query;
					var diff, oldid;
					var specialDiff = /Special:Diff\/(\d+)(?:\/(\S+))?/i.exec(free_resolves);
					if (specialDiff) {
						if (specialDiff[2]) {
							oldid = specialDiff[1];
							diff = specialDiff[2];
						} else {
							diff = specialDiff[1];
						}
					} else {
						diff = mw.util.getParamValue('diff', free_resolves);
						oldid = mw.util.getParamValue('oldid', free_resolves);
					}
					var title = mw.util.getParamValue('title', free_resolves);
					var diffNum = /^\d+$/.test(diff); // used repeatedly

					// rvdiffto in prop=revisions is deprecated, but action=compare doesn't return
					// timestamps ([[phab:T247686]]) so we can't rely on it unless necessary.
					// Likewise, we can't rely on a meaningful comment for diff=cur.
					// Additionally, links like Special:Diff/123/next, Special:Diff/123/456, or ?diff=next&oldid=123
					// would each require making use of rvdir=newer in the revisions API.
					// That requires a title parameter, so we have to use compare instead of revisions.
					if (oldid && (diff === 'cur' || (!title && (diff === 'next' || diffNum)))) {
						query = {
							action: 'compare',
							fromrev: oldid,
							prop: 'ids|title',
							format: 'json',
						};
						if (diffNum) {
							query.torev = diff;
						} else {
							query.torelative = diff;
						}
					} else {
						query = {
							action: 'query',
							prop: 'revisions',
							rvprop: 'ids|timestamp|comment',
							format: 'json',
							indexpageids: true,
						};

						if (diff && oldid) {
							if (diff === 'prev') {
								query.revids = oldid;
							} else {
								query.titles = title;
								query.rvdir = 'newer';
								query.rvstartid = oldid;

								if (diff === 'next' && title) {
									query.rvlimit = 2;
								} else if (diffNum) {
									// Diffs may or may not be consecutive, no limit
									query.rvendid = diff;
								}
							}
						} else {
							// diff=next|prev|cur with no oldid
							// Implies title= exists otherwise it's not a valid diff link (well, it is, but to the Main Page)
							if (diff && /^\D+$/.test(diff)) {
								query.titles = title;
							} else {
								query.revids = diff || oldid;
							}
						}
					}

					new mw.Api()
						.get(query)
						.done(function (data) {
							var page;
							if (data.compare && data.compare.fromtitle === data.compare.totitle) {
								page = data;
							} else if (data.query) {
								var pageid = data.query.pageids[0];
								page = data.query.pages[pageid];
							} else {
								return;
							}
							an3_next(page);
						})
						.fail(function (data) {
							console.log('API failed :(', data); // eslint-disable-line no-console
						});
				} else {
					an3_next();
				}
				break; */
		}
	}

	static processSock(params: any) {
		Morebits.wiki.addCheckpoint(); // prevent notification events from causing an erronous "action completed"

		// notify all user accounts if requested
		if (params.notify && params.sockpuppets.length > 0) {
				var notifyEditSummary = 'Thông báo về việc nghi ngờ là con rối.';
			var notifyText = '\n\n{{subst:socksuspectnotice|1=' + params.uid + '}} ~~~~';

			// notify user's master account
				var masterTalkPage = new Morebits.wiki.page('User talk:' + params.uid, 'Thông báo cho chủ rối bị nghi ngờ');
				masterTalkPage.setFollowRedirect(true);
				masterTalkPage.setEditSummary(notifyEditSummary);
				masterTalkPage.setChangeTags(Twinkle.changeTags);
				masterTalkPage.setAppendText(notifyText);
				masterTalkPage.append();

			var statusIndicator = new Morebits.status('Đang thông báo cho các tài khoản con rối bị nghi ngờ', '0%');
			var total = params.sockpuppets.length;
			var current = 0;

			// display status of notifications as they progress
			var onSuccess = function (sockTalkPage: any) {
				var now = Math.floor((100 * ++current) / total) + '%';
				statusIndicator.update(now);
				sockTalkPage.getStatusElement().unlink();
				if (current >= total) {
					statusIndicator.info(now + ' (hoàn thành)');
				}
			};

			var socks = params.sockpuppets;

			// notify each puppet account
			for (var i = 0; i < socks.length; ++i) {
				var sockTalkPage = new Morebits.wiki.page('User talk:' + socks[i], 'Thông báo cho ' + socks[i]);
				sockTalkPage.setFollowRedirect(true);
				sockTalkPage.setEditSummary(notifyEditSummary);
				sockTalkPage.setChangeTags(Twinkle.changeTags);
				sockTalkPage.setAppendText(notifyText);
				sockTalkPage.append(onSuccess);
			}
		}

		// prepare the SPI report
		var text =
			'\n\n{{subst:SPI report|socksraw=' +
			params.sockpuppets
				.map(function (v: string) {
					return '* {{' + (mw.util.isIPAddress(v, true) ? 'checkip' : 'checkuser') + '|1=' + v + '}}';
				})
				.join('\n') +
			'\n|evidence=' +
			params.evidence +
			' \n';

		if (params.checkuser) {
			text += '|checkuser=yes';
		}
		text += '}}';

		var reportpage = 'Wikipedia:Yêu cầu kiểm định tài khoản/' + params.uid;

		Morebits.wiki.actionCompleted.redirect = reportpage;
		Morebits.wiki.actionCompleted.notice = 'Báo cáo hoàn thành';

		var spiPage = new Morebits.wiki.page(reportpage, 'Đang lấy trang thảo luận');
		spiPage.setFollowRedirect(true);
		spiPage.setEditSummary('Thêm báo cáo mới cho [[Đặc biệt:Đóng góp/' + params.uid + '|' + params.uid + ']].');
		spiPage.setChangeTags(Twinkle.changeTags);
		spiPage.setAppendText(text);
		switch (getPref('spiWatchReport')) {
			case 'yes':
				spiPage.setWatchlist('yes');
				break;
			case 'no':
				spiPage.setWatchlist('no');
				break;
			default:
				spiPage.setWatchlist(getPref('spiWatchReport'));
				break;
		}
		spiPage.append();

		Morebits.wiki.removeCheckpoint(); // all page updates have been started
	}

	/* Legacy AN3 implementation intentionally disabled for viwiki.
	static processAN3(params) {
		// prepare the AN3 report
		var minid;
		for (var i = 0; i < params.diffs.length; ++i) {
			if (params.diffs[i].parentid && (!minid || params.diffs[i].parentid < minid)) {
				minid = params.diffs[i].parentid;
			}
		}

		new mw.Api()
			.get({
				action: 'query',
				prop: 'revisions',
				format: 'json',
				rvprop: 'sha1|ids|timestamp|comment',
				rvlimit: 100, // intentionally limited
				rvstartid: minid,
				rvexcludeuser: params.uid,
				indexpageids: true,
				titles: params.page,
			})
			.done(function (data) {
				Morebits.wiki.addCheckpoint(); // prevent notification events from causing an erronous "action completed"

				// In case an edit summary was revdel'd
				var hasHiddenComment = function (rev) {
					if (!rev.comment && typeof rev.commenthidden === 'string') {
						return '(comment hidden)';
					}
					return '"' + rev.comment + '"';
				};

				var orig;
				if (data.length) {
					var sha1 = data[0].sha1;
					for (var i = 1; i < data.length; ++i) {
						if (data[i].sha1 === sha1) {
							orig = data[i];
							break;
						}
					}

					if (!orig) {
						orig = data[0];
					}
				}

				var origtext = '';
				if (orig) {
					origtext = '{{diff2|' + orig.revid + '|' + orig.timestamp + '}} ' + hasHiddenComment(orig);
				}

				var grouped_diffs = {};

				var parentid, lastid;
				for (var j = 0; j < params.diffs.length; ++j) {
					var cur = params.diffs[j];
					if ((cur.revid && cur.revid !== parentid) || lastid === null) {
						lastid = cur.revid;
						grouped_diffs[lastid] = [];
					}
					parentid = cur.parentid;
					grouped_diffs[lastid].push(cur);
				}

				var difftext = $.map(grouped_diffs, function (sub) {
					var ret = '';
					if (sub.length >= 2) {
						var last = sub[0];
						var first = sub.slice(-1)[0];
						var label =
							'Consecutive edits made from ' +
							new Morebits.date(first.timestamp).format('HH:mm, D MMMM YYYY', 'utc') +
							' (UTC) to ' +
							new Morebits.date(last.timestamp).format('HH:mm, D MMMM YYYY', 'utc') +
							' (UTC)';
						ret = '# {{diff|oldid=' + first.parentid + '|diff=' + last.revid + '|label=' + label + '}}\n';
					}
					ret += sub
						.reverse()
						.map(function (v) {
							return (
								(sub.length >= 2 ? '#' : '') +
								'# {{diff2|' +
								v.revid +
								'|' +
								new Morebits.date(v.timestamp).format('HH:mm, D MMMM YYYY', 'utc') +
								' (UTC)}} ' +
								hasHiddenComment(v)
							);
						})
						.join('\n');
					return ret;
				})
					.reverse()
					.join('\n');
				var warningtext = params.warnings
					.reverse()
					.map(function (v) {
						return (
							'# ' +
							' {{diff2|' +
							v.revid +
							'|' +
							new Morebits.date(v.timestamp).format('HH:mm, D MMMM YYYY', 'utc') +
							' (UTC)}} ' +
							hasHiddenComment(v)
						);
					})
					.join('\n');
				var resolvetext = params.resolves
					.reverse()
					.map(function (v) {
						return (
							'# ' +
							' {{diff2|' +
							v.revid +
							'|' +
							new Morebits.date(v.timestamp).format('HH:mm, D MMMM YYYY', 'utc') +
							' (UTC)}} ' +
							hasHiddenComment(v)
						);
					})
					.join('\n');

				if (params.free_resolves) {
					var page = params.free_resolves;
					if (page.compare) {
						resolvetext +=
							'\n# ' +
							' {{diff|oldid=' +
							page.compare.fromrevid +
							'|diff=' +
							page.compare.torevid +
							'|label=Consecutive edits on ' +
							page.compare.totitle +
							'}}';
					} else if (page.revisions) {
						var revCount = page.revisions.length;
						var rev;
						if (revCount < 3) {
							// diff=prev or next
							rev = revCount === 1 ? page.revisions[0] : page.revisions[1];
							resolvetext +=
								'\n# ' +
								' {{diff2|' +
								rev.revid +
								'|' +
								new Morebits.date(rev.timestamp).format('HH:mm, D MMMM YYYY', 'utc') +
								' (UTC) on ' +
								page.title +
								'}} ' +
								hasHiddenComment(rev);
						} else {
							// diff and oldid are nonconsecutive
							rev = page.revisions[0];
							var revLatest = page.revisions[revCount - 1];
							var label =
								'Consecutive edits made from ' +
								new Morebits.date(rev.timestamp).format('HH:mm, D MMMM YYYY', 'utc') +
								' (UTC) to ' +
								new Morebits.date(revLatest.timestamp).format('HH:mm, D MMMM YYYY', 'utc') +
								' (UTC) on ' +
								page.title;
							resolvetext += '\n# {{diff|oldid=' + rev.revid + '|diff=' + revLatest.revid + '|label=' + label + '}}\n';
						}
					}
				}

				var comment = params.comment.replace(/~*$/g, '').trim();

				if (comment) {
					comment += ' ~~~~';
				}

				var text =
					'\n\n' +
					'{{subst:AN3 report|diffs=' +
					difftext +
					'|warnings=' +
					warningtext +
					'|resolves=' +
					resolvetext +
					'|pagename=' +
					params.page +
					'|orig=' +
					origtext +
					'|comment=' +
					comment +
					'|uid=' +
					params.uid +
					'}}';

				var reportpage = "Wikipedia:Administrators' noticeboard/Edit warring";

				Morebits.wiki.actionCompleted.redirect = reportpage;
				Morebits.wiki.actionCompleted.notice = 'Reporting complete';

				var an3Page = new Morebits.wiki.page(reportpage, 'Retrieving discussion page');
				an3Page.setFollowRedirect(true);
				an3Page.setEditSummary(
					'Adding new report for [[Special:Contributions/' + params.uid + '|' + params.uid + ']].'
				);
				an3Page.setChangeTags(Twinkle.changeTags);
				an3Page.setAppendText(text);
				an3Page.append();

				// notify user
				var notifyText = '\n\n{{subst:an3-notice|1=' + mw.util.wikiUrlencode(params.uid) + '|auto=1}} ~~~~';

				var user = new Morebits.wiki.user(params.uid, 'Notifying edit warrior');
				user.setReason('Notifying about edit warring noticeboard discussion.');
				user.setChangeTags(Twinkle.changeTags);
				user.setMessage(notifyText);
				user.setNotifyBots(true);
				user.notify();
				Morebits.wiki.removeCheckpoint(); // all page updates have been started
			})
			.fail(function (data) {
				console.log('API failed :(', data); // eslint-disable-line no-console
			});
	} */
}