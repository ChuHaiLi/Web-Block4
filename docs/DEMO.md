# Kịch bản demo 10 phút - PDF trang 17

Chuẩn bị: chạy Block4 bằng npm.cmd run dev, mở http://127.0.0.1:5173 trong Chrome; mở App.jsx, AddStudentForm.jsx, StudentList.jsx, StudentRow.jsx và sơ đồ. Không sửa source trong lúc quan sát Network để tránh Vite reload do thay đổi file. Reload trước demo để về 40 hồ sơ.

| Thời gian | Thao tác | Nội dung nói |
|---|---|---|
| 0:00-1:00 | Giới thiệu trang, 40 seed records, bố cục kế thừa | “Block 1 trong đề chính là Block3 của nhóm. Đây là cùng Student Management, render ở browser.” |
| 1:00-2:00 | F12 → Network → Doc; bật Keep log; reload một lần, chụp trước | “Đây là document request ban đầu. Ta sẽ giữ log để kiểm tra có document mới khi submit hay không.” |
| 2:00-4:00 | + Thêm sinh viên; nhập Nguyễn Minh Anh CSR / csr.demo@example.com / 24C11; submit | “Input value lấy từ values state, onChange cập nhật values. Submit gọi preventDefault, rồi callback lên App.” |
| 4:00-5:00 | Chỉ dòng cuối 02410011, mở lại form trống, xem Network | “Danh sách có 41; ba trường reset. Doc vẫn đúng một request; không có POST/navigation do submit.” |
| 5:00-7:00 | Mở App.jsx và sơ đồ; chỉ useState, addStudent, spread; mở List/Row | “App là owner duy nhất. Tạo mảng mới với current và sinh viên mới. List nhận props và map Row; key là ID.” |
| 7:00-8:30 | Chỉ state bằng React DevTools hoặc breakpoint tại App | “State đổi khiến component được render lại. React cập nhật DOM; render lại không phải reload document.” |
| 8:30-9:30 | Mở source route/form EJS của Block3, chỉ POST/303/res.render | “SSR POST lên Express, store lưu JSON, 303 rồi GET trả HTML mới. CSR bài này chỉ cập nhật state ở client.” |
| 9:30-10:00 | Nhắc giới hạn refresh về seed, mở bốn evidence và chuẩn bị nộp | “Không API/database hoặc lưu bền vững. Model rendering phụ thuộc cơ chế ứng dụng, không chỉ tên React.” |

So sánh SSR dùng source đã đọc, không cần thêm sinh viên thật vào Block3 để demo. Không chạy POST tới backend cũ trong quy trình kiểm thử này. Nhóm có thể chỉ routes/students.js và views/partials/student-form.ejs hoặc artifact SSR đã có.

## Câu hỏi nhóm cần tự giải thích

- Vì sao App giữ students, còn Form chỉ giữ values?
- Callback là prop như thế nào, khi gọi thì dữ liệu đi ra sao?
- Vì sao không dùng students.push()? current trong functional update là gì?
- Thiếu preventDefault thì browser có thể submit/navigate thế nào?
- Vì sao mở lại form trống? Lỗi email thì tại sao dữ liệu được giữ?
- Vì sao refresh lại mất sinh viên mới trong bài này?
- React có bắt buộc là CSR không? Không; ứng dụng này CSR vì browser chạy JS để tạo bảng từ shell.

Kịch bản đã chuẩn bị; thời lượng và khả năng trình bày thực tế của nhóm chưa được xác minh. PDF trang 19 nhắc nộp artifact trước khi rời lớp: nhóm tự thực hiện bước nộp.

## Demo Delete tùy chọn sau phần 10 phút bắt buộc

Delete là phần mở rộng của người dùng. Giữ phần Add/Network/state owner/POST SSR trong kịch bản PDF ở trên.

1. Bấm Xóa một dòng, chỉ năm trường trong dialog và cảnh báo. Bấm Hủy hoặc Escape: danh sách vẫn giữ nguyên.
2. Bấm Xóa lại, xác nhận: hồ sơ biến mất ngay, tổng số giảm, Network Doc không tăng.
3. Chỉ callback App → List → Row và Dialog → onConfirm → App.filter; không mutate state. App vẫn là owner duy nhất.
4. So sánh Block3 GET xác nhận, POST xóa/303/GET với dialog client + filter. Chỉ đọc source Block3, không POST tới backend cũ.
5. Nếu có thời gian, thêm rồi xóa hồ sơ mới và thêm lại để chỉ MSSV đã cấp không tái sử dụng trong phiên; reload khôi phục seed.
