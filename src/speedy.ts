import { SpeedyCore, criterion } from './core';
import { hatnoteRegex } from './common';

export class Speedy extends SpeedyCore {
	footerlinks = {
		'Quy định xóa nhanh': 'WP:XN',
		'Cấu hình Xóa nhanh': 'WP:TW/PREF#speedy',
		'Trợ giúp Twinkle': 'WP:TW/DOC#xóa_nhanh',
        'Báo cáo lỗi TWV3': 'Thảo luận Wikipedia:Twinkle/TwinkleV3',
	};

    addMenu() {
        if (mw.config.get('wgNamespaceNumber') === -1) {
            return;
        }
        super.addMenu();
    }
    
    preprocessParamInputs() {
        let params = this.params;

        if (params.banned_user) {
            params.banned_user = params.banned_user.replace(
                /^\s*(?:User|Thành viên):/i,
                ''
            );
        }

        if (params.redundantimage_filename) {
            params.redundantimage_filename =
            new mw.Title(params.redundantimage_filename, 6).toText();
        }

        if (
            params.commons_filename &&
            params.commons_filename !== Morebits.pageNameNorm
        ) {
            params.commons_filename =
                new mw.Title(params.commons_filename, 6).toText();
        }
    }
    validateInputs(): string | void {
        const input = this.params;
        const csd = new Set(input.csd);

        // C4: Trang tạo lại của một trang bị xóa theo biểu quyết
        if (
            csd.has('repost') &&
            input.repost_xfd &&
            !/^(?:wp|wikipedia):/i.test(input.repost_xfd)
        ) {
            return 'XN C4: Tên trang biểu quyết xóa bài, nếu được cung cấp, phải bắt đầu bằng tiền tố "Wikipedia:".';
        }

        // C6: Xóa kết quả của theo biểu quyết xóa bài (BQXB)
        if (
            csd.has('xfd') &&
            input.xfd_fullvotepage &&
            !/^(?:wp|wikipedia):/i.test(input.xfd_fullvotepage)
        ) {
            return 'XN C6 (BQXB): Tên trang biểu quyết xóa bài, nếu được cung cấp, phải bắt đầu bằng tiền tố "Wikipedia:".';
        }

        // TT9: Vi phạm bản quyền hình ảnh
        if (
            csd.has('imgcopyvio') &&
            !input.imgcopyvio_url &&
            !input.imgcopyvio_rationale
        ) {
            return 'XN TT9: Bạn phải nhập URL hoặc lý do (hoặc cả hai) khi đề nghị xóa tệp theo TT9.';
        }
    }

	insertTagText(code: string, pageText: string) {
		const wikipage = new Morebits.wikitext.page(pageText);

		return wikipage
			.insertAfterTemplates(code + '\n', hatnoteRegex)
			.getText();
	}

    criteriaLists: Array<{ label: string; visible: (self: SpeedyCore) => boolean; list: Array<criterion> }> = [
        {
            label: 'Tiêu chí tùy chọn',
            visible: (self) => !self.mode.isMultiple,
            list: [
                {
                    label: 'Tiêu chí tùy chọn' + (
                        Morebits.userIsSysop || Morebits.userIsInGroup('eliminator')
                            ? ' (lý do xóa tùy chọn)'
                            : ' sử dụng bản mẫu {{db}}'
                    ),
                    value: 'reason',
                    code: 'db',
                    tooltip:
                        'Tên bản mẫu {{db}} là viết tắt của "xóa bởi vì" (delete because). ' +
                        'Trang sắp bị xóa phải được áp dụng tối thiểu một trong các tiêu chí xóa nhanh với lý do hợp lý. ' +
                        'Lưu ý đây không phải là tiêu chí "chung cho tất cả trường hợp" khi bạn không thể tìm thấy bất kỳ tiêu chí xóa nhanh nào phù hợp.',
                    subgroup: {
                        name: 'reason_1',
                        parameter: '1',
                        type: 'input',
                        label: 'Lý do: ',
                        size: 60,
                    },
                    hideWhenMultiple: true,
                },
            ],
        },

        {
            label: 'Trang thảo luận',
            visible: (self) => self.namespace % 2 === 1 && self.namespace !== 3,
            list: [
                {
                    label: 'C8: Các trang thảo luận không có trang chủ đề tương ứng',
                    value: 'talk',
                    code: 'c8',
                    tooltip:
                        'Tiêu chí này không bao gồm bất kỳ trang nào hữu ích cho dự án - ' +
                        'cụ thể là các trang thảo luận của thành viên, trang lưu trữ trang thảo luận ' +
                        'và các trang thảo luận của các tập tin đang tồn tại ở Wikimedia Commons.',
                },
            ],
        },

        {
            label: 'Tập tin',
            visible: (self) => !self.isRedirect && [6, 7].indexOf(self.namespace) !== -1,
            list: [
                {
                    label: 'TT1: Tập tin dư thừa',
                    value: 'redundantimage',
                    code: 'tt1',
                    tooltip:
                        'Bất kỳ tập tin nào là bản sao dư thừa, ở cùng một định dạng tập tin và cùng độ phân giải hoặc thấp hơn, ' +
                        'của một tập tin khác trên Wikipedia. Tương tự như vậy, các phương tiện khác là bản sao dự phòng, ' +
                        'có cùng định dạng và chất lượng tương đương hoặc thấp hơn.',
                    subgroup: {
                        name: 'redundantimage_filename',
                        parameter: 'filename',
                        type: 'input',
                        label: 'Tập tin dư thừa là vì: ',
                        tooltip: 'Tiến tố "Tập tin:" có thể bỏ qua.',
                    },
                },
                {
                    label: 'TT2: Tập tin bị hỏng, thất lạc hoặc trống',
                    value: 'noimage',
                    code: 'tt2',
                    tooltip:
                        'Trước khi xóa loại tập tin này, hãy xác minh rằng phần mềm MediaWiki không thể đọc tập tin bằng cách xem trước ' +
                        'hình thu nhỏ đã thay đổi kích thước của tập tin. Điều này cũng bao gồm các trang mô tả tập tin trống.',
                },
                {
                    label: 'TT3: Giấy phép không phù hợp',
                    value: 'noncom',
                    code: 'tt3',
                    tooltip:
                        'Các tập tin được cấp phép là "chỉ sử dụng cho mục đích phi thương mại", "sử dụng phi phái sinh" ' +
                        'hoặc "được sử dụng với sự cho phép" đã được tải lên vào hoặc sau ngày 5 tháng 5 năm 2005, ' +
                        'ngoại trừ trường hợp chúng được chứng minh là tuân thủ các tiêu chuẩn hạn chế cho sử dụng nội dung không miễn phí.',
                },
                {
                    label: 'TT4: Thiếu thông tin cấp phép',
                    value: 'unksource',
                    code: 'tt4',
                    tooltip:
                        'Các tập tin trong các danh mục nguồn không xác định, trạng thái bản quyền không xác định hoặc không có thẻ bản quyền ' +
                        'đã được gắn thẻ bằng mẫu đặt chúng trong danh mục hơn 7 ngày.',
                    hideWhenUser: true,
                },
                {
                    label: 'TT5: Tập tin không tự do nhưng không được sử dụng',
                    value: 'tt5',
                    code: 'tt5',
                    tooltip:
                        'Các tập tin không theo giấy phép tự do hoặc trong phạm vi công cộng không được sử dụng trong bất kỳ bài viết nào, ' +
                        'mà mục đích sử dụng duy nhất là trong một bài viết đã bị xóa và rất ít có khả năng được sử dụng trên bất kỳ bài viết nào khác.',
                    hideWhenUser: true,
                },
                {
                    label: 'TT6: Thiếu lý do sử dụng hợp lý với tập tin không tự do',
                    value: 'norat',
                    code: 'tt6',
                    tooltip:
                        'Bất kỳ tập tin nào không có lý do sử dụng hợp lý có thể bị xóa sau 7 ngày kể từ khi tải lên.',
                    hideWhenUser: true,
                },
                {
                    label: 'TT7: Yêu cầu sử dụng hợp lý không hợp lệ',
                    value: 'badfairuse',
                    code: 'tt7',
                    tooltip:
                        'Tiêu chí này chỉ áp dụng cho các tập tin có thẻ sử dụng hợp pháp rõ ràng không hợp lệ.',
                    subgroup: {
                        name: 'badfairuse_rationale',
                        type: 'input',
                        label: 'Lý do tùy chọn: ',
                        size: 60,
                    },
                },
                {
                    label: 'TT8: Các hình ảnh có sẵn dưới dạng các bản sao giống hệt nhau ở Wikimedia Commons',
                    value: 'commons',
                    code: 'tt8',
                    tooltip:
                        'Các điều kiện của TT8 phải được đáp ứng đầy đủ trước khi xóa tập tin.',
                    subgroup: {
                        name: 'commons_filename',
                        parameter: 'filename',
                        type: 'input',
                        label: 'Tập tin ở Commons: ',
                        value: Morebits.pageNameNorm,
                        tooltip:
                            'Có thể để trống nếu tập tin có cùng tên trên Commons. Tiền tố "File:" hoặc "Tập tin:" là tùy chọn.',
                    },
                    hideWhenMultiple: true,
                },
                {
                    label: 'TT9: Rõ ràng vi phạm bản quyền',
                    value: 'imgcopyvio',
                    code: 'tt9',
                    tooltip:
                        'Tập tin được sao chép từ một trang web hoặc nguồn khác không có giấy phép tương thích với Wikipedia ' +
                        'và người tải lên không tuyên bố sử dụng hợp pháp cũng không đưa ra lời khẳng định đáng tin cậy về việc cho phép sử dụng tự do.',
                    subgroup: [
                        {
                            name: 'imgcopyvio_url',
                            parameter: 'url',
                            type: 'input',
                            label: 'URL vi phạm bản quyền, bao gồm "http://": ',
                            size: 60,
                        },
                        {
                            name: 'imgcopyvio_rationale',
                            parameter: 'rationale',
                            type: 'input',
                            label: 'Lý do của việc xóa tập tin vi phạm không có mặt ở Internet: ',
                            size: 60,
                        },
                    ],
                },
                {
                    label: 'TT10: Tập tin không phải phương tiện và không hữu ích',
                    value: 'badfiletype',
                    code: 'tt10',
                    tooltip:
                        'Các tập tin đã tải lên không phải là tập tin hình ảnh, âm thanh hoặc video ' +
                        'không được sử dụng trong bất kỳ bài viết nào và không có mục đích sử dụng bách khoa.',
                },
                {
                    label: 'TT11: Không có bằng chứng về việc cho phép sử dụng',
                    value: 'nopermission',
                    code: 'tt11',
                    tooltip:
                        'Nếu người tải lên chỉ định bên thứ ba là người giữ nguồn/bản quyền mà không cung cấp bằng chứng ' +
                        'cho thấy bên thứ ba này thực tế đã đồng ý, tập tin có thể bị xóa sau 7 ngày kể từ khi thông báo.',
                    hideWhenUser: true,
                },
            ],
        },

        {
            label: 'Bài viết',
            visible: (self) => !self.isRedirect && [0, 1].indexOf(self.namespace) !== -1,
            list: [
                {
                    label: 'BV1: Không ngữ cảnh hoặc thiếu ngữ cảnh cần thiết để người khác xác định đúng chủ thể được nói đến.',
                    value: 'khongngucanh',
                    code: 'bv1',
                    tooltip:
                        'Tiêu chí này áp dụng cho các bài viết thiếu ngữ cảnh cần thiết để nhận diện chủ đề của bài viết.',
                },
                {
                    label: 'BV2: Không có nội dung thực',
                    value: 'khongnoidung',
                    code: 'bv2',
                    tooltip:
                        'Tiêu chí này áp dụng cho các bài viết chỉ chứa các liên kết ngoài, nhãn thể loại, phần "Xem thêm", ' +
                        'cách diễn đạt tiêu đề, thư từ, câu hỏi, bình luận dạng trò chuyện, nhãn bản mẫu hoặc hình ảnh. ' +
                        'Tiêu chí này không áp dụng các trang định hướng.',
                },
                {
                    label: 'BV3: Bài viết mới được tạo ra có nội dung sao chép từ một bài viết đã có sẵn',
                    value: 'noidungsaochep',
                    code: 'bv3',
                    tooltip:
                        'Tiêu chí này áp dụng cho bài viết mới tạo có nội dung trùng lặp với bài viết hiện có ' +
                        'mà không mở rộng chi tiết hoặc cải thiện thông tin.',
                    subgroup: {
                        name: 'baisaochep',
                        parameter: '1',
                        type: 'input',
                        label: 'Tên bài bị sao chép: ',
                        tooltip: 'Tên bài bị sao chép nội dung.',
                        size: 60,
                    },
                },
                {
                    label: 'BV4: Bài viết rõ ràng chưa đủ độ nổi bật (cần xem xét thật kỹ trước khi gán nhãn)',
                    value: 'khongnoibat',
                    code: 'bv4',
                    tooltip:
                        'Tiêu chí này áp dụng cho các bài viết có nội dung rõ ràng chưa đủ nổi bật. ' +
                        'Tiêu chí này chỉ nên được sử dụng hạn chế và cẩn thận sau khi đã đánh giá bài viết kỹ lưỡng.',
                },
            ],
        },

        {
            label: 'Thể loại',
            visible: (self) => !self.isRedirect && [14, 15].indexOf(self.namespace) !== -1,
            list: [
                {
                    label: 'TL1: Thể loại trống hoặc không cần thiết',
                    value: 'theloaitrong',
                    code: 'tl1',
                    tooltip:
                        'Tiêu chí này áp dụng cho các thể loại trống hoặc không cần thiết. ' +
                        'Đối với các thể loại bảo quản thì phải đặt nhãn {{Thể loại trống}}.',
                },
                {
                    label: 'TL2: Tên thể loại sai',
                    value: 'theloaisaiten',
                    code: 'tl2',
                    tooltip:
                        'Tiêu chí này áp dụng với các thể loại có tên sai, chẳng hạn như lỗi chính tả, lỗi bỏ dấu từ hoặc lỗi trình bày.',
                },
            ],
        },

        {
            label: 'Trang thành viên',
            visible: (self) => !self.isRedirect && [2, 3].indexOf(self.namespace) !== -1,
            list: [
                {
                    label: 'TV1: Thành viên yêu cầu xóa',
                    value: 'tvyeucauxoa',
                    code: 'tv1',
                    tooltip:
                        'Thành viên có quyền được yêu cầu xóa các trang thành viên và trang con của mình ' +
                        '(nhưng không phải là các trang thảo luận thành viên) theo yêu cầu cá nhân.',
                    hideWhenMultiple: true,
                },
                {
                    label: 'TV2: Tên thành viên chưa đăng ký',
                    value: 'tvchuadangky',
                    code: 'tv2',
                    tooltip:
                        'Tiêu chí này áp dụng cho các trang thành viên chưa đăng ký hoặc không tồn tại.',
                },
                {
                    label: 'TV3: Chứa nhiều hình không tự do',
                    value: 'tvhinhkhongtudo',
                    code: 'tv3',
                    tooltip:
                        'Tiêu chí này áp dụng cho các hình ảnh trong không gian thành viên, ' +
                        'bao gồm hầu hết hoặc toàn bộ hình ảnh không tự do hoặc "sử dụng hợp lý".',
                    hideWhenRedirect: true,
                },
            ],
        },

        {
            label: 'Bản mẫu/Mô đun',
            visible: (self) => !self.isRedirect && [10, 11].indexOf(self.namespace) !== -1,
            list: [
                {
                    label: 'BM1: Bản mẫu/Mô đun có nội dung hoặc cách trình bày vi phạm quy định của Wikipedia',
                    value: 'banmauvipham',
                    code: 'bm1',
                    tooltip:
                        'Tiêu chí này áp dụng cho các bản mẫu/mô đun có nội dung hoặc cách trình bày vi phạm quy định của Wikipedia.',
                },
                {
                    label: 'BM2: Bản mẫu/Mô đun không thể được sử dụng hữu ích theo bất kỳ cách nào hoặc theo biểu quyết đồng thuận',
                    value: 'banmaukhonghuuich',
                    code: 'bm2',
                    tooltip:
                        'Tiêu chí này áp dụng cho các bản mẫu/mô đun không được sử dụng hữu ích. ' +
                        'Bản mẫu/mô đun quan trọng hoặc được nhúng ở nhiều trang cần được xem xét kỹ.',
                    subgroup: {
                        name: 'bieuquyet_url',
                        parameter: 'url',
                        type: 'input',
                        label: 'Liên kết biểu quyết (nếu có): ',
                        size: 60,
                    },
                },
                {
                    label: 'BM3: Bản mẫu/Mô đun không liên kết hoặc không sử dụng ở bất kỳ trang nào',
                    value: 'banmaukhonglienket',
                    code: 'bm3',
                    tooltip:
                        'Tiêu chí này áp dụng cho các bản mẫu/mô đun không liên kết hoặc không sử dụng ở bất kỳ trang nào.',
                },
            ],
        },

        {
            label: 'Cổng thông tin',
            visible: (self) => !self.isRedirect && [100, 101].indexOf(self.namespace) !== -1,
            list: [
                {
                    label: 'CTT1: Cổng thông tin dưới dạng một bài viết',
                    value: 'ctt1',
                    code: 'ctt1',
                    tooltip:
                        'Bạn phải chỉ định một tiêu chí bài viết áp dụng trong trường hợp này.',
                    subgroup: {
                        name: 'p1_criterion',
                        parameter: '1',
                        type: 'input',
                        label: 'Tiêu chí bài viết sẽ áp dụng: ',
                    },
                },
                {
                    label: 'CTT2: Cổng thông tin ít thông tin (cấu thành từ ít hơn ba bài viết không sơ khai)',
                    value: 'ctt2',
                    code: 'ctt2',
                    tooltip:
                        'Cổng thông tin dựa trên một chủ đề mà chỉ có một bài viết sơ khai và ít hơn ba bài viết không sơ khai.',
                },
            ],
        },

        {
            label: 'Tiêu chí chung',
            visible: () => true,
            list: [
                {
                    label: 'C1: Vô nghĩa rõ ràng',
                    value: 'nonsense',
                    code: 'c1',
                    tooltip:
                        'Tiêu chí này áp dụng với những trang chứa các đoạn văn bản hoàn toàn không mạch lạc hoặc vô nghĩa, ' +
                        'và cả nội dung lẫn lịch sử trang đều không chứa nội dung gì có ý nghĩa.',
                    hideInNamespaces: [2],
                },
                {
                    label: 'C2: Trang thử nghiệm',
                    value: 'test',
                    code: 'c2',
                    tooltip:
                        'Tiêu chí này áp dụng với những trang được tạo ra nhằm thử nghiệm chức năng sửa đổi hoặc những chức năng khác của Wikipedia.',
                    hideInNamespaces: [2],
                },
                {
                    label: 'C3: Hoàn toàn là phá hoại hoặc lừa bịp rõ ràng',
                    value: 'vandalism',
                    code: 'c3',
                    tooltip:
                        'Tiêu chí này áp dụng với những trang tung thông tin sai lệch, tin vịt rõ ràng, ' +
                        'kể cả những hình ảnh được tải lên nhằm cố ý cung cấp thông tin sai lệch.',
                },
                {
                    label: 'C4: Trang được tạo lại với nội dung của một trang đã từng bị xoá theo biểu quyết',
                    value: 'repost',
                    code: 'c4',
                    tooltip:
                        'Tiêu chí này áp dụng cho các bản sao y hệt của một trang đã từng bị xoá theo kết quả của một lần biểu quyết xoá.',
                    subgroup: {
                        name: 'repost_xfd',
                        parameter: 'xfd',
                        type: 'input',
                        label: 'Trang diễn ra cuộc thảo luận xóa: ',
                        tooltip: 'Phải bắt đầu với tiền tố "Wikipedia:"',
                        size: 60,
                    },
                },
                {
                    label: 'C5: Trang do thành viên bị cấm hoặc cấm chỉ tạo ra',
                    value: 'banned',
                    code: 'c5',
                    tooltip:
                        'Tiêu chí này áp dụng với những trang do thành viên bị cấm tạo ra mà vi phạm lệnh cấm.',
                    subgroup: {
                        name: 'banneduser',
                        parameter: 'user',
                        type: 'input',
                        label: 'Tên thành viên bị cấm (nếu có): ',
                        tooltip: 'Không bắt đầu bằng tiền tố "User:" hoặc "Thành viên:"',
                    },
                },
                {
                    label: 'C6: Xóa để thực hiện các tác vụ bảo trì kĩ thuật',
                    value: 'technical',
                    code: 'c6',
                    tooltip:
                        'Tiêu chí này áp dụng cho các tác vụ xóa để thực hiện công tác bảo trì kĩ thuật.',
                },
                {
                    label: 'C6: Xóa theo biểu quyết',
                    value: 'xfd',
                    code: 'bqxb',
                    subgroup: {
                        name: 'xfd_fullvotepage',
                        type: 'input',
                        label: 'Trang biểu quyết xóa bài: ',
                        tooltip: 'Phải bắt đầu với tiền tố "Wikipedia:"',
                        size: 60,
                    },
                },
                {
                    label: 'C8: Trang liên quan đến một trang khác không tồn tại hoặc đã bị xóa',
                    value: 'notexists',
                    code: 'c8',
                    tooltip:
                        'Bao gồm trang thảo luận không có trang nội dung tương ứng, trang con không có trang cha, ' +
                        'trang tập tin không có tập tin tương ứng, đổi hướng tới đích không hợp lệ và các trường hợp tương tự.',
                    subgroup: {
                        name: 'notexists_rationale',
                        parameter: 'rationale',
                        type: 'input',
                        label: 'Lý do tùy chọn: ',
                        size: 60,
                    },
                    hideSubgroupWhenSysop: true,
                },
                {
                    label: 'C9: Quảng cáo, quảng bá cho một công ty, sản phẩm, dịch vụ hay cá nhân',
                    value: 'advert',
                    code: 'c9',
                    tooltip:
                        'Tiêu chí này áp dụng với những bài viết chỉ có một mục đích duy nhất là quảng cáo cho một công ty, ' +
                        'sản phẩm, dịch vụ hay cá nhân.',
                },
                {
                    label: 'C11: Trang có nội dung tấn công cá nhân',
                    value: 'attack',
                    code: 'c11',
                    tooltip:
                        'Các trang tấn công có thể bao gồm phỉ báng, đe dọa pháp lý, quấy rối hoặc đe dọa một cá nhân ' +
                        'và các tiểu sử người đang sống có giọng điệu hoàn toàn tiêu cực và không có nguồn.',
                },
                {
                    label: 'C12: Bài không được dịch: chỉ có ≤ 10 từ tiếng Việt, còn lại là tiếng nước ngoài',
                    value: 'foreign',
                    code: 'c12',
                    tooltip:
                        'Tiêu chí này áp dụng cho các bài viết không được viết bằng tiếng Việt hoặc có ít hơn 10 chữ là từ tiếng Việt ' +
                        'và về cơ bản nội dung có thể giống như một bài viết ở một dự án Wikimedia khác.',
                },
                {
                    label: 'C13: Bài/đoạn hoặc hình ảnh vi phạm bản quyền',
                    value: 'copyvio',
                    code: 'c13',
                    tooltip:
                        'Tiêu chí này áp dụng cho các trang văn bản chứa tài liệu bản quyền mà không có khẳng định tin cậy để sử dụng.',
                    subgroup: [
                        {
                            name: 'copyvio_url',
                            parameter: 'url',
                            type: 'input',
                            label: 'URL (nếu có): ',
                            size: 60,
                        },
                        {
                            name: 'copyvio_url2',
                            parameter: 'url2',
                            type: 'input',
                            label: 'URL bổ sung 1: ',
                            size: 60,
                        },
                        {
                            name: 'copyvio_url3',
                            parameter: 'url3',
                            type: 'input',
                            label: 'URL bổ sung 2: ',
                            size: 60,
                        },
                    ],
                },
                {
                    label: 'C14: Rõ ràng là AI tạo sinh hoặc được tạo từ mô hình ngôn ngữ lớn',
                    value: 'llm',
                    code: 'c14',
                    tooltip:
                        'Tiêu chí này áp dụng cho các bài viết rõ ràng được tạo ra từ AI hoặc mô hình ngôn ngữ lớn ' +
                        'mà không có sự biên tập, đánh giá, kiểm chứng và chỉnh sửa đáng kể từ con người.',
                    subgroup: {
                        name: 'llm_reason',
                        parameter: 'rationale',
                        type: 'input',
                        label: 'Lý do tùy chọn: ',
                        size: 60,
                    },
                },
                {
                    label: 'C15: Trang định hướng không cần thiết',
                    value: 'disambig',
                    code: 'c15',
                    tooltip:
                        'Tiêu chí này áp dụng cho các trang định hướng vô nghĩa, mồ côi (chỉ có 0–1 liên kết) hoặc trang đổi hướng sai quy định.',
                },
            ],
        },

        {
            label: 'Đổi hướng',
            visible: (self) => self.isRedirect,
            list: [
                {
                    label: 'ĐH1: Trang đổi hướng đến một trang không tồn tại',
                    value: 'doihuongkhongtontai',
                    code: 'đh1',
                    tooltip:
                        'Tiêu chí này áp dụng cho bất kỳ trang đổi hướng nào đến trang không tồn tại.',
                },
                {
                    label: 'ĐH2: Trang đổi hướng lặp',
                    value: 'doihuonglap',
                    code: 'đh2',
                    tooltip:
                        'Tiêu chí này áp dụng cho tất cả các trang đổi hướng lặp hay đổi hướng đến chính nó.',
                },
                {
                    label: 'ĐH3: Đổi hướng liên không gian',
                    value: 'doihuonglienkhonggian',
                    code: 'đh3',
                    tooltip:
                        'Tiêu chí này áp dụng cho các trang đổi hướng từ không gian chính đến không gian khác, ' +
                        'ngoại trừ các không gian được quy định cho phép.',
                },
                {
                    label: 'ĐH4: Tên trang đổi hướng sai',
                    value: 'doihuongsai',
                    code: 'đh4',
                    tooltip:
                        'Tiêu chí này áp dụng với các trang đổi hướng có tên sai, chẳng hạn như lỗi chính tả, lỗi bỏ dấu từ hoặc lỗi trình bày.',
                },
            ],
        },
    ];
}