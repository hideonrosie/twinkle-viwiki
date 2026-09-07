import { FluffCore, Config } from './core';

// Các bot đáng tin cậy sẽ được bỏ qua.
export class Fluff extends FluffCore {
	trustedBots = ['Kiểm tra tự động'];

	hiddenName = 'thành viên không rõ';
}

Config.addGroup('fluff', {
	title: 'Hồi sửa và lùi sửa',
	module: 'fluff',
	preferences: [
		{
			name: 'autoMenuAfterRollback',
			label: 'Tự động mở menu cảnh báo Twinkle trên trang thảo luận của người dùng sau khi lùi sửa bằng Twinkle',
			helptip: 'Chỉ hoạt động nếu các chức năng tương ứng bên dưới được chọn.',
			type: 'boolean',
			default: false,
		},
		{
			name: 'openTalkPage',
			label: 'Mở trang thảo luận của thành viên khi sử dụng kiểu lùi sửa sau',
			type: 'set',
			setValues: {
				agf: 'Lùi sửa thiện chí',
				norm: 'Lùi sửa bình thường',
				vand: 'Lùi sửa phá hoại',
			},
			default: ['agf', 'norm', 'vand'],
		},
		{
			name: 'openTalkPageOnAutoRevert',
			label: 'Mở trang thảo luận của thành viên khi khôi phục lùi sửa từ các đóng góp của thành viên hoặc các thay đổi gần đây',
			helptip: 'Khi tính năng này được bật, các tùy chọn mong muốn phải được bật ở cài đặt trước đó để tính năng này hoạt động.',
			type: 'boolean',
			default: false,
		},
		{
			name: 'rollbackInPlace',
			label: 'Không tải lại trang khi lùi sửa từ các đóng góp hoặc các thay đổi gần đây',
			helptip: 'Khi không được bật, Twinkle sẽ không tải lại trang đóng góp hoặc thay đổi gần đây sau khi hồi sửa, cho phép bạn hồi sửa nhiều sửa đổi cùng một lúc.',
			type: 'boolean',
			default: false,
		},
		{
			name: 'markRevertedPagesAsMinor',
			label: 'Đánh dấu kiểu lùi sửa sau là sửa đổi nhỏ',
			type: 'set',
			setValues: {
				agf: 'Lùi sửa thiện chí',
				norm: 'Lùi sửa bình thường',
				vand: 'Lùi sửa phá hoại',
				torev: 'Phục hồi phiên bản',
			},
			default: ['vand'],
		},
		{
			name: 'watchRevertedPages',
			label: 'Thêm trang vào danh sách theo dõi khi sử dụng kiểu lùi sửa sau',
			type: 'set',
			setValues: {
				agf: 'Lùi sửa thiện chí',
				norm: 'Lùi sửa bình thường',
				vand: 'Lùi sửa phá hoại',
				torev: 'Phục hồi phiên bản',
			},
			default: ['agf', 'norm', 'vand', 'torev'],
		},
		{
			name: 'offerReasonOnNormalRevert',
			label: 'Nhắc lý do cho các tác vụ lùi sửa bình thường',
			helptip: 'Các lùi sửa “bình thường” là những lùi sửa được khôi phục từ liên kết [lùi sửa] nằm ở chính giữa.',
			type: 'boolean',
			default: true,
		},
		{
			name: 'confirmOnFluff',
			label: 'Yêu cầu xác nhận khi lùi sửa',
			type: 'boolean',
			default: false,
		},
		{
			name: 'confirmOnMobileFluff',
			label: 'Yêu cầu xác nhận khi lùi sửa (trên thiết bị di động)',
			helptip: 'Dành cho những người sử dụng bút cảm ứng, thiết bị cảm ứng và những người hay nhầm lẫn.',
			type: 'boolean',
			default: true,
		},
		{
			name: 'showRollbackLinks',
			label: 'Hiển thị liên kết lùi sửa trên các trang sau',
			type: 'set',
			setValues: {
				diff: 'Trang khác biệt',
				others: 'Trang đóng góp của những người dùng khác',
				mine: 'Trang đóng góp của tôi',
				recent: 'Thay đổi gần đây và các thay đổi liên quan đến các trang đặc biệt',
				history: 'Lịch sử trang',
			},
			default: ['diff', 'others'],
		},
	],
});
