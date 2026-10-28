# Healthy Weight

Website sức khỏe cá nhân sử dụng miễn phí, hỗ trợ cài lên màn hình chính iPad như ứng dụng web.

## Chức năng
- Dashboard sức khỏe: cân nặng gần nhất, BMI, kcal và mục tiêu
- Hồ sơ cá nhân, mục tiêu cân nặng và ước tính kcal duy trì (công thức Mifflin–St Jeor)
- Nhật ký cân nặng và biểu đồ theo thời gian
- Nhật ký ăn uống nhập kcal thủ công
- Theo dõi nước uống và 3 thói quen hằng ngày
- Ghi chú, xuất/nhập JSON để sao lưu
- Thông tin tác giả và liên kết GitHub

## Hướng dẫn đăng website bằng GitHub Pages
1. Vào https://github.com/new để tạo repository công khai **healthy-weight** (không cần đụng tới kho cũ).
2. Giải nén file ZIP rồi upload các file **index.html, manifest.webmanifest, icon.svg, service-worker.js** vào thư mục gốc của kho. README.md có thể upload cùng.
3. Trong GitHub repository chọn **Settings → Pages → Build and deployment → Deploy from a branch**. Chọn nhánh **main**, thư mục **/(root)**, rồi **Save**.
4. Địa chỉ trang dự kiến: https://toitenphuong19-ctrl.github.io/healthy-weight/ . GitHub Pages có thể cần một lúc để xuất bản.
5. Trên iPad mở trang trong Safari, chọn **Chia sẻ → Thêm vào Màn hình chính**.

## Thông tin tác giả
- **Tác giả / người phát triển:** `toitenphuong`
- GitHub: https://github.com/toitenphuong19-ctrl
- Phiên bản: 1.0

## Chú ý
Dữ liệu được lưu bằng localStorage riêng ở trình duyệt hiện tại, không tự đồng bộ giữa thiết bị. Hãy xuất JSON thường xuyên để sao lưu. Đừng nhập dữ liệu sức khỏe nhạy cảm trên thiết bị dùng chung. BMI và kcal là số liệu tham khảo, không thay thế tư vấn y tế.

**Giao diện mẫu:** thêm `?demo=1` vào địa chỉ website để xem với dữ liệu minh họa, dữ liệu minh họa không tự lưu. Để nhập dữ liệu thật, mở trang không có `?demo=1`.


## Bản 2.0 — xem trước gói thành viên
- Thêm thẻ **Gói thành viên** trong menu, so sánh Free / Plus 29.000đ.
- Chọn mô phỏng **29.000đ/tháng (tự gia hạn)** hoặc **29.000đ/30 ngày (không gia hạn)**.
- **KHÔNG có thanh toán thật, đăng nhập, đồng bộ dữ liệu hoặc cấp quyền Plus.** Các tính năng AI và phân tích Plus chưa được triển khai.
- Dữ liệu bản 1.0 vẫn giữ nguyên key lưu trữ trong trình duyệt. Trước khi nâng cấp nên xuất bản sao lưu JSON.
- Cập nhật GitHub Pages: giải nén ZIP và tải các file lên repository `healthy-weight`, ghi đè tên file cũ, commit. Không đăng tải ZIP trực tiếp.
- Nếu thiết bị vẫn thấy phiên bản cũ do bộ nhớ đệm PWA, đóng mở lại hoặc làm mới website sau khi GitHub Pages triển khai.
