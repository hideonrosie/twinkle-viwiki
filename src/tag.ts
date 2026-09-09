import { Twinkle, Page, Config, Preference, PreferenceGroup, getPref } from './core';
import { TagCore, tagData, tagListType, TagMode, tagSubgroup } from './core';
import { hatnoteRegex } from './common';

const redirectTagList: tagListType = {};

const fileTagList: tagListType = {
	'Các thẻ giấy phép và vấn đề về nguồn': [
		// { tag: 'Better source requested', description: 'thông tin nguồn chỉ bao gồm URL hình ảnh/URL cơ sở chung' },
		{ tag: 'Bsr', description: 'thông tin nguồn chỉ bao gồm URL hình ảnh/URL cơ sở chung' },
		{ tag: 'Non-free reduce', description: 'hình ảnh sử dụng hợp lý không ở độ phân giải thấp (hoặc đoạn âm thanh quá dài, v.v.)' },
		{
			tag: 'Tập tin không tự do có phiên bản cũ',
			description: 'tập tin sử dụng hợp lý có các phiên bản cũ cần được xóa',
			subst: true,
			subgroup: {
				type: 'hidden',
				name: 'OrphanedNonFreeRevisionsDate',
				parameter: 'date',
				value: '{{subst:date}}',
			},
		},
	],
	'Các thẻ liên quan đến Wikimedia Commons': [
		{
			tag: 'Chuyển sang Commons',
			description: 'tập tin tự do cần được chuyển sang Commons',
			subgroup: {
				type: 'hidden',
				name: 'CopyToCommonsHuman',
				parameter: 'human',
				value: mw.config.get('wgUserName'),
			},
		},
		{
			tag: 'Đừng chuyển sang Commons',
			description: 'tập tin chưa đủ điều kiện để chuyển sang Commons',
			subgroup: [
				{
					type: 'input',
					name: 'DoNotMoveToCommons_reason',
					label: 'Lý do: ',
					tooltip:
						'Nhập lý do tại sao hình ảnh này không nên chuyển đến Commons (bắt buộc). Nếu tập tin thuộc phạm vi công cộng ở Hoa Kỳ nhưng không phải ở quốc gia xuất xứ, hãy nhập "US only"',
					required: true,
					parameter: 'reason',
				},
				{
					type: 'input',
					name: 'DoNotMoveToCommons_expiry',
					label: 'Năm hết hạn: ',
					tooltip:
						'Nếu tập tin này có thể được chuyển sang Commons kể từ một năm nhất định, bạn có thể nhập năm đó ở đây (tùy chọn).',
					parameter: 'expiry',
				},
			],
		},
		{
			tag: 'Giữ bản sao địa phương',
			description: 'yêu cầu giữ bản sao địa phương của một tập tin Commons',
			subgroup: {
				type: 'input',
				name: 'keeplocalName',
				label: 'Tên hình ảnh ở Commons nếu khác: ',
				tooltip: 'Tên hình ảnh trên Commons (nếu khác với tên địa phương), không bao gồm tiền tố File:',
				parameter: '1',
			},
		},
		{
			tag: 'Hiện có tại Commons',
			description: 'tập tin đã được chuyển sang Commons',
			subst: true,
			subgroup: {
				type: 'input',
				name: 'nowcommonsName',
				label: 'Tên hình ảnh ở Commons nếu khác: ',
				tooltip: 'Tên hình ảnh trên Commons (nếu khác với tên địa phương), không bao gồm tiền tố File:',
				parameter: '1',
			},
		},
	],
	'Các thẻ dọn dẹp': [
		{ tag: 'Artifacts', description: 'PNG chứa các nhiễu nén còn sót lại' },
		{ tag: 'Bad font', description: 'SVG sử dụng phông chữ không có sẵn trên máy chủ hình thu nhỏ' },
		{ tag: 'Bad format', description: 'tập tin PDF/DOC/... nên được chuyển đổi sang định dạng hữu ích hơn' },
		{ tag: 'Bad GIF', description: 'GIF nên là PNG, JPEG hoặc SVG' },
		{ tag: 'Bad JPEG', description: 'JPEG nên là PNG hoặc SVG' },
		{ tag: 'Bad SVG', description: 'SVG chứa đồ họa raster' },
		// { tag: 'Bad trace', description: 'SVG được tự động chuyển đổi cần được dọn dẹp' },
		{
			tag: 'Cleanup image',
			description: 'dọn dẹp chung',
			subgroup: {
				type: 'input',
				name: 'cleanupimageReason',
				label: 'Lý do: ',
				tooltip: 'Nhập lý do cần dọn dẹp (bắt buộc)',
				required: true,
				parameter: '1',
			},
		},
		{ tag: 'ClearType', description: 'hình ảnh (không phải ảnh chụp màn hình) có khử răng cưa ClearType' },
		{ tag: 'Watermark', description: 'hình ảnh chứa watermark có thể nhìn thấy hoặc không nhìn thấy' },
		// { tag: 'NoCoins', description: 'hình ảnh sử dụng tiền xu để biểu thị quy mô' },
		{ tag: 'Overcompressed JPEG', description: 'JPEG có mức độ nhiễu cao' },
		{ tag: 'Opaque', description: 'nền mờ đục phải trong suốt' },
		// { tag: 'Remove border', description: 'đường viền, khoảng trắng không cần thiết, v.v.' },
		{
			tag: 'Đổi tên tập tin',
			description: 'tập tin phải được đổi tên theo tiêu chí tại [[Wikipedia:Trình di chuyển tập tin]] ([[WP:FMV]])',
			subgroup: [
				{
					type: 'input',
					name: 'renamemediaNewname',
					label: 'Tên mới: ',
					tooltip: 'Nhập tên mới cho hình ảnh (tùy chọn)',
					parameter: '1',
				},
				{
					type: 'input',
					name: 'renamemediaReason',
					label: 'Lý do: ',
					tooltip: 'Nhập lý do đổi tên (tùy chọn)',
					parameter: '2',
				},
			],
		},
		{ tag: 'Should be PNG', description: 'GIF hoặc JPEG nên là định dạng không mất dữ liệu' },
		{
			tag: 'Should be SVG',
			description: 'PNG, GIF hoặc JPEG nên là đồ họa vector',
			subgroup: {
				name: 'svgCategory',
				type: 'select',
				list: [
					{ label: '{{Should be SVG|other}}', value: 'other' },
					{ label: '{{Should be SVG|alphabet}}: hình ảnh ký tự, ví dụ về phông chữ, v.v.', value: 'alphabet' },
					{ label: '{{Should be SVG|chemical}}: sơ đồ hóa học, v.v.', value: 'chemical' },
					{ label: '{{Should be SVG|circuit}}: sơ đồ mạch điện tử, v.v.', value: 'circuit' },
					{ label: '{{Should be SVG|coat of arms}}: huy hiệu', value: 'coat of arms' },
					{ label: '{{Should be SVG|diagram}}: sơ đồ không phù hợp với danh mục con nào khác', value: 'diagram' },
					{ label: '{{Should be SVG|emblem}}: biểu tượng, biểu trưng, phù hiệu, v.v.', value: 'emblem' },
					{ label: '{{Should be SVG|fair use}}: hình ảnh và biểu trưng sử dụng hợp lý', value: 'fair use' },
					{ label: '{{Should be SVG|flag}}: cờ', value: 'flag' },
					{ label: '{{Should be SVG|graph}}: biểu đồ dữ liệu trực quan', value: 'graph' },
					{ label: '{{Should be SVG|logo}}: logo', value: 'logo' },
					{ label: '{{Should be SVG|map}}: bản đồ', value: 'map' },
					{ label: '{{Should be SVG|music}}: thang âm, nốt nhạc, v.v.', value: 'music' },
					{
						label: '{{Should be SVG|physical}}: hình ảnh "thực tế" của vật thể, con người, v.v.',
						value: 'physical',
					},
					{ label: '{{Should be SVG|symbol}}: các ký hiệu, biểu tượng khác, v.v.', value: 'symbol' },
				],
				parameter: '1',
			},
		},
		{ tag: 'Should be text', description: 'hình ảnh nên được thể hiện dưới dạng văn bản, bảng hoặc đánh dấu toán học' },
	],
	'Các thẻ chất lượng hình ảnh': [
		{
			tag: 'Image hoax',
			description: 'hình ảnh có thể đã bị thao túng hoặc là một trò lừa bịp',
			subgroup: {
				type: 'hidden',
				name: 'ImageHoaxDate',
				parameter: 'date',
				value: '{{subst:CURRENTMONTHNAME}} {{subst:CURRENTYEAR}}',
			},
		},
		{ tag: 'Image-blownout' },
		{ tag: 'Image-out-of-focus' },
		{
			tag: 'Image-Poor-Quality',
			subgroup: {
				type: 'input',
				name: 'ImagePoorQualityReason',
				label: 'Lý do: ',
				tooltip: 'Nhập lý do tại sao hình ảnh này có chất lượng kém (bắt buộc)',
				required: true,
				parameter: '1',
			},
		},
		{ tag: 'Image-underexposure' },
		{
			tag: 'Low quality chem',
			description: 'cấu trúc hóa học đang bị tranh cãi',
			subgroup: {
				type: 'input',
				name: 'lowQualityChemReason',
				label: 'Lý do: ',
				tooltip: 'Nhập lý do tại sao sơ đồ bị tranh cãi (bắt buộc)',
				required: true,
				parameter: '1',
			},
		},
	],
	'Các thẻ thay thế': [
		{ tag: 'Lỗi thời', description: 'đã có phiên bản cải tiến' },
		{ tag: 'PNG version available', description: 'đã có phiên bản PNG' },
		{ tag: 'Vector version available', description: 'đã có phiên bản vector' },
	],
};

(fileTagList['Các thẻ thay thế'] as Array<tagData>).forEach(function (el) {
	el.subgroup = {
		type: 'input',
		label: 'Tập tin thay thế: ',
		tooltip: 'Nhập tên của tập tin thay thế tập tin này (bắt buộc)',
		name: el.tag.replace(/ /g, '_') + 'File',
		required: true,
		parameter: '1',
	};
});

function getMergeSubgroups(tag: string): tagSubgroup[] {
	let otherTagName = 'Hợp nhất';

	switch (tag) {
		case 'Hợp nhất từ':
			otherTagName = 'Hợp nhất đến';
			break;
		case 'Hợp nhất đến':
			otherTagName = 'Hợp nhất từ';
			break;
	}

	return ([
		{
			name: 'mergeTarget',
			parameter: '1',
			type: 'input',
			label: 'Các bài viết khác: ',
			tooltip:
				'Nếu chỉ định nhiều bài viết, hãy phân tách chúng bằng ký tự |: Bài viết 1|Bài viết 2',
			required: true,
		},
		{
			type: 'checkbox',
			list: [
				{
					name: 'mergeTagOther',
					label: 'Gắn thẻ bài viết khác bằng {{' + otherTagName + '}}',
					checked: true,
					tooltip: 'Chỉ khả dụng nếu một tên bài viết được nhập vào.',
				},
			],
		},
	] as tagSubgroup[]).concat(
		mw.config.get('wgNamespaceNumber') === 0
			? {
				name: 'mergeReason',
				type: 'textarea',
				label:
					'Lý do hợp nhất (sẽ được đăng trên trang thảo luận ' +
					(tag === 'Hợp nhất đến' ? 'của bài viết khác' : 'của bài viết này') +
					'):',
				tooltip:
					'Tùy chọn, nhưng đặc biệt khuyến khích. Để trống nếu không muốn. ' +
					'Chỉ khả dụng nếu một tên bài viết được nhập vào.',
			}
			: []
	);
}

const articleTagList: tagListType = {
	'Các thẻ phổ biến': {
		'Danh sách thẻ': [
			{
				tag: 'Bài quảng cáo',
				description: '{{Advert}} -- được viết như quảng cáo',
			},
			{
				tag: 'Chú thích trong bài',
				description:
					'{{More citations needed}} -- có thể đã có vài nguồn nhưng vẫn cần thêm nguồn hoặc tài liệu tham khảo để xác minh',
			},
			{
				tag: 'Cần biên tập',
				description:
					'{{Expert needed}} -- cần người am hiểu về chủ đề tham gia biên tập bài viết',
				subgroup: [
					{
						name: 'expertNeeded',
						parameter: '1',
						type: 'input',
						label: 'Tên của dự án WikiProject tương đương: ',
						tooltip:
							'Tùy chọn. Nhập tên WikiProject có thể giúp tìm chuyên gia. Không cần thêm tiền tố "WikiProject".',
					},
					{
						name: 'expertNeededReason',
						parameter: 'reason',
						type: 'input',
						label: 'Lý do: ',
						tooltip:
							'Giải thích ngắn gọn vấn đề. Cần có Lý do hoặc Thảo luận.',
					},
					{
						name: 'expertNeededTalk',
						parameter: 'talk',
						type: 'input',
						label: 'Thảo luận: ',
						tooltip:
							'Tên phần trên trang thảo luận của bài viết nơi vấn đề đang được thảo luận. Không nhập liên kết.',
					},
				],
			},
			{
				tag: 'Chất lượng kém',
				description:
					'{{Chất lượng kém/nguồn}} hoặc {{clk}} -- bài có chất lượng kém (dịch máy, thiếu nguồn, không biên tập, trình bày cẩu thả,...)',
				subgroup: {
					name: 'cleanup',
					parameter: 'lý do',
					type: 'input',
					label: 'Nêu lý do vì sao chất lượng kém: ',
					tooltip: 'Bắt buộc phải có.',
					size: 35,
					required: true,
				},
			},
			{
				tag: 'Đang diễn ra',
				description: '{{Current}} -- một sự kiện đang diễn ra',
				excludeInGroup: true,
			},
			{
				tag: 'Đang viết',
				description:
					'{{Under construction}} -- đang trong quá trình mở rộng hoặc sửa đổi lớn',
				excludeInGroup: true,
			},
			{
				tag: 'Hợp nhất',
				description: '{{Merge}} -- cần hợp nhất với một bài viết khác',
				excludeInGroup: true,
				subgroup: getMergeSubgroups('Hợp nhất'),
			},
			{
				tag: 'Không nổi bật',
				description:
					'{{Notability}} -- chủ thể có thể không đáp ứng nguyên tắc chung về độ nổi bật',
				subgroup: {
					name: 'notability',
					type: 'select',
					list: [
						{
							label:
								'{{không nổi bật}}: chủ thể có thể không đáp ứng nguyên tắc chung về độ nổi bật',
							value: 'none',
						},
						{
							label:
								'{{không nổi bật|Academics}}: hướng dẫn về độ nổi bật cho giới học thuật',
							value: 'Academics',
						},
						{
							label:
								'{{không nổi bật|Astro}}: hướng dẫn về độ nổi bật cho các đối tượng thiên văn',
							value: 'Astro',
						},
						{
							label:
								'{{không nổi bật|Biographies}}: hướng dẫn về độ nổi bật cho thông tin tiểu sử (người)',
							value: 'Biographies',
						},
						{
							label:
								'{{không nổi bật|Books}}: hướng dẫn về độ nổi bật cho sách vở',
							value: 'Books',
						},
						{
							label:
								'{{không nổi bật|Companies}}: hướng dẫn về độ nổi bật cho các công ty và tổ chức',
							value: 'Companies',
						},
						{
							label:
								'{{không nổi bật|Events}}: hướng dẫn về độ nổi bật cho các sự kiện',
							value: 'Events',
						},
						{
							label:
								'{{không nổi bật|Films}}: hướng dẫn về độ nổi bật cho phim ảnh',
							value: 'Films',
						},
						{
							label:
								'{{không nổi bật|Geographic}}: hướng dẫn về độ nổi bật cho các đặc điểm địa lý',
							value: 'Geographic',
						},
						{
							label:
								'{{không nổi bật|Lists}}: hướng dẫn về độ nổi bật cho các danh sách độc lập',
							value: 'Lists',
						},
						{
							label:
								'{{không nổi bật|Music}}: hướng dẫn về độ nổi bật cho âm nhạc',
							value: 'Music',
						},
						{
							label:
								'{{không nổi bật|Neologisms}}: hướng dẫn về độ nổi bật cho cách dùng từ (chữ) mới',
							value: 'Neologisms',
						},
						{
							label:
								'{{không nổi bật|Numbers}}: hướng dẫn về độ nổi bật cho các con số',
							value: 'Numbers',
						},
						{
							label:
								'{{không nổi bật|Products}}: hướng dẫn về độ nổi bật cho các sản phẩm và dịch vụ',
							value: 'Products',
						},
						{
							label:
								'{{không nổi bật|Sports}}: hướng dẫn về độ nổi bật cho các môn thể thao và vận động viên',
							value: 'Sports',
						},
						{
							label:
								'{{không nổi bật|Television}}: hướng dẫn về độ nổi bật cho các show diễn truyền hình',
							value: 'Television',
						},
						{
							label:
								'{{không nổi bật|Web}}: hướng dẫn về độ nổi bật cho nội dung web',
							value: 'Web',
						},
					],
				},
			},
			{
				tag: 'TSNDS không nguồn',
				description:
					'{{TSNDS không nguồn}} -- Tiểu sử người đang sống (TSNĐS) không có nguồn nào cả (với các bài viết tạo sau ngày 14/03/2021, hãy sử dụng BLP PROD)',
			},
			{
				tag: 'Thiếu nguồn gốc',
				description: '{{Thiếu nguồn gốc}} -- hoàn toàn không có nguồn',
			},
			{
				tag: 'Tầm nhìn hẹp',
				description:
					'{{Globalize}} -- có thể không đại diện cho một cái nhìn toàn cầu về chủ đề',
				subgroup: {
					name: 'globalizeRegion',
					type: 'input',
					label: 'Tập trung quá mức vào quốc gia hoặc khu vực nào đó: ',
				},
			},
			{
				tag: 'Thái độ trung lập',
				description:
					'{{POV}} -- không duy trì quan điểm trung lập',
			},
			{
				tag: 'Vi phạm bản quyền',
				description:
					'{{copyvio}} -- sao chép nguyên văn từ trang mạng/sách vở đã giữ bản quyền mà chưa thấy sự cho phép của tác giả',
			},
			{
				tag: 'Wiki hóa',
				description:
					'{{wikify}} -- cần chỉnh sửa bài viết theo đúng định dạng của Wikipedia',
			},
		],
	},

	'Các thẻ bảo trì và dọn dẹp': {
		'Dọn dẹp chung': [
			{
				tag: 'Cần dọn dẹp',
				description: '{{Cleanup}} -- yêu cầu dọn dẹp',
				subgroup: {
					name: 'cleanup',
					parameter: 'reason',
					type: 'input',
					label: 'Nêu lý do cụ thể vì sao cần dọn dẹp: ',
					tooltip: 'Bắt buộc phải có.',
					size: 35,
					required: true,
				},
			},
			{
				tag: 'Cần dọn dẹp-viết lại',
				description:
					'{{Cleanup rewrite}} -- cần được viết lại hoàn toàn để tuân thủ theo các tiêu chuẩn chất lượng của Wikipedia',
			},
			{
				tag: 'Biên tập',
				description:
					'{{Biên tập}} -- sửa các lỗi ngữ pháp, chính tả, tính mạch lạc, trau chuốt hành văn tiếng Việt',
				subgroup: {
					name: 'copyEdit',
					parameter: 'for',
					type: 'input',
					label:
						'"Cần sửa các lỗi ngữ pháp, chính tả, tính mạch lạc, trau chuốt lối hành văn tiếng Việt"',
					tooltip:
						'Ví dụ, "sửa chính tả tiếng Việt". Không bắt buộc.',
					size: 35,
				},
			},
			{
				tag: 'Định dạng',
				description: '{{Định dạng}} -- cần định dạng',
			},
		],

		'Nội dung không hợp lệ': [
			{
				tag: 'Diễn giải gần giống nội dung bản quyền',
				description:
					'{{Close paraphrasing}} -- chứa các diễn giải gần giống nguồn có bản quyền',
				subgroup: {
					name: 'closeParaphrasing',
					parameter: 'source',
					type: 'input',
					label: 'Nguồn: ',
					tooltip:
						'Nội dung viết/diễn giải gần giống với nguồn có bản quyền',
				},
			},
			{
				tag: 'Chép dán',
				description:
					'{{Copypaste}} -- có thể đã được sao chép và dán từ một nơi khác',
				excludeInGroup: true,
				subgroup: {
					name: 'copypaste',
					parameter: 'url',
					type: 'input',
					label: 'Nguồn URL: ',
					tooltip: 'Nếu biết.',
					size: 50,
				},
			},
			{
				tag: 'Quá nhiều liên kết ngoài',
				description:
					'{{External links}} -- có những liên kết ngoài phạm quy',
			},
			{
				tag: 'Không tự do',
				description:
					'{{Non-free}} -- có thể chứa quá nhiều nội dung, tập tin có bản quyền',
			},
			{
				tag: 'Tự mâu thuẫn',
				description:
					'{{Tự mâu thuẫn}} -- có những tình tiết tự mâu thuẫn nhau',
			},
		],

		'Bố cục': [
			{
				tag: 'Dọn dẹp lại',
				description: '{{Cleanup reorganize}} -- cần sửa lại bố cục toàn bài',
			},
			{
				tag: 'Phân chia thành các mục con',
				description:
					'{{Sections}} -- cần được chia thành các đề mục để người đọc dễ nắm bắt nội dung',
			},
			{
				tag: 'Quá nhiều đề mục',
				description: '{{Too many sections}} -- quá nhiều đề mục',
			},
			{
				tag: 'Quá dài',
				description:
					'{{Very long}} -- quá dài để đọc và điều hướng một cách dễ dàng',
			},
			{
				tag: 'Chia',
				description:
					'{{Chia}} -- chia bài này ra thành nhiều bài hoặc tạo bài con cho bài này',
			},
		],

		'Phần mở đầu': [
			{
				tag: 'Thiếu mở đầu',
				description: '{{Lead missing}} -- không có phần mở đầu',
			},
			{
				tag: 'Viết lại phần mở đầu',
				description:
					'{{Lead rewrite}} -- phần mở đầu cần được viết lại theo quy định',
			},
			{
				tag: 'Mở đầu quá dài',
				description:
					'{{Lead too long}} -- phần mở đầu quá dài so với độ dài của bài',
			},
			{
				tag: 'Mở đầu quá ngắn',
				description:
					'{{Lead too short}} -- phần mở đầu quá ngắn và cần được mở rộng để tóm tắt các điểm chính',
			},
			{
				tag: 'Chỉ có ở phần mở đầu',
				description:
					'{{Chỉ có ở phần mở đầu}} -- một số thông tin không có trong thân bài',
			},
		],

		'Tiểu sử người đang sống': [
			{
				tag: 'Cleanup Congress bio',
				description:
					'{{Cleanup Congress bio}} -- tiểu sử chép từ Danh mục Tiểu sử Quốc hội Hoa Kỳ',
			},
		],

		'Bài về tác phẩm hư cấu': [
			{
				tag: 'Tóm tắt cốt truyện',
				description:
					'{{All plot}} -- gần như chỉ thấy tóm tắt cốt truyện, thiếu thông tin về quá trình sáng tác, tạo ra tác phẩm, đánh giá chuyên môn',
			},
			{
				tag: 'Cách viết hư cấu',
				description:
					'{{Fiction}} -- không phân biệt được giữa thực tế và hư cấu',
			},
			{
				tag: 'Thiếu tóm tắt cốt truyện',
				description:
					'{{No plot}} -- cần một bản tóm tắt cốt truyện',
			},
			{
				tag: 'Tóm lược dài',
				description:
					'{{Long plot}} -- tóm tắt cốt truyện quá dài hoặc quá chi tiết',
			},
		],
	},

	'Các vấn đề chung về nội dung': {
		'Độ nổi bật': [
			{
				tag: 'Không nổi bật',
				description:
					'{{Notability}} -- chủ thể có thể không đáp ứng nguyên tắc chung về độ nổi bật',
				subgroup: {
					name: 'notability',
					type: 'select',
					list: [
						{
							label: '{{không nổi bật}}: chủ thể của bài viết có thể không đáp ứng nguyên tắc chung về độ nổi bật',
							value: 'none',
						},
						{ label: '{{không nổi bật|Academics}}: hướng dẫn về độ nổi bật cho giới học thuật', value: 'Academics' },
						{ label: '{{không nổi bật|Astro}}: hướng dẫn về độ nổi bật cho các đối tượng thiên văn', value: 'Astro' },
						{ label: '{{không nổi bật|Biographies}}: hướng dẫn về độ nổi bật cho thông tin tiểu sử (người)', value: 'Biographies' },
						{ label: '{{không nổi bật|Books}}: hướng dẫn về độ nổi bật cho sách vở', value: 'Books' },
						{ label: '{{không nổi bật|Companies}}: hướng dẫn về độ nổi bật cho các công ty và tổ chức', value: 'Companies' },
						{ label: '{{không nổi bật|Events}}: hướng dẫn về độ nổi bật cho các sự kiện', value: 'Events' },
						{ label: '{{không nổi bật|Films}}: hướng dẫn về độ nổi bật cho phim ảnh', value: 'Films' },
						{ label: '{{không nổi bật|Geographic}}: hướng dẫn về độ nổi bật cho các đặc điểm địa lý', value: 'Geographic' },
						{ label: '{{không nổi bật|Lists}}: hướng dẫn về độ nổi bật cho các danh sách độc lập', value: 'Lists' },
						{ label: '{{không nổi bật|Music}}: hướng dẫn về độ nổi bật cho âm nhạc', value: 'Music' },
						{ label: '{{không nổi bật|Neologisms}}: hướng dẫn về độ nổi bật cho cách dùng từ (chữ) mới', value: 'Neologisms' },
						{ label: '{{không nổi bật|Numbers}}: hướng dẫn về độ nổi bật cho các con số', value: 'Numbers' },
						{ label: '{{không nổi bật|Products}}: hướng dẫn về độ nổi bật cho các sản phẩm và dịch vụ', value: 'Products' },
						{ label: '{{không nổi bật|Sports}}: hướng dẫn về độ nổi bật cho các môn thể thao và vận động viên', value: 'Sports' },
						{ label: '{{không nổi bật|Television}}: hướng dẫn về độ nổi bật cho các show diễn truyền hình', value: 'Television' },
						{ label: '{{không nổi bật|Web}}: hướng dẫn về độ nổi bật cho nội dung web', value: 'Web' },
					],
				},
			},
			{
				tag: 'Có nguồn',
				description:
					'{{Có nguồn}} -- có người đã thử tìm nguồn và cho rằng chủ thể này đủ độ nổi bật',
			},
		],

		'Phong cách viết': [
			{ tag: 'Bài quảng cáo', description: '{{Advert}} -- được viết như một quảng cáo' },
			{ tag: 'Bình luận cá nhân', description: '{{Essay-like}} -- viết như một bài luận cá nhân, tiểu luận chủ quan hay nghị luận và trình bày tư tưởng, quan điểm riêng của người viết' },
			{ tag: 'Quan điểm người hâm mộ', description: '{{Fanpov}} -- được viết từ quan điểm của một người hâm mộ' },
			{ tag: 'Như sơ yếu lý lịch', description: '{{Like resume}} -- được viết như một sơ yếu lý lịch' },
			{ tag: 'Cẩm nang', description: '{{Cẩm nang}} -- viết như cẩm nang hướng dẫn du lịch, hướng dẫn cách chơi, cách làm, cách sử dụng, cách nấu, cách thực hiện quy trình...' },
			{
				tag: 'Dọn dẹp văn phong báo chí',
				description:
					'{{Cleanup-PR}} -- đọc như một thông cáo báo chí hoặc bài viết tin tức',
				subgroup: {
					type: 'hidden',
					name: 'cleanupPR1',
					parameter: '1',
					value: 'article',
				},
			},
			{ tag: 'Trích dẫn quá dài', description: '{{Over-quotation}} -- trích dẫn quá nhiều hoặc quá dài cho một bài viết bách khoa' },
			{ tag: 'Văn xuôi', description: '{{Prose}} -- đang ở dạng danh sách nhưng cần chuyển thành dạng văn xuôi' },
			{ tag: 'Chuyên môn', description: '{{Technical}} -- lối viết quá nặng về chuyên môn để hầu hết người đọc có thể hiểu' },
			{ tag: 'Văn phong', description: '{{Tone}} -- giọng văn không bách khoa theo kiểu Wikipedia' },
			{ tag: 'Khẩu ngữ', description: '{{Khẩu ngữ}} -- dùng khẩu ngữ, văn nói, từ lóng' },
			{ tag: 'Sách giáo khoa', description: '{{Sách giáo khoa}} -- viết như sách giáo khoa, giáo trình đại học' },
			{ tag: 'Specific', description: '{{Specific}} -- chủ yếu chỉ liệt kê các ví dụ, thiếu thông tin khái quát về chủ đề bài viết' },
		],

		'Giác quan (hoặc thiếu giác quan)': [
			{ tag: 'Gây nhầm lẫn', description: '{{Confusing}} -- khó hiểu hoặc không rõ ràng' },
			{ tag: 'Khó hiểu', description: '{{Incomprehensible}} -- nội dung rất tối nghĩa hoặc khó hiểu' },
			{ tag: 'Không trọng tâm', description: '{{Unfocused}} -- thiếu trọng tâm, lan man hoặc viết về nhiều hơn một chủ đề' },
			{ tag: 'Lạc đề', description: '{{Lạc đề}} -- lạc đề hoặc hơi lạc đề' },
			{ tag: 'Đoạn quan trọng', description: '{{Đoạn quan trọng}} -- nghi ngờ độ quan trọng của đoạn này so với chủ đề bài viết' },
		],

		'Thông tin và chi tiết': [
			{ tag: 'Ngữ cảnh', description: '{{Context}} -- không đủ ngữ cảnh cho những người không quen thuộc với chủ đề này' },
			{ tag: 'Cleanup book', description: '{{Cleanup book}} -- không đủ ngữ cảnh về quyển sách' },
			{
				tag: 'Cần chuyên gia',
				description: '{{Expert needed}} -- cần sự chú ý từ một chuyên gia về chủ đề này',
				subgroup: [
					{
						name: 'expertNeeded',
						parameter: '1',
						type: 'input',
						label: 'Tên của dự án WikiProject tương đương: ',
						tooltip: 'Tùy chọn.',
					},
					{
						name: 'expertNeededReason',
						parameter: 'reason',
						type: 'input',
						label: 'Lý do: ',
						tooltip: 'Giải thích ngắn gọn vấn đề.',
					},
					{
						name: 'expertNeededTalk',
						parameter: 'talk',
						type: 'input',
						label: 'Thảo luận: ',
						tooltip: 'Tên phần thảo luận liên quan.',
					},
				],
			},
			{ tag: 'Quá chi tiết', description: '{{Overly detailed}} -- quá nhiều chi tiết phức tạp' },
			{ tag: 'Nhấn mạnh quá mức', description: '{{Undue weight}} -- thiên lệch, viết quá nhiều về một số lập trường, sự cố hoặc tranh cãi' },
			{ tag: 'Chuyện bên lề', description: '{{Chuyện bên lề}} -- liệt kê các thông tin bên lề' },
			{ tag: 'Quá nhiều ảnh', description: '{{Quá nhiều ảnh}} -- quá nhiều hình ảnh, biểu đồ hoặc sơ đồ so với chiều dài tổng thể của bài' },
		],

		'Tính chất thời gian': [
			{
				tag: 'Đang diễn ra',
				description: '{{Current}} -- một sự kiện đang diễn ra',
				excludeInGroup: true,
			},
			{ tag: 'Truyền hình tương lai', description: '{{Truyền hình tương lai}} -- chương trình truyền hình sắp phát sóng' },
			{ tag: 'Mới qua đời', description: '{{Mới qua đời}} -- chủ thể trong bài vừa qua đời' },
			{ tag: 'Thảm họa đang xảy ra', description: '{{Thảm họa đang xảy ra}} -- thảm họa đang xảy ra' },
			{ tag: 'Lỗi thời hoặc sai thời', description: '{{Lỗi thời hoặc sai thời}} -- dùng từ sai so với giai đoạn lịch sử, nội dung đã lỗi thời mà không ghi số năm' },
			{ tag: 'Lỗi thời', description: '{{Update}} -- cần cập nhật các thông tin mới nhất' },
		],

		'Tính trung lập, thiên vị': [
			{ tag: 'Tự truyện', description: '{{Autobiography}} -- văn phong tự truyện và cách viết không trung lập' },
			{ tag: 'Có xung đột lợi ích', description: '{{COI}} -- người tạo bài hoặc người đóng góp chính cho bài viết có thể có xung đột lợi ích' },
			{
				tag: 'Tầm nhìn hẹp',
				description: '{{Globalize}} -- có thể không đại diện cho một cái nhìn toàn cầu về chủ đề',
				subgroup: {
					name: 'globalizeRegion',
					type: 'input',
					label: 'Tập trung quá mức vào quốc gia hoặc khu vực nào đó: ',
				},
			},
			{ tag: 'Tâng bốc', description: '{{Tâng bốc}} -- chứa các từ ngữ quảng bá một cách chủ quan mà không đưa ra dẫn chứng thực sự' },
			{ tag: 'Thái độ trung lập', description: '{{POV}} -- không duy trì quan điểm trung lập' },
			{ tag: 'Recentism', description: '{{Recentism}} -- chứa quá nhiều nội dung về các sự kiện diễn ra gần đây khiến bài bị mất cân đối' },
			{ tag: 'Quá ít quan điểm', description: '{{Too few opinions}} -- có thể không bao gồm tất cả các quan điểm quan trọng' },
			{ tag: 'Có đóng góp được trả thù lao', description: '{{Đóng góp được trả thù lao}} -- có các đóng góp được trả thù lao, có thể dẫn tới xung đột lợi ích, cần biên tập lại' },
			{ tag: 'Thù lao không công khai', description: '{{Undisclosed paid}} -- có thể đã được tạo hoặc chỉnh sửa để đổi lại các khoản thù lao hay lợi lộc chưa khai báo' },
			{ tag: 'Diễn đạt không rõ ràng', description: '{{Weasel}} -- diễn đạt mơ hồ thường đi kèm thông tin thiên lệch hoặc không thể kiểm chứng được' },
		],

		'Tính chính xác': [
			{ tag: 'Phỏng đoán', description: '{{Phỏng đoán}} -- chứa các dự đoán không nguồn chứng thực, thông tin về những sự kiện sẽ không xảy ra' },
			{ tag: 'Tranh chấp', description: '{{Disputed}} -- nghi ngờ độ chính xác của bài' },
			{ tag: 'Tin vịt', description: '{{Tin vịt}} -- một phần hoặc toàn bài có thể là chuyện bịa đặt, không có thật' },
		],

		'Khả năng xác minh và nguồn': [
			{ tag: 'TSNDS không nguồn', description: '{{TSNDS không nguồn}} -- Tiểu sử người đang sống (TSNĐS) không có nguồn nào cả (với các bài viết tạo sau ngày 14/03/2021, hãy sử dụng BLP PROD)' },
			{ tag: 'TSNDS nguồn', description: '{{TSNDS nguồn}} -- TSNĐS cần thêm nguồn để xác minh' },
			{ tag: 'TSNDS tự xuất bản', description: '{{TSNDS tự xuất bản}} -- TSNĐS chỉ chứa nguồn tự xuất bản nên cần thêm các nguồn khác' },
			{ tag: 'Thiếu nguồn gốc', description: '{{Thiếu nguồn gốc}} -- không có nguồn nào cả' },
			{ tag: 'Chỉ có một nguồn', description: '{{Chỉ có một nguồn}} -- gần như chỉ dựa vào một nguồn duy nhất' },
			{ tag: 'Chú thích trong bài', description: '{{More citations needed}} -- có thể đã có vài nguồn nhưng vẫn cần thêm nguồn và tài liệu tham khảo' },
			{ tag: 'Cần thêm nguồn y khoa', description: '{{Cần thêm nguồn y khoa}} -- cần thêm nguồn chuyên môn y khoa' },
			{ tag: 'Nguồn sơ cấp', description: '{{Nguồn sơ cấp}} -- dựa quá nhiều vào nguồn sơ cấp (vd, do chính chủ thể phát hành, sách tự truyện...)' },
			{ tag: 'Tự xuất bản', description: '{{Tự xuất bản}} -- chứa quá nhiều nguồn tự xuất bản (blog, diễn đàn, mạng xã hội, sách tự xuất bản...)' },
			{ tag: 'Thiếu nguồn từ bên thứ ba', description: '{{Third-party}} -- phụ thuộc quá nhiều vào các nguồn liên quan có quá chặt chẽ với chủ thể, cần nguồn trung lập hơn' },
			{ tag: 'Nguồn không đáng tin cậy', description: '{{Nguồn không đáng tin cậy}} -- một số nguồn có thể không đáng tin cậy theo quy định của Wikipedia' },
			{ tag: 'Kiểm tra chú thích', description: '{{Kiểm tra chú thích}} -- thông tin trong bài bách khoa không khớp với nguồn' },
			{ tag: 'Nghiên cứu chưa công bố', description: '{{Original research}} -- chứa nghiên cứu chưa công bố, phát hiện mới, dữ kiện mới, thông tin tự chế, tự tổng hợp, tự suy luận ra' },
			{ tag: 'Tổng hợp', description: '{{Tổng hợp}} -- chứa nội dung tự tổng hợp từ các nguồn tham khảo để truyền đạt các ý tưởng chưa hề tồn tại trong các nguồn đó' },
		],
	},

	'Các vấn đề cụ thể về nội dung': {
		'Ngôn ngữ': [
			{
				tag: 'Đang dịch 2',
				description: '{{Đang dịch 2}} -- đang tiến hành dịch từ Wikipedia ngôn ngữ khác',
			},
			{
				tag: 'Chưa dịch phần lớn',
				description: '{{Chưa dịch phần lớn}} -- phần lớn bài vẫn chưa dịch xong',
			},
			{
				tag: 'Chất lượng dịch',
				description: '{{Rough translation}} -- dịch kém từ ngôn ngữ khác',
				excludeInGroup: true,
			},
			{
				tag: 'Cần hiệu đính',
				description:
					'{{Cần hiệu đính}} -- cần người giỏi ngữ văn tiếng Việt hiệu đính',
			},
			{
				tag: 'Mở rộng ngôn ngữ',
				description:
					'{{Mở rộng ngôn ngữ}} -- có thể nâng cấp bài bằng cách dịch từ Wikipedia ngôn ngữ khác',
				excludeInGroup: true,
				subgroup: [
					{
						name: 'expandLanguageLangCode',
						parameter: '1',
						type: 'input',
						label: 'Mã ngôn ngữ: ',
						tooltip:
							'Mã ngôn ngữ của ngôn ngữ mà bài viết sẽ được mở rộng, ví dụ en là tiếng Anh.',
					},
					{
						name: 'expandLanguageArticle',
						parameter: '2',
						type: 'input',
						label: 'Tên bài viết: ',
						tooltip:
							'Tên bài viết tiếng nước ngoài, không có tiền tố interwiki.',
					},
				],
			},
		],

		'Liên kết trong bài': [
			{ tag: 'Đường cùng', description: '{{Dead end}} -- bài viết không có liên kết đến các bài viết khác' },
			{ tag: 'Mồ côi', description: '{{Orphan}} -- không được liên kết với bất kỳ bài viết nào' },
			{ tag: 'Quá nhiều liên kết', description: '{{Overlinked}} -- quá nhiều liên kết lặp, liên kết những từ ai cũng hiểu, không hữu ích cho người đọc' },
			{ tag: 'Quá ít liên kết', description: '{{Underlinked}} -- cần thêm các liên kết đến các bài viết khác để người đọc hiểu hơn về ngữ cảnh' },
		],

		'Kỹ thuật dẫn nguồn': [
			{ tag: 'Phong cách trích dẫn', description: '{{Citation style}} -- cách ghi nguồn không nhất quán' },
			{ tag: 'Toàn URL', description: '{{Cleanup bare URLs}} -- nguồn toàn là URL trần (bare URL), dễ bị hỏng liên kết' },
			{ tag: 'Chú thích trong hàng', description: '{{No footnotes}} -- có tài liệu tham khảo nhưng thân bài không có chú thích trong hàng nào' },
			{ tag: 'Cần nhiều trích dẫn trong bài hơn', description: '{{More footnotes}} -- có tài liệu tham khảo nhưng cần thêm chú thích trong hàng' },
			{ tag: 'Cần chú thích hoàn chỉnh', description: '{{Cần chú thích hoàn chỉnh}} -- chú thích nguồn còn thiếu tên bài, đơn vị xuất bản, tên tác giả, ngày tháng và số trang' },
			{ tag: 'Citations broken', description: '{{Citations broken}} -- nguồn trong chú thích bị hỏng hoặc lỗi thời' },
		],

		'Chuyển sang dự án Wiki khác': [
			{ tag: 'Di chuyển đến Wikiquote', description: 'yêu cầu chuyển các trích dẫn nguyên văn sang Wikiquote' },
			{ tag: 'Di chuyển đến Wikisource', description: 'yêu cầu chuyển nội dung văn thư sang Wikisource' },
			{ tag: 'Di chuyển đến Wiktionary', description: 'yêu cầu chuyển định nghĩa từ vựng sang Wiktionary' },
		],

		'Thể loại': [
			{
				tag: 'Cải thiện thể loại',
				description:
					'{{Cải thiện thể loại}} -- cần thêm các thể loại khác hoặc phân vào thể loại con cụ thể hơn',
				excludeInGroup: true,
			},
			{
				tag: 'Chưa phân loại',
				description: '{{Chưa phân loại}} -- chưa xếp vào thể loại nào',
				excludeInGroup: true,
			},
		],
	},

	'Trộn/Hợp nhất nội dung': [
		{
			tag: 'Trộn lịch sử',
			description:
				'{{History merge}} -- một trang khác sẽ được hợp nhất lịch sử của nó vào trang này',
			excludeInGroup: true,
			dupeAllowed: true,
			subgroup: [
				{
					name: 'histmergeOriginalPage',
					parameter: 'originalpage',
					type: 'input',
					label: 'Bài kia: ',
					tooltip:
						'Tên của trang sẽ được hợp nhất vào trang này (bắt buộc).',
					required: true,
				},
				{
					name: 'histmergeReason',
					parameter: 'reason',
					type: 'input',
					label: 'Lý do: ',
					tooltip:
						'Giải thích ngắn gọn lý do cần trộn lịch sử.',
				},
				{
					name: 'histmergeSysopDetails',
					parameter: 'details',
					type: 'input',
					label: 'Chi tiết thêm: ',
					tooltip:
						'Đối với các trường hợp phức tạp, cung cấp thêm hướng dẫn cho quản trị viên.',
				},
			],
		},
		{
			tag: 'Hợp nhất',
			description:
				'{{Merge}} -- yêu cầu hợp nhất bài này vào một bài khác',
			excludeInGroup: true,
			subgroup: getMergeSubgroups('Hợp nhất'),
		},
		{
			tag: 'Hợp nhất từ',
			description:
				'{{Merge from}} -- một bài viết khác nên được hợp nhất vào bài này',
			excludeInGroup: true,
			dupeAllowed: true,
			subgroup: getMergeSubgroups('Hợp nhất từ'),
		},
		{
			tag: 'Hợp nhất đến',
			description:
				'{{Merge to}} -- yêu cầu hợp nhất bài này vào một bài khác',
			excludeInGroup: true,
			subgroup: getMergeSubgroups('Hợp nhất đến'),
		},
	],

	'Thông tin': [
		{
			tag: 'Đang tạo bài',
			description: '{{Đang tạo bài}} -- đang tạo bài mới',
		},
		{
			tag: 'Đang sửa đổi',
			description:
				'{{In use}} -- đang trải qua một sửa đổi lớn trong thời gian ngắn',
			excludeInGroup: true,
		},
		{
			tag: 'Đang viết',
			description:
				'{{Under construction}} -- đang trong quá trình mở rộng hoặc đại tu',
			excludeInGroup: true,
		},
	],
};

class ArticleMode extends TagMode {
	name = 'article';
	tagList = articleTagList;
	removalSupported = true;

	params!: {
		newTags: string[];
		existingTags: string[];
		tagsToRemove: string[];
		tagsToRetain: string[];
		groupableExistingTags: string[];
		groupableNewTags: string[];
		nonGroupableNewTags: string[];
		groupableExistingTagsText: string;
		[paramName: string]: any;
	};

	// Configurations
	groupTemplateName = 'Nhiều vấn đề';
	groupTemplateNameRegex = '(?:multiple ?issues|article ?issues|mi)(?!\\s*\\|\\s*section\\s*=)';
	groupTemplateNameRegexFlags = 'i';
	groupMinSize = 2;
	assumeUnknownTagsGroupable = false;

	static isActive() {
		return [0, 118].indexOf(mw.config.get('wgNamespaceNumber')) !== -1 && !!mw.config.get('wgCurRevisionId'); // check if page exists
	}

	getMenuTooltip() {
		return 'Thêm hoặc xóa các thẻ bảo trì bài viết';
	}

	getWindowTitle() {
		return 'Gắn thẻ bảo trì bài viết';
	}

	makeForm(Window: Window) {
		super.makeForm(Window);

		this.form.append({
			type: 'checkbox',
			list: [
				{
					label: 'Nhóm vào {{Nhiều vấn đề}} nếu có thể',
					value: 'group',
					name: 'group',
					tooltip:
						'Khi áp dụng từ hai thẻ được {{Nhiều vấn đề}} hỗ trợ trở lên, các thẻ được hỗ trợ sẽ được nhóm vào một bản mẫu {{Nhiều vấn đề}}.',
					checked: getPref('groupByDefault'),
				},
			],
		});

		this.form.append({
			type: 'input',
			label: 'Lý do',
			name: 'reason',
			tooltip: 'Lý do tùy chọn được thêm vào tóm lược sửa đổi. Khuyến nghị khi xóa thẻ.',
			size: '60px',
		});

		this.formAppendPatrolLink();
	}

	// For historical reasons, this isn't named customArticleTagList
	getCustomTagPrefName() {
		return 'customTagList';
	}

	parseExistingTags() {
		this.existingTags = [];
		if (!this.canRemove()) {
			return;
		}

		// All tags are HTML table elements that are direct children of .mw-parser-output,
		// except when they are within {{multiple issues}}
		$('.mw-parser-output')
			.children()
			.each((i, e) => {
				// break out on encountering the first heading, which means we are no
				// longer in the lead section
				if (e.tagName === 'H2') {
					return false;
				}

				// The ability to remove tags depends on the template's {{ambox}} |name=
				// parameter bearing the template's correct name (preferably) or a name that at
				// least redirects to the actual name

				// All tags have their first class name as "box-" + template name
				var className = typeof e.className === 'string' ? e.className : (e.getAttribute ? e.getAttribute('class') || '' : '');
				if (className && className.indexOf('box-') === 0) {
					var firstClass = e.classList && e.classList[0];
					if (firstClass && ['box-Nhiều_vấn_đề', 'box-Multiple_issues'].indexOf(firstClass) !== -1) {
						$(e)
							.find('.ambox')
							.each((idx, el) => {
								var elClass = el.classList && el.classList[0];
								if (elClass && elClass.indexOf('box-') === 0) {
									var tag = elClass.slice(4).replace(/_/g, ' ');
									this.existingTags.push(tag);
								}
							});
						return; // continue
					}

					if (firstClass && firstClass.indexOf('box-') === 0) {
						var tag = firstClass.slice(4).replace(/_/g, ' ');
						this.existingTags.push(tag);
					}
				}
			});

		// {{Uncategorized}} and {{Improve categories}} are usually placed at the end
		if ($('.box-Uncategorized').length) {
			this.existingTags.push('Uncategorized');
		}
		if ($('.box-Improve_categories').length) {
			this.existingTags.push('Improve categories');
		}
	}

	// Tagging process:
	/// Initial cleanup
	/// Checking if group is present, or if it needs to be added
	/// Adding selected tags
	/// Putting existing tags into group if it's being added
	/// Removing unselected existing tags
	/// Final cleanup
	/// Save

	validateInput() {
		let params = this.params,
			tags = params.tags;
		if (['Hợp nhất', 'Hợp nhất từ', 'Hợp nhất đến'].filter((t: string) => tags.indexOf(t) !== -1).length > 1) {
			return 'Chỉ chọn một trong {{Hợp nhất}}, {{Hợp nhất từ}} và {{Hợp nhất đến}}. Nếu cần hợp nhất nhiều bài, hãy dùng {{Hợp nhất}} và phân tách tên bài bằng ký tự | (trong trường hợp này Twinkle không thể tự động gắn thẻ các bài khác).';
		}
		if ((params.mergeTagOther || params.mergeReason) && params.mergeTarget && params.mergeTarget.indexOf('|') !== -1) {
			return 'Hiện chưa hỗ trợ gắn thẻ nhiều bài trong một lần hợp nhất hoặc mở thảo luận cho nhiều bài. Hãy tắt tùy chọn gắn thẻ bài viết khác và/hoặc xóa ô lý do rồi thử lại.';
		}
	}

	preprocessParams() {
		super.preprocessParams();
		let params = this.params;

		params.disableGrouping = !params.group;

		params.tags.forEach((tag: string) => {
			switch (tag) {
				case 'Hợp nhất':
				case 'Hợp nhất đến':
				case 'Hợp nhất từ':
					params.mergeTag = tag;
					// normalize the merge target for now and later
					params.mergeTarget = Morebits.string.toUpperCaseFirstChar(params.mergeTarget.replace(/_/g, ' '));

					this.templateParams[tag]['1'] = params.mergeTarget;

					// link to the correct section on the talk page, for article space only
					if (mw.config.get('wgNamespaceNumber') === 0 && (params.mergeReason || params.discussArticle)) {
						if (!params.discussArticle) {
							// discussArticle is the article whose talk page will contain the discussion
							params.discussArticle = tag === 'Hợp nhất đến' ? params.mergeTarget : mw.config.get('wgTitle');
							// nonDiscussArticle is the article which won't have the discussion
							params.nonDiscussArticle = tag === 'Hợp nhất đến' ? mw.config.get('wgTitle') : params.mergeTarget;
							var direction =
								'[[' +
								params.nonDiscussArticle +
								']]' +
								(params.mergeTag === 'Hợp nhất' ? ' với ' : ' vào ') +
								'[[' +
								params.discussArticle +
								']]';
							params.talkDiscussionTitleLinked = 'Đề xuất hợp nhất ' + direction;
							params.talkDiscussionTitle = params.talkDiscussionTitleLinked.replace(/\[\[(.*?)\]\]/g, '$1');
						}
						this.templateParams[tag].discuss = 'Talk:' + params.discussArticle + '#' + params.talkDiscussionTitle;
					}
					break;
				default:
					break;
			}
		});
	}

	initialCleanup() {
		this.pageText = this.pageText.replace(/\{\{\s*([Uu]serspace draft)\s*(\|(?:\{\{[^{}]*\}\}|[^{}])*)?\}\}\s*/g, '');
	}

	// getTagSearchRegex(tag) {
	// 	return new RegExp('\\{\\{' + tag + '(\\||\\}\\})', 'im');
	// }

	/**
	 * Create params.newTags, params.groupableNewTags, params.nonGroupableNewTags,
	 * params.groupableExistingTags
	 * Any tags to be added at the bottom of the page get added in this function itself.
	 */
	sortTags() {
		let params = this.params;
		params.newTags = params.tags.filter((tag: string) => {
			let exists = this.getTagRegex(tag).test(this.pageText);
			if (exists && (!this.flatObject[tag] || !this.flatObject[tag].dupeAllowed)) {
				Morebits.status.warn('Thông tin', `Đã tìm thấy {{${tag}}} trong ${this.name} ... loại trừ`);

				// XXX: don't do anything else with merge tags: handle this better!
				if (['Hợp nhất', 'Hợp nhất đến'].indexOf(tag) !== -1) {
					params.mergeTarget = params.mergeReason = params.mergeTagOther = null;
				}
				return false; // remove from params.newTags
			} else if (tag === 'Uncategorized' || tag === 'Improve categories') {
				this.pageText += '\n\n' + this.getTagText(tag);
				return false; // remove from params.newTags, since it's now already inserted
			}
			return true;
		});

		if (!this.groupTemplateName) {
			// tag grouping disabled
			return;
		}

		params.groupableExistingTags = params.tagsToRetain.filter((tag: string) => this.isGroupable(tag));
		params.groupableNewTags = [];
		params.nonGroupableNewTags = [];
		params.newTags.forEach((tag: string) => {
			if (this.isGroupable(tag)) {
				params.groupableNewTags.push(tag);
			} else {
				params.nonGroupableNewTags.push(tag);
			}
		});
	}

	/**
	 * Adds new tags to pageText. If there are existing tags which are groupable but outside the
	 * group, they are put into it.
	 */
	addAndRearrangeTags() {
		let params = this.params;

		// Grouping disabled for this mode
		if (!this.groupTemplateName) {
			this.addTagsOutsideGroup(params.newTags);
			return $.Deferred().resolve();
		}

		/// Case 1. Group exists: New groupable tags put into group. Existing groupable tags that were outside are pulled in.
		if (this.groupRegex().test(this.pageText)) {
			Morebits.status.info('Thông tin', 'Thêm các thẻ được hỗ trợ bên trong thẻ {{Nhiều vấn đề}}');

			this.addTagsOutsideGroup(params.nonGroupableNewTags);

			// ensure all groupable existing tags are in group
			return this.spliceGroupableExistingTags().then((groupableExistingTagsText) => {
				this.addTagsIntoGroup(groupableExistingTagsText + this.makeTagSetText(params.groupableNewTags));
			});

			/// Case 2. No group exists, but should be added: Group created. Existing groupable tags are put in it. New groupable tags also put in it.
		} else if (this.shouldAddGroup()) {
			Morebits.status.info('Thông tin', 'Gom nhóm các thẻ được hỗ trợ bên trong thẻ {{Nhiều vấn đề}}');

			return this.spliceGroupableExistingTags().then((groupableExistingTagsText) => {
				let groupedTagsText =
					'{{' +
					this.groupTemplateName +
					'|\n' +
					this.makeTagSetText(params.groupableNewTags) +
					groupableExistingTagsText +
					'}}';
				let ungroupedTagsText = this.makeTagSetText(params.nonGroupableNewTags);
				this.pageText = this.insertTagText(groupedTagsText + '\n' + ungroupedTagsText, this.pageText);
			});

			/// Case 3. No group exists, no group to be added
		} else {
			this.addTagsOutsideGroup(params.newTags);
			return $.Deferred().resolve();
		}
		/// If group needs to be removed because of removal of tags, that's handled in finalCleanup, not here.
	}

	/**
	 * Inserts `tagText` (the combined wikitext of one or more tags) to the top of the
	 * pageText at the correct position, taking account of any existing hatnote templates.
	 * @param tagText
	 * @param pageText
	 */
	insertTagText(tagText: string, pageText: string) {
		// Insert tag after short description or any hatnotes,
		// as well as deletion/protection-related templates
		var wikipage = new Morebits.wikitext.page(pageText);
		var templatesAfter =
			hatnoteRegex +
			// Protection templates
			'pp|pp-.*?|' +
			// CSD
			'db|delete|db-.*?|speedy deletion-.*?|' +
			// PROD
			'(?:proposed deletion|prod blp)\\/dated(?:\\s*\\|(?:concern|user|timestamp|help).*)+|' +
			// not a hatnote, but sometimes under a CSD or AfD
			'salt|proposed deletion endorsed';
		// AfD is special, as the tag includes html comments before and after the actual template
		// trailing whitespace/newline needed since this subst's a newline
		var afdRegex =
			'(?:<!--.*AfD.*\\n\\{\\{(?:Article for deletion\\/dated|AfDM).*\\}\\}\\n<!--.*(?:\\n<!--.*)?AfD.*(?:\\s*\\n))?';
		return wikipage.insertAfterTemplates(tagText, templatesAfter, undefined, afdRegex).getText();
	}

	// Override to include |date= param, which is applicable for all tags
	// Could also have done this by adding the date param for all tags in
	// this.templateParams thorough this.preprocessParams()
	getTagText(tag: string) {
		const params = this.params;
		let currentTag = '{{' + tag;

		switch (tag) {
			case 'Chất lượng kém': {
				const reason = params.cleanup || 'Chưa có lý do';

				return '{{thế:' + tag + '|lý do=' + reason + '}}';
			}

			case 'Cần dọn dẹp': {
				const reason = params.cleanup || 'Chưa có lý do';

				currentTag += '|reason=' + reason;
				break;
			}

			case 'Close paraphrasing':
				currentTag += '|source=' + params.closeParaphrasing;
				break;

			case 'Biên tập':
				if (params.copyEdit) {
					currentTag += '|for=' + params.copyEdit;
				}
				break;

			case 'Chép dán':
				if (params.copypaste) {
					currentTag += '|url=' + params.copypaste;
				}
				break;

			case 'Mở rộng ngôn ngữ':
				currentTag += '|topic=';
				currentTag += '|langcode=' + params.expandLanguageLangCode;

				if (params.expandLanguageArticle !== null) {
					currentTag += '|otherarticle=' + params.expandLanguageArticle;
				}
				break;

			case 'Expert needed':
				if (params.expertNeeded) {
					currentTag += '|1=' + params.expertNeeded;
				}

				if (params.expertNeededTalk) {
					currentTag += '|talk=' + params.expertNeededTalk;
				}

				if (params.expertNeededReason) {
					currentTag += '|reason=' + params.expertNeededReason;
				}
				break;

			case 'Tầm nhìn hẹp':
				currentTag += '|1=bài viết';

				if (params.globalizeRegion) {
					currentTag += '|2=' + params.globalizeRegion;
				}
				break;

			case 'Không nổi bật':
				if (params.notability !== 'none') {
					currentTag += '|' + params.notability;
				}
				break;

			case 'Trộn lịch sử':
				currentTag += '|originalpage=' + params.histmergeOriginalPage;

				if (params.histmergeReason) {
					currentTag += '|reason=' + params.histmergeReason;
				}

				if (params.histmergeSysopDetails) {
					currentTag += '|details=' + params.histmergeSysopDetails;
				}
				break;

			case 'Hợp nhất':
			case 'Hợp nhất từ':
			case 'Hợp nhất đến': {
				params.mergeTag = tag;

				params.mergeTarget =
					Morebits.string.toUpperCaseFirstChar(
						params.mergeTarget.replace(/_/g, ' ')
					);

				currentTag += '|' + params.mergeTarget;

				if (
					mw.config.get('wgNamespaceNumber') === 0 &&
					(params.mergeReason || params.discussArticle)
				) {
					if (!params.discussArticle) {
						params.discussArticle =
							tag === 'Hợp nhất đến'
								? params.mergeTarget
								: mw.config.get('wgTitle');

						params.nonDiscussArticle =
							tag === 'Hợp nhất đến'
								? mw.config.get('wgTitle')
								: params.mergeTarget;

						const direction =
							'[[' + params.nonDiscussArticle + ']]' +
							(tag === 'Hợp nhất' ? ' với ' : ' vào ') +
							'[[' + params.discussArticle + ']]';

						params.talkDiscussionTitleLinked =
							'Đề xuất hợp nhất ' + direction;

						params.talkDiscussionTitle =
							params.talkDiscussionTitleLinked.replace(
								/\[\[(.*?)\]\]/g,
								'$1'
							);
					}

					currentTag +=
						'|discuss=Talk:' +
						params.discussArticle +
						'#' +
						params.talkDiscussionTitle;
				}

				break;
			}

			default:
				return super.getTagText(tag);
		}

		return (
			currentTag +
			'|date={{subst:CURRENTMONTHNAME}}/{{subst:CURRENTYEAR}}}}\n'
		);
	}

	savePage() {
		return super.savePage().then(() => {
			return this.postSave(this.pageobj);
		});
	}

	postSave(pageobj: Page) {
		let params = this.params;
		let promises = [];

		// special functions for merge tags
		if (params.mergeReason) {
			// post the rationale on the talk page (only operates in main namespace)
			var talkpage = new Page('Talk:' + params.discussArticle, 'Đăng lý do lên trang thảo luận');
			talkpage.setNewSectionText(params.mergeReason.trim() + ' ~~~~');
			talkpage.setNewSectionTitle(params.talkDiscussionTitleLinked);
			talkpage.setChangeTags(Twinkle.changeTags);
			talkpage.setWatchlist(getPref('watchMergeDiscussions'));
			talkpage.setCreateOption('recreate');
			promises.push(talkpage.newSection());
		}

		if (params.mergeTagOther) {
			// tag the target page if requested
			var otherTagName = 'Hợp nhất';
			if (params.mergeTag === 'Hợp nhất từ') {
				otherTagName = 'Hợp nhất đến';
			} else if (params.mergeTag === 'Hợp nhất đến') {
				otherTagName = 'Hợp nhất từ';
			}
			var otherpage = new Page(params.mergeTarget, 'Gắn thẻ bài viết khác (' + params.mergeTarget + ')');
			otherpage.setChangeTags(Twinkle.changeTags);
			promises.push(
				otherpage.load().then(() => {
					this.templateParams[otherTagName] = {
						// these will be accessed by this.getTagText()
						1: Morebits.pageNameNorm,
						discuss: this.templateParams[params.mergeTag].discuss || '',
					};
					// XXX: check if {{Merge from}} or {{Merge}} tag already exists?
					let pageText = this.insertTagText(this.getTagText(otherTagName) + '\n', otherpage.getPageText());
					otherpage.setPageText(pageText);
					otherpage.setEditSummary(TagCore.makeEditSummary([otherTagName], []));
					otherpage.setWatchlist(getPref('watchTaggedPages'));
					otherpage.setMinorEdit(getPref('markTaggedPagesAsMinor'));
					otherpage.setCreateOption('nocreate');
					return otherpage.save();
				})
			);
		}

		return $.when.apply($, promises);
	}
}

class FileMode extends TagMode {
	name = 'file';
	tagList = fileTagList;
	removalSupported = true;

	getMenuTooltip() {
		return 'Thêm hoặc xóa các nhãn bảo trì tập tin';
	}

	getWindowTitle() {
		return 'Gắn nhãn bảo trì tập tin';
	}

	makeForm(Window: Window) {
		super.makeForm(Window);

		this.form.append({
			type: 'input',
			label: 'Lý do',
			name: 'reason',
			tooltip:
				'Lý do tùy chọn được thêm vào tóm lược sửa đổi. Khuyến nghị khi xóa nhãn.',
			size: '60px',
		});

		this.formAppendPatrolLink();
	}

	getCustomTagPrefName() {
		return 'customTagList';
	}
}

TagCore.modeList = [
	ArticleMode,
	FileMode,
];

export class Tag extends TagCore {
	footerlinks = {
		'Trợ giúp Twinkle': 'WP:TW/DOC#tag',
		'Báo cáo lỗi TW2026': 'Thảo luận Wikipedia:Twinkle/Twinkle2026',
	};

	static userPreferences() {
		const prefs = super.userPreferences() as PreferenceGroup;

		return prefs;
	}
}