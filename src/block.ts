import { BlockCore, BlockPresetInfo } from './core';

export class Block extends BlockCore {
	footerlinks = {
		'Bản mẫu cấm': 'Template:Uw-block/doc/Block_templates',
		'Quy định cấm': 'WP:BLOCK',
		'Tùy chọn cấm': 'WP:TW/PREF#block',
		'Trợ giúp Twinkle': 'WP:TW/DOC#block',
		'Báo cáo lỗi TW2026': 'Thảo luận Wikipedia:Twinkle/Twinkle2026',
	};

	blockPresetsInfo: Record<string, BlockPresetInfo> = {
		'anonblock': {
			expiry: '31 hours',
			forAnonOnly: true,
			nocreate: true,
			nonstandard: true,
			reason: '{{cấm vô danh}}',
			sig: '~~~~',
		},
		'anonblock - school': {
			expiry: '36 hours',
			forAnonOnly: true,
			nocreate: true,
			nonstandard: true,
			reason: '{{cấm vô danh}} <!-- Có thể là IP trường học -->',
			templateName: 'cấm vô danh',
			sig: '~~~~',
		},
		'blocked proxy': {
			expiry: '1 year',
			forAnonOnly: true,
			nocreate: true,
			nonstandard: true,
			hardblock: true,
			reason: '{{cấm proxy}}',
			sig: null,
		},
		'CheckUser block': {
			expiry: '1 week',
			forAnonOnly: true,
			nocreate: true,
			nonstandard: true,
			reason: '{{CheckUser block}}',
			sig: '~~~~',
			requireGroup: 'checkuser',
		},
		'checkuserblock-account': {
			autoblock: true,
			expiry: 'infinity',
			forRegisteredOnly: true,
			nocreate: true,
			nonstandard: true,
			reason: '{{checkuserblock-account}}',
			sig: '~~~~',
			requireGroup: 'checkuser',
		},
		'checkuserblock-wide': {
			forAnonOnly: true,
			nocreate: true,
			nonstandard: true,
			reason: '{{checkuserblock-wide}}',
			sig: '~~~~',
			requireGroup: 'checkuser',
		},
		'colocationwebhost': {
			expiry: '1 year',
			forAnonOnly: true,
			nonstandard: true,
			reason: '{{colocationwebhost}}',
			sig: null,
		},
		'oversightblock': {
			autoblock: true,
			expiry: 'infinity',
			nocreate: true,
			nonstandard: true,
			reason: '{{OversightBlock}}',
			sig: '~~~~',
			requireGroup: 'oversight',
		},
		'school block': {
			forAnonOnly: true,
			nocreate: true,
			nonstandard: true,
			reason: '{{school block}}',
			sig: '~~~~',
		},
		'spamblacklistblock': {
			forAnonOnly: true,
			expiry: '1 month',
			disabletalk: true,
			nocreate: true,
			reason: '{{spamblacklistblock}} <!-- cố gắng thêm vào liên kết bị chặn [[Special:Log/spamblacklist]] -->',
		},
		'tor': {
			expiry: '1 year',
			forAnonOnly: true,
			nonstandard: true,
			reason: '{{Tor}}',
			sig: null,
		},
		'webhostblock': {
			expiry: '1 year',
			forAnonOnly: true,
			nonstandard: true,
			reason: '{{webhostblock}}',
			sig: null,
		},

		'uw-3block': {
			autoblock: true,
			expiry: '24 hours',
			nocreate: true,
			pageParam: true,
			reason: 'Vi phạm quy định [[WP:3RR|ba lần hồi sửa]]',
			summary: 'Bạn đã bị cấm sửa đổi vì vi phạm [[WP:3RR|quy định ba lần hồi sửa]]',
		},
		'uw-ablock': {
			autoblock: true,
			expiry: '31 hours',
			forAnonOnly: true,
			nocreate: true,
			pageParam: true,
			reasonParam: true,
			summary: 'Địa chỉ IP này đã bị tạm thời cấm sửa đổi',
			suppressArticleInSummary: true,
		},
		'uw-adblock': {
			autoblock: true,
			nocreate: true,
			pageParam: true,
			reason: 'Sử dụng Wikipedia với mục đích [[Wikipedia:Spam|spam]] hoặc [[WP:KHONGQUANGCAO|quảng cáo]]',
			summary: 'Bạn đã bị cấm sửa đổi vì lạm dụng quyền sửa đổi để [[WP:SOAP|spam hoặc quảng cáo]]',
		},
		'uw-bioblock': {
			autoblock: true,
			nocreate: true,
			pageParam: true,
			reason: 'Vi phạm quy định [[Wikipedia:Tiểu sử người đang sống|tiểu sử người đang sống]]',
			summary: 'Bạn đã bị cấm sửa đổi vì vi phạm quy định về [[Wikipedia:Tiểu sử người đang sống|tiểu sử người đang sống]] của Wikipedia',
		},
		'uw-block': {
			autoblock: true,
			expiry: '24 hours',
			forRegisteredOnly: true,
			nocreate: true,
			pageParam: true,
			reasonParam: true,
			summary: 'Thông báo: Bạn đã bị cấm sửa đổi tại Wikipedia tiếng Việt',
			suppressArticleInSummary: true,
		},
		'uw-blockindef': {
			autoblock: true,
			expiry: 'infinity',
			forRegisteredOnly: true,
			nocreate: true,
			pageParam: true,
			reasonParam: true,
			summary: 'Bạn đã bị cấm sửa đổi vô thời hạn tại Wikipedia tiếng Việt',
			suppressArticleInSummary: true,
		},
		'uw-blocknotalk': {
			disabletalk: true,
			pageParam: true,
			reasonParam: true,
			summary: 'Bạn đã bị cấm sửa đổi tại Wikipedia tiếng Việt; đồng thời quyền sửa đổi trang thảo luận thành viên của bạn đã bị thu hồi',
			suppressArticleInSummary: true,
		},
		'uw-botblock': {
			forRegisteredOnly: true,
			pageParam: true,
			reason: 'Vận hành [[WP:BOT|tập lệnh bot]] [[WP:BOT/YCCQ|chưa được cấp phép]]',
			summary: 'Bạn đã bị cấm sửa đổi vì có vẻ như bạn đang vận hành một [[WP:BOT|tập lệnh bot]] mà không có [[WP:BRFA|sự phê duyệt]]',
		},
		'uw-botublock': {
			expiry: 'infinity',
			forRegisteredOnly: true,
			reason: '{{cb-cấm-tên bot}} <!-- Tên người dùng bot, cấm mềm -->',
			summary: 'Bạn đã bị cấm sửa đổi vô thời hạn vì [[WP:TND|tên người dùng]] chỉ ra đây là một tài khoản [[WP:BOT|bot]] chưa được chấp thuận để sửa đổi',
		},
		'uw-botuhblock': {
			autoblock: true,
			expiry: 'infinity',
			forRegisteredOnly: true,
			nocreate: true,
			reason: '{{cb-cấm-tên bot-vp rõ}} <!-- Tên người dùng bot và tài khoản chỉ phá hoại -->',
			summary: 'Bạn đã bị cấm sửa đổi vô thời hạn vì vi phạm trắng trợn [[WP:TND|quy định về tên người dùng]].',
		},
		'uw-causeblock': {
			expiry: 'infinity',
			forRegisteredOnly: true,
			reason: '{{uw-causeblock}} <!-- Tên người dùng đại diện cho tổ chức -->',
			summary: 'Bạn đã bị cấm sửa đổi vô thời hạn vì [[WP:TND|tên người dùng]] cho thấy rằng tài khoản đại diện cho một tổ chức, một nhóm người hoặc một trang web cụ thể',
		},
		'uw-compblock': {
			autoblock: true,
			expiry: 'infinity',
			forRegisteredOnly: true,
			nocreate: true,
			reason: '[[WP:BMTK|Tài khoản bị xâm nhập]]',
			summary: 'Tài khoản này đã bị cấm sửa đổi vô thời hạn vì có dấu hiệu bị [[WP:BMTK|xâm nhập trái phép]]',
		},
		'uw-copyrightblock': {
			autoblock: true,
			expiry: '24 hours',
			nocreate: true,
			pageParam: true,
			reason: '[[WP:Vi phạm bản quyền|Vi phạm bản quyền]]',
			summary: 'Bạn đã bị cấm sửa đổi vì tái diễn [[WP:VPBQ|vi phạm bản quyền]]',
		},
		'uw-dblock': {
			autoblock: true,
			nocreate: true,
			reason: 'Xóa nội dung trang',
			pageParam: true,
			summary: 'Bạn đã bị cấm sửa đổi vì tái diễn hành vi [[WP:VAND|xóa nội dung trang]]',
		},
		'uw-disruptblock': {
			autoblock: true,
			nocreate: true,
			reason: '[[WP:Sửa đổi gây hại|Sửa đổi gây hại]]',
			summary: 'Bạn đã bị cấm vì có [[WP:Sửa đổi gây hại|sửa đổi gây hại]]',
		},
		'uw-efblock': {
			autoblock: true,
			nocreate: true,
			reason: 'Liên tục kích hoạt [[WP:Bộ lọc sai phạm|bộ lọc sai phạm]]',
			summary: 'Bạn đã bị cấm sửa đổi vì liên tục sửa đổi gây hại gây kích hoạt [[WP:Bộ lọc sai phạm|bộ lọc sai phạm]]',
		},
		'uw-ewblock': {
			autoblock: true,
			expiry: '24 hours',
			nocreate: true,
			pageParam: true,
			reason: '[[WP:Bút chiến|Bút chiến]]',
			summary: 'Bạn đã bị cấm sửa đổi để ngăn ngừa [[WP:Sửa đổi gây hại|tác hại]] do việc bạn có dính líu đến [[WP:Bút chiến|bút chiến]]',
		},
		'uw-hblock': {
			autoblock: true,
			nocreate: true,
			pageParam: true,
			reason: '[[WP:TCCN|Tấn công cá nhân]] hoặc [[WP:Quấy rối|quấy rối]]',
			summary: 'Bạn đã bị cấm sửa đổi vì đã cố gắng tấn công cá nhân hoặc [[WP:Quấy rối|quấy rối]] thành viên khác',
		},
		'uw-ipevadeblock': {
			forAnonOnly: true,
			nocreate: true,
			reason: '[[WP:Quy định cấm thành viên#Lách lệnh cấm|Lách lệnh cấm]]',
			summary: 'Địa chỉ IP này đã bị cấm sửa đổi vì nó được dùng để [[WP:Quy định cấm thành viên#Lách lệnh cấm|lách lệnh cấm trước đó]]',
		},
		'uw-lblock': {
			autoblock: true,
			expiry: 'infinity',
			nocreate: true,
			reason: '[[WP:DDPL|Đe dọa can thiệp pháp lý]]',
			summary: 'Bạn đã bị cấm sửa đổi vì có hành vi [[WP:DDPL|đe dọa can thiệp pháp lý]]',
		},
		'uw-nothereblock': {
			autoblock: true,
			expiry: 'infinity',
			forRegisteredOnly: true,
			nocreate: true,
			reason: 'Rõ ràng [[WP:KHONGODAY|không ở đây để xây dựng bách khoa toàn thư]]',
			summary: 'Bạn đã bị cấm sửa đổi vô thời hạn vì có vẻ như bạn [[WP:KHONGODAY|không hề ở đây để xây dựng bách khoa toàn thư]]',
		},
		'uw-npblock': {
			autoblock: true,
			nocreate: true,
			pageParam: true,
			reason: 'Tạo các trang [[WP:VONGHIA|vô nghĩa]] hoặc không phù hợp',
			summary: 'Bạn đã bị cấm sửa đổi vì tạo nhiều [[WP:VONGHIA|trang vô nghĩa]] hoặc không phù hợp',
		},
		'uw-pablock': {
			autoblock: true,
			expiry: '31 hours',
			nocreate: true,
			reason: '[[WP:KCKCN|Tấn công cá nhân]] hoặc [[WP:Quấy rối|quấy rối]]',
			summary: 'Bạn đã bị cấm sửa đổi vì có hành vi [[WP:KCKCN|tấn công cá nhân]] biên tập viên khác',
		},
		'uw-sblock': {
			autoblock: true,
			nocreate: true,
			reason: 'Thêm các liên kết [[WP:SPAM|spam]] hoặc [[WP:KHONGQUANGCAO|quảng cáo]]',
			summary: 'Bạn đã bị cấm sửa đổi vì sử dụng Wikipedia để thêm các liên kết [[WP:SPAM|spam]]',
		},
		'uw-soablock': {
			autoblock: true,
			expiry: 'infinity',
			forRegisteredOnly: true,
			nocreate: true,
			pageParam: true,
			reason: 'Tài khoản chỉ dùng để đăng [[WP:Spam|spam]] hoặc [[WP:KHONGQUANGCAO|quảng cáo]]',
			summary: 'Tài khoản này đã bị cấm sửa đổi vô thời hạn vì nó được tạo ra chỉ dùng để [[WP:SPAM|spam, quảng cáo hoặc quảng bá]]',
		},
		'uw-socialmediablock': {
			autoblock: true,
			nocreate: true,
			pageParam: true,
			reason: 'Sử dụng Wikipedia như một [[WP:KHONGMAYCHUWEB|blog, web cá nhân, mạng xã hội hoặc diễn đàn]]',
			summary: 'Bạn đã bị cấm sửa đổi vì sử dụng trang bài viết hoặc trang thành viên như một [[WP:KHONGMAYCHUWEB|blog, web cá nhân, mạng xã hội hoặc diễn đàn]]',
		},
		'uw-sockblock': {
			autoblock: true,
			forRegisteredOnly: true,
			nocreate: true,
			reason: 'Lạm dụng [[WP:Tài khoản con rối|nhiều tài khoản]]',
			summary: 'Bạn đã bị cấm sửa đổi vì lạm dụng [[WP:Tài khoản con rối|nhiều tài khoản]]',
		},
		'uw-softerblock': {
			expiry: 'infinity',
			forRegisteredOnly: true,
			reason: '{{uw-softerblock}} <!-- Tên người dùng quảng cáo, cấm mềm -->',
			summary: 'Bạn đã bị cấm sửa đổi vì [[WP:TND|tên người dùng của bạn]] thể hiện việc tài khoản này đại diện cho một tổ chức hoặc trang web',
		},
		'uw-spamublock': {
			autoblock: true,
			expiry: 'infinity',
			forRegisteredOnly: true,
			nocreate: true,
			reason: '{{uw-spamublock}} <!-- Tên người dùng và sửa đổi quảng cáo -->',
			summary: 'Bạn đã bị cấm sửa đổi vô thời hạn vì tài khoản chỉ dùng để [[WP:SPAM|spam hoặc quảng cáo]]; đồng thời tên người dùng của bạn cũng vi phạm [[WP:TND|quy định về tên người dùng]]',
		},
		'uw-sockblock2': {
			autoblock: true,
			expiry: 'infinity',
			forRegisteredOnly: true,
			nocreate: true,
			reason: '[[Wikipedia:Tài khoản con rối|Con rối]] của thành viên bị cấm',
			sig: '~~~~',
			summary: 'Tài khoản này đã bị cấm vì là [[WP:CONROI|tài khoản con rối]] được tạo ra để vi phạm các quy định của Wikipedia. Nếu bạn tin rằng lệnh cấm này là không đúng, vui lòng làm theo hướng dẫn trên thông báo cấm',
		},
		'uw-spoablock': {
			autoblock: true,
			expiry: 'infinity',
			forRegisteredOnly: true,
			nocreate: true,
			reason: '[[WP:CONROI|Tài khoản con rối]]',
			summary: 'Tài khoản này đã bị cấm vì là [[WP:CONROI|tài khoản con rối]] được tạo ra để vi phạm các quy định của Wikipedia',
		},
		'uw-talkrevoked': {
			disabletalk: true,
			reason: 'Thu hồi quyền sửa đổi trang thảo luận vì sử dụng không đúng mục đích',
			prependReason: true,
			summary: 'Quyền sửa đổi trang thảo luận của bạn đã bị thu hồi',
			useInitialOptions: true,
		},
		'uw-ublock': {
			expiry: 'infinity',
			forRegisteredOnly: true,
			reason: '{{uw-ublock}} <!-- Tên người dùng vi phạm quy định -->',
			reasonParam: true,
			summary: 'Tài khoản của bạn đã bị cấm sửa đổi vì vi phạm [[WP:TND|quy định về tên người dùng]]',
		},
		'uw-ublock-double': {
			expiry: 'infinity',
			forRegisteredOnly: true,
			reason: '{{uw-ublock-double}} <!-- Tên người dùng gây nhầm lẫn với thành viên khác -->',
			summary: 'Bạn đã bị cấm sửa đổi vô thời hạn vì [[WP:TND|tên người dùng]] quá giống với thành viên khác',
		},
		'uw-ucblock': {
			autoblock: true,
			expiry: '31 hours',
			nocreate: true,
			pageParam: true,
			reason: 'Thêm nội dung không nguồn',
			summary: 'Bạn đã bị cấm sửa đổi vì liên tục thêm nội dung không nguồn',
		},
		'uw-uhblock': {
			autoblock: true,
			expiry: 'infinity',
			forRegisteredOnly: true,
			nocreate: true,
			reason: '{{uw-uhblock}} <!-- Tên người dùng vi phạm quy định trắng trợn -->',
			reasonParam: true,
			summary: 'Bạn đã bị cấm sửa đổi vô thời hạn vì vi phạm trắng trợn [[WP:TND|quy định về tên người dùng]]',
		},
		'uw-ublock-wellknown': {
			expiry: 'infinity',
			forRegisteredOnly: true,
			reason: '{{uw-ublock-wellknown}} <!-- Tên người dùng trùng với tên người nổi bật -->',
			summary: 'Bạn đã bị cấm sửa đổi vô thời hạn vì [[WP:TND|tên người dùng]] trùng với tên của một người nổi bật còn sống',
		},
		'uw-uhblock-double': {
			autoblock: true,
			expiry: 'infinity',
			forRegisteredOnly: true,
			nocreate: true,
			reason: '{{uw-uhblock-double}} <!-- Tên người dùng mạo danh biên tập viên Wikipedia khác -->',
			summary: 'Bạn đã bị cấm sửa đổi vô thời hạn vì [[WP:TND|tên người dùng]] có dấu hiệu mạo danh biên tập viên Wikipedia khác',
		},
		'uw-upeblock': {
			autoblock: true,
			expiry: 'infinity',
			forRegisteredOnly: true,
			nocreate: true,
			pageParam: true,
			reason: '[[WP:PAID|Không công bố sửa đổi nhận thù lao]], vi phạm [[foundation:ToU|Điều khoản Sử dụng]] của WMF',
			summary: 'Bạn đã bị cấm sửa đổi vô thời hạn vì đã vi phạm [[WP:PAID|quy định của Wikipedia về đóng góp được trả thù lao không công bố]]',
		},
		'uw-vaublock': {
			autoblock: true,
			expiry: 'infinity',
			forRegisteredOnly: true,
			nocreate: true,
			pageParam: true,
			reason: '{{uw-vaublock}} <!-- Tên người dùng vi phạm quy định và tài khoản rõ ràng chỉ để phá hoại -->',
			summary: 'Bạn đã bị cấm sửa đổi vô thời hạn vì tài khoản chỉ để phá hoại và vi phạm trắng trợn [[WP:TND|quy định về tên người dùng]]',
		},
		'uw-vblock': {
			autoblock: true,
			expiry: '31 hours',
			nocreate: true,
			pageParam: true,
			reason: '[[WP:VAND|Phá hoại]]',
			summary: 'Bạn đã bị cấm sửa đổi vì có hành vi [[WP:VAND|phá hoại]] bài viết',
		},
		'uw-voablock': {
			autoblock: true,
			expiry: 'infinity',
			forRegisteredOnly: true,
			nocreate: true,
			pageParam: true,
			reason: 'Tài khoản chỉ dùng để [[WP:VAND|phá hoại]]',
			summary: 'Tài khoản này đã bị cấm sửa đổi vô thời hạn vì nó chỉ được dùng để [[WP:VAND|phá hoại]]',
			sig: '~~~~',
		},
		'zombie proxy': {
			expiry: '1 month',
			forAnonOnly: true,
			nocreate: true,
			nonstandard: true,
			reason: '{{proxy ma}}',
			sig: null,
		},

		'uw-acpblock': {
			autoblock: true,
			expiry: '48 hours',
			nocreate: true,
			pageParam: false,
			reasonParam: true,
			reason: 'Sử dụng sai mục đích [[WP:CONROI|các tài khoản phụ]]',
			summary: 'Bạn đã bị [[WP:CBP|cấm tạo tài khoản mới]] vì sử dụng sai mục đích [[WP:SOCK|các tài khoản phụ]]',
		},
		'uw-acpblockindef': {
			autoblock: true,
			expiry: 'infinity',
			forRegisteredOnly: true,
			nocreate: true,
			pageParam: false,
			reasonParam: true,
			reason: 'Sử dụng sai mục đích [[WP:CONROI|các tài khoản phụ]]',
			summary: 'Bạn đã bị [[WP:CBP|cấm tạo tài khoản mới]] vô thời hạn vì sử dụng sai mục đích [[WP:SOCK|các tài khoản phụ]]',
		},
		'uw-epblock': {
			autoblock: true,
			expiry: 'infinity',
			forRegisteredOnly: true,
			nocreate: false,
			noemail: true,
			pageParam: false,
			reasonParam: true,
			reason: '[[WP:Quấy rối|Quấy rối]] qua thư điện tử',
			summary: 'Bạn đã bị [[WP:CBP|cấm gửi thư điện tử]] đến thành viên khác vì có hành vi [[WP:Quấy rối|quấy rối]]',
		},
		'uw-ewpblock': {
			autoblock: true,
			expiry: '24 hours',
			nocreate: false,
			pageParam: false,
			reasonParam: true,
			reason: '[[WP:Bút chiến|Bút chiến]]',
			summary: 'Bạn đã bị [[WP:CBP|cấm sửa đổi tại một số khu vực]] của Wikipedia vì có hành vi [[WP:Bút chiến|bút chiến]]',
		},
		'uw-pblock': {
			autoblock: true,
			expiry: '24 hours',
			nocreate: false,
			pageParam: false,
			reasonParam: true,
			summary: 'Bạn đã bị [[WP:CBP|cấm sửa đổi tại một số khu vực]] của Wikipedia',
		},
		'uw-pblockindef': {
			autoblock: true,
			expiry: 'infinity',
			forRegisteredOnly: true,
			nocreate: false,
			pageParam: false,
			reasonParam: true,
			summary: 'Bạn đã bị [[WP:CBP|cấm sửa đổi vô thời hạn tại một số khu vực]] của Wikipedia',
		},
	};

	blockGroups = [
		{
			label: 'Các lý do cấm phổ biến',
			list: [
				{ label: 'Cấm vô danh', value: 'anonblock' },
				{
					label: 'Cấm vô danh - có thể là một trường học',
					value: 'anonblock - school',
				},
				{ label: 'Cấm trường học', value: 'school block' },
				{ label: 'Cấm chung (lý do tùy chỉnh)', value: 'uw-block' },
				{
					label:
						'Cấm chung (lý do tùy chỉnh) - IP (chú ý: không thêm bản mẫu vào trang thảo luận)',
					value: 'uw-ablock',
					selected: true,
				},
				{
					label: 'Cấm chung (lý do tùy chỉnh) - vô thời hạn',
					value: 'uw-blockindef',
				},
				{ label: 'Sửa đổi gây hại', value: 'uw-disruptblock' },
				{
					label: 'Sử dụng trang thảo luận sai mục đích khi đang bị cấm',
					value: 'uw-talkrevoked',
				},
				{
					label:
						'Không phải ở đây để xây dựng một bách khoa toàn thư',
					value: 'uw-nothereblock',
				},
				{ label: 'Thêm vào nội dung không nguồn', value: 'uw-ucblock' },
				{ label: 'Phá hoại', value: 'uw-vblock' },
				{ label: 'Tài khoản chỉ để phá hoại', value: 'uw-voablock' },
			],
		},
		{
			label: 'Lý do mở rộng',
			list: [
				{
					label: 'Quảng cáo hoặc spam',
					value: 'uw-adblock'
				},
				{
					label: 'Địa chỉ IP được sử dụng để lách lệnh cấm',
					value: 'uw-ipevadeblock'
				},
				{
					label: 'Vi phạm quy định về tiêu sử người đang sống',
					value: 'uw-bioblock',
				},
				{
					label: 'Vi phạm bản quyền',
					value: 'uw-copyrightblock'
				},
				{
					label: 'Tạo các trang vô nghĩa',
					value: 'uw-npblock'
				},
				{
					label: 'Liên tục thực hiện sửa đổi gây kích hoạt bộ lọc',
					value: 'uw-efblock',
				},
				{
					label: 'Bút chiến',
					value: 'uw-ewblock'
				},
				{
					label: 'Cấm và thu hồi quyền sửa đổi trang thảo luận',
					value: 'uw-blocknotalk',
				},
				{
					label: 'Quấy rối',
					value: 'uw-hblock'
				},
				{
					label: 'Đe dọa can thiệp pháp lý',
					value: 'uw-lblock',
				},
				{
					label: 'Tấn công hoặc quấy rối cá nhân',
					value: 'uw-pablock',
				},
				{
					label: 'Tài khoản có thể đã bị xâm nhập',
					value: 'uw-compblock',
				},
				{
					label: 'Tẩy trống trang, xóa nội dung',
					value: 'uw-dblock',
				},
				{
					label: 'Tài khoản con rối của thành viên bị cấm (mới)',
					value: 'uw-sockblock2',
				},
				{
					label: 'Con rối (chủ rối)',
					value: 'uw-sockblock'
				},
				{
					label: 'Con rối (tài khoản rối) (phiên bản cũ)',
					value: 'uw-spoablock',
				},
				{
					label: 'Sử dụng Wikipedia như mạng xã hội',
					value: 'uw-socialmediablock',
				},
				{
					label: 'Thêm các liên kết spam',
					value: 'uw-sblock',
				},
				{
					label: 'Tài khoản spam/chỉ để quảng cáo',
					value: 'uw-soablock',
				},
				{
					label: 'Bot chưa được phê duyệt',
					value: 'uw-botblock',
				},
				{
					label: 'Sửa đổi nhận thù lao nhưng không tiết lộ',
					value: 'uw-upeblock',
				},
				{
					label: 'Vi phạm nguyên tắc 3 lần hồi sửa (3RR)',
					value: 'uw-3block',
				},
			],
		},
		{
			label: 'Vi phạm tên người dùng',
			list: [
				{
					label: 'Tên người dùng bot, cấm mềm',
					value: 'uw-botublock',
				},
				{
					label: 'Tên người dùng bot, cấm cứng',
					value: 'uw-botuhblock',
				},
				{
					label: 'Tên người dùng quảng cáo, cấm cứng',
					value: 'uw-spamublock',
				},
				{
					label: 'Tên người dùng quảng cáo, cấm mềm',
					value: 'uw-softerblock',
				},
				{
					label: 'Tên người dùng gây nhầm lẫn với thành viên khác, cấm mềm',
					value: 'uw-ublock-double',
				},
				{
					label: 'Vi phạm tên người dùng, cấm mềm',
					value: 'uw-ublock',
				},
				{
					label: 'Vi phạm tên người dùng, cấm cứng',
					value: 'uw-uhblock',
				},
				{
					label: 'Tên người dùng mạo danh thành viên khác, cấm cứng',
					value: 'uw-uhblock-double',
				},
				{
					label:
						'Tên người dùng đại diện cho một người nổi tiếng, cấm mềm',
					value: 'uw-ublock-wellknown',
				},
				{
					label:
						'Tên người dùng đại diện cho một tổ chức phi lợi nhuận, cấm mềm',
					value: 'uw-causeblock',
				},
				{
					label:
						'Vi phạm tên người dùng, tài khoản chỉ phá hoại',
					value: 'uw-vaublock',
				},
			],
		},
		{
			label: 'Lý do được đúc kết',
			list: [
				{
					label: 'Cấm proxy',
					value: 'blocked proxy'
				},
				{
					label: 'Cấm theo kết quả kiểm định - KĐV tự cấm',
					value: 'CheckUser block',
				},
				{
					label: 'Cấm theo kết quả kiểm định - KĐV tự cấm (tài khoản)',
					value: 'checkuserblock-account',
				},
				{
					label: 'Cấm theo kết quả kiểm định - KĐV tự cấm (rộng)',
					value: 'checkuserblock-wide',
				},
				{
					label: 'Máy chủ web cho thuê',
					value: 'colocationwebhost',
				},
				{
					label: 'Tác vụ cấm này do giám sát viên thực hiện - nếu không phải GSV vui lòng không sử dụng',
					value: 'oversightblock',
				},
				{
					label: 'Cố gắng chèn tên miền bị chặn bị chặn vào bài viết',
					value: 'spamblacklistblock',
				},
				{
					label: 'Nút thoát tor',
					value: 'tor'
				},
				{
					label: 'Máy chủ web',
					value: 'webhostblock'
				},
				{
					label: 'Proxy hoặc máy tính ma',
					value: 'zombie proxy'
				},
			],
		},
	];

	blockGroupsPartial = [
		{
			label: 'Các lý do cấm bán phần phổ biến',
			list: [
				{
					label: 'Cấm bán phần thông thường',
					value: 'uw-pblock',
					selected: true,
				},
				{
					label: 'Cấm bán phần vô thời hạn',
					value: 'uw-pblockindef',
				},
				{
					label: 'Bút chiến',
					value: 'uw-ewpblock'
				},
			],
		},
		{
			label: 'Lý do cấm bán phần mở rộng',
			list: [
				{
					label: 'Quấy rối qua thư điện tử',
					value: 'uw-epblock',
				},
				{
					label: 'Sử dụng các tài khoản phụ sai mục đích',
					value: 'uw-acpblock',
				},
				{
					label:
						'Sử dụng các tài khoản phụ sai mục đích - vô thời hạn',
					value: 'uw-acpblockindef',
				},
			],
		},
	];

	// Không cho phép cấm bán phần không gian Tiện ích/Định nghĩa Tiện ích
	// và các không gian tên thảo luận tương ứng.
	disablePartialBlockNamespaces = [2300, 2301, 2302, 2303];

	seeAlsos: never[] = [];

	toggle_see_alsos(e: QuickFormEvent) {
		const checkbox = e.target;
		const form = checkbox.form!;
		const seeAlsos = this.seeAlsos as unknown as string[];
		const reason = form.reason.value.replace(
			new RegExp(
				'( <!--|;) ' +
				'xem thêm ' +
				seeAlsos.join(' và ') +
				'( -->)?'
			),
			''
		);

		seeAlsos.splice(0, seeAlsos.length, ...seeAlsos.filter(
			(el) => el !== checkbox.value
		));

		if (checkbox.checked) {
			seeAlsos.push(checkbox.value);
		}

		const seeAlsoMessage = seeAlsos.join(' và ');

		if (!seeAlsos.length) {
			form.reason.value = reason;
		} else if (reason.indexOf('{{') !== -1) {
			form.reason.value =
				reason + ' <!-- xem thêm ' + seeAlsoMessage + ' -->';
		} else {
			form.reason.value =
				reason + '; xem ' + seeAlsoMessage;
		}
	}

	processUserInfo(userobj: any) {
		super.processUserInfo(userobj);

		if (!this.hasBlockLog) {
			(this as any).lastBlockLogId = undefined;
		}
	}

	getBlockNoticeWikitextAndSummary(params: any) {
		let text = '{{';
		const settings = this.blockPresetsInfo[params.template];

		params.messageData ??= settings;

		if (!settings.nonstandard) {
			text += 'subst:' + params.template;

			if (params.article && settings.pageParam) {
				text += '|page=' + params.article;
			}

			if (params.dstopic) {
				text += '|topic=' + params.dstopic;
			}

			if (!/te?mp|^\s*$|min/.test(params.expiry)) {
				if (params.indefinite) {
					text += '|indef=yes';
				} else if (
					!params.blank_duration &&
					!new Morebits.date(params.expiry).isValid()
				) {
					text += '|time=' + params.expiry;
				}
			}

			if (!this.isRegistered && !params.hardblock) {
				text += '|anon=yes';
			}

			if (params.reason) {
				text += '|reason=' + params.reason;
			}

			if (params.disabletalk) {
				text += '|notalk=yes';
			}

			if (params.partial) {
				if (params.pagerestrictions.length || params.namespacerestrictions.length) {
					text += '|area=' + (params.indefinite ? 'certain ' : 'from certain ');

					if (params.pagerestrictions.length) {
						text +=
							'pages (' +
							mw.language.listToText(
								params.pagerestrictions.map((p: string) => '[[:' + p + ']]')
							);

						text += params.namespacerestrictions.length ? ') và certain ' : ')';
					}

					if (params.namespacerestrictions.length) {
						const namespaceNames = params.namespacerestrictions.map(
							(id: number) => this.menuFormattedNamespaces[id]
						);

						text +=
							'[[Wikipedia:Không gian tên|các không gian tên]] (' +
							mw.language.listToText(namespaceNames) +
							')';
					}
				} else if (params.area) {
					text += '|area=' + params.area;
				} else {
					if (params.noemail) {
						text += '|email=yes';
					}

					if (params.nocreate) {
						text += '|accountcreate=yes';
					}
				}
			}
		} else {
			text += params.template;
		}

		if (settings.sig) {
			text += '|sig=' + settings.sig;
		}

		text += '}}';

		let summary = params.messageData.summary as string;

		if (params.messageData.suppressArticleInSummary !== true && params.article) {
			summary += ' on [[:' + params.article + ']]';
		}

		summary += '.';

		return [text, summary] as [string, string];
	}
}