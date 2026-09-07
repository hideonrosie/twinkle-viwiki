# 6 tháng 9 năm 2026

- **XfD**: Hỗ trợ các biểu quyết: [Wikipedia:Biểu quyết xoá bài](https://vi.wikipedia.org/wiki/Wikipedia:Bi%E1%BB%83u_quy%E1%BA%BFt_xo%C3%A1_b%C3%A0i) (AfD), [Wikipedia:Biểu quyết xoá tập tin](https://vi.wikipedia.org/wiki/Wikipedia:Bi%E1%BB%83u_quy%E1%BA%BFt_xo%C3%A1_t%E1%BA%ADp_tin) (FfD), [Wikipedia:Biểu quyết xoá trang (thể loại, bản mẫu và mô đun)](https://vi.wikipedia.org/wiki/Wikipedia:Bi%E1%BB%83u_quy%E1%BA%BFt_xo%C3%A1_trang_(th%E1%BB%83_lo%E1%BA%A1i,_b%E1%BA%A3n_m%E1%BA%ABu_v%C3%A0_m%C3%B4_%C4%91un)) (PfD), [Wikipedia:Biểu quyết xoá trang (khác)](https://vi.wikipedia.org/wiki/Wikipedia:Bi%E1%BB%83u_quy%E1%BA%BFt_xo%C3%A1_trang_(kh%C3%A1c)) (MfD).
- **Warn**: Nay đã hỗ trợ thêm nội dung cảnh báo vào cùng đề mục trong cùng tháng hiện tại. Không hỗ trợ autolevel (tự động chọn cấp độ cảnh báo), người dùng phải chọn thủ công cấp độ cảnh báo.
- Các mô đun khác được port với cấu hình từ Twinkle Legacy của Wikipedia tiếng Việt.

---

# 7 tháng 9 năm 2026

## 1. Mô đun mới

### Mô đun DI / Đề nghị xóa hình ([src/image.ts](https://github.com/hideonrosie/twinkle-viwiki/blob/master/src/image.ts))
- **Tính năng**: Thêm công cụ `Đề nghị xóa hình` (`tw-di`) kích hoạt trên các trang Tập tin cục bộ (`wgNamespaceNumber === 6`).
- **Gắn thẻ & Thông báo**:
  - Hỗ trợ các tiêu chí xóa nhanh tập tin sau 7 ngày (TT4, TT5, TT6, TT7, TT11) tự động gắn bản mẫu `{{xh-...}}`.
  - Tự động thông báo cho người tải lên ban đầu (`{{subst:xh-...-tb}}`) và ghi nhật trình xóa nhanh không gian thành viên (`Morebits.userspaceLogger`).
  - Hỗ trợ tiền tố phái sinh `ps ` / `ps-` (*tác phẩm phái sinh*).
- **Tùy chỉnh cá nhân**: Thêm cấu hình `notifyUserOnDeli`, `deliWatchPage`, `deliWatchUser` vào [Config.ts](https://github.com/hideonrosie/twinkle-viwiki/blob/master/twinkle-core/Config.ts) & `userPreferences`.

### Mô đun Báo cáo lỗi ([src/bugreport.ts](https://github.com/hideonrosie/twinkle-viwiki/blob/master/src/bugreport.ts))
- **Tính năng**: Thêm cổng liên kết `Báo cáo lỗi` (`tw-bugreport`) trên thanh công cụ Twinkle.
- **Biểu mẫu & Tự động chèn**:
  - Giao diện báo cáo đầy đủ các trường: *Tiêu đề tóm tắt*, *Mô đun gặp lỗi*, *Trang liên quan*, *Chi tiết lỗi*, *Các bước tái tạo lỗi*, *Kết quả mong đợi*.
  - Tự động tạo bản mẫu `{{subst:Wikipedia:Twinkle/Twinkle2026/bug|...}}` và chèn vào vị trí chuẩn trên trang [Thảo luận Wikipedia:Twinkle/Twinkle2026](https://vi.wikipedia.org/wiki/Th%E1%BA%A3o_lu%E1%BA%ADn_Wikipedia:Twinkle/Twinkle2026)
- **Sửa lỗi Promise**: Sử dụng lớp bọc `Page` từ `./core` giúp xử lý `.load().then(...)` mượt mà, khắc phục triệt để lỗi `no onSuccess callback provided to load()`.

---

## 2. Sửa lỗi & Nâng cấp Mô đun Khóa trang ([protect.ts](https://github.com/hideonrosie/twinkle-viwiki/blob/master/src/protect.ts) & [protectCore.ts](https://github.com/hideonrosie/twinkle-viwiki/blob/master/twinkle-core/protectCore.ts))

- **Sửa lỗi không gửi được yêu cầu khóa trang**: Chuyển trang mục tiêu về `Wikipedia:Yêu cầu khóa hay mở khóa trang` và chèn nội dung vào cuối trang, xử lý dứt điểm lỗi không tìm thấy đề mục tiếng Anh (`Could not find relevant heading on WP:RPP`).
- **Sửa lỗi URL chuyển hướng bị lặp `%25` & lặp thông báo 3 lần**:
  - Cập nhật `Morebits.wiki.actionCompleted.event` trong [morebits.js](https://github.com/hideonrosie/twinkle-viwiki/blob/master/twinkle-core/morebits/morebits.js): dùng biến cục bộ `redirectUrl`, bổ sung kiểm tra `!/^\//.test(redirectUrl)` và reset `notice` / `redirect` về `null` ngay sau khi thực thi.
  - Áp dụng `Morebits.wiki.addCheckpoint()` và `removeCheckpoint()` trong [protectCore.ts](https://github.com/hideonrosie/twinkle-viwiki/blob/master/twinkle-core/protectCore.ts) để chặn sự kiện hoàn tất kích hoạt sớm giữa các bước API nối tiếp (edit + watch).
- **Tự động điền Lý do khóa**: Cập nhật `changePreset` trong [protectCore.ts](https://github.com/hideonrosie/twinkle-viwiki/blob/master/twinkle-core/protectCore.ts) để khi chọn dropdown "Loại khóa" trong tab Yêu cầu khóa trang, ô văn bản *Lý do* (`form.reason`) tự động điền lý do chuẩn theo preset tương ứng.
- **Việt hóa & Định dạng chữ thường**:
  - Việt hóa thời hạn khóa: `temporary` -> **`tạm thời`**, `indefinite` -> **`vô hạn`**.
  - Viết thường chữ cái đầu của mức khóa trong tóm lược sửa đổi (`Đang yêu cầu bán khóa...`) và hiển thị chuẩn đầu câu trên trang wiki (`Tạm thời bán khóa:`, `Vô hạn bán khóa:`).

---

## 3. Tối ưu cấu trúc & Tách mã (Core Refactoring)

- **Đưa Preferences vào Core**: Chuyển các tùy chỉnh người dùng (`userPreferences`) và cấu hình mặc định từ các file riêng lẻ ([speedy.ts](https://github.com/hideonrosie/twinkle-viwiki/blob/master/src/speedy.ts), [fluff.ts](https://github.com/hideonrosie/twinkle-viwiki/blob/master/src/fluff.ts), [block.ts](https://github.com/hideonrosie/twinkle-viwiki/blob/master/src/block.ts), [twinkle.ts](https://github.com/hideonrosie/twinkle-viwiki/blob/master/src/twinkle.ts)) về tập trung tại `twinkle-core` ([Config.ts](https://github.com/hideonrosie/twinkle-viwiki/blob/master/twinkle-core/Config.ts), [speedyCore.ts](https://github.com/hideonrosie/twinkle-viwiki/blob/master/twinkle-core/speedyCore.ts), [fluffCore.ts](https://github.com/hideonrosie/twinkle-viwiki/blob/master/twinkle-core/fluffCore.ts), [blockCore.ts](https://github.com/hideonrosie/twinkle-viwiki/blob/master/twinkle-core/blockCore.ts)) giúp mã nguồn tại `src/` gọn nhẹ và dễ bảo trì.
- **Cấu hình Webpack Alias**: Cập nhật [webpack.config.js](https://github.com/hideonrosie/twinkle-viwiki/blob/master/webpack.config.js) để alias `'twinkle-core'` và `corePath` trực tiếp tới thư mục mã nguồn `./twinkle-core` cục bộ. Giúp dev server và lệnh build ghi nhận ngay lập tức mọi thay đổi trong `twinkle-core` mà không phụ thuộc vào `node_modules`.

---

## 4. Thay đổi tên của dự án
- Tên của dự án hiện được đổi từ `TwinkleV3` -> `Twinkle2026`, vì TwinkleV3 là phiên bản của twinkle-core, không hợp lý.