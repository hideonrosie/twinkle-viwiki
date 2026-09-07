import { NS_MAIN, ProtectCore } from './core';
import { hatnoteRegex } from './common';

export class Protect extends ProtectCore {
	requestPageName = 'Wikipedia:Yêu cầu khóa hay mở khóa trang';

	footerlinks = {
		'Bản mẫu khóa': 'Bản mẫu:Khóa trang',
		'Quy định khóa trang': 'WP:KHOA',
		'Tùy chọn khóa': 'WP:TW/PREF#protect',
		'Trợ giúp Twinkle': 'WP:TW/DOC#protect',
		'Báo cáo lỗi TWV3': 'Thảo luận Wikipedia:Twinkle/TwinkleV3',
	};

    getProtectionLevels() {
		return $.extend(true, super.getProtectionLevels(), {
            autoconfirmed: {
                label: 'Thành viên tự xác nhận',
                weight: 10,
                types: ['edit', 'move', 'create'],
                applicable: (type: string) => !(type === 'create' && mw.config.get('wgNamespaceNumber') === NS_MAIN),
            },
			extendedconfirmed: {
				label: 'Thành viên được xác nhận mở rộng',
				weight: 20,
				types: ['edit', 'move', 'create'],
			},
            autopatrolled: {
                label: 'Người tự đánh dấu tuần tra',
                weight: 25,
                types: ['edit', 'move', 'create'],
            },
			templateeditor: {
				label: 'Kỹ thuật viên bản mẫu',
				weight: 30,
				applicable: this.isTemplate,
    				types: ['edit', 'move'],
			},
            sysop: {
                label: 'Bảo quản viên',
                weight: 40,
                types: ['edit', 'move', 'create'],
			},
		});
	}

	existingTagRegex =
		/\s*(?:<noinclude>)?\s*\{\{\s*(?:pp-[^{}]*?|protected|(?:t|v|s|p-|usertalk-v|usertalk-s|sb|move)protected(?:2)?|protected template|privacy protection)\s*?\}\}\s*(?:<\/noinclude>)?\s*/gi;

	disableTaggingOnRedirectTemplateRegex =
		/{{(?:redr|this is a redirect|r(?:edirect)?(?:.?cat.*)?[ _]?sh)/i;

	insertTagIntoPage(text: string, tag: string): string {
		return new Morebits.wikitext.page(text)
			.insertAfterTemplates(tag, hatnoteRegex)
			.getText();
	}

	existingRequestRegex = new RegExp(
		'===\\s*(\\[\\[)?\\s*:?\\s*' +
			Morebits.string.escapeRegExp(Morebits.pageNameNorm) +
			'\\s*(\\]\\])?\\s*===',
		'm'
	);
    
	
    getProtectionPresets(): quickFormElementData[] {
        return [
            { label: 'Không khóa', value: 'unprotect' },
            {
                label: 'Khóa hẳn (khóa hoàn toàn)',
                list: [
                    { label: 'Chung (khóa hẳn)', value: 'pp-protected' },
                    {
                        label: 'Tranh chấp nội dung/bút chiến (hoàn toàn)',
                        value: 'pp-dispute',
                        reason: '[[Wikipedia:KT#Tranh cãi về nội dung|Bút chiến thiếu tính xây dựng]]',
                    },
                    {
                        label: 'Phá hoại dai dẳng (hoàn toàn)',
                        value: 'pp-vandalism',
                        reason: 'Thường xuyên bị [[Wikipedia:Phá hoại|phá hoại]]',
                    },
                    {
                        label: 'Trang Thảo luận Thành viên của thành viên bị cấm (khóa hẳn)',
                        value: 'pp-usertalk',
                        reason:
                            '[[Wikipedia:Quy định khóa trang#Khóa trang thảo luận|Sử dụng trang thảo luận thành viên sai mục đích trong thời gian bị cấm]]',
                    },
                ],
            },
            {
                label: 'Khóa bản mẫu',
                list: [
                    {
                        label: 'Bản mẫu hay mô đun được sử dụng rất nhiều',
                        value: 'pp-template',
                        reason: '[[Wikipedia:Quy định khóa trang#Khóa bản mẫu|Bản mẫu hay mô đun được sử dụng rất nhiều]]',
                    },
                ],
            },
            {
                label: 'Khóa xác nhận mở rộng (khóa 30-500)',
                list: [
                    {
                        label: 'Phá hoại dai dẳng',
                        selected: true,
                        value: 'pp-30-500-vandalism',
                        reason: 'Thường xuyên bị [[Wikipedia:Phá hoại|phá hoại]]',
                    },
                    {
                        label: 'Sửa đổi gây hại',
                        value: 'pp-30-500-disruptive',
                        reason: 'Thường xuyên bị [[Wikipedia:Sửa đổi phá hoại|sửa đổi gây hại]]',
                    },
                    {
                        label: 'Vi phạm quy định về tiểu sử người còn sống (TSNĐS)',
                        value: 'pp-30-500-blp',
                        reason: 'Liên tục vi phạm [[Wikipedia:Tiểu sử người đang sống|quy định về tiểu sử người đang sống]]',
                    },
                    {
                        label: 'Thường xuyên bị tài khoản con rối sửa đổi',
                        value: 'pp-30-500-sock',
                        reason: 'Thường xuyên bị [[Wikipedia:Tài khoản con rối|tài khoản con rối]] sửa',
                    },
                ],
            },
            {
                label: 'Bán khóa',
                list: [
                    {
                        label: 'Chung (bán khóa)',
                        value: 'pp-semi-protected',
                    },
                    {
                        label: 'Phá hoại dai dẳng (bán khóa)',
                        selected: true,
                        value: 'pp-semi-vandalism',
                        reason: 'Thường xuyên bị [[Wikipedia:Phá hoại|phá hoại]]',
                    },
                    {
                        label: 'Sửa đổi phá hoại (bán khóa)',
                        value: 'pp-semi-disruptive',
                        reason: 'Thường xuyên bị [[Wikipedia:Sửa đổi phá hoại|sửa đổi gây hại]]',
                    },
                    {
                        label: 'Thêm nội dung không nguồn (bán khóa)',
                        value: 'pp-semi-unsourced',
                        reason:
                            'Thêm [[Wikipedia:Thông tin kiểm chứng được|nội dung không nguồn hoặc nguồn yếu]]',
                    },
                    {
                        label: 'Vi phạm quy định về tiểu sử người còn sống (TSNĐS) (bán khóa)',
                        value: 'pp-semi-blp',
                        reason: 'Vi phạm về [[Wikipedia:Tiểu sử người đang sống|quy định vềtiểu sử người đang sống]]',
                    },
                    {
                        label: 'Con rối (bán khóa)',
                        value: 'pp-semi-sock',
                        reason: 'Thường xuyên bị [[Wikipedia:Tài khoản con rối|tài khoản rối]] sửa',
                    },
                    {
                        label: 'Trang Thảo luận Thành viên của thành viên bị cấm (bán khóa)',
                        value: 'pp-semi-usertalk',
                        reason: '[[Wikipedia:Quy định khóa trang#Khóa trang thảo luận|Sử dụng trang thảo luận thành viên sai mục đích trong thời gian bị cấm]]',
                    },
                ],
            },
            {
                label: 'Khóa di chuyển trang',
                list: [
                    {
                        label: 'Khóa di chuyển (chung)',
                        value: 'pp-move',
                    },
                    {
                        label: 'Tranh chấp di chuyển trang (di chuyển)',
                        value: 'pp-move-dispute',
                        reason: '[[Wikipedia:Quy định khóa trang#Khóa khả năng di chuyển|Có tranh chấp về di chuyển trang]]',
                    },
                    {
                        label: 'Phá hoại di chuyển trang',
                        value: 'pp-move-vandalism',
                        reason: 'Thường xuyên bị [[Wikipedia:Quy định khóa trang#Khóa khả năng di chuyển|phá hoại di chuyển trang]]',
                    },
                    {
                        label: 'Trang quan trọng có nhiều người xem (di chuyển)',
                        value: 'pp-move-indef',
                        reason: '[[Wikipedia:Quy định khóa trang#Khóa khả năng di chuyển|Trang quan trọng có nhiều người xem]]',
                    },
                ],
            },
        ].filter((type) => {
            return this.isTemplate || type.label !== 'Khóa bản mẫu';
        });
    }

    getCreateProtectionPresets(): quickFormElementData[] {
        return [
            { label: 'Không khóa', value: 'unprotect' },
            {
                label: 'Khóa khởi tạo',
                list: [
                    {
                        label: 'Chung (lý do tùy chỉnh)',
                        value: 'pp-create',
                    },
                    {
                        label: 'Tựa đề mang tính chất xúc phạm',
                        value: 'pp-create-offensive',
                    },
                    {
                        label: 'Liên tục tạo lại trang đã xóa',
                        selected: true,
                        value: 'pp-create-salt',
                    },
                    {
                        label: 'Tiểu sử người còn sống (TSNĐS) đã xóa gần đây',
                        value: 'pp-create-blp',
                    },
                ],
            },
        ];
    }

    // LƯU Ý: Lý do nên được đồng bộ với [[MediaWiki:Protect-dropdown]]
	protectionPresetsInfo = {
        'pp-protected': {
            edit: 'sysop',
            move: 'sysop',
            reason: undefined,
        },
        'pp-dispute': {
            edit: 'sysop',
            move: 'sysop',
            reason: '[[Wikipedia:KT#Tranh cãi về nội dung|Bút chiến thiếu tính xây dựng]]',
        },
        'pp-vandalism': {
            edit: 'sysop',
            move: 'sysop',
            reason: 'Thường xuyên bị [[Wikipedia:Phá hoại|phá hoại]]',
        },
        'pp-usertalk': {
            edit: 'sysop',
            move: 'sysop',
            expiry: 'infinity',
            reason: '[[Wikipedia:Quy định khóa trang#Khóa trang thảo luận|Sử dụng trang thảo luận thành viên sai mục đích trong thời gian bị cấm]]',
        },

        'pp-template': {
            edit: 'templateeditor',
            move: 'templateeditor',
            expiry: 'infinity',
            reason: '[[Wikipedia:Quy định khóa trang#Khóa bản mẫu|Bản mẫu hay mô đun được sử dụng rất nhiều]]',
        },

        'pp-30-500-vandalism': {
            edit: 'extendedconfirmed',
            move: 'extendedconfirmed',
            reason: 'Thường xuyên bị [[Wikipedia:Phá hoại|phá hoại]]',
            template: 'pp-30-500',
        },
        'pp-30-500-disruptive': {
            edit: 'extendedconfirmed',
            move: 'extendedconfirmed',
            reason: 'Thường xuyên bị [[Wikipedia:Sửa đổi phá hoại|sửa đổi gây hại]]',
            template: 'pp-30-500',
        },
        'pp-30-500-blp': {
            edit: 'extendedconfirmed',
            move: 'extendedconfirmed',
            reason: 'Vi phạm [[Wikipedia:Tiểu sử người đang sống|quy định về tiểu sử người đang sống]]',
            template: 'pp-30-500',
        },
        'pp-30-500-sock': {
            edit: 'extendedconfirmed',
            move: 'extendedconfirmed',
            reason: 'Thường xuyên bị [[Wikipedia:Tài khoản con rối|tài khoản rối]] sửa',
            template: 'pp-30-500',
        },

        'pp-semi-vandalism': {
            edit: 'autoconfirmed',
            reason: 'Thường xuyên bị [[Wikipedia:Phá hoại|phá hoại]]',
            template: 'pp-vandalism',
        },
        'pp-semi-disruptive': {
            edit: 'autoconfirmed',
            reason: 'Thường xuyên bị [[Wikipedia:Sửa đổi phá hoại|sửa đổi gây hại]]',
            template: 'pp-protected',
        },
        'pp-semi-unsourced': {
            edit: 'autoconfirmed',
            reason:
                'Thêm [[Wikipedia:Thông tin kiểm chứng được|nội dung không nguồn hoặc nguồn yếu]]',
            template: 'pp-protected',
        },
        'pp-semi-blp': {
            edit: 'autoconfirmed',
            reason:
                'Vi phạm quy định về [[Wikipedia:Tiểu sử người đang sống|tiểu sử người đang sống]]',
            template: 'pp-blp',
        },
        'pp-semi-usertalk': {
            edit: 'autoconfirmed',
            move: 'autoconfirmed',
            expiry: 'infinity',
            reason:
                '[[Wikipedia:Quy định khóa trang#Khóa trang thảo luận|Sử dụng trang thảo luận của người dùng không phù hợp khi bị cấm]]',
            template: 'pp-usertalk',
        },

        // Không hiển thị trong selector hiện tại.
        'pp-semi-template': {
            edit: 'autoconfirmed',
            move: 'autoconfirmed',
            expiry: 'infinity',
            reason: '[[Wikipedia:Quy định khóa trang#Khóa bản mẫu|Bản mẫu hay mô đun được sử dụng rất nhiều]]',
            template: 'pp-template',
        },

        'pp-semi-sock': {
            edit: 'autoconfirmed',
            reason: 'Thường xuyên bị [[Wikipedia:Tài khoản con rối|tài khoản rối]] sửa',
            template: 'pp-sock',
        },
        'pp-semi-protected': {
            edit: 'autoconfirmed',
            reason: undefined,
            template: 'pp-protected',
        },

        'pp-move': {
            move: 'sysop',
            reason: undefined,
        },
        'pp-move-dispute': {
            move: 'sysop',
            reason: '[[Wikipedia:Quy định khóa trang#Khóa di chuyển trang|Tranh chấp di chuyển trang]]',
        },
        'pp-move-vandalism': {
            move: 'sysop',
            reason: '[[Wikipedia:Quy định khóa trang#Khóa di chuyển trang|Phá hoại di chuyển trang]]',
        },
        'pp-move-indef': {
            move: 'sysop',
            expiry: 'infinity',
            reason: '[[Wikipedia:Quy định khóa trang#Khóa di chuyển trang|Trang quan trọng có nhiều người xem]]',
        },

        'unprotect': {
            edit: 'all',
            move: 'all',
            stabilize: 'none',
            create: 'all',
            reason: undefined,
            template: 'none',
        },

        'pp-create-offensive': {
            create: 'sysop',
            reason: '[[Wikipedia:Quy định khóa trang#Khóa khởi tạo|Tên xúc phạm]]',
        },
        'pp-create-salt': {
            create: 'extendedconfirmed',
            reason: '[[Wikipedia:Quy định khóa trang#Khóa khởi tạo|Tạo lại nội dung nhiều lần]]',
        },
        'pp-create-blp': {
            create: 'extendedconfirmed',
            reason:
                '[[Wikipedia:Tiểu sử người đang sống#Xóa trang|Tiểu sử người đang sống đã bị xóa gần đây]]',
        },
        'pp-create': {
            create: 'extendedconfirmed',
            reason: '{{pp-create}}',
        },
    };

	protectionTags = [
        {
            label: 'Không có bản mẫu (xóa các bản mẫu khóa hiện có)',
            value: 'none',
        },
        {
            label: 'Không bản mẫu (không xóa các bản mẫu khóa hiện có)',
            value: 'noop',
        },
        {
            label: 'Sửa đổi các bản mẫu khóa',
            list: [
                {
                    label: '{{pp-vandalism}}: phá hoại',
                    value: 'pp-vandalism',
                },
                {
                    label: '{{pp-dispute}}: tranh chấp nội dung/bút chiến',
                    value: 'pp-dispute',
                },
                {
                    label: '{{pp-blp}}: Vi phạm quy định về tiểu sử người còn sống (TSNĐS)',
                    value: 'pp-blp',
                },
                {
                    label: '{{pp-sock}}: Thường xuyên bị tài khoản con rối sửa đổi',
                    value: 'pp-sock',
                },
                {
                    label: '{{pp-template}}: Bản mẫu có rủi ro cao bị phá hoại',
                    value: 'pp-template',
                },
                {
                    label: '{{pp-usertalk}}: Trang thảo luận của thành viên bị cấm',
                    value: 'pp-usertalk',
                },
                {
                    label: '{{pp-protected}}: khóa chung',
                    value: 'pp-protected',
                },
                {
                    label: '{{pp-semi-indef}}: bán khóa chung dài hạn',
                    value: 'pp-semi-indef',
                },
                {
                    label: '{{pp-30-500}}: khóa xác nhận mở rộng',
                    value: 'pp-30-500',
                },
            ],
        },
        {
            label: 'Các bản mẫu khóa di chuyển trang',
            list: [
                {
                    label: '{{pp-move-dispute}}: Tranh chấp di chuyển trang',
                    value: 'pp-move-dispute',
                },
                {
                    label: '{{pp-move-vandalism}}: Phá hoại di chuyển trang',
                    value: 'pp-move-vandalism',
                },
                {
                    label: '{{pp-move-indef}}: Khóa di chuyển trang vô hạn hạn - chung',
                    value: 'pp-move-indef',
                },
                {
                    label: '{{pp-move}}: Khác',
                    value: 'pp-move',
                },
            ],
        },
    ];
}