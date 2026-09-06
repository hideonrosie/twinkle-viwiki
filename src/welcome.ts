import { Twinkle, TwinkleModule, getPref, addPortletLink, Config, Preference } from './core';

export class Welcome extends TwinkleModule {
    moduleName = 'welcome';
    static moduleName = 'welcome';

    constructor() {
        super();
        if (mw.util.getParamValue('friendlywelcome')) {
            if (mw.util.getParamValue('friendlywelcome') === 'auto') {
                Welcome.auto();
            } else {
                Welcome.semiauto();
            }
        } else {
            Welcome.normal();
        }
    }

    static auto() {
        if (mw.util.getParamValue('action') !== 'edit') {
            // Trang thành viên không trống, hủy auto-welcome
            return;
        }

        Welcome.welcomeUser();
    }

    static semiauto() {
        Welcome.callback(mw.config.get('wgRelevantUserName'));
    }

    static normal() {
        if (mw.util.getParamValue('diff')) {
            // Kiểm tra xem trang thảo luận của thành viên đã tồn tại chưa
            var $oList = $('#mw-diff-otitle2').find('span.mw-usertoollinks a.new:contains(talk)').first();
            var $nList = $('#mw-diff-ntitle2').find('span.mw-usertoollinks a.new:contains(talk)').first();

            if ($oList.length > 0 || $nList.length > 0) {
                var spanTag = function (color, content) {
                    var span = document.createElement('span');
                    span.style.color = color;
                    span.appendChild(document.createTextNode(content));
                    return span;
                };

                var welcomeNode = document.createElement('strong');
                var welcomeLink = document.createElement('a');
                welcomeLink.appendChild(spanTag('Black', '['));
                welcomeLink.appendChild(spanTag('Goldenrod', 'chào mừng'));
                welcomeLink.appendChild(spanTag('Black', ']'));
                welcomeNode.appendChild(welcomeLink);

                if ($oList.length > 0) {
                    var oHref = $oList.attr('href');

                    var oWelcomeNode = welcomeNode.cloneNode(true);
                    (oWelcomeNode as Element).firstElementChild.setAttribute(
                        'href',
                        oHref +
                        '&' +
                        $.param({
                            friendlywelcome: getPref('quickWelcomeMode') === 'auto' ? 'auto' : 'norm',
                            vanarticle: Morebits.pageNameNorm,
                        })
                    );
                    $oList[0].parentNode.parentNode.appendChild(document.createTextNode(' '));
                    $oList[0].parentNode.parentNode.appendChild(oWelcomeNode);
                }

                if ($nList.length > 0) {
                    var nHref = $nList.attr('href');

                    var nWelcomeNode = welcomeNode.cloneNode(true);
                    (nWelcomeNode as Element).firstElementChild.setAttribute(
                        'href',
                        nHref +
                        '&' +
                        $.param({
                            friendlywelcome: getPref('quickWelcomeMode') === 'auto' ? 'auto' : 'norm',
                            vanarticle: Morebits.pageNameNorm,
                        })
                    );
                    $nList[0].parentNode.parentNode.appendChild(document.createTextNode(' '));
                    $nList[0].parentNode.parentNode.appendChild(nWelcomeNode);
                }
            }
        }
        // Thành viên và IP, nhưng không phải dải IP
        if (mw.config.get('wgRelevantUserName') && !Morebits.ip.isRange(mw.config.get('wgRelevantUserName'))) {
            addPortletLink(
                function () {
                    Welcome.callback(mw.config.get('wgRelevantUserName'));
                },
                'Chào mừng',
                'twinkle-welcome',
                'Hoan nghênh người dùng'
            );
        }
    }

    static welcomeUser() {
        Morebits.status.init(document.getElementById('mw-content-text'));
        $('#catlinks').remove();

        var params = {
            template: getPref('quickWelcomeTemplate'),
            article: mw.util.getParamValue('vanarticle') || '',
            mode: 'auto',
        };

        var userTalkPage = mw.config.get('wgFormattedNamespaces')[3] + ':' + mw.config.get('wgRelevantUserName');
        Morebits.wiki.actionCompleted.redirect = userTalkPage;
        Morebits.wiki.actionCompleted.notice = 'Hoan nghênh hoàn tất, tải lại trang thảo luận thành viên trong vài giây';

        var wikipedia_page = new Morebits.wiki.page(userTalkPage, 'Sửa trang thảo luận thành viên');
        wikipedia_page.setFollowRedirect(true);
        wikipedia_page.setCallbackParameters(params);
        wikipedia_page.load(Welcome.callbacks.main);
    }

    static callback(uid) {
        if (uid === mw.config.get('wgUserName') && !confirm('Bạn có chắc là muốn tự hoan nghênh mình không?...')) {
            return;
        }

        var Window = new Morebits.simpleWindow(600, 420);
        Window.setTitle('Hoan nghênh thành viên');
        Window.setScriptName('Twinkle');
        Window.addFooterLink('Ủy ban hoan nghênh', 'WP:WC');
        Window.addFooterLink('Tùy chọn chào mừng', 'WP:TW/PREF#welcome');
        Window.addFooterLink('Trợ giúp Twinkle', 'WP:TW/DOC#welcome');

        var form = new Morebits.quickForm(Welcome.evaluate);

        form.append({
            type: 'select',
            name: 'type',
            label: 'Dạng hoan nghênh: ',
            event: Welcome.populateWelcomeList,
            list: [
                {
                    type: 'option',
                    value: 'standard',
                    label: 'Hoan nghênh thành viên',
                    selected: !mw.util.isIPAddress(mw.config.get('wgRelevantUserName')),
                },
                {
                    type: 'option',
                    value: 'anonymous',
                    label: 'Hoan nghênh IP',
                    selected: mw.util.isIPAddress(mw.config.get('wgRelevantUserName')),
                },
                {
                    type: 'option',
                    value: 'nonVietnamese',
                    label: 'Hoan nghênh người không nói tiếng Việt',
                },
            ],
        });

        form.append({
            type: 'div',
            id: 'welcomeWorkArea',
            className: 'morebits-scrollbox',
        });

        form.append({
            type: 'input',
            name: 'article',
            label: '* Bài viết được liên kết (nếu được bản mẫu hỗ trợ):',
            value: mw.util.getParamValue('vanarticle') || '',
            tooltip:
                'Một bài viết có thể được liên kết từ trong phần hoan nghênh nếu bản mẫu hỗ trợ. Để trống nếu không muốn liên kết bài viết nào. Các bản mẫu hỗ trợ liên kết bài viết được đánh dấu bằng dấu hoa thị (*).',
        });

        var previewlink = document.createElement('a');
        $(previewlink).click(function () {
            Welcome.callbacks.preview(result); // |result| được định nghĩa bên dưới
        });
        previewlink.style.cursor = 'pointer';
        previewlink.textContent = 'Xem trước';
        form.append({ type: 'div', name: 'welcomepreview', label: [previewlink] });

        form.append({ type: 'submit' });

        var result = form.render();
        Window.setContent(result);
        Window.display();

        // Khởi tạo danh sách hoan nghênh
        var evt = document.createEvent('Event');
        evt.initEvent('change', true, true);
        result.type.dispatchEvent(evt);
    }

    static populateWelcomeList(e) {
        var type = e.target.value;

        var container = new Morebits.quickForm.element({ type: 'fragment' });

        if ((type === 'standard' || type === 'anonymous') && getPref('customWelcomeList').length) {
            container.append({ type: 'header', label: 'Bản mẫu hoan nghênh tùy chỉnh' });
            container.append({
                type: 'radio',
                name: 'template',
                list: getPref('customWelcomeList'),
                event: function () {
                    e.target.form.article.disabled = false;
                },
            });
        }

        var sets = Welcome.templates[type];
        $.each(sets, function (label, templates) {
            container.append({ type: 'header', label: String(label) });
            container.append({
                type: 'radio',
                name: 'template',
                list: $.map(templates, function (properties, template) {
                    return {
                        value: String(template),
                        label: '{{' + String(template) + '}}: ' + properties.description + (properties.linkedArticle ? '\u00A0*' : ''), // U+00A0 NO-BREAK SPACE
                        tooltip: properties.tooltip, // có thể undefined
                    };
                }),
                event: function (ev) {
                    ev.target.form.article.disabled = !templates[ev.target.value].linkedArticle;
                },
            });
        });

        var rendered = container.render();
        $(e.target.form).find('div#welcomeWorkArea').empty().append(rendered);

        var firstRadio = e.target.form.template[0];
        firstRadio.checked = true;
        var vals = sets[Object.keys(sets)[0]];
        e.target.form.article.disabled = vals[firstRadio.value] ? !vals[firstRadio.value].linkedArticle : true;
    }

    /**
     * Danh sách bản mẫu hoan nghênh và thuộc tính, cùng cú pháp của chúng.
     *
     * Bốn trường khả dụng: "description", "linkedArticle", "syntax", "tooltip".
     * Ba từ thần kỳ dùng trong trường "syntax":
     *   - $USERNAME$  - được thay bằng tên thành viên hoan nghênh (tùy chỉnh)
     *   - $ARTICLE$   - được thay bằng tên bài viết, nếu "linkedArticle" là true
     *   - $HEADER$    - thêm tiêu đề cấp 2 (hầu hết bản mẫu đã tự có)
     */
    static templates = {
        standard: {
            'Bản mẫu hoan nghênh phổ biến': {
                'hoan nghênh2': {
                    description: 'hoan nghênh thành viên mới',
                    linkedArticle: true,
                    syntax: '{{subst:hoan nghênh2|$USERNAME$|art=$ARTICLE$}} ~~~~',
                },
                'hoan nghênh3': {
                    description: 'hoan nghênh thành viên mới',
                    linkedArticle: true,
                    syntax: '{{subst:hoan nghênh3|$USERNAME$|art=$ARTICLE$}} ~~~~',
                },
                'hoan nghênh4': {
                    description: 'hoan nghênh thành viên mới',
                    linkedArticle: true,
                    syntax: '{{subst:hoan nghênh4|$USERNAME$|art=$ARTICLE$}} ~~~~',
                },
                'hoan nghênh5': {
                    description: 'hoan nghênh thành viên mới',
                    linkedArticle: true,
                    syntax: '{{subst:hoan nghênh5|$USERNAME$|art=$ARTICLE$}} ~~~~',
                },
                'hoan nghênh6': {
                    description: 'hoan nghênh thành viên mới',
                    linkedArticle: true,
                    syntax: '{{subst:hoan nghênh6|$USERNAME$|art=$ARTICLE$}} ~~~~',
                },
                'hoan nghênh7': {
                    description: 'hoan nghênh thành viên mới',
                    linkedArticle: true,
                    syntax: '{{subst:hoan nghênh7|$USERNAME$|art=$ARTICLE$}} ~~~~',
                },
                'hoan nghênh8': {
                    description: 'hoan nghênh thành viên mới',
                    linkedArticle: true,
                    syntax: '{{subst:hoan nghênh8|$USERNAME$|art=$ARTICLE$}} ~~~~',
                },
                'hoan nghênh12': {
                    description: 'hoan nghênh thành viên mới',
                    linkedArticle: true,
                    syntax: '{{subst:hoan nghênh12|$USERNAME$|art=$ARTICLE$}} ~~~~',
                },
                'hoan nghênh của Băng Tỏa': {
                    description: 'hoan nghênh thành viên mới (của thành viên Băng Tỏa)',
                    linkedArticle: true,
                    syntax: '{{subst:Thành viên:Băng Tỏa/Welcome|$USERNAME$|art=$ARTICLE$}} ~~~~',
                },
                'chào mừng thành viên mới': {
                    description: 'chào mừng thành viên mới',
                    linkedArticle: true,
                    syntax: '{{subst:chào mừng thành viên mới|$USERNAME$|art=$ARTICLE$}}~~~~',
                },
                'hoan nghênh phá hoại': {
                    description: 'hoan nghênh thành viên có chỉnh sửa phá hoại',
                    linkedArticle: true,
                    syntax: '{{subst:hoan nghênh-phá hoại|$USERNAME$|art=$ARTICLE$}}~~~~',
                },
            },
        },

        anonymous: {
            'Bản mẫu hoan nghênh thành viên vô danh (IP)': {
                'hoan nghênh vô danh': {
                    description: 'cho người dùng vô danh; khuyến khích tạo tài khoản',
                    linkedArticle: true,
                    syntax: '{{subst:welcome-anon|art=$ARTICLE$}} ~~~~',
                },
                'hoan nghênh vô danh nghịch thử': {
                    description: 'cho người dùng vô danh đã thực hiện các chỉnh sửa thử nghiệm',
                    linkedArticle: true,
                    syntax: '{{subst:welcome-anon-test|$ARTICLE$|$USERNAME$}} ~~~~',
                },
                'hoan nghênh vô danh thiếu tính xây dựng': {
                    description: 'cho người dùng vô danh đã phá hoại hoặc chỉnh sửa không hữu ích',
                    linkedArticle: true,
                    syntax: '{{subst:welcome-anon-unconstructive|$ARTICLE$|$USERNAME$}}',
                },
                'hoan nghênh vô danh có tính xây dựng': {
                    description: 'cho người dùng vô danh chống phá hoại hoặc chỉnh sửa mang tính xây dựng',
                    linkedArticle: true,
                    syntax: '{{subst:welcome-anon-constructive|art=$ARTICLE$}}',
                },
                'hoan nghênh vô danh đã xóa nội dung': {
                    description: 'cho người dùng vô danh đã xóa nội dung khỏi trang',
                    linkedArticle: true,
                    syntax: '{{subst:welcome-anon-delete|$ARTICLE$|$USERNAME$}} ~~~~',
                },
                'cảm ơn IP': {
                    description: 'cảm ơn IP đã đóng góp và khuyến khích tạo tài khoản',
                    linkedArticle: true,
                    syntax: '{{subst:cảm ơn IP|$ARTICLE$|$USERNAME$}}~~~~',
                },
            },
        },

        nonVietnamese: {
            'Bản mẫu hoan nghênh không phải tiếng Việt': {
                'welcome-en': {
                    description: 'chào mừng người dùng có ngôn ngữ mẹ đẻ không phải tiếng Việt (tiếng Anh)',
                    syntax: '{{subst:welcome-en}}',
                },
            },
        },
    };

    static getTemplateWikitext(type, template, article) {
        // Phải duyệt qua vì type=standard có nhiều nhóm
        var properties;
        $.each(Welcome.templates[type], function (label, templates) {
            properties = templates[template];
            if (properties) {
                return false; // break
            }
        });
        if (properties) {
            return properties.syntax
                .replace('$USERNAME$', getPref('insertUsername') ? mw.config.get('wgUserName') : '')
                .replace('$ARTICLE$', article ? article : '')
                .replace(/\$HEADER\$\s*/, '== Hoan nghênh đến với Wikipedia ==\n\n')
                .replace('$EXTRA$', ''); // EXTRA chưa được hỗ trợ
        }
        return (
            '{{subst:' +
            template +
            (article ? '|art=' + article : '') +
            '}}' +
            (getPref('customWelcomeSignature') ? ' ~~~~' : '')
        );
    }

    static callbacks = {
        preview: function (form) {
            var previewDialog = new Morebits.simpleWindow(750, 400);
            previewDialog.setTitle('Xem trước bản mẫu hoan nghênh');
            previewDialog.setScriptName('Hoan nghênh thành viên');
            previewDialog.setModality(true);

            var previewdiv = document.createElement('div');
            previewdiv.style.marginLeft = previewdiv.style.marginRight = '0.5em';
            previewdiv.style.fontSize = 'small';
            previewDialog.setContent(previewdiv);

            var previewer = new Morebits.wiki.preview(previewdiv);
            var input = Morebits.quickForm.getInputData(form);
            previewer.beginRender(
                Welcome.getTemplateWikitext(input.type, input.template, input.article),
                'User talk:' + mw.config.get('wgRelevantUserName')
            ); // Bắt buộc dùng wikitext và tên thành viên đúng

            var submit = document.createElement('input');
            submit.setAttribute('type', 'submit');
            submit.setAttribute('value', 'Đóng');
            previewDialog.addContent(submit);

            previewDialog.display();

            $(submit).click(function () {
                previewDialog.close();
            });
        },
        main: function (pageobj) {
            var params = pageobj.getCallbackParameters();
            var text = pageobj.getPageText();

            // Hủy nếu chế độ auto và trang đã có nội dung
            if (pageobj.exists() && params.mode === 'auto') {
                Morebits.status.info('Cảnh báo', 'Trang thảo luận của thành viên không trống; hủy bỏ hoan nghênh tự động');
                Morebits.wiki.actionCompleted.event();
                return;
            }

            var welcomeText = Welcome.getTemplateWikitext(params.type, params.template, params.article);

            if (getPref('topWelcomes')) {
                text = welcomeText + '\n\n' + text;
            } else {
                text += '\n' + welcomeText;
            }

            var summaryText = 'Hoan nghênh đến với Wikipedia!';
            pageobj.setPageText(text);
            pageobj.setEditSummary(summaryText);
            pageobj.setChangeTags(Twinkle.changeTags);
            pageobj.setWatchlist(getPref('watchWelcomes'));
            pageobj.setCreateOption('recreate');
            pageobj.save();
        },
    };

    static evaluate(e) {
        var form = e.target;

        var params = Morebits.quickForm.getInputData(form); // : type, template, article
        params.mode = 'manual';

        Morebits.simpleWindow.setButtonsEnabled(false);
        Morebits.status.init(form);

        var userTalkPage = mw.config.get('wgFormattedNamespaces')[3] + ':' + mw.config.get('wgRelevantUserName');
        Morebits.wiki.actionCompleted.redirect = userTalkPage;
        Morebits.wiki.actionCompleted.notice = 'Hoan nghênh hoàn tất, tải lại trang thảo luận sau vài giây';

        var wikipedia_page = new Morebits.wiki.page(userTalkPage, 'Sửa đổi trang thảo luận của thành viên');
        wikipedia_page.setFollowRedirect(true);
        wikipedia_page.setCallbackParameters(params);
        wikipedia_page.load(Welcome.callbacks.main);
    }

    static userPreferences() {
        return {
            title: 'Hoan nghênh (Welcome)',
            preferences: [
                // TwinkleConfig.topWelcomes (boolean)
                // Có chèn bản mẫu chào mừng vào đầu trang hay không
                {
                    name: 'topWelcomes',
                    label: 'Thêm bản mẫu hoan nghênh vào đầu trang thảo luận thành viên (thay vì cuối trang)',
                    type: 'boolean',
                    default: false,
                } as Preference,

                // TwinkleConfig.watchWelcomes (string)
                // Thời gian theo dõi trang thảo luận sau khi hoan nghênh
                {
                    name: 'watchWelcomes',
                    label: 'Thêm trang thảo luận thành viên vào danh sách theo dõi khi hoan nghênh',
                    helptip: 'Chọn "Không bao giờ" để không theo dõi. "Mặc định" sẽ dùng cài đặt theo dõi của tài khoản.',
                    type: 'enum',
                    enumValues: Config.watchlistEnums,
                    default: '3 months',
                } as Preference,

                // TwinkleConfig.insertUsername (boolean)
                // Có chèn tên thành viên vào tham số $USERNAME$ không
                {
                    name: 'insertUsername',
                    label: 'Chèn tên thành viên của bạn vào bản mẫu hoan nghênh',
                    helptip: 'Một số bản mẫu hỗ trợ tham số tên thành viên để cá nhân hóa lời hoan nghênh.',
                    type: 'boolean',
                    default: true,
                } as Preference,

                // TwinkleConfig.quickWelcomeMode (string)
                // Chế độ click link [chào mừng] trên trang diff
                {
                    name: 'quickWelcomeMode',
                    label: 'Khi nhấp vào [chào mừng] trên trang so sánh, hoan nghênh thành viên',
                    type: 'enum',
                    enumValues: { auto: 'Tự động (không hiện hộp thoại)', norm: 'Thủ công (mở hộp thoại)' },
                    default: 'norm',
                } as Preference,

                // TwinkleConfig.quickWelcomeTemplate (string)
                // Bản mẫu dùng cho auto-welcome
                {
                    name: 'quickWelcomeTemplate',
                    label: 'Bản mẫu dùng để hoan nghênh tự động',
                    helptip: 'Chỉ áp dụng khi chế độ hoan nghênh tự động được chọn ở trên. Nhập tên bản mẫu không có tiền tố {{subst:}}.',
                    type: 'string',
                    default: 'hoan nghênh2',
                } as Preference,

                // TwinkleConfig.customWelcomeList (customList)
                // Danh sách bản mẫu hoan nghênh tùy chỉnh
                {
                    name: 'customWelcomeList',
                    label: 'Danh sách bản mẫu hoan nghênh tùy chỉnh',
                    helptip: 'Bạn có thể thêm các bản mẫu hoan nghênh không có sẵn trong danh sách mặc định. Giá trị (value) là tên bản mẫu; nhãn (label) là mô tả hiển thị.',
                    type: 'customList',
                    default: [],
                } as Preference,

                // TwinkleConfig.customWelcomeSignature (boolean)
                // Có thêm ~~~~ vào bản mẫu không có trong danh sách không
                {
                    name: 'customWelcomeSignature',
                    label: 'Tự động thêm chữ ký (~~~~) khi dùng bản mẫu tùy chỉnh không có trong danh sách',
                    type: 'boolean',
                    default: true,
                } as Preference,
            ],
        };
    }
}
