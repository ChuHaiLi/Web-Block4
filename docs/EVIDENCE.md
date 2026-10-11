# Bốn bằng chứng phải nộp - PDF trang 15

| Bằng chứng | Artifact | Trạng thái |
|---|---|---|
| Component/state owner | [COMPONENT_DIAGRAM.md](COMPONENT_DIAGRAM.md) | Hoàn thành sơ đồ Mermaid, props, callback và owner |
| Recording thêm Student | [add-student.webm](evidence/add-student.webm) | Hoàn thành: video Chrome thật, không dựng hình/không chỉnh nội dung; đã mở và kiểm tra frame |
| Network trước/sau | [Trước](evidence/devtools-doc-before.png), [sau](evidence/devtools-doc-after.png), [kết quả đo](evidence/recording-and-devtools-results.json) | Hoàn thành: Chrome DevTools thật, Doc, Keep log, 1→1 document requests |
| Code nhóm giải thích | [CODE_EXPLANATION.md](CODE_EXPLANATION.md) | Hoàn thành tài liệu; nhóm cần tự hiểu/trình bày |

Video dài khoảng13 giây,1440×1000. Nội dung:40 hồ sơ → mở form → gõ tên/email, chọn 24C11 → submit → dòng02410011 xuất hiện → mở lại form trống → trở lại dòng mới. Không có lời thuyết minh. [video-validation.json](evidence/video-validation.json) lưu metadata và các thời điểm đã xem để kiểm tra.

DevTools mở bằng frontend đi kèm Chrome, kết nối tới đúng target CSR qua debugger localhost. Screenshot là giao diện DevTools thật, không phải biểu đồ hoặc UI Network mô phỏng. Trong phiên chụp đã bật Keep log và Disable cache; clear log/reload **trước** thao tác thêm để có một document ban đầu. Sau submit không clear/reload; vẫn đúng một dòng document. Time origin giữ nguyên; số sinh viên40→41. [ARIA trước](evidence/devtools-doc-before.txt) và [ARIA sau](evidence/devtools-doc-after.txt) bổ sung dữ liệu đọc được từ giao diện.

Video được quay trong một phiên riêng sau phiên chụp DevTools để tránh hai screencast ảnh hưởng nhau. Cả hai phiên chạy cùng source dev http://127.0.0.1:5173, dùng cùng hồ sơ demo; kết quả từng phiên được ghi trong recording-and-devtools-results.json. Các screenshot desktop/mobile và network-before-after.json do kiểm thử browser thu trên production http://127.0.0.1:4173. Không trộn các phiên thành một log.

## Bằng chứng kiểm thử bổ sung

- [Unit12/12](evidence/unit-test-output.txt), [build không cảnh báo](evidence/build-output.txt), [npm ci](evidence/install-output.txt).
- [Chrome dev18/18](evidence/browser-results-dev.json), [Chrome production18/18](evidence/browser-results-production.json).
- [CDP Network trước/sau submit trên production](evidence/network-before-after.json): Document count không tăng, không Fetch/XHR/document mới khi submit, timeOrigin giữ nguyên.
- [Desktop ban đầu](evidence/desktop-before.png), [sinh viên mới](evidence/desktop-after-submit.png), [form reset](evidence/form-reset.png).
- [Mobile390](evidence/mobile-390.png), [form390](evidence/mobile-form-390.png), [mobile320](evidence/mobile-320.png), [form320](evidence/mobile-form-320.png).
- [Bảo toàn source/dữ liệu/PDF](evidence/preservation.json), [review source](evidence/source-review.json).

## Tự quay/chụp lại trên máy nhóm (không bắt buộc bổ sung cho các artifact đã có)

1. Chạy Block4, reload trước khi quay để có 40 hồ sơ. Không mở source editing trong lúc quay.
2. Chrome F12 → Network → Doc; bật Keep log/Preserve log, bảo đảm nút ghi đỏ; reload một lần **trước** thêm. Chụp màn hình trước và lưu network-before.png.
3. Dùng Windows Snipping Tool chức năng Record (Win+Shift+R trên bản hỗ trợ), hoặc OBS quay cả cửa sổ Chrome gồm trang/DevTools. Không dùng ảnh ghép thay video.
4. Mở + Thêm sinh viên; nhập tên Nguyễn Minh Anh CSR, email csr.demo@example.com, chọn 24C11. Giữ vài giây để người xem thấy đủ ba trường, rồi submit.
5. Chỉ dòng cuối mới và MSSV 02410011. Mở lại popup, chỉ tên/email trống và dropdown về “Chọn lớp sinh hoạt”; đóng popup.
6. Network Doc giữ đúng một dòng document ban đầu. Không clear log hoặc reload giữa hai ảnh. Chụp network-after.png và dừng quay, mở video để kiểm tra phát được.
7. Nếu đã thêm emaildemo trong phiên trước, reload **trước** lần quay mới hoặc dùng email khác. Reload trong bước chuẩn bị không phải submit reload; đừng reload giữa trước/sau.

Nếu không muốn giữ request ban đầu, có thể clear Network trước submit: ảnh trước0 document, ảnh sau0 document. Giữ log vẫn bật và các thao tác phải cùng một phiên. Không yêu cầu bộ lọc All hoàn toàn im lặng; asset/HMR ban đầu là bình thường.

## Nhóm còn phải tự làm

Không còn loại bằng chứng kỹ thuật nào thiếu hoặc bắt buộc phải tự quay/chụp. Nhóm cần tự luyện giải thích đoạn code, trình bày khoảng10 phút và nộp artifact theo yêu cầu giảng viên. Khả năng hiểu/trình bày/nộp thực tế của nhóm là NOT VERIFIED. Có thể tự quay bản có thuyết minh hoặc chụp React DevTools nếu muốn bổ sung.

React DevTools extension, Firefox/Safari, trình duyệt cũ fallback Popover, thiết bị thật, screen reader chưa được kiểm tra. Không dùng các artifact hiện tại để tuyên bố chúng đã PASS.

Trong lần triển khai ban đầu, đã quan sát state trực tiếp qua Chrome Debugger trong scope của App và ghi [react-state-log.json](evidence/react-state-log.json): 40 → 41 phần tử, MSSV cuối 02410010 → 02410011. StrictMode development tạo hai lần quan sát ở mỗi trạng thái; không có hồ sơ bị thêm hai lần. React DevTools extension vẫn là phần chưa thao tác thực tế.

## Delete Student - bằng chứng mở rộng

Delete là yêu cầu mở rộng của người dùng, không thay thế bốn evidence PDF về Add. [DELETE_STUDENT.md](DELETE_STUDENT.md) mô tả luồng props/callback/filter và cách demo.

- [Xác nhận xóa](evidence/delete-confirmation.png), [sau xóa](evidence/delete-after-confirm.png), [empty state](evidence/delete-empty-state.png).
- [Dialog390](evidence/mobile-delete-390.png), [dialog320](evidence/mobile-delete-320.png).
- [CDP trước/sau Delete](evidence/delete-network-before-after.json):43→42, Document count không tăng, timeOrigin giữ nguyên, không Document/Fetch/XHR mới.
- Kết quả Delete nằm trong browser-results-dev/production.json, cùng các kiểm tra hồi quy Add.
- Ảnh/log Delete thu trên production; bản dev có artifact riêng trong evidence/dev. Đây là ảnh ứng dụng và log CDP, **không** phải ảnh Chrome DevTools Doc cho thao tác Delete.
- Chưa quay recording Delete riêng. Có thể tự quay theo luồng Xóa → Hủy → Xóa → Xác nhận, giữ Network Doc/Keep log; đây là bổ sung tùy chọn.
