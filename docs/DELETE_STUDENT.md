# Delete Student - phần mở rộng kế thừa Block3

Delete không phải yêu cầu bắt buộc của PDF. Phần mở rộng giữ các tiêu chí Add ban đầu và chỉ thay đổi Block4.

## Giao diện và luồng sự kiện

Mỗi dòng có nút Xóa màu đỏ như Block3, với aria-label chứa tên và MSSV. Bấm mở native dialog hiển thị MSSV, họ tên, email, lớp và ngành, cảnh báo và hai nút Xác nhận xóa/Hủy. Focus ban đầu vào Hủy; Escape cũng hủy. Nội dung/CSS tham khảo views/delete-student.ejs và public/css/styles.css của Block3.

App → StudentList → StudentRow truyền onRequestDelete. Row gọi callback với ID; App lưu pendingDeleteId, tìm hồ sơ từ students và truyền vào DeleteStudentDialog cùng onConfirm/onCancel. Dialog không giữ danh sách. Chỉ khi xác nhận, App chạy:

```jsx
setStudents((current) => current.filter((student) => student.id !== pendingDeleteId));
```

filter tạo mảng mới; không mutate mảng hoặc object cũ, giữ thứ tự các hồ sơ khác. Dialog gọi preventDefault khi submit. Không API, không POST, không reload. Xóa xong có thông báo, dòng biến mất, tổng số/badge/footer cập nhật; xóa hết hiện empty state và vẫn thêm được.

Metadata issuedCounters trong ref của App chỉ chứa số thứ tự theo khóa, không chứa students. Giữ MSSV đã cấp trong phiên để xóa mã cao nhất không khiến Add cấp lại mã đó. Có thể dùng lại email của sinh viên đã xóa. Refresh khôi phục 40 seed và bộ đếm ban đầu; không lưu bền vững hoặc đồng bộ với SSR.

## Kiểm thử thực tế

Đã chạy toàn bộ npm test (12/12), browser tests trên dev và production (18/18 nhóm mỗi bản), build thành công. [Unit output](evidence/unit-test-output.txt), [dev](evidence/browser-results-dev.json), [production](evidence/browser-results-production.json), [build](evidence/build-output.txt).

| Hành vi | Kết quả/bằng chứng |
|---|---|
| Hồ sơ xác nhận đúng; mở dialog chưa xóa | PASS: DOM so sánh đủ năm trường với seed |
| Hủy/Escape giữ nguyên toàn bộ danh sách | PASS: snapshot trước/sau |
| Xác nhận chỉ xóa đúng ID và cập nhật số lượng | PASS: snapshot còn lại đúng dữ liệu/thứ tự |
| Không reload/API | PASS: CDP Document count giữ nguyên, timeOrigin giữ nguyên, không Document/Fetch/XHR mới |
| Add sau Delete, email đã xóa, MSSV không tái sử dụng | PASS: thêm 02410013 sau khi xóa 02410012; controlled form vẫn reset |
| Xóa hết rồi thêm lại | PASS: 0 → empty state → 1; cấp 02410014 |
| Responsive dialog 390/320px | PASS: trong viewport; Hủy giữ danh sách; bảng cuộn ngang |
| Add/PDF bốn tiêu chí ban đầu | PASS: đã chạy lại và quay lại bằng chứng Add/DevTools |
| App là students state owner duy nhất | PASS: review source; pendingStudent chỉ là giá trị suy ra |
| Không lỗi JavaScript | PASS: pageerror và console.error đều rỗng |

[Ảnh xác nhận](evidence/delete-confirmation.png), [sau xóa](evidence/delete-after-confirm.png), [empty state](evidence/delete-empty-state.png), [mobile320](evidence/mobile-delete-320.png), [Network CDP trước/sau Delete](evidence/delete-network-before-after.json). Các ảnh/log này thu từ bản production; không phải ảnh Chrome DevTools Doc và không phải recording Delete. Recording/DevTools Add vẫn nằm trong EVIDENCE.md.

## Chạy lại trên Windows

Terminal 1 trong Block4: npm.cmd run dev. Terminal 2:

```powershell
cd D:\VSCode\HCMUS\Web\Block4
npm.cmd test
npm.cmd run test:browser
npm.cmd run build
```

Để kiểm tra production, chạy npm.cmd run preview sau build rồi ở terminal kiểm thử đặt $env:TEST_URL = "http://127.0.0.1:4173", chạy npm.cmd run test:browser, cuối cùng Remove-Item Env:TEST_URL. Chrome hệ thống được dùng; cấu hình CHROME_PATH theo README nếu cần.

## Demo mở rộng tùy chọn

Sau demo PDF, chọn một sinh viên → Xóa → chỉ hồ sơ → Hủy để thấy danh sách không đổi → Xóa lần nữa → Xác nhận → chỉ dòng biến mất và Doc không tăng. Mở App chỉ filter, mở List/Row chỉ callback props. So sánh Block3 GET xác nhận + POST/303/GET. Không gửi thao tác tới backend Block3.

Firefox/Safari, trình duyệt cũ không hỗ trợ dialog/popover, thiết bị thật và screen reader chưa xác minh. Bản hiện tại dùng dialog native và đã kiểm tra Chrome desktop/mobile viewport. Chưa quay video riêng cho Delete; người dùng có thể tự quay nếu muốn, PDF không yêu cầu artifact Delete.
