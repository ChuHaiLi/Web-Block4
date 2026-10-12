# Student Management — Block4

React + Vite render Student List tại trình duyệt. Express cung cấp JSON API và lưu dữ liệu vào file; không có EJS, template engine, database hoặc localStorage. **Delete và JSON Persistence là mở rộng theo quyết định nhóm, không phải yêu cầu bắt buộc của PDF.** “Block 1” trong PDF được hiểu là Block3.

## Chạy trên Windows

Dùng Node.js 24 LTS (đã kiểm tra với 24.18.0), npm và Google Chrome để chạy browser tests. Từ PowerShell:

```powershell
cd D:\VSCode\HCMUS\Web\Block4
npm.cmd ci
```

Development dùng hai terminal, cùng thư mục Block4:

```powershell
# Terminal 1 — API http://127.0.0.1:3004
npm.cmd run backend
```

```powershell
# Terminal 2 — React http://127.0.0.1:5173
npm.cmd run dev
```

Vite proxy /api sang Express, không cần cấu hình CORS. PORT đổi cổng backend; API_PORT đổi đích proxy Vite. Nếu cổng đang được dùng, dừng đúng tiến trình của bạn hoặc chọn cổng khác.

Production:

```powershell
npm.cmd run build
npm.cmd start
```

Mở http://127.0.0.1:3004. Express phục vụ nguyên HTML shell/assets trong dist và JSON API. React vẫn tạo bảng tại client. npm.cmd run preview dùng cổng 4173 và cũng cần backend đang chạy; đây là preview, không thay thế npm start.

## Cấu trúc

```text
Block4/
├── Block4_CSR_Assignment.pdf         # đề gốc, không sửa
├── src/
│   ├── App.jsx                      # owner duy nhất của students
│   ├── api/students.js               # Fetch GET/POST/DELETE
│   ├── components/                   # Header, List, Row, Add Form, Delete Dialog
│   ├── data/                         # seed 40, danh mục lớp/ngành gốc
│   ├── utils/student.js              # validation/cấp ID dùng chung
│   └── styles.css
├── server/{index,app,store}.js        # Express + JSON store
├── data/.gitkeep                     # runtime students.json được gitignore
├── tests/                           # unit, API, browser, E2E, evidence
├── docs/                            # phân tích, sơ đồ, giải thích, demo, nghiệm thu
│   └── evidence/json-persistence/    # kết quả và bằng chứng phiên bản này
└── package.json, package-lock.json, vite.config.js
```

CODEX_TASK.md đã bị xóa trong working tree trước thay đổi này; nội dung gốc đã đọc từ Git HEAD, trạng thái xóa được bảo toàn.

## Dữ liệu và luồng CSR

Seed: src/data/students.seed.json, **40 hồ sơ**, giữ nguyên bytes và thứ tự. Không lấy runtime 41 hồ sơ của Block3. Danh mục classes.json/majors.json cũng giữ nguyên.

Runtime mặc định: data/students.json. Lần đầu chưa có file thì backend tạo bản sao seed cùng counters; những lần sau đọc file đã lưu, không reset hoặc ghi lại seed. File chứa version, students và counters (bộ đếm MSSV theo khóa). Runtime và file ghi tạm được gitignore.

- Mở trang: HTML shell → JavaScript → App với students=[] → Fetch GET → JSON → setStudents → List.map → Row.
- Add: controlled inputs → submit.preventDefault → onAdd → Fetch POST → backend validate/lưu JSON → trả student → setStudents(current => [...current, student]) → reset form.
- Delete: Row → callback qua List → App chọn ID → dialog xác nhận → Fetch DELETE → lưu thành công → filter trong setStudents.
- Lỗi API: hiển thị thông báo; Add giữ input, Delete giữ dòng/dialog. GET lỗi không giả vờ dùng seed. Pending khóa nút submit, ref chặn gọi lặp.
- F5 tạo document request do người dùng chủ động, rồi GET nạp dữ liệu đã lưu. Add/Delete chỉ tạo Fetch/XHR, không điều hướng document.

App là **state owner React duy nhất**. File JSON là persistent storage, không phải React state thứ hai. AddStudentForm giữ values/error/submitting; DeleteStudentDialog giữ error/saving; List/Row nhận props.

## API và an toàn dữ liệu

| Endpoint | Thành công | Lỗi chính |
|---|---|---|
| GET /api/students | 200, array students | 500 đọc/JSON lỗi |
| POST /api/students | 201, student có ID | 400 dữ liệu sai; 409 email trùng; 500 ghi lỗi |
| DELETE /api/students/:id | 200, {id} | 404 không tồn tại; 500 ghi lỗi |

POST chỉ nhận name/email/className. Ngành suy ra từ lớp, ID do backend cấp; không nhận đường dẫn file/ID từ request. Hàng đợi tuần tự hóa đọc–sửa–ghi trong một tiến trình; ghi file tạm cùng thư mục, flush rồi rename. Khởi tạo dùng link để tránh ghi đè file đã tồn tại. Xóa không hạ counters nên mã đã cấp không được tái dùng trong cùng runtime, kể cả sau restart.

Đọc [JSON_PERSISTENCE](docs/JSON_PERSISTENCE.md) để xem định dạng, lỗi file, reset có kiểm soát và giới hạn một backend/file.

## Kiểm thử và evidence

```powershell
npm.cmd test                 # unit + API
npm.cmd run build           # cần trước browser production/E2E
npm.cmd run test:browser     # dev và production
npm.cmd run test:e2e         # 40 → 41 → F5 → Delete → F5 → restart
npm.cmd run evidence:capture # screenshot/log + Chrome DevTools Doc; không quay video
```

Browser/E2E/evidence tự khởi động server trên cổng trống và JSON riêng trong .tools/test-data. Không cần chạy server tay cho các suite; không chạm data/students.json thật, không xóa/reset dữ liệu khi test/build. CHROME_PATH có thể chỉ đến Chrome đã cài nếu đường dẫn mặc định khác.

Kết quả thực tế đã lưu: **14 unit + 12 API**, **23 nhóm browser dev + 23 production**, **10 E2E** PASS; build PASS. [Bảng nghiệm thu](docs/ACCEPTANCE.md) nêu phạm vi và NOT VERIFIED. Ảnh/log kiểm thử backend trong json-persistence được giữ nguyên; artifact baseline khác chỉ để tham khảo.

Recording nghiệm thu duy nhất là [add-student.mp4](docs/evidence/add-student.mp4), do người dùng quay bằng Chrome và OBS. Phạm vi video đã xác minh xem [EVIDENCE.md](docs/EVIDENCE.md); không dùng recording tự động cũ. `evidence:capture` chỉ tạo screenshot/log và kiểm tra trên fixture riêng, không tạo video hoặc ghi đè MP4. Bốn bằng chứng theo trang 15 PDF: sơ đồ component/state owner, MP4 Add Student, Network trước/sau và code explanation.

- [Sơ đồ component/state owner](docs/COMPONENT_DIAGRAM.md)
- [Giải thích code](docs/CODE_EXPLANATION.md)
- [Kịch bản demo 10 phút](docs/DEMO.md)
- [Danh sách video/ảnh/log](docs/EVIDENCE.md)
- [Phân tích ảnh hưởng](docs/ANALYSIS.md)

CSR khác SSR Block3: Block3 POST form → server ghi → redirect 303 → GET → EJS tạo HTML bảng mới. Block4 Fetch JSON → React State → React cập nhật UI trong document hiện tại. Có backend lưu dữ liệu không biến CSR thành SSR.
