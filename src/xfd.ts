import { getPref, Page, Api, PreferenceGroup, Preference, Config } from './core';
import { addNs, makeTemplate, obj_entries, stripNs } from './utils';
import { XfdCore, XfdMode } from './core';
import { makeFindSourcesDiv, hatnoteRegex } from './common';

function num2order(num: number): string {
    switch (num) {
        case 1:
            return '';
        case 2:
            return '2';
        case 3:
            return '3';
        default:
            return num + '';
    }
}


class Afd extends XfdMode {
    static venueCode = 'AfD';
    static venueLabel = 'AfD (Biểu quyết xóa bài)';

    static isDefaultChoice() {
        return mw.config.get('wgNamespaceNumber') === 0 && !Morebits.isPageRedirect();
    }

    discussionPagePrefix = 'Wikipedia:Biểu quyết xoá bài';

    getFieldsetLabel() {
        return 'Biểu quyết xóa bài';
    }

    getVenueWarning() {
        if (mw.config.get('wgNamespaceNumber') !== 0) {
            return 'AfD thường chỉ thích hợp cho các bài viết.';
        } else if (mw.config.get('wgIsRedirect')) {
            return 'Vui lòng sử dụng RfD cho các trang chuyển hướng.';
        }
    }

    getMenuTooltip() {
        return 'Đề cử bài viết để xóa hoặc di chuyển';
    }

    generateFieldset() {
        this.fieldset = super.generateFieldset();
        this.fieldset.append({
            type: 'div',
            label: '', // Added later by Twinkle.makeFindSourcesDiv()
            style: 'margin-bottom: 5px;',
        });

        this.fieldset.append({
            type: 'checkbox',
            list: [
                {
                    label: 'Bao thẻ xóa với <noinclude>',
                    value: 'noinclude',
                    name: 'noinclude',
                    tooltip:
                        'Tính năng này sẽ bao thẻ xóa trong &lt;noinclude&gt; để không bị nhúng vào nội dung. Tùy chọn này thường không cần thiết.',
                },
            ],
        });
        this.fieldset.append({
            type: 'select',
            name: 'xfdcat',
            label: 'Chọn thể loại đề cử:',
            list: [
                { type: 'option', label: 'Không rõ', value: '?', selected: true },
                { type: 'option', label: 'Phương tiện và âm nhạc', value: 'M' },
                { type: 'option', label: 'Tổ chức, công ty hoặc sản phẩm', value: 'O' },
                { type: 'option', label: 'Tiểu sử', value: 'B' },
                { type: 'option', label: 'Các chủ đề xã hội', value: 'S' },
                { type: 'option', label: 'Web hay internet', value: 'W' },
                { type: 'option', label: 'Trò chơi hoặc thể thao', value: 'G' },
                { type: 'option', label: 'Khoa học và công nghệ', value: 'T' },
                { type: 'option', label: 'Hư cấu và nghệ thuật', value: 'F' },
                { type: 'option', label: 'Địa điểm và phương tiện đi lại', value: 'P' },
                { type: 'option', label: 'Chủ đề không thể xác định được hoặc không thể phân loại được', value: 'I' },
                { type: 'option', label: 'Tranh luận chưa được phân loại', value: 'U' },
            ],
        });

        this.appendReasonArea();
        return this.fieldset;
    }

    postRender(renderedFieldset: HTMLFieldSetElement) {
        makeFindSourcesDiv('#twinkle-xfd-findsources');
    }

    evaluate() {
        super.evaluate();
        this.tm.add(this.checkPage, []);
        this.tm.add(this.determineDiscussionPage, []);
        this.tm.add(this.createDiscussionPage, [this.checkPage, this.determineDiscussionPage], this.printReasonText);
        // create discussion page before linking or transcluding it from anywhere, so that
        // there's no need to do any purging later (#364)
        this.tm.add(this.tagPage, [this.checkPage, this.createDiscussionPage]); // tagPage has an arg coming from checkPage
        this.tm.add(this.addToList, [this.createDiscussionPage]);
        this.tm.add(this.fetchCreatorInfo, []);
        this.tm.add(this.notifyCreator, [this.createDiscussionPage, this.fetchCreatorInfo]);
        this.tm.add(this.addToLog, [this.notifyCreator]);
        this.tm.execute().then(() => this.redirectToDiscussion());
    }

    preprocessParams() {
        this.params.lookupNonRedirectCreator = true; // for this.fetchCreatorInfo()
    }

    /**
     * Check to see that the page still exists, is not already tagged for AfD, etc.
     */
    checkPage() {
        var pageobj = new Page(mw.config.get('wgPageName'), 'Thêm thẻ xóa vào bài viết');
        pageobj.setFollowRedirect(true);
        return pageobj.load().then(() => {
            var text = pageobj.getPageText();
            var statelem = pageobj.getStatusElement();

            this.params.articleLoadTime = pageobj.getLoadTime();

            if (!pageobj.exists()) {
                statelem.error("Có vẻ như trang không tồn tại; có lẽ nó đã bị xóa");
                return $.Deferred().reject();
            }

            var textNoAfd = text.replace(
                /<!--.*AfD.*\n\{\{(?:Article for deletion\/dated|AfDM|VfD|Xoá|Xóa).*\}\}\n<!--.*(?:\n<!--.*)?AfD.*(?:\s*\n)?/g,
                ''
            );
            if (text !== textNoAfd) {
                if (
                    confirm(
                        'Một thẻ AfD đã được tìm thấy trên bài viết này. Có thể ai đó đã đặt trước bạn.  \nNhấn OK để thay thế thẻ AfD hiện tại (không khuyến khích), hoặc Cancel để hủy bỏ đề cử.'
                    )
                ) {
                    pageobj.setPageText(textNoAfd);
                } else {
                    statelem.error('Bài viết đã có thẻ AfD, bạn đã chọn hủy');
                    window.location.reload();
                    return $.Deferred().reject();
                }
            }
            return pageobj;
        });
    }

    determineDiscussionPage() {
        let params = this.params;
        params.discussionpage = 'Wikipedia:Biểu quyết xoá bài/' + Morebits.pageNameNorm;
        var pageobj = new Page(params.discussionpage, 'Kiểm tra tên trang thảo luận');
        return pageobj.load().then(() => {
            if (pageobj.exists()) {
                var text = pageobj.getPageText();
                // Check if discussion is already running
                var isAlreadyRunning = text.indexOf(params.discussionpage) !== -1 || text.indexOf('<!-- Twinkle: Bản mẫu Afd -->') !== -1;
                if (isAlreadyRunning) {
                    pageobj.getStatusElement().error("Một cuộc thảo luận đang diễn ra. Vui lòng tham gia vào đó.");
                    return $.Deferred().reject();
                }

                // For viwiki, find suffix
                return new Api('Tìm trang thảo luận khả dụng', {
                    action: 'query',
                    list: 'allpages',
                    apprefix: mw.config.get('wgTitle'),
                    apnamespace: 4, // Wikipedia
                }).post().then((apiobj) => {
                    var pages = apiobj.getResponse().query.allpages;
                    var max = 1;
                    pages.forEach((page) => {
                        var title = page.title;
                        var regex = /Biểu quyết xoá bài\/.*(?:\(lần (\d+)\)|\/lần (\d+)|\/ (\d+))/i;
                        var match = title.match(regex);
                        if (match) {
                            var num = parseInt(match[1] || match[2] || match[3], 10);
                            if (num > max) {
                                max = num;
                            }
                        }
                    });
                    params.number = (max + 1) + '';
                    params.numbering = ' (lần ' + params.number + ')';
                    params.discussionpage += params.numbering;
                });
            } else {
                params.number = '';
                params.numbering = '';
            }
        });
    }

    tagPage(pageobj) {
        let params = this.params;

        params.tagText =
            (params.noinclude ? '<noinclude>{{' : '{{') +
            (params.number === '' ? 'subst:afd|help=off' : 'subst:afdx|' + params.number + '|help=off') +
            (params.noinclude ? '}}</noinclude>\n' : '}}\n');

        if (pageobj.canEdit()) {
            var text = pageobj.getPageText();

            // Insert tag after short description or any hatnotes
            var wikipage = new Morebits.wikitext.page(text);
            text = wikipage.insertAfterTemplates(params.tagText, hatnoteRegex).getText();

            pageobj.setPageText(text);
            pageobj.setEditSummary('Đề cử biểu quyết xóa bài; xem [[:' + params.discussionpage + ']].');
            pageobj.setWatchlist(getPref('xfdWatchPage'));
            pageobj.setCreateOption('nocreate');
            return pageobj.save();
        } else {
            return this.autoEditRequest(pageobj);
        }
    }

    getDiscussionWikitext(): string {
        let params = this.params;
        return makeTemplate('subst:afd2', {
            text: Morebits.string.formatReasonText(params.reason, true),
            pg: Morebits.pageNameNorm,
            cat: params.xfdcat,
        });
    }

    createDiscussionPage() {
        let params = this.params;
        var pageobj = new Page(params.discussionpage, 'Tạo trang biểu quyết xóa bài');
        return pageobj.load().then(() => {
            pageobj.setPageText(this.getDiscussionWikitext());
            pageobj.setEditSummary('Tạo trang biểu quyết xóa cho [[:' + Morebits.pageNameNorm + ']].');
            pageobj.setWatchlist(getPref('xfdWatchDiscussion'));
            pageobj.setCreateOption('createonly');
            return pageobj.save();
        });
    }

    addToList() {
        let params = this.params;

        var pageobj = new Page(
            'Wikipedia:Biểu quyết xoá bài',
            "Thêm biểu quyết vào danh sách"
        );
        pageobj.setFollowRedirect(true);
        return pageobj.load().then(() => {
            var statelem = pageobj.getStatusElement();

            var added_data = '{{subst:afd4|pg=' + Morebits.pageNameNorm + params.numbering + '}}';
            var text = pageobj.getPageText();

            var date = new Morebits.date(params.articleLoadTime);
            // convert to Vietnamese month
            var vnMonth = "Tháng " + date.format('M', 'utc');
            var year = date.format('YYYY', 'utc');

            var date_header = '==' + vnMonth + ' năm ' + year + '==\n';
            var date_header_regex = new RegExp('(==\\s*' + vnMonth + ' năm ' + year + '\\s*==)');

            if (date_header_regex.test(text)) {
                statelem.info("Tìm thấy mục của tháng hiện tại, tiến hành thêm thảo luận");
                text = text.replace(date_header_regex, '$1\n' + added_data);
            } else {
                statelem.info('Không tìm thấy mục của tháng hiện tại, tiến hành tạo mới');
                // Find <!-- Twinkle V3: Tạo thêm đề mục dưới dòng này sau khi sang tháng mới-->
                var insert_regex = /(<!--\s*Twinkle V3: Tạo thêm đề mục dưới dòng này sau khi sang tháng mới\s*-->)/i;
                if (insert_regex.test(text)) {
                    text = text.replace(insert_regex, '$1\n' + date_header + added_data + '\n');
                } else {
                    // Fallback
                    text = text + '\n' + date_header + added_data;
                }
            }

            pageobj.setPageText(text);
            pageobj.setEditSummary('Thêm [[:' + params.discussionpage + ']].');
            pageobj.setWatchlist(getPref('xfdWatchList'));
            pageobj.setCreateOption('recreate');
            return pageobj.save();
        });
    }

    getNotifyText(): string {
        return (
            makeTemplate('subst:afd notice', {
                1: Morebits.pageNameNorm,
                order: this.params.numbering ? `|order=&#32;${this.params.numbering}` : '',
            }) + ' ~~~~'
        );
    }
}


class Ffd extends XfdMode {
    static venueCode = 'FfD';
    static venueLabel = 'FfD (Biểu quyết xóa tập tin)';

    static isDefaultChoice() {
        return mw.config.get('wgNamespaceNumber') === 6;
    }

    getFieldsetLabel() {
        return 'Biểu quyết xóa tập tin';
    }

    getMenuTooltip(): string {
        return 'Đề cử tập tin để xóa';
    }

    getVenueWarning() {
        if (mw.config.get('wgNamespaceNumber') !== 6) {
            return "FfD được chọn nhưng trang này có vẻ không phải là một tập tin!";
        }
    }

    generateFieldset(): Morebits.quickForm.element {
        this.fieldset = super.generateFieldset();
        this.appendReasonArea();
        return this.fieldset;
    }

    preview(form: HTMLFormElement) {
        this.params = Morebits.quickForm.getInputData(form);
        this.preprocessParams();
        this.fetchCreatorInfo().then(() => {
            this.showPreview(form);
        });
    }

    evaluate() {
        super.evaluate();
        this.tm.add(this.fetchCreatorInfo, []);
        this.tm.add(this.tagPage, []);
        this.tm.add(this.addToList, [this.fetchCreatorInfo, this.tagPage], this.printReasonText);
        this.tm.add(this.notifyCreator, [this.fetchCreatorInfo]);
        this.tm.add(this.addToLog, [this.notifyCreator]);
        this.tm.execute().then(() => this.redirectToDiscussion());
    }

    tagPage() {
        let params = this.params;
        let pageobj = new Page(mw.config.get('wgPageName'), 'Thêm thẻ xóa vào tập tin');
        pageobj.setFollowRedirect(true);
        return pageobj.load().then(() => {
            var text = pageobj.getPageText();

            params.logpage = 'Wikipedia:Biểu quyết xoá tập tin';
            params.discussionpage = params.logpage + '#' + Morebits.pageNameNorm;

            params.tagText = '{{ffd|help=off}}\n';
            if (pageobj.canEdit()) {
                text = text.replace(
                    /\{\{(mtc|(copy |move )?to ?commons|move to wikimedia commons|copy to wikimedia commons)[^}]*\}\}/gi,
                    ''
                );

                pageobj.setPageText(params.tagText + text);
                pageobj.setEditSummary('Đề cử xóa tập tin; xem [[:' + params.discussionpage + ']].');
                pageobj.setWatchlist(getPref('xfdWatchPage'));
                pageobj.setCreateOption('recreate');
                return pageobj.save();
            } else {
                return this.autoEditRequest(pageobj);
            }
        });
    }

    addToList() {
        let params = this.params;
        var pageobj = new Page(params.logpage, "Thêm thảo luận vào danh sách");
        pageobj.setFollowRedirect(true);
        return pageobj.load().then(() => {
            var text = pageobj.getPageText();
            var added_data = this.getDiscussionWikitext() + '\n';

            var header_regex = /(==\s*Các biểu quyết hiện tại\s*==)/i;
            if (header_regex.test(text)) {
                text = text.replace(header_regex, '$1\n' + added_data);
            } else {
                // Fallback to inserting after {{/Đầu}} or at the bottom
                var head_regex = /(\{\{\/Đầu\}\})/;
                if (head_regex.test(text)) {
                    text = text.replace(head_regex, '$1\n' + added_data);
                } else {
                    text += '\n' + added_data;
                }
            }

            pageobj.setPageText(text);
            pageobj.setEditSummary('Thêm [[:' + Morebits.pageNameNorm + ']].');
            pageobj.setWatchlist(getPref('xfdWatchDiscussion'));
            pageobj.setCreateOption('recreate');
            return pageobj.save();
        });
    }

    getDiscussionWikitext(): string {
        return makeTemplate('subst:ffd2', {
            text: Morebits.string.formatReasonText(this.params.reason, true),
            1: mw.config.get('wgTitle'),
            Uploader: this.params.initialContrib,
        });
    }
}


class Pfd extends XfdMode {
    static venueCode = 'PfD';
    static venueLabel = 'PfD (Biểu quyết xóa/hợp nhất thể loại, bản mẫu, mô đun)';

    static isDefaultChoice() {
        return [10, 14, 828].indexOf(mw.config.get('wgNamespaceNumber')) !== -1;
    }

    getFieldsetLabel() {
        return 'Biểu quyết xóa/hợp nhất';
    }

    getMenuTooltip(): string {
        return 'Đề cử thể loại, bản mẫu, mô đun để xóa hoặc hợp nhất';
    }

    getVenueWarning(): string | void {
        if ([10, 14, 828].indexOf(mw.config.get('wgNamespaceNumber')) === -1) {
            return 'PfD chỉ dành cho thể loại, bản mẫu và mô đun.';
        }
    }

    generateFieldset(): Morebits.quickForm.element {
        this.fieldset = super.generateFieldset();
        var isTemplateOrModule = [10, 828].indexOf(mw.config.get('wgNamespaceNumber')) !== -1;
        var isModule = mw.config.get('wgNamespaceNumber') === 828;

        this.fieldset.append({
            type: 'select',
            name: 'xfdcat',
            label: 'Hành động: ',
            list: [
                { type: 'option', value: 'PfD', label: 'Xóa', selected: true },
                { type: 'option', value: 'PfM', label: 'Hợp nhất' },
            ],
            event: function (e) {
                var value = e.target.value;
                var target = e.target.form.pfdtarget;
                if (target) {
                    target.disabled = value === 'PfD';
                }
            },
        });

        this.fieldset.append({
            type: 'input',
            name: 'pfdtarget',
            label: 'Trang đích (nếu hợp nhất): ',
            disabled: true,
            required: true,
        });

        if (isTemplateOrModule) {
            this.fieldset.append({
                type: 'select',
                name: 'templatetype',
                label: 'Kiểu hiển thị thẻ: ',
                list:
                    isModule
                        ? [{ type: 'option', value: 'module', label: 'Module', selected: true }]
                        : [
                            { type: 'option', value: 'standard', label: 'Tiêu chuẩn', selected: true },
                            { type: 'option', value: 'sidebar', label: 'Hộp thông tin/Sidebar', selected: !!$('.infobox').length },
                            {
                                type: 'option',
                                value: 'inline',
                                label: 'Bản mẫu trong dòng (inline)',
                                selected: !!$('.mw-parser-output > p .Inline-Template').length,
                            },
                            { type: 'option', value: 'tiny', label: 'Rất nhỏ (tiny inline)' },
                        ],
            });

            this.fieldset.append({
                type: 'checkbox',
                list: [
                    {
                        label: 'Bao thẻ với <noinclude> (chỉ dùng cho bản mẫu thế)',
                        value: 'noinclude',
                        name: 'noinclude',
                        tooltip: 'Tính năng này sẽ bao thẻ trong &lt;noinclude&gt; để không bị thế (subst) cùng với bản mẫu.',
                        disabled: isModule,
                        checked: !!$('.box-Subst_only').length,
                    },
                ],
            });
        }

        this.appendReasonArea();
        return this.fieldset;
    }

    preprocessParams() {
        this.params.isTemplateOrModule = [10, 828].indexOf(mw.config.get('wgNamespaceNumber')) !== -1;
        this.params.isModule = mw.config.get('wgNamespaceNumber') === 828;
        if (this.params.pfdtarget) {
            this.params.pfdtarget = stripNs(this.params.pfdtarget);
        }
        this.params.action = this.params.xfdcat === 'PfM' ? 'merging' : 'deletion';
    }

    evaluate() {
        super.evaluate();
        if (this.params.xfdcat === 'PfM' && this.params.isTemplateOrModule) {
            this.tm.add(this.tagPagesForMerge, []);
            this.tm.add(this.addToList, [this.tagPagesForMerge], this.printReasonText);
        } else {
            this.tm.add(this.tagPage, []);
            this.tm.add(this.addToList, [this.tagPage], this.printReasonText);
        }
        this.tm.add(this.fetchCreatorInfo, []);
        if (this.params.xfdcat === 'PfM' && this.params.isTemplateOrModule) {
            this.tm.add(this.notifyCreator, [this.fetchCreatorInfo, this.tagPagesForMerge]);
        } else {
            this.tm.add(this.notifyCreator, [this.fetchCreatorInfo, this.tagPage]);
        }
        this.tm.add(this.addToLog, [this.notifyCreator]);
        this.tm.execute().then(() => this.redirectToDiscussion());
    }

    setLogPageAndDiscussionPage(loadTime?) {
        this.params.logpage = 'Wikipedia:Biểu quyết xóa trang (thể loại, bản mẫu và mô đun)';
        this.params.discussionpage = this.params.logpage + '#' + Morebits.pageNameNorm;
    }

    tagPage() {
        let params = this.params;
        let pageobj = new Page(
            Morebits.pageNameNorm + (params.isModule ? '/doc' : ''),
            'Thêm thẻ ' + (params.action === 'merging' ? 'hợp nhất' : 'xóa') + ' vào trang'
        );
        pageobj.setFollowRedirect(true);

        return pageobj.load().then(() => {
            this.setLogPageAndDiscussionPage();
            var text = pageobj.getPageText();
            var isCategory = !params.isTemplateOrModule;

            if (isCategory) {
                params.tagText = params.action === 'merging' ? '{{subst:pfm|' + params.pfdtarget + '}}\n' : '{{subst:pfd}}\n';
            } else {
                params.tagText =
                    '{{subst:' + (params.action === 'merging' ? 'pfm|' + params.pfdtarget + '|' : 'pfd|') + 'help=off' +
                    (params.templatetype !== 'standard' ? '|type=' + params.templatetype : '') +
                    '}}';

                if (pageobj.getContentModel() === 'sanitized-css') {
                    params.tagText = '/* ' + params.tagText + ' */';
                } else {
                    if (params.noinclude) {
                        params.tagText = '<noinclude>' + params.tagText + '</noinclude>';
                    }
                    params.tagText += params.templatetype === 'standard' || params.templatetype === 'sidebar' ? '\n' : '';
                }
            }

            if (pageobj.canEdit() && (isCategory || ['wikitext', 'sanitized-css'].indexOf(pageobj.getContentModel()) !== -1)) {
                pageobj.setPageText(params.tagText + text);
                pageobj.setEditSummary('Đề cử ' + (params.action === 'merging' ? 'hợp nhất' : 'xóa') + ' trang; xem [[:' + params.discussionpage + ']].');
                pageobj.setWatchlist(getPref('xfdWatchPage'));
                if (params.isModule) {
                    pageobj.setCreateOption('recreate');
                } else {
                    pageobj.setCreateOption('nocreate');
                }
                return pageobj.save();
            } else {
                return this.autoEditRequest(pageobj);
            }
        });
    }

    tagPagesForMerge() {
        let params = this.params;

        let docOrNot = params.isModule ? '/doc' : '';
        let moduleDocOrTemplate = params.isModule ? 'tài liệu mô đun' : 'bản mẫu';

        let pageobj = new Page(`${Morebits.pageNameNorm}${docOrNot}`, `Thêm thẻ hợp nhất vào ${moduleDocOrTemplate}`);
        pageobj.setFollowRedirect(true);

        let thispageTagging = pageobj.load().then(() => {
            this.setLogPageAndDiscussionPage(pageobj.getLoadTime());
            return this.tagForMerge(pageobj, params);
        });

        let prefix = params.isModule ? 'Module:' : 'Template:';
        let otherpageobj = new Page(
            `${prefix}${params.pfdtarget}${docOrNot}`,
            `Thêm thẻ hợp nhất vào ${moduleDocOrTemplate} đích`
        );
        otherpageobj.setFollowRedirect(true);

        let otherpageTagging = otherpageobj.load().then(() => {
            this.setLogPageAndDiscussionPage(pageobj.getLoadTime());

            // Create cloned params object manually
            let paramsCopy = Object.assign({}, params);
            paramsCopy.pfdtarget = stripNs(Morebits.pageNameNorm);

            return this.tagForMerge(
                otherpageobj,
                paramsCopy
            );
        });

        return $.when(thispageTagging, otherpageTagging);
    }

    tagForMerge(pageobj: Page, params) {
        var text = pageobj.getPageText();
        params.tagText =
            '{{subst:pfm|' + params.pfdtarget + '|help=off' +
            (params.templatetype !== 'standard' ? '|type=' + params.templatetype : '') +
            '}}';

        if (pageobj.getContentModel() === 'sanitized-css') {
            params.tagText = '/* ' + params.tagText + ' */';
        } else {
            if (params.noinclude) {
                params.tagText = '<noinclude>' + params.tagText + '</noinclude>';
            }
            params.tagText += params.templatetype === 'standard' || params.templatetype === 'sidebar' ? '\n' : '';
        }

        if (pageobj.canEdit() && ['wikitext', 'sanitized-css'].indexOf(pageobj.getContentModel()) !== -1) {
            pageobj.setPageText(params.tagText + text);
            pageobj.setEditSummary('Đề cử hợp nhất trang; xem [[:' + params.discussionpage + ']].');
            pageobj.setWatchlist(getPref('xfdWatchPage'));
            if (params.isModule) {
                pageobj.setCreateOption('recreate');
            } else {
                pageobj.setCreateOption('nocreate');
            }
            return pageobj.save();
        } else {
            return this.autoEditRequest(pageobj);
        }
    }

    addToList() {
        let params = this.params;

        var pageobj = new Page(params.logpage, "Thêm thảo luận vào danh sách");
        pageobj.setFollowRedirect(true);
        return pageobj.load().then(() => {
            var added_data = this.getDiscussionWikitext();
            var text = pageobj.getPageText();

            // Append to the end of the page
            text += '\\n\\n' + added_data;

            pageobj.setPageText(text);
            pageobj.setEditSummary(
                'Thêm đề cử ' + (params.action === 'merging' ? 'hợp nhất' : 'xóa') + ' [[:' + Morebits.pageNameNorm + ']].'
            );

            pageobj.setWatchlist(getPref('xfdWatchDiscussion'));
            pageobj.setCreateOption('recreate');
            return pageobj.save();
        });
    }

    getDiscussionWikitext(): string {
        var templateName = this.params.xfdcat === 'PfM' ? 'subst:Pfm2' : 'subst:Pfd2';
        return makeTemplate(templateName, {
            text: Morebits.string.formatReasonText(this.params.reason, true),
            1: mw.config.get('wgTitle'),
            2: this.params.xfdcat === 'PfM' ? this.params.pfdtarget : undefined,
            module: this.params.isModule ? 'Module:' : '',
        });
    }

    getNotifyText(): string {
        var templateName = this.params.xfdcat === 'PfM' ? 'subst:pfm notice' : 'subst:pfd notice';
        return `{{${templateName}|1=${Morebits.pageNameNorm}${this.params.xfdcat === 'PfM' ? '|2=' + this.params.pfdtarget : ''}}} ~~~~`;
    }
}






class Mfd extends XfdMode {
    static venueCode = 'MfD';
    static venueLabel = 'MfD (Biểu quyết xóa trang khác)';

    static isDefaultChoice() {
        return (
            [0, 6, 10, 14, 828].indexOf(mw.config.get('wgNamespaceNumber')) === -1 ||
            Morebits.pageNameNorm.indexOf('Template:User ') === 0
        );
    }

    getMenuTooltip(): string {
        return 'Đề cử trang này để xóa';
    }

    getFieldsetLabel() {
        return 'Biểu quyết xóa trang khác';
    }

    generateFieldset(): Morebits.quickForm.element {
        this.fieldset = super.generateFieldset();
        this.fieldset.append({
            type: 'checkbox',
            list: [
                {
                    label: 'Bao thẻ xóa với <noinclude>',
                    value: 'noinclude',
                    name: 'noinclude',
                    tooltip:
                        "Sẽ bao thẻ xóa trong <noinclude>, để nó không bị nhúng. Chọn tùy chọn này cho hộp userbox.",
                },
            ],
        });
        this.appendReasonArea();
        return this.fieldset;
    }

    evaluate() {
        super.evaluate();
        this.tm.add(this.tagPage, []);
        this.tm.add(this.addToList, [this.tagPage], this.printReasonText);
        this.tm.add(this.fetchCreatorInfo, []);
        this.tm.add(this.notifyCreator, [this.fetchCreatorInfo]);
        this.tm.add(this.addToLog, [this.notifyCreator]);
        this.tm.execute().then(() => this.redirectToDiscussion());
    }

    tagPage() {
        let params = this.params;
        var pageobj = new Page(mw.config.get('wgPageName'), 'Thêm thẻ xóa vào trang');
        pageobj.setFollowRedirect(true);
        return pageobj.load().then(() => {
            var text = pageobj.getPageText();

            params.logpage = 'Wikipedia:Biểu quyết xóa trang (khác)';
            params.discussionpage = params.logpage + '#' + Morebits.pageNameNorm;

            params.tagText = '{{mfd|help=off}}';

            if (['javascript', 'css', 'sanitized-css'].indexOf(mw.config.get('wgPageContentModel')) !== -1) {
                params.tagText = '/* ' + params.tagText + ' */\n';
            } else {
                params.tagText += '\n';
                if (params.noinclude) {
                    params.tagText = '<noinclude>' + params.tagText + '</noinclude>';
                }
            }

            if (
                pageobj.canEdit() &&
                ['wikitext', 'javascript', 'css', 'sanitized-css'].indexOf(pageobj.getContentModel()) !== -1
            ) {
                pageobj.setPageText(params.tagText + text);
                pageobj.setEditSummary('Đề cử xóa trang; xem [[:' + params.discussionpage + ']].');
                pageobj.setWatchlist(getPref('xfdWatchPage'));
                pageobj.setCreateOption('nocreate');
                return pageobj.save();
            } else {
                return this.autoEditRequest(pageobj);
            }
        });
    }

    getDiscussionWikitext(): string {
        return makeTemplate('subst:mfd2', {
            text: Morebits.string.formatReasonText(this.params.reason, true),
            pg: Morebits.pageNameNorm,
        });
    }

    addToList() {
        let params = this.params;
        let pageobj = new Page(params.logpage, "Thêm thảo luận vào danh sách");
        pageobj.setFollowRedirect(true);
        return pageobj.load().then(() => {
            var text = pageobj.getPageText();
            var added_data = this.getDiscussionWikitext();

            text += '\n\n' + added_data;

            pageobj.setPageText(text);
            pageobj.setEditSummary('Thêm [[:' + Morebits.pageNameNorm + ']].');
            pageobj.setWatchlist(getPref('xfdWatchList'));
            pageobj.setCreateOption('recreate');
            return pageobj.save();
        });
    }

    getNotifyText(): string {
        let text = `{{subst:mfd notice|1=${Morebits.pageNameNorm}}} ~~~~`;
        return text;
    }
}

XfdCore.modeList = [Afd, Ffd, Pfd, Mfd];

export class Xfd extends XfdCore {
    footerlinks = {
        // 'Về thảo luận xóa': 'WP:XFD',
        'Tùy chọn BQX': 'WP:TW/PREF#xfd',
        'Trợ giúp Twinkle': 'WP:TW/DOC#xfd',
        'Phản hồi': 'WT:TW',
    };

    static userPreferences() {
        const prefs = super.userPreferences() as PreferenceGroup;
        prefs.preferences = prefs.preferences.concat([
            {
                name: 'noLogOnXfdNomination',
                label: 'Không ghi log vào không gian người dùng khi đề cử',
                type: 'set',
                setValues: {
                    afd: 'AfD',
                    ffd: 'FfD',
                    pfd: 'PfD',
                    mfd: 'MfD'
                },
                default: [],
            }
        ] as Preference[]);
        return prefs;
    }
}
