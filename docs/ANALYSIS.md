# Phân tích trước thay đổi và ảnh hưởng kiến trúc

Đã đọc đủ 19 trang PDF, render để đối chiếu phần hình; đọc CODEX_TASK.md từ Git HEAD vì file bị xóa trước phiên làm việc. “Block 1” của PDF ánh xạ Block3. Source/components, CSS, Vite/package, unit/browser tests, toàn bộ docs và evidence cũ đã kiểm tra trước triển khai.

Trước sửa: branch feature/json-persistence đúng yêu cầu; git status chỉ có D CODEX_TASK.md. Không chuyển branch. main và tag pre-json-backend đều tại f6a9ee9b304c9fdb679268b9a6f501484df78d00. Giữ deletion đã có, không commit/push/merge.

## PDF

| Trang | Nội dung ảnh hưởng |
|---|---|
| 1–3,6 | Giới thiệu/mục lục/tiêu đề, không thêm chức năng |
| 4–5 | HTML shell → JS → UI; component/props/state/event; quan sát state |
| 7–9 | CSR/SSR, useState, immutable array/props, tránh mutate/component lớn/thiếu preventDefault |
| 10–13 | Student List CSR, seed giống bài SSR, id/name/email; list state, controlled form, event/callback; không cần API/database |
| 14 | Bốn tiêu chí: student xuất hiện, không document mới, reset form, một owner |
| 15 | Bốn evidence |
| 16–17 | Demo khoảng 10 phút: Doc/Add/owner/so POST SSR |
| 18–19 | Tổng kết rendering model; nhóm tự nộp artifact |

“Không cần API/database” mô tả phạm vi gốc, không được diễn giải thành cấm backend trong mở rộng đã được nhóm yêu cầu. PDF gốc và baseline giữ nguyên; yêu cầu mới thay phần chỉ lưu state trong phiên.

## Block3 tham khảo — chỉ đọc

GET /students đọc store, lọc/phân trang rồi res.render EJS. POST form validate, lưu JSON, redirect 303 → GET → HTML bảng mới. views/students.ejs và partial form/delete, CSS/header navy/teal, validator/catalog/search/store/data đã phân tích. Store dùng seed, counter và tuần tự hóa ghi; runtime Block3 có 41 nên không lấy làm seed. Không copy backend SSR, search/pagination/edit/history/migration sang Block4.

Seed gốc 40, 10 lớp/4 ngành, id/name/email/className/major giữ nguyên trong Block4. Seed/danh mục/PDF và toàn bộ file dự án cũ được hash trước/sau.

## Ảnh hưởng và thay đổi tối thiểu

| Trước | Sau | Bảo toàn |
|---|---|---|
| App useState(seed), cấp ID trong client | App useState([]), GET runtime; backend cấp ID/counter | Một owner, React render/props |
| onAdd đồng bộ, spread ngay | async Fetch POST, spread sau ack | controlled form, reset khi thành công |
| confirm Delete, filter ngay | async Fetch DELETE, filter sau ack | dialog/Hủy/Escape, đúng row |
| Refresh về 40 | GET runtime, không reset | seed chỉ khởi tạo lần đầu |
| Không có API | Express ba endpoint + JSON store | Không EJS/HTML render/navigation |
| Tests mặc định server đang chạy | Fixture tự tạo file/cổng/server riêng | Add/validation/Doc/order/mobile giữ coverage |

SiteHeader, StudentList, StudentRow, main.jsx, seed/catalog giữ nguyên. App chỉ đổi loading/async, Form/Dialog chỉ thêm await/pending/error, CSS chỉ thêm trạng thái button disabled. Vite giữ cổng/JSX/strictPort, thêm proxy và ignore runtime/test/evidence để file ghi không kích hoạt reload.

Rủi ro chính: API có thể lỗi, ghi có thể chồng, file JSON có thể hỏng. Giải pháp: loading/error không fallback seed; giữ input/list khi lỗi; ref/pending chặn submit lặp; backend validate+queue+temp/flush/rename; file hỏng fail rõ, không reseed. Mỗi suite file test riêng, không reset runtime. Giới hạn một backend/file được ghi rõ trong JSON_PERSISTENCE.md.
