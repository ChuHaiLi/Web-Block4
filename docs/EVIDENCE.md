# Bằng chứng phiên bản JSON Persistence

**Recording nghiệm thu duy nhất là [add-student.mp4](evidence/add-student.mp4), do người dùng tự quay bằng Chrome và OBS.** Ảnh/log kiểm thử backend trong evidence/json-persistence được giữ nguyên; artifact baseline khác chỉ để tham khảo. WebM tự động đã được loại bỏ, không chuyển đổi sang MP4. Mọi suite chạy trên JSON tạm độc lập, không dùng runtime thật.

## Evidence 1 — Diagram/state owner

[COMPONENT_DIAGRAM.md](COMPONENT_DIAGRAM.md): App owner, props/callback, Fetch → Express → JSON; phân biệt storage và React State.

## Evidence 2 — Recording Add Student

[Video Add Student chính thức](evidence/add-student.mp4): MP4 nguyên gốc của người dùng, không chỉnh sửa/cắt ghép/nén/encode. Không giữ recording chính thức khác và không yêu cầu video mới. File đọc được; container MP4 hợp lệ, duration 36,333 giây, 1280×720, track AVC và AAC. Chrome đã giải mã và seek các khung hình mẫu xuyên suốt video; không phát hiện lỗi tại các điểm đã kiểm tra. Đây không phải kiểm tra giải mã toàn bộ từng frame/audio.

Phạm vi đã quan sát trong MP4:

| Nội dung | Quan sát và kết luận |
|---|---|
| Add và dòng mới | Khoảng 1 giây: 40 hồ sơ; khoảng 5–10 giây: nhập/chọn lớp; khoảng 13 giây: dòng mới và tổng 41. Đã xác minh bằng hình ảnh. |
| CSR không document reload do submit | Khoảng 1 và 13 giây, Network lọc Doc, Keep log bật, vẫn một dòng document. Đã xác minh trước đoạn tải lại chủ động. |
| API thành công | Khoảng 20–24 giây, Fetch/XHR hiện request `students` status 201. Đã thấy Fetch 201; Method/body không mở trong khung hình kiểm tra, nên chưa xác minh trực tiếp rằng đây là POST `/api/students` chỉ từ video. |
| Persistence sau reload | Khoảng 28 giây, trang đã trở về đầu, vẫn 41, Fetch/XHR có thêm response 200. Đã thấy trạng thái sau đoạn tải lại; không xác định được phím F5 so với thao tác reload khác từ ảnh. Video không chứng minh restart backend. |
| Form reset | Không thấy mở lại form sau thành công trong các khung hình kiểm tra: NOT VERIFIED từ MP4. DOM/log kiểm thử cũ là bằng chứng riêng. |

CSR không reload cần so Doc trước/sau submit trong cùng document; F5/reload chủ động tạo document request riêng để kiểm tra persistence. Không dùng metadata/frames/report của WebM cũ để xác minh MP4.

[Report capture cũ](evidence/json-persistence/recording/recording-and-devtools-results.json), [ảnh sau F5 cũ](evidence/json-persistence/recording/recording-after-f5.png), `frame-*.png` và `video-validation.json` giữ nguyên như lịch sử kiểm thử tự động. Thời lượng 16,76 giây và frames của phiên cũ không mô tả MP4 chính thức. Các đường dẫn video cũ trong JSON/log là dữ liệu lịch sử, không phải liên kết artifact phải nộp hiện tại; PASS/FAIL lịch sử không bị thay đổi.

## Evidence 3 — Chrome DevTools Network thật

- [Doc trước Add](evidence/json-persistence/recording/devtools-doc-before.png)
- [Doc sau Add](evidence/json-persistence/recording/devtools-doc-after.png)
- [Doc sau Delete](evidence/json-persistence/recording/devtools-doc-after-delete.png)
- [Fetch/XHR API](evidence/json-persistence/recording/devtools-fetch-xhr.png)

Doc chọn, Keep log/Disable cache bật: **1→1 sau Add, 1→1 sau Delete**, cùng performance.timeOrigin. Các .txt ARIA snapshot và report JSON đi kèm. Fetch/XHR thấy GET 200 và POST 201; GET canceled là effect cleanup của StrictMode development, không phải document reload. Không tính F5 chủ động trong cửa sổ đo Add/Delete.

CDP log browser dev/prod ở các thư mục tương ứng. [E2E](evidence/json-persistence/e2e/results.json) tách rõ Add/Delete và F5, restart Chrome/backend thật.

## Evidence 4 — Code explanation

[CODE_EXPLANATION.md](CODE_EXPLANATION.md): state, controlled form, callbacks, await Fetch, Express/store, immutable updates, CSR và persistence.

## Log kiểm thử

- unit-api-output.txt: 14 unit + 12 API.
- dev/browser-results.json và production/browser-results.json: 23 nhóm/bản.
- e2e/results.json: 10 nhóm, tiến trình Chrome/backend restart.
- build-output.txt, install-output.txt.
- preservation.json, source-review.json, final-summary.json: kiểm tra cuối.
- react-state-log.json: CDP breakpoint đọc students thực tế trong App, 40→41.
- git-status.txt: working tree, có deletion CODEX_TASK.md tồn tại từ trước.

## Danh sách phải nộp theo trang 15 PDF

1. [Sơ đồ component/state owner](COMPONENT_DIAGRAM.md).
2. [Recording Add Student duy nhất](evidence/add-student.mp4).
3. Ảnh Network trước/sau Add và log đi kèm ở Evidence 3.
4. [Code explanation](CODE_EXPLANATION.md) cùng source để nhóm tự giải thích.

Nhóm tự nộp bài và trình bày; không yêu cầu recording Delete riêng hoặc video mới. `npm.cmd run evidence:capture` vẫn kiểm tra Add/Delete, Network, form reset và F5 trên JSON fixture riêng, chỉ xuất screenshot/log, không tạo video và không đụng MP4. Các kết quả test lịch sử không tự xác minh nội dung MP4 mới.

## Kiểm tra riêng sau dọn dẹp

Phiên 12/10/2026: `npm.cmd test` PASS 26/26 (14 unit + 12 API), `npm.cmd run build` PASS 38 modules, `node --check tests/evidence.mjs` và `git diff --check` PASS. Build/test chạy lại ngoài sandbox sau lỗi quyền EPERM trong lần đầu; không sửa source để xử lý lỗi quyền. Tests dùng JSON fixture riêng, không dùng runtime thật.

Không chạy lại browser/E2E/evidence capture để tránh ghi đè ảnh/log đang giữ: NOT VERIFIED trong phiên này. Kiểm tra source scripts không còn cấu hình `recordVideo`, lấy video từ page hoặc lưu video; các assertion Add/Delete, Network, reset và persistence vẫn giữ nguyên. JSON/log lịch sử không được viết lại.
