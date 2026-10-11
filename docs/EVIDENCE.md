# Bằng chứng phiên bản JSON Persistence

**Chỉ thư mục evidence/json-persistence được dùng chứng minh phiên bản có backend.** Artifact cũ ngoài thư mục này giữ nguyên để tham khảo baseline, không giả làm kết quả hiện tại. Mọi suite chạy trên JSON tạm độc lập, không dùng runtime thật.

## Evidence 1 — Diagram/state owner

[COMPONENT_DIAGRAM.md](COMPONENT_DIAGRAM.md): App owner, props/callback, Fetch → Express → JSON; phân biệt storage và React State.

## Evidence 2 — Recording Add Student

[Video thật 16,76 giây](evidence/json-persistence/recording/add-student-persistence.webm), Playwright ghi trực tiếp Google Chrome 154, không chỉnh video/không tạo recording giả. Video: trang 40 → nhập → submit → 41 → mở form thấy reset → F5 → vẫn 41. Metadata 1440×1000, browser decode/seek, đã xem frames 6/8/9/10/11/12/13/16 giây (11–12: form reset; 16: sau F5): [validation](evidence/json-persistence/recording/video-validation.json).

[Report](evidence/json-persistence/recording/recording-and-devtools-results.json) ghi JSON count, reset, timeOrigin và file test. [Sau F5](evidence/json-persistence/recording/recording-after-f5.png). Video chạy phiên riêng từ file recording.json mới; phiên DevTools có file students.json riêng, không reset/xóa file trước đó.

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

## Nhóm cần tự làm

Bốn bằng chứng kỹ thuật đã chuẩn bị. Nhóm tự nộp bài, tự trình bày và có thể quay thêm bản có thuyết minh; video hiện có không có lời nói. Recording Delete riêng không bắt buộc PDF, chưa quay.

Nếu cần tự quay lại: chạy bản hiện tại, mở Chrome DevTools Doc/Keep log, chuẩn bị baseline rồi ghi màn hình. Nhập email mới → submit → chỉ dòng/tổng số → mở form reset → so Doc **trước F5** → F5 → hồ sơ còn. Đổi Fetch/XHR giải thích POST JSON. Với Delete đo Doc riêng, rồi F5 chứng minh không trở lại. Giữ ảnh/log/bản ghi nguyên gốc và ghi rõ phiên bản, không dùng screenshot baseline cũ.
