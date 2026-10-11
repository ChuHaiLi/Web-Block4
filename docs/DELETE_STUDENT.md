# Delete Student — mở rộng kế thừa Block3

Nút Xóa, hồ sơ năm trường, cảnh báo đỏ, Xác nhận xóa/Hủy giữ phong cách Block3. Block4 dùng native dialog trong document hiện tại; không chuyển sang trang EJS xác nhận.

Row → onRequestDelete(id) qua List → App.pendingDeleteId → dialog. Hủy/Escape giữ list và không gọi DELETE. Confirm dùng preventDefault → callback App → Fetch DELETE → Express ghi JSON → filter immutable trong students → đóng dialog.

Lỗi lưu giữ row/dialog, hiển thị message; pending khóa xác nhận/Cancel/Escape để tránh thao tác lặp. App vẫn là owner duy nhất; dialog chỉ giữ error/saving.

Dữ liệu xóa tồn tại sau F5/restart. Bộ đếm lưu cùng runtime, không giảm khi Delete; mã đã cấp không dùng lại trong cùng runtime. Chỉ reset có chủ đích bằng file dữ liệu khác mới bắt đầu lại từ seed.

Kiểm tra thực tế: backend DELETE đúng ID/404/ghi lỗi/concurrency; browser mở/Hủy/Escape/confirm/500/empty/thêm sau xóa/mobile; E2E JSON + F5 + restart. Ảnh/log mới ở evidence/json-persistence; DevTools Doc trước/sau Delete là 1→1. Xem ACCEPTANCE.md và EVIDENCE.md. Không có video Delete riêng; PDF yêu cầu recording Add, đã hoàn thành.
