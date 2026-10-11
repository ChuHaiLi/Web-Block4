# Đối chiếu yêu cầu chính thức và kết quả nghiệm thu

Nguồn: Block4_CSR_Assignment.pdf, đã đọc toàn bộ19 trang; CODEX_TASK.md đã đọc đầy đủ. “Block 1” trong PDF ánh xạ sang Block3. PASS chỉ áp dụng cho kiểm tra đã có kết quả hoặc artifact đã đọc/kiểm tra; NOT VERIFIED là việc chưa thực hiện. FAIL dùng khi quan sát thực tế không đạt. Bản cuối không còn mục FAIL trong phạm vi kỹ thuật được yêu cầu.

## Toàn bộ yêu cầu PDF có ảnh hưởng đến sản phẩm/nộp bài

| ID | Trang PDF | Yêu cầu | Xác minh / bằng chứng | Kết quả |
|---|---|---|---|---|
| O1 |4| Mô tả HTML shell → JavaScript → UI | README, HTTP shell được kiểm tra trong Chrome tests | PASS |
| O2 |4-5| Phân biệt component, props, state, event | README, COMPONENT_DIAGRAM, CODE_EXPLANATION | PASS: tài liệu đã có |
| O3 |4| Cập nhật không reload toàn trang | Chrome/timeOrigin/Network | PASS |
| O4 |4| Quan sát state bằng React DevTools hoặc log | Debugger trong scope App: [log40→41](evidence/react-state-log.json) | PASS qua log; extension chưa thử |
| D1 |10-11| Student List dạng CSR, dùng React/framework component | React19.2/Vite, shell + createRoot | PASS |
| D2 |11| Seed giống Block 1 | Hash students.seed.json Block3/Block4 giống nguyên bytes,40 hồ sơ | PASS |
| D3 |11| Student có id/name/email | Unit seed + Chrome đối chiếu toàn bảng; giữ thêm className/major | PASS |
| D4 |11| Không cần API/database | Review source không fetch/XHR/API; submit không request tạo HTML | PASS |
| F1 |12| Render list từ state | App owns students; List map Row; source + runtime | PASS |
| F2 |12| Controlled inputs cho form Add Student | value/onChange trên name/email/className; Chrome nhập/reset | PASS |
| F3 |12| Submit cập nhật UI tại client | onSubmit → onAdd → setStudents,40→41 | PASS |
| F4 |12| Không reload khi thêm | preventDefault + document count/timeOrigin | PASS |
| P1 |13| Chọn owner students và form | App: students; AddStudentForm: values/error | PASS: source review |
| P2 |13| Tách List, Row, Add Form | Ba component riêng cùng App/SiteHeader | PASS: source review |
| P3 |13| Event đẩy student/input mới lên owner | Form gọi onAdd(values); App tạo student và cập nhật | PASS |
| P4 |13| Quan sát reload/state transition | Debugger log40/41; browser/DevTools thật | PASS |
| A1 |14| Student mới xuất hiện ngay sau submit | Chrome DOM41, dòng cuối đúng ID/tên/email/lớp/ngành | PASS |
| A2 |14| Network không có document request mới | DevTools Doc + Keep log bật:1→1; CDP và timeOrigin | PASS |
| A3 |14| Form reset sau thêm | Cả 3 trường trống; mở lại popup, screenshot/video | PASS |
| A4 |14| Một nguồn state danh sách | Chỉ App có students useState/setStudents; không list state trong con | PASS: source review |
| E1 |15| Sơ đồ component và owner | [COMPONENT_DIAGRAM.md](COMPONENT_DIAGRAM.md), props/callback | PASS: artifact hoàn thành |
| E2 |15| Recording thêm Student | [Video Chrome thật](evidence/add-student.webm),13.48s; đã xem 3 frames | PASS: artifact hoàn thành |
| E3 |15| Network trước/sau submit | [Trước](evidence/devtools-doc-before.png) / [sau](evidence/devtools-doc-after.png), log/JSON | PASS: artifact hoàn thành |
| E4 |15| Đoạn code agent để nhóm giải thích | [CODE_EXPLANATION.md](CODE_EXPLANATION.md), trích source và giải thích tiếng Việt | PASS: tài liệu; nhóm giải thích thực tế NOT VERIFIED |
| M1 |16-17| Chuẩn bị demo khoảng10 phút | [DEMO.md](DEMO.md), timeline đủ 10 phút | PASS: kịch bản; buổi trình bày NOT VERIFIED |
| M2 |17| Mở Network lọc Doc | Đã thao tác DevTools thật trong phiên evidence | PASS |
| M3 |17| Thêm Student mới | Recording, Chrome tests | PASS |
| M4 |17| Chỉ component giữ state | App.jsx, sơ đồ, log debugger owner=App | PASS: source/tài liệu |
| M5 |17| So sánh POST form Block 1 | Đọc routes/form EJS Block3; README/DEMO so sánh POST→303→GET | PASS: phân tích/tài liệu |
| R1 |7-9,18| JS tạo UI; state render; event nối thao tác; model khác tên framework | README/CODE_EXPLANATION; shell/Chrome/state log | PASS: tài liệu + runtime liên quan |
| R2 |8-9| Array mới, không mutate; props nối state/con | Spread functional update, không students.push; source review +40 hồ sơ cũ không đổi | PASS |
| R3 |9| Tránh một component lớn/biến thường thay state/thiếu preventDefault | Component tách riêng; App useState; form preventDefault | PASS: source review |
| S1 |19| Nộp artifact trước khi rời lớp | Đã chuẩn bị artifact; nhóm tự nộp, không thực hiện nộp thay | NOT VERIFIED |

Trang1-3 giới thiệu/mục lục/câu hỏi; trang6 chỉ có tiêu đề; trang10/13 nêu khung thời gian thực hành, không thêm tiêu chí chức năng. PDF không yêu cầu PowerPoint; không tạo deck.

## Yêu cầu bổ sung của CODEX_TASK.md

| Yêu cầu | Cách kiểm tra | Kết quả |
|---|---|---|
| Giao diện kế tiếp Block3 | Giữ header/navy/teal/font/bảng/popup; kiểm tra screenshot desktop/mobile | PASS |
| Tái sử dụng CSS/tài nguyên phù hợp | CSS phần liên quan và icon/header; bỏ search/pagination; kế thừa Delete theo yêu cầu mở rộng | PASS: source review |
| Không copy toàn bộ backend | Block4 chỉ app React/helper frontend, không Express/EJS/store JSON server | PASS: source review |
| Thêm đúng thứ tự/ID duy nhất | Chrome thêm3 lần, Enter, khớp ID 02410011/02410012/02500011 | PASS |
| Validation đơn giản, không thêm khi lỗi | Unit/Chrome, whitespace/email/lớp/duplicate; giữ values | PASS |
| Không có lỗi JS nghiêm trọng | Chrome pageerror và console.error đều[] | PASS |
| Chạy dev và production | Chrome5173/4173,18 nhóm mỗi bản | PASS |
| Cài dependency/build | npm ci thành công sau khi dừng server; build exit0, không stderr/cảnh báo | PASS |
| Unit tests |12 test,0 fail | PASS |
| Responsive |1440×1000,390×844,320×640; bảng cuộn ngang, popup trong viewport | PASS |
| README/giải thích/demo tiếng Việt | Các tài liệu trong docs và README | PASS: artifact |
| Chỉ thay đổi Block4 | Hash350 file Block3 và59 file Block1_2 không đổi | PASS trong scope hash |
| Giữ PDF/CODEX_TASK | SHA-256 trước/sau không đổi | PASS |
| Seed/catalog nguyên vẹn |3 file JSON copy có SHA-256 giống bản gốc | PASS |
| Không đổi branch/history/push | Không thực hiện thao tác Git ghi/branch/push; Git metadata nếu có nằm trong hash scope | PASS: hành động thực hiện + hash |

Scope hash: toàn bộ regular files trong dự án cũ, gồm source/data/assets/evidence/Git metadata nếu có, loại node_modules/symlink và timestamp thư mục. Agent không chỉnh node_modules của các dự án cũ. [preservation.json](evidence/preservation.json) ghi count/hash/diff trước/sau; không có thay đổi.

## Kết quả thực tế và giới hạn

- Unit:12/12; Chrome dev:18/18; Chrome production:18/18. Build sạch, npm ci thành công.
- DevTools capture:40→41 hồ sơ,1→1 document requests, cùng timeOrigin. Keep log bật nên reload do submit, nếu có, sẽ tích lũy document mới. Form reset name/email/className đều chuỗi rỗng.
- Trong lần triển khai ban đầu, state được đọc trực tiếp trong App:40,40,41,41 (StrictMode development); không thêm trùng.
- Video13.48 giây,1440×1000; đã phát/seek và xem các frame5/9/11.5 giây. Không quay giả hoặc tạo UI Network mô phỏng.
- React DevTools extension, Firefox/Safari, browser cũ fallback, thiết bị thật, screen reader: NOT VERIFIED.
- Nhóm hiểu và tự giải thích code, demo đúng10 phút trước giảng viên, nộp artifact: NOT VERIFIED; nhóm cần thực hiện.
- Refresh chủ động về 40 seed là hành vi đúng phạm vi, không phải lỗi. Không lưu bền vững hoặc đồng bộ ID với SSR; metadata counter chỉ giữ mã đã cấp trong phiên trang.

Không còn bằng chứng kỹ thuật bắt buộc nào thiếu. Video không có thuyết minh; nhóm có thể dùng artifact đã có hoặc tự quay bản có lời trình bày theo EVIDENCE.md.

## Delete Student - mở rộng của người dùng, không phải yêu cầu PDF

Kết quả dưới đây thuộc lần kiểm tra mã cuối có Delete. Bộ browser test vẫn giữ tất cả kiểm tra Add/PDF và bổ sung luồng Delete. [Thiết kế và bằng chứng](DELETE_STUDENT.md).

| Yêu cầu mở rộng | Xác minh | Kết quả |
|---|---|---|
| Tham khảo Delete Block3 | Nút Xóa, chi tiết năm trường, cảnh báo và nút xác nhận/Hủy kế thừa EJS/CSS | PASS: source review và screenshot |
| Xóa bằng React State, không API/reload | CDP Network + timeOrigin; không Document/Fetch/XHR mới | PASS |
| Immutable update | App dùng functional update với filter; snapshot còn lại giữ dữ liệu/thứ tự | PASS |
| App là owner duy nhất | source-review.json: một students state owner; pendingStudent suy ra bằng find | PASS |
| Callback qua component con | App → List → Row: onRequestDelete; App → Dialog: onConfirm/onCancel | PASS: source + runtime |
| Xác nhận trước xóa | Đúng hồ sơ; mở dialog chưa xóa; Hủy/Escape giữ nguyên toàn bộ danh sách | PASS |
| Biến mất ngay sau xác nhận | DOM giảm 43→42, đúng hồ sơ bị xóa; badge/tổng số cập nhật | PASS |
| Bổ sung test | Bốn unit regression về mã đã xóa; browser kiểm tra cancel/confirm/network/empty/Add sau Delete/mobile | PASS |
| Cập nhật tài liệu | README, sơ đồ, giải thích code, phân tích, evidence, demo, acceptance, DELETE_STUDENT | PASS: artifact |
| Add/tiêu chí PDF được giữ | Toàn bộ kiểm tra Add chạy lại; video13.48s và ảnh Doc mới; reset ba trường, 1→1 document | PASS |
| Không sửa Block3/Block1_2 | Hash350/59 files trước/sau mở rộng không đổi | PASS |
| Xóa hết rồi thêm lại | Empty state; Add cấp02410014; form reset; không navigation | PASS |
| MSSV đã cấp không tái sử dụng trong phiên | Unit + Chrome: xóa02410012 rồi thêm02410013; metadata ref | PASS |
| Không lỗi JavaScript | Chrome dev/prod: pageerror/console.error=[] | PASS |
| Recording Delete riêng | Không phải PDF requirement; mới có screenshot/CDP/test Delete | NOT VERIFIED: chưa quay |
| Firefox/Safari, thiết bị thật, screen reader, browser cũ | Chưa chạy | NOT VERIFIED |

Bốn bằng chứng bắt buộc PDF vẫn áp dụng cho **Add**. Screenshot và log Delete bổ sung không được gọi là recording hoặc ảnh Chrome DevTools Doc. Reload chủ động khôi phục cả các sinh viên seed đã xóa; thay đổi chỉ tồn tại trong phiên trang.
