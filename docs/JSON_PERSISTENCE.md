# JSON Persistence — mở rộng của nhóm

Không phải yêu cầu bắt buộc của PDF. Express 5 chỉ xử lý REST API và phục vụ assets production; không tạo HTML Student List.

## Storage

Seed bất biến: src/data/students.seed.json (40). Runtime: data/students.json (gitignore), ví dụ cấu trúc:

```json
{
  "version": 1,
  "students": [],
  "counters": { "024": 10010, "025": 10, "026": 10 }
}
```

Đây chỉ là minh họa schema; file khởi tạo thật chứa đầy đủ 40 hồ sơ. Mỗi hồ sơ giữ id/name/email/className/major. ID là string giữ số 0 đầu; email không trùng khi so không phân biệt hoa thường. counters giữ số thứ tự cao nhất đã cấp theo khóa, không giảm khi Delete.

Backend đọc/validate runtime mỗi lần truy cập, không giữ một bản students trong memory thay cho file. initialize chỉ tạo seed nếu file chưa có; file lỗi/schema sai/ID trùng/counter thấp khiến startup báo lỗi, **không tự sửa hoặc reseed**.

## Ghi và lỗi

Các GET/POST/DELETE đi qua hàng đợi Promise trong store. Mỗi ghi đọc dữ liệu mới nhất, tạo array/object mới, ghi file tạm riêng (wx + flush), rồi rename cùng thư mục. API chỉ xác nhận thành công sau khi ghi xong. Nếu ghi/rename lỗi, không trả thành công, không cập nhật State frontend; file cũ được giữ trong kiểm tra injected failure. Khởi tạo dùng link không overwrite file hiện có.

API không nhận đường dẫn file. STUDENT_DATA_FILE là cấu hình khởi động do người vận hành đặt, chỉ chấp nhận JSON dưới Block4/data hoặc .tools/test-data; seed/source/Git/outside bị từ chối.

## Thử nghiệm, backup và khôi phục

Không có endpoint reset. Build/test không xóa runtime. Để demo từ 40 hồ sơ, dùng **file test mới** thay vì reset dữ liệu thật:

```powershell
# Chọn tên mới chưa có dữ liệu; backend tạo từ seed.
$env:STUDENT_DATA_FILE = ".tools/test-data/manual-demo-20261011/students.json"
npm.cmd run backend
# Sau khi dừng demo:
Remove-Item Env:STUDENT_DATA_FILE
```

Biến trên chỉ áp dụng terminal hiện tại. Mỗi lần muốn demo sạch hãy chọn thư mục tên mới, không xóa file cũ.

Nếu thực sự muốn reset runtime thật: dừng backend, sao lưu data/students.json sang tên mới có thời gian, kiểm tra bản sao rồi **tự quyết định** đổi tên file runtime để lần khởi động sau tạo seed. Không chạy script tự động reset và không đụng Block3. Khi file lỗi: giữ bản lỗi/backup, sửa hoặc khôi phục bản JSON hợp lệ sau khi dừng backend; không thay bằng seed âm thầm.

## Giới hạn

- Chỉ chạy **một tiến trình backend trên mỗi file**. Hàng đợi không khóa giữa nhiều process; không tuyên bố an toàn nhiều backend cùng ghi.
- Phù hợp bài tập/local demo, chưa có authentication, backup tự động, audit log hoặc triển khai nhiều người dùng.
- Temp/flush/rename giảm nguy cơ ghi dở; chưa kiểm thử mất điện/crash tại từng bước hoặc mọi filesystem.
- Nếu kết nối mất sau khi server đã ghi nhưng trước khi client nhận response, tải lại để đối chiếu trước khi thử thêm lại; backend chặn email trùng.
- Một tab không tự đồng bộ thay đổi từ tab khác; F5 tải trạng thái lưu mới nhất.
- Không có migration tự động cho JSON tùy ý; schema sai được báo lỗi, không overwrite.

Nguồn Express chính thức: [JSON middleware và static](https://expressjs.com/en/5x/api/application/), [xử lý lỗi async Express 5](https://expressjs.com/en/5x/guide/error-handling/).
