# Evidence 1 - Component và state owner

Delete là phần mở rộng của người dùng, không thêm yêu cầu nghiệm thu vào PDF.

```mermaid
flowchart TD
  Root["main.jsx: createRoot + StrictMode"] --> App["App: owner duy nhất của students"]
  Seed["students.seed.json: 40 records"] -. "khởi tạo useState" .-> App
  App --> Header["SiteHeader"]
  App -->|"students, createdId, onRequestDelete"| List["StudentList: map students"]
  List -->|"student, isNew, onRequestDelete; key=id"| Row["StudentRow: dòng + nút Xóa"]
  App -->|"onAdd=addStudent"| Form["AddStudentForm: values/error state"]
  Form -. "submit → preventDefault → onAdd(values)" .-> App
  Row -. "Xóa → onRequestDelete(id)" .-> App
  App -->|"student từ students.find; onConfirm, onCancel"| Dialog["DeleteStudentDialog: hồ sơ + xác nhận"]
  Dialog -. "Hủy/Escape → onCancel" .-> App
  Dialog -. "submit → preventDefault → onConfirm" .-> App
  App -. "thêm: setStudents(current => spread + student)" .-> App
  App -. "xóa: setStudents(current => current.filter(...))" .-> App
```

App kiểm tra/cấp ID khi thêm và lọc theo ID khi xác nhận xóa. List truyền tiếp callback xóa đến Row, không sửa dữ liệu. Dialog cũng chỉ gọi callback; mở hộp thoại chưa xóa hồ sơ. Form reset khi onAdd trả chuỗi rỗng và giữ values nếu có lỗi.

| Dữ liệu | Owner | Mục đích |
|---|---|---|
| students | App | Danh sách state chính thức duy nhất |
| createdId/deletedId | App | Chuỗi MSSV cho thông báo/highlight |
| pendingDeleteId | App | MSSV đang chờ xác nhận; Hủy/Escape đặt lại chuỗi rỗng |
| pendingStudent | Không có state riêng | Tính từ students.find trong mỗi render của App |
| issuedCounters | App, useRef | Số thứ tự cao nhất đã cấp theo khóa; không chứa hồ sơ/danh sách; không giảm khi xóa |
| values/error | AddStudentForm | Dữ liệu form và lỗi đầu vào |
| rowRef/panelRef/dialogRef/cancelRef | Component tương ứng | Tham chiếu DOM để cuộn/đóng popup/mở dialog/focus Hủy |

Props đi từ cha xuống con; con gọi callback nhận qua props để đề nghị owner thay đổi dữ liệu. Không có students state trong component con, Context, Redux, localStorage hoặc module store. JSON seed là input ban đầu. Native popover quản lý mở/đóng form; native dialog giữ focus trong hộp thoại; React quản lý nội dung và event.
