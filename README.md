# Healthy Weight 2.1 — by toitenphuong

Bản nâng cấp từ Healthy Weight 2.0 có **đăng ký/đăng nhập email, khôi phục mật khẩu, khu vực tài khoản và đồng bộ đám mây thủ công** giữa iPad / iPhone / Android / website. Các tính năng Free, trang giới thiệu Plus và giao diện y khoa được giữ lại. **Chưa có thanh toán thật hoặc AI thật.**

## Trước khi cập nhật GitHub

1. Trên Healthy Weight 2.0 hiện tại, vào **Dữ liệu & tác giả → Xuất JSON** để sao lưu, nhất là nếu đã nhập dữ liệu.
2. Giải nén ZIP, tải **toàn bộ 7 tệp sau** lên thư mục gốc repo `toitenphuong19-ctrl/healthy-weight`: `index.html`, `auth-sync.js`, `config.js`, `manifest.webmanifest`, `service-worker.js`, `icon.svg`, `README.md`. Có thể giữ `supabase-setup.sql` trong repo để tham khảo nhưng **không phải file bắt buộc để GitHub Pages chạy**. Tất cả file thuộc dự án, không tải file ZIP nguyên lên.
3. Trong GitHub, chọn **Add file → Upload files → Commit changes**, không sửa lại repository `renalmet`.
4. Sau khi GitHub Pages triển khai thành công, mở `https://toitenphuong19-ctrl.github.io/healthy-weight/?v=21` bằng Safari. Xem mục **Tài khoản**. Khi chưa cấu hình Supabase, ứng dụng tiếp tục chạy ở chế độ khách.

## Cấu hình đăng ký/đăng nhập thật trên Supabase

1. Vào https://supabase.com/dashboard, tạo project mới với tên tùy ý (ví dụ `healthy-weight-prod`). Lưu mật khẩu database ở nơi an toàn, không đưa lên GitHub.
2. Trong project, vào **SQL Editor → New query**. Mở tệp `supabase-setup.sql` và chạy toàn bộ nội dung. Đây là bước bắt buộc để tạo bảng riêng tư có RLS. **Chưa chạy SQL thì không được đưa dữ liệu sức khỏe lên hệ thống.**
3. Tìm **Project URL** và **Publishable key** ở **Project Settings → API Keys** (vị trí có thể thay đổi theo giao diện Supabase). Legacy `anon` key cũng là key công khai phù hợp, nhưng ưu tiên publishable key. **KHÔNG lấy secret key hoặc service_role key.**
4. Trên GitHub vào file **`config.js` → Edit** (biểu tượng bút). Thay nội dung hai chuỗi `url` và `publishableKey` bằng thông tin tương ứng, ví dụ:

```js
window.HEALTHY_WEIGHT_SUPABASE = {
  url: "https://PROJECT_ID.supabase.co",
  publishableKey: "sb_publishable_xxx"
};
```

5. Trong Supabase → **Authentication → URL Configuration**, đặt **Site URL** là `https://toitenphuong19-ctrl.github.io/healthy-weight/`, thêm đúng URL này vào **Redirect URLs**. Kiểm tra Email authentication đã bật và cấu hình gửi mail xác nhận. Môi trường sản xuất nên cấu hình SMTP phù hợp; dịch vụ email mặc định có hạn mức.
6. Commit `config.js`, mở lại web bằng tab Safari mới với `?v=21`. Đăng ký bằng email và mật khẩu từ 8 ký tự; xác nhận email khi được yêu cầu; đăng nhập bằng email.
7. Kiểm thử bằng **hai tài khoản** và **hai thiết bị** trước khi mời người dùng thật. Tài khoản A không được xem hoặc sửa bản ghi của B. Kiểm thử Đăng ký → xác nhận email → Đăng nhập → Quên mật khẩu → Đặt lại mật khẩu → Đăng xuất. Kiểm tra nút đồng bộ trên iPad và Android.

## Đồng bộ dữ liệu (đúng theo thiết kế 2.1)

- **Tính năng đồng bộ hiện là THỦ CÔNG**, không phải đồng bộ tự động liên tục. Thiết bị nguồn: **Tài khoản → Lưu lên đám mây**. Thiết bị nhận: đăng nhập cùng tài khoản → **Lấy từ đám mây**.
- Khi lấy dữ liệu về, ứng dụng tải xuống bản JSON sao lưu cục bộ trước khi thay thế; cần xác nhận rõ ràng.
- Người dùng đang sử dụng 2.0 ở chế độ khách: sau khi đăng nhập, bấm **Chuyển nhật ký khách vào tài khoản**, rồi **Lưu lên đám mây**. Bản khách vẫn còn trên máy.
- Khi hai máy cùng nhập dữ liệu mới, phải xuất sao lưu và chọn bản chuẩn trước khi đồng bộ; không tự gộp hai tập dữ liệu.
- **Dữ liệu người dùng trong trình duyệt không được mã hóa ở localStorage**, do đó nên tránh dùng trên thiết bị dùng chung; không thu thập dữ liệu nhạy cảm ngoài phạm vi cần thiết.

## Bảo mật / giới hạn

- `config.js` chỉ chứa URL và publishable key, **không được** chứa `service_role`/secret key. Không tải lên các tệp chứa mật khẩu, mã khôi phục hay dữ liệu sức khỏe của người thật.
- RLS là bắt buộc; câu lệnh SQL chỉ cho user đọc / ghi snapshot của chính mình. Nên kiểm thử quy tắc RLS thực tế với hai account trước khi phát hành rộng rãi.
- 2.1 dùng **một JSON snapshot / tài khoản** cho thuận tiện nâng cấp. Giới hạn phiên bản này ~700 KB mỗi bản đẩy lên, một lần bấm lưu có thể ghi đè snapshot trước trên đám mây (có xác nhận). Chưa có lịch sử phiên bản đám mây, chưa đồng bộ xung đột hay tự động.
- Supabase Auth và dữ liệu thật sẽ chỉ hoạt động **sau** khi chủ website tạo project, chạy SQL và cấu hình URL/key. Không thể tự tạo hoặc kết nối tài khoản Supabase thay người dùng.
- Thông tin sức khỏe cần chính sách quyền riêng tư, điều khoản sử dụng và đánh giá tuân thủ trước khi phát hành công khai rộng rãi. Không coi ứng dụng là thiết bị y tế.

## Tác giả

**toitenphuong** · GitHub: https://github.com/toitenphuong19-ctrl · Healthy Weight 2.1
