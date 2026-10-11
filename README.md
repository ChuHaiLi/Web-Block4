# Student Management CSR - Block4

Ứng dụng React + Vite kế tiếp Student Management SSR trong Block3. Danh sách được tạo từ React state; thêm và xóa sinh viên diễn ra trong trình duyệt và không tải lại document.

Tài liệu chính thức: [PDF bài tập](Block4_CSR_Assignment.pdf), đã đọc cả 19 trang và kiểm tra bản render. [CODEX_TASK.md](CODEX_TASK.md) được giữ nguyên. Mọi chỗ PDF gọi dự án Student Management cũ là “Block 1” đều ánh xạ sang **Block3**.

## Chạy trên Windows

Yêu cầu Node.js >=22.12.0, npm và trình duyệt có JavaScript. Môi trường đã chạy: Node 24.18.0, npm 11.16.0, React 19.2.0, Vite 7.3.6, Chrome 154.0.8037.98.

```powershell
cd D:\VSCode\HCMUS\Web\Block4
npm.cmd ci
npm.cmd run dev
```

Mở **http://127.0.0.1:5173**. Dùng npm.cmd để tránh PowerShell chặn npm.ps1. Dừng terminal bằng Ctrl+C trước khi chạy lại npm ci: Windows có thể khóa DLL Rollup khi Vite còn chạy. Port 5173 được đặt strictPort để tránh âm thầm chuyển cổng; dừng đúng server đang dùng cổng trước khi mở một server khác.

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run preview
```

Preview bản build: **http://127.0.0.1:4173**. Không mở trực tiếp dist/index.html bằng file://; hãy dùng preview hoặc static server có hỗ trợ đường dẫn asset.

Nếu cùng môi trường này không có mạng, cache đã chuẩn bị trong Block4:

```powershell
npm.cmd ci --offline --no-audit --no-fund --no-update-notifier --cache .tools/npm-cache
```

.tools chỉ chứa công cụ/cache kiểm tra cục bộ, được gitignore và không cần nộp. npm có thể cảnh báo postinstall của esbuild chưa được approve trên npm mới; lần kiểm tra thực tế đã dùng binary Windows của optional dependency và build thành công.

## Cấu trúc

```text
Block4/
  Block4_CSR_Assignment.pdf       PDF gốc, giữ nguyên
  CODEX_TASK.md                  yêu cầu của người dùng, giữ nguyên
  package.json / package-lock.json
  index.html / vite.config.js
  public/favicon.svg
  src/
    main.jsx / App.jsx / styles.css
    components/
      SiteHeader.jsx
      StudentList.jsx
      StudentRow.jsx
      AddStudentForm.jsx
      DeleteStudentDialog.jsx
    data/students.seed.json / classes.json / majors.json
    utils/student.js
  tests/student.test.js / browser.mjs / evidence.mjs
  docs/
    ANALYSIS.md / COMPONENT_DIAGRAM.md / CODE_EXPLANATION.md
    EVIDENCE.md / DEMO.md / ACCEPTANCE.md / DELETE_STUDENT.md
    evidence/                   video, screenshots, logs, kết quả kiểm tra
  dist/                         output build, gitignore
  node_modules/ / .tools/        dependencies/công cụ, gitignore
```

## Kế thừa và phạm vi

- Sao chép nguyên bytes **40 hồ sơ** từ Block3/data/students.seed.json, giữ id/name/email/className/major và thứ tự. Dữ liệu runtime Block3/data/students.json đã có 41 hồ sơ từ trước; nó không phải seed của bài CSR.
- Sao chép danh mục lớp/ngành. Giữ bố cục header, bảng rộng, popup ba trường, navy/teal, Segoe UI, spacing, badge lớp và CSS responsive phù hợp.
- EJS loop chuyển thành students.map() với key là MSSV; EJS values chuyển thành controlled inputs; POST/303/GET chuyển thành event.preventDefault() và callback cập nhật state.
- Giữ form tên/email/lớp để đồng nhất giao diện. Client cấp MSSV theo khóa và tra ngành từ majorCode. Bộ đếm theo khóa trong useRef của App giữ số thứ tự đã cấp trong phiên, để xóa không làm tái sử dụng MSSV. Không lấy lịch sử/counter backend SSR; reload khởi tạo lại từ seed.
- Phạm vi PDF: danh sách + thêm sinh viên. **Delete Student là phần mở rộng theo yêu cầu người dùng**, kế thừa nút Xóa, chi tiết hồ sơ, cảnh báo và nút xác nhận/Hủy từ Block3; dùng native dialog ở client. Không chuyển tìm kiếm/lọc/phân trang, Express, EJS, file store hoặc database sang Block4.

## Component, props, state và event

| Component | Vai trò/state |
|---|---|
| App | Owner duy nhất của students; createdId/deletedId cho thông báo; pendingDeleteId cho xác nhận; issuedCounters ref cho số thứ tự |
| SiteHeader | Header và biểu tượng sách |
| StudentList | Nhận students/createdId/onRequestDelete, hiển thị bảng và nút mở form |
| StudentRow | Nhận student/isNew/onRequestDelete, hiển thị dòng/nút Xóa, cuộn đến hồ sơ mới |
| AddStudentForm | State values/error cho dữ liệu đang nhập; nhận callback onAdd |
| DeleteStudentDialog | Nhận student/onConfirm/onCancel; không giữ students state; hiển thị hồ sơ và xác nhận |

Props đi từ cha xuống con. Callback cũng được truyền xuống dưới dạng prop; khi submit, form **gọi** callback để App cập nhật danh sách. Form không giữ bản sao students.

Luồng thêm: nhập → onChange → values → submit → preventDefault → onAdd(values) → App kiểm tra/cấp mã → setStudents(current => [...current, student]) → React render lại → form reset. Lỗi đầu vào/email trùng giữ dữ liệu để sửa. Sinh viên mới nối cuối và tự cuộn vào vùng nhìn thấy. Popup đóng khi thành công; mở lại để chứng minh ba trường trống.

Luồng xóa: nút Xóa trong Row → onRequestDelete(id) qua List → App đặt pendingDeleteId → tìm hồ sơ từ students để mở dialog → Hủy/Escape đóng và giữ danh sách; Xác nhận gọi preventDefault → onConfirm → App dùng filter tạo mảng mới → dòng biến mất và số lượng giảm ngay. Không API, không document navigation. [Thiết kế và kiểm thử Delete](docs/DELETE_STUDENT.md).

## SSR và CSR

| Nội dung | SSR Block3 | CSR Block4 |
|---|---|---|
| HTML đầu tiên | Express/EJS tạo bảng có dữ liệu | Shell có div#root, tải JavaScript |
| Dữ liệu thay đổi | Server đọc/ghi JSON | React state trong App |
| Submit | POST /students, lưu, redirect 303, GET HTML mới | onSubmit, preventDefault, gọi onAdd, cập nhật state |
| Trình duyệt | Nhận document mới | React cập nhật DOM trong document hiện tại |
| Xóa | GET hồ sơ xác nhận; POST /students/:id/delete, ghi store, 303 rồi GET | Dialog client; onConfirm → App filter state |
| Sau refresh | Dữ liệu lưu vẫn còn | Quay về 40 seed records |

HTML shell → JavaScript → createRoot → App → state seed → JSX → DOM. Khi state đổi, React gọi lại component để tính UI mới rồi cập nhật DOM cần thiết. Render lại component không đồng nghĩa tải lại document. React cũng có thể dùng cho SSR; rendering model phụ thuộc cách ứng dụng render, không chỉ tên framework.

## Kiểm thử và bằng chứng

Đã chạy npm ci, build sạch, **12/12 unit tests**, **18/18 nhóm Chrome** trên bản dev và production; kiểm tra desktop 1440×1000 và mobile 390×844, 320×640. [Kết quả nghiệm thu](docs/ACCEPTANCE.md) ghi từng yêu cầu, loại xác minh và các mục cần nhóm thực hiện.

```powershell
# Terminal khác, sau khi dev server sẵn sàng:
npm.cmd run test:browser
npm.cmd run evidence:capture
# Chạy cùng kiểm thử trên production khi preview đang chạy:
$env:TEST_URL = "http://127.0.0.1:4173"
npm.cmd run test:browser
Remove-Item Env:TEST_URL
```

Scripts trình duyệt dùng Chrome hệ thống ở C:/Program Files/Google/Chrome/Application/chrome.exe. Nếu máy khác cài vị trí khác, đặt $env:CHROME_PATH trước khi chạy. evidence:capture dùng cổng debugger 9337; đóng phiên kiểm tra trước đó hoặc giải phóng đúng cổng nếu bị chiếm. Các script thao tác thêm/xóa trên app CSR trong trình duyệt, không đụng backend/dữ liệu SSR.

Bốn bằng chứng đã có: [sơ đồ](docs/COMPONENT_DIAGRAM.md), [video thật](docs/evidence/add-student.webm), [ảnh/log Network thật](docs/EVIDENCE.md), [giải thích code](docs/CODE_EXPLANATION.md). Video không có lời thuyết minh; nhóm có thể dùng file này hoặc tự quay lại theo hướng dẫn. [Kịch bản 10 phút](docs/DEMO.md) sẵn sàng để luyện tập.

## Quan sát state và Network

React DevTools: mở tab Components, chọn App, xem hook students chứa 40 phần tử; thêm một hồ sơ và thấy 41. Chọn AddStudentForm để quan sát values trước/sau submit. Đây là hướng dẫn cho nhóm; phiên kiểm tra chưa cài hoặc thao tác extension React DevTools.

Có thể dùng Chrome Sources đặt breakpoint ở App ngay trước return, xem students.length trong Scope/Console khi debugger dừng. Tiếp tục bằng F8 rồi thêm sinh viên. Không kết luận từ console.log đặt ngay sau setStudents rằng state đã cập nhật: setter lên lịch render tiếp theo. Chi tiết trong CODE_EXPLANATION.md.

Network: bật ghi, chọn Doc, bật Keep log/Preserve log, reload **một lần trước demo** để có request ban đầu. Chụp trước, thêm sinh viên, chụp sau; số document request giữ nguyên. JS/CSS/HMR có thể xuất hiện ở bộ lọc All trong dev mode; tiêu chí là không phát sinh document navigation do submit.

## Giới hạn

State chỉ tồn tại trong phiên trang, không lưu localStorage/API/database. Refresh chủ động sẽ bỏ thay đổi thêm/xóa và nạp seed; đây là hành vi đúng phạm vi. Trình duyệt cũ không hỗ trợ Popover có CSS fallback inline, nhưng chưa thử trực tiếp; Firefox, Safari, thiết bị thật và screen reader chưa xác minh. Nhóm vẫn cần tự trình bày, giải thích code và nộp artifact theo yêu cầu giảng viên.

Trong lần triển khai ban đầu, đã quan sát state trực tiếp qua Chrome Debugger trong scope của App và ghi [react-state-log.json](docs/evidence/react-state-log.json): 40 → 41 phần tử, MSSV cuối 02410010 → 02410011. StrictMode development tạo hai lần quan sát ở mỗi trạng thái; không có hồ sơ bị thêm hai lần. React DevTools extension vẫn là phần chưa thao tác thực tế.
