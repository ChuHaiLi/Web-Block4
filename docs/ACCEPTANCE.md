# Nghiệm thu — phiên bản JSON Persistence

Đã đọc đủ 19 trang Block4_CSR_Assignment.pdf. “Block 1” trong PDF ánh xạ Block3. CODEX_TASK.md được đọc từ Git HEAD; file đã bị xóa trước phiên làm việc, deletion được giữ nguyên.

**Delete và Express/JSON là mở rộng theo quyết định nhóm.** “Không cần API/database” của PDF mô tả bài gốc; backend mới trả JSON, không tạo HTML Student List. App vẫn là owner duy nhất của students. PASS chỉ dùng cho kết quả thực tế/artifact đã kiểm tra; phần trình bày/nộp bài do nhóm tự làm là NOT VERIFIED.

## Toàn bộ yêu cầu PDF có ảnh hưởng sản phẩm/nộp bài

| ID | Trang | Yêu cầu | Xác minh bản hiện tại | Kết quả |
|---|---|---|---|---|
| O1 | 4 | HTML shell → JavaScript → UI | HTTP shell không chứa bảng; React createRoot + GET JSON; README | PASS |
| O2 | 4–5 | Component, props, state, event | Sơ đồ và giải thích code | PASS: tài liệu/source |
| O3 | 4 | Cập nhật không reload | Chrome CDP + Doc + timeOrigin Add/Delete | PASS |
| O4 | 4 | Quan sát state DevTools hoặc log | CDP debugger đọc students trong App: 40→41, log mới | PASS qua debugger log; extension chưa thử |
| D1 | 10–11 | Student List CSR, React/component | App → List.map → Row; Express không render bảng | PASS |
| D2 | 11 | Seed giống bài SSR | Seed Block4 40 nguyên bytes; hash giữ nguyên; không lấy runtime Block3 | PASS; seed khởi tạo runtime lần đầu |
| D3 | 11 | Có id/name/email | Unit seed, browser toàn bảng; giữ className/major | PASS |
| D4 | 11 | Không cần API/database trong bài gốc | Không DB; API JSON là mở rộng nhóm, không điều hướng/render HTML | PASS phạm vi CSR; API ngoài yêu cầu gốc |
| F1 | 12 | Render list từ state | App.students; browser DOM khớp API/JSON | PASS |
| F2 | 12 | Controlled inputs Add | value/onChange; nhập/reset/giữ values khi 500 | PASS |
| F3 | 12 | Submit cập nhật UI tại client | await POST → immutable setStudents; DOM 40→41 | PASS |
| F4 | 12 | Không reload khi thêm | preventDefault; Doc count/timeOrigin giữ nguyên | PASS |
| P1 | 13 | Owner students/form rõ | App.students; Form.values/error/submitting | PASS: source + log |
| P2 | 13 | Tách List/Row/Add Form | Các component hiện tại được giữ | PASS: source |
| P3 | 13 | Event/callback lên owner | onAdd(values), onRequestDelete(id), onConfirm | PASS: source + runtime |
| P4 | 13 | Quan sát reload/state transition | Log actual App, Chrome Network/CDP, F5 tách riêng | PASS |
| A1 | 14 | Student mới xuất hiện sau submit | Row thứ 41 khớp ID/tên/email/lớp/ngành, JSON đã lưu | PASS |
| A2 | 14 | Không document request mới do submit | DevTools Keep log Doc 1→1; CDP dev/prod/E2E | PASS |
| A3 | 14 | Form reset | Cả name/email/className rỗng sau thành công, video/DOM | PASS |
| A4 | 14 | Một nguồn state list | Một students useState tại App; con chỉ props | PASS: source review |
| E1 | 15 | Diagram/state owner | COMPONENT_DIAGRAM.md, thêm API/storage | PASS: artifact |
| E2 | 15 | Recording Add | Video mới 16,76s, Chrome thật, reset + F5 giữ 41 | PASS: artifact đã xem |
| E3 | 15 | Network trước/sau | Ảnh DevTools Doc thật mới; Fetch/XHR riêng | PASS: artifact |
| E4 | 15 | Code agent để nhóm giải thích | CODE_EXPLANATION.md, await API/store/CSR | PASS: tài liệu; nhóm trình bày NOT VERIFIED |
| M1 | 16–17 | Demo khoảng 10 phút | DEMO.md đủ timeline | PASS: kịch bản; demo thực tế NOT VERIFIED |
| M2 | 17 | Network lọc Doc | Phiên DevTools thực tế | PASS |
| M3 | 17 | Thêm student | Browser/recording mới | PASS |
| M4 | 17 | Chỉ owner | App source/diagram/actual debugger scope | PASS |
| M5 | 17 | So POST form SSR | Đọc Block3 routes/EJS; POST→303→GET so Fetch JSON | PASS: phân tích/tài liệu |
| R1 | 7–9,18 | JS tạo UI; state render; event nối thao tác; rendering model | README/code/diagram và Chrome runtime | PASS |
| R2 | 8–9 | Không mutate, props nối state/con | Functional spread/filter, dữ liệu/thứ tự hồ sơ cũ không đổi | PASS |
| R3 | 9 | Tránh component lớn/biến thường/thiếu preventDefault | Component riêng, useState và submit handlers | PASS: source |
| S1 | 19 | Nộp artifact trước khi rời lớp | Nhóm tự nộp | NOT VERIFIED |

Trang 1–3 giới thiệu/mục lục/câu hỏi; trang 6 chỉ tiêu đề; trang 10/13 có khung thời gian thực hành. Không có yêu cầu PowerPoint. Ví dụ useState(seed) của bài gốc được thay bằng []→GET runtime theo mở rộng đã được yêu cầu; React State vẫn là dữ liệu trực tiếp render.

## Kết quả kiểm thử thực tế

Môi trường: Windows, Node 24.18.0, npm 11.16.0, Chrome 154.0.8037.98, React 19.2.0, Vite 7.3.6, Express 5.2.1.

| Bộ kiểm tra | Kết quả | Bằng chứng mới |
|---|---|---|
| Unit | 14/14 PASS | unit-api-output.txt |
| API/backend | 12/12 PASS | unit-api-output.txt |
| Browser dev | 23/23 nhóm PASS | dev/browser-results.json |
| Browser production Express + dist | 23/23 nhóm PASS | production/browser-results.json |
| E2E production | 10/10 nhóm PASS | e2e/results.json |
| Production build | PASS, 38 modules, stderr rỗng | build-output.txt |
| Dependency | Express 5.2.1 cài offline thành công từ cache đọc, chỉ ghi Block4 | install-output.txt |
| State observation | PASS, đọc biến App thực tế 40→41 | react-state-log.json |
| Video/DevTools | PASS, Add/Delete Doc 1→1; reset/F5 | recording/ |
| Bảo toàn | PASS, Block3 350 + Block1_2 59 files; seed/PDF/catalog/50 evidence gốc không đổi | preservation.json |

Paths bảng trên tương đối từ [evidence/json-persistence](evidence/json-persistence/). npm test chạy tổng 26 test, không skip/fail. Backend injected write/JSON lỗi và browser tiêm HTTP 500 là **test lỗi có chủ đích**, ghi riêng; không có pageerror/console.error bất ngờ. Chưa chạy npm ci lại trong phiên extension; dependency được npm install offline, build và toàn bộ tests đã xác minh.

## Đối chiếu mở rộng backend/frontend/E2E

| Yêu cầu | Xác minh | Kết quả |
|---|---|---|
| GET đúng dữ liệu, JSON không HTML | 40 seed, content-type/no-store, GET khớp file | PASS |
| POST hợp lệ/invalid/unique ID | 201, 400, 409; POST đồng thời ID khác nhau | PASS |
| DELETE đúng/không tồn tại | File+GET+UI, 404 không sửa file | PASS |
| JSON lưu sau thao tác, ack sau ghi | Đọc JSON ngay sau response; pending POST chưa ack UI giữ 40 | PASS |
| Restart không mất dữ liệu/counter | Restart tiến trình Express thật API và E2E | PASS |
| Không ghi lại seed/runtime khi khởi động | initialize lần hai không đổi bytes/mtime; seed giữ hash | PASS |
| Nhiều ghi không mất dữ liệu | 20 POST song song rồi 5 DELETE; 4 POST cùng email chỉ tạo 1 | PASS trong một backend |
| JSON hỏng/ghi lỗi | Startup reject giữ bytes; GET 500; rename injected failure giữ file/counter | PASS trong trường hợp đã test |
| Không đường dẫn file tùy ý | POST reject file/id; cấu hình store reject seed/outside/Git | PASS |
| Load state/error không fake seed | GET từ API; 500 báo lỗi, Thử lại nạp dữ liệu thật | PASS |
| Add/reset/retain-on-failure/double-submit | Browser thực tế 500 + held POST + Enter/click; không reset khi lỗi | PASS |
| Delete/confirmation/failure | Hủy/Escape chưa xóa; 500 giữ row/dialog; success filter | PASS |
| F5 và trình duyệt mới | 41 sau Add/F5/fresh Chrome; 40 sau Delete/F5 | PASS |
| Responsive/UI/JS | 1440,390,320; bảng cuộn ngang, popup/dialog vừa viewport; errors=[] | PASS trong Chrome |
| Một owner, callbacks, immutable | Source + App scope + DOM/order snapshots | PASS |
| Test không chạm runtime thật | Mỗi fixture file riêng; mặc định data/students.json trước/sau không tồn tại | PASS |
| Build/test không reset dữ liệu | Không reset script; kiểm tra runtime preservation | PASS |
| Giữ branch/main/tag và dự án cũ | Git refs + hash trước/sau, không commit/push/merge | PASS |

Chuỗi E2E: 40 → thêm 41 → đọc JSON → F5 41 → đóng/mở Chrome mới 41 → Delete 40 → đọc JSON → F5 40 → restart backend/F5 40. Mỗi cửa sổ đo Add/Delete tách F5, document count không tăng trong thao tác submit.

## NOT VERIFIED và giới hạn

- Buổi demo/thuyết trình nhóm, tự giải thích trước giảng viên, nộp bài: NOT VERIFIED.
- React DevTools extension, Firefox/Safari, browser cũ, thiết bị vật lý và screen reader: NOT VERIFIED.
- Mất điện/crash từng bước ghi, filesystem khác, nhiều backend cùng ghi một file: NOT VERIFIED. Chỉ hỗ trợ một backend/file.
- Chưa có video Delete riêng; không phải evidence bắt buộc PDF. Video Add không có thuyết minh, nhóm có thể tự quay thêm.
- Không auto-sync tab khác, auth hoặc backup tự động; xem JSON_PERSISTENCE.md.

Bốn bằng chứng kỹ thuật PDF đã cập nhật. Không dùng kết quả baseline cũ làm nghiệm thu phiên bản mới.
