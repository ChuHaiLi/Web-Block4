# Phân tích PDF và Student Management SSR

Nguồn chính thức là ../Block4_CSR_Assignment.pdf (19 trang); ../CODEX_TASK.md bổ sung ràng buộc workspace. Ánh xạ “Block 1” của PDF sang Block3, không dùng Block1_2 làm nguồn. PDF gốc không bị chỉnh sửa.

PDF đã được trích văn bản bằng PDF.js và render đủ 19 trang để đọc phần ảnh. Trang 1 là bìa; trang 6 chỉ có tiêu đề Mental Model; trang 19 có nhắc nộp artifact trước khi rời lớp. Bản trích [pdf-text.json](evidence/pdf-text.json) có thể sai một số toán tử trong ví dụ trang 8; code triển khai dựa trên nội dung đã đối chiếu trực quan, dùng spread ...current đúng cú pháp.

## Toàn bộ nội dung có ảnh hưởng đến triển khai

| Trang | Nội dung | Quyết định |
|---|---|---|
| 1-3 | Chủ đề browser tạo/cập nhật UI, mục lục, câu hỏi lớn | Giải thích cơ chế CSR |
| 4-5 | HTML shell → JS → UI; component/props/state/event; quan sát state | README, giải thích code, sơ đồ |
| 6 | Tiêu đề Mental Model | Không có chức năng thêm |
| 7-8 | So sánh SSR/CSR; useState(seed), immutable array, props | App là owner, cập nhật bằng spread |
| 9 | Tránh mutate, biến thường thay state, component lớn, thiếu preventDefault | List/Row/Form riêng; controlled input |
| 10 | Cùng Student List CSR, thêm không reload; khung giờ bài tập 20-60 phút | PDF chỉ list/add; Delete là mở rộng sau đó |
| 11 | React, seed giống Block 1, id/name/email, không cần API/database | React/Vite; seed Block3; giữ thêm lớp/ngành sẵn có |
| 12 | State list, controlled form, client update, không reload | JSX, onChange/onSubmit/onAdd |
| 13 | Owner students/form, tách component, nối event, quan sát transition | App + AddStudentForm; Chrome kiểm tra |
| 14 | Thêm ngay, không document request mới, reset, một state list | Kiểm tra thực tế và review source |
| 15 | Sơ đồ, recording, Network trước/sau, code nhóm giải thích | Chuẩn bị đủ bốn artifact |
| 16-17 | 10 phút/nhóm; mở Doc, thêm, chỉ owner, so sánh POST SSR | DEMO.md; không yêu cầu PowerPoint |
| 18 | JS tạo UI, state gây render, event nối thao tác, rendering model khác tên framework | Phần giải thích và câu hỏi demo |
| 19 | Nộp artifact trước khi rời lớp | Nhóm tự nộp; không có quyền nộp thay |

Không có mâu thuẫn chức năng giữa PDF và CODEX_TASK.md. Phần 20-60/40 phút là hướng dẫn buổi thực hành; bốn tiêu chí nghiệm thu nằm ở trang 14.

## Source Block3 đã phân tích

| File/nhóm | Cách SSR hoạt động |
|---|---|
| app.js, server.js | Express localhost; view engine EJS, middleware form-urlencoded, CSS static, error/header/log |
| routes/students.js | GET đọc store rồi selectStudents, res.render('students'); POST validate/store.add, 303 tới trang chứa hồ sơ mới |
| services/studentStore.js | Seed40 khi kho mới; JSON store, hàng đợi ghi, ghi atomic, counter theo khóa, migration/history; xóa không hạ counter |
| services/studentCatalog.js | Đọc/validate danh mục lớp/ngành/cohort khi khởi động |
| services/studentSearch.js | Tìm không dấu, lọc lớp/ngành, giữ query, phân trang 20 hồ sơ |
| validators/studentValidator.js | POST chỉ name/email/className; normalize, validate email, suy major; không nhận id/major client |
| views/students.ejs | Header, tổng số, thông báo, bảng; vòng for EJS tạo tr; tìm/lọc/phân trang/xóa |
| views/partials/student-form.ejs | Popover HTML native, ba trường; action=/students, method=post; giữ values/lỗi server khi 422 |
| views/delete-student.ejs, views/error.ejs | Xác nhận xóa qua POST; kế thừa nội dung/CSS vào dialog CSR theo yêu cầu mở rộng; trang lỗi SSR không chuyển |
| public/css/styles.css | Navy/teal, Segoe UI, panel bo góc, bảng ngang, popup, responsive/print |
| data/students.seed.json, classes.json, majors.json | 40 seed records; 10 lớp có cohort/majorCode; 4 ngành |
| README.md | Cấu trúc, routes, chính sách mã theo khóa và lịch sử; tài liệu cũ mô tả runtime 40, nhưng dữ liệu thực tế đã có 41 |

SSR render Student List: GET → store.getAll() → selectStudents() → res.render() → EJS chèn dữ liệu/HTML → response → browser. POST hợp lệ → ghi JSON/counter → redirect 303 → GET → EJS tạo HTML mới. SSR hoạt động không cần JavaScript trình duyệt, khác CSR của bài này.

## Seed và dữ liệu runtime

Seed chuẩn có 40 hồ sơ, 5 trường, MSSV dạng chuỗi để giữ số 0 đầu, email/tên tiếng Việt, thứ tự từ file giữ nguyên. Seed có 10 CNTT khóa24, 10 KHDL khóa25, 10 TOAN khóa26, 10 VL khóa24. Runtime students.json đang có 41 hồ sơ, gồm một hồ sơ được thêm từ trước. CSR lấy **students.seed.json**, không chép dữ liệu runtime hoặc bộ đếm SSR.

Ba file JSON được sao chép nguyên bytes sang src/data; hash được đối chiếu trong [preservation.json](evidence/preservation.json). UI ngành dùng tên từ majors, không thay majorCode trong hồ sơ.

## Tái sử dụng và chuyển đổi

| Phần | Cách xử lý |
|---|---|
| Seed, lớp/ngành | Copy nguyên bytes; import tại build, không fetch API |
| CSS/header/icon/bảng/popup | Tái sử dụng phần liên quan; bỏ CSS search/pagination; kế thừa thêm CSS delete; chuyển HTML sang JSX |
| EJS loop/values | map với key=id; value + onChange nối form state |
| POST server | Event.preventDefault và gọi callback onAdd; lỗi xử lý ở client |
| Store/ID bền vững | Không copy backend; hàm thuần cấp mã theo max của khóa và metadata đã cấp trong phiên, để xóa không tái cấp mã |
| Search/filter/page | Bỏ khỏi phạm vi để rõ component/state/event |
| Delete | Mở rộng theo yêu cầu người dùng: Row callback qua List lên App; dialog xác nhận; filter immutable, không POST/API |

Mã mới khóa24 bắt đầu 02410011, khóa25 02500011, khóa26 02600011 theo seed. SSR có lịch sử đã reserve mã; CSR không nhận lịch sử đó. Không coi ID demo CSR là mã được cấp vĩnh viễn hoặc đồng bộ với backend.

App sở hữu students; AddStudentForm sở hữu values/error. StudentList/StudentRow chỉ đọc props. createdId là string cho feedback, không là một bản sao danh sách. Chi tiết trong COMPONENT_DIAGRAM.md và CODE_EXPLANATION.md.

## Mở rộng Delete Student

Đã tham khảo views/delete-student.ejs, nút Xóa trong views/students.ejs, routes/students.js, studentStore và CSS của Block3 ở chế độ chỉ đọc. Giữ hồ sơ năm trường, cảnh báo đỏ, nút Xác nhận xóa/Hủy và nguyên tắc không tái dùng MSSV đã cấp trong phiên. CSR dùng native dialog thay GET trang xác nhận; App dùng filter thay POST ghi store. Chỉ giữ pendingDeleteId và metadata số thứ tự, không sao chép backend hoặc tạo danh sách state thứ hai. PDF và bốn tiêu chí Add không thay đổi. Xem [DELETE_STUDENT.md](DELETE_STUDENT.md).
