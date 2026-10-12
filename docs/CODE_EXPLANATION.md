# Evidence 4 — Giải thích code do agent tạo

JSON Persistence là mở rộng của nhóm; kiến trúc render vẫn là React CSR. Tài liệu này là evidence code explanation theo trang 15, đi kèm sơ đồ, ảnh Network và recording chính thức [add-student.mp4](evidence/add-student.mp4). Phạm vi quan sát video xem EVIDENCE.md; phần giải thích source không tự chứng minh MP4 thể hiện mọi tiêu chí.

## 1. State owner và khởi tạo

Trong src/App.jsx:

```jsx
const [students, setStudents] = useState([]);
const pendingStudent = students.find((student) => student.id === pendingDeleteId);
```

App sở hữu students duy nhất. List/Row nhận props, không copy students vào state khác. pendingStudent chỉ suy ra hồ sơ từ ID để dialog xác nhận.

useEffect tạo AbortController rồi gọi loadStudents(signal). Hàm này Fetch GET /api/students. Khi nhận array hợp lệ, App gọi setStudents(data). Trong lúc chờ có loading; lỗi có thông báo/Thử lại, không hiển thị seed như thể dữ liệu đã tải thành công. Cleanup hủy request khi effect kết thúc. StrictMode dev có thể tạo GET bị canceled rồi GET khác thành công; không phải lỗi Add hoặc document navigation.

## 2. Controlled inputs và callback

AddStudentForm giữ values gồm name/email/className. Mỗi input/select có value từ state và onChange tạo object mới. React kiểm soát nội dung trường.

```jsx
async function handleSubmit(event) {
  event.preventDefault();
  // submittingRef chặn gửi lặp; submitting khóa controls.
  // ...
  const message = await onAdd(values);
  if (message) {
    setError(message);
    return; // giữ values khi lỗi
  }
  // Thành công mới setValues về rỗng và đóng popup.
}
```

Đây là trích lược luồng; xem hàm đầy đủ trong src/components/AddStudentForm.jsx. preventDefault ngăn trình duyệt submit form theo cách tạo trang mới. onAdd là callback App truyền xuống, nối event với state owner.

## 3. Add — await lưu rồi cập nhật UI

Đoạn quan trọng trong App.addStudent:

```jsx
const student = await saveStudent(values);
setStudents((current) => [...current, student]);
setCreatedId(student.id);
setDeletedId('');
return '';
```

1. App validate cơ bản và khóa thao tác ghi.
2. saveStudent gửi Fetch POST JSON, không phải form navigation.
3. Express validate lại, tạo ID và ghi runtime; thành công trả 201 cùng student.
4. await hoàn thành mới nối student vào array mới. Functional updater nhận state hiện hành, không mutate bằng push.
5. React thấy state mới, gọi render; StudentList.map tạo Row mới ở cuối, badge/tổng số đổi.
6. Callback trả chuỗi rỗng để Form reset. Nếu request lỗi, catch trả message; state/list và input giữ nguyên, không giả vờ đã lưu.

## 4. Delete — xác nhận rồi filter

Row gọi onRequestDelete(id) qua List lên App. App giữ pendingDeleteId, dialog hiển thị đúng hồ sơ; mở/Hủy/Escape chưa gọi API.

```jsx
await removeStudent(id);
setStudents((current) => current.filter((student) => student.id !== id));
setDeletedId(id);
setCreatedId('');
setPendingDeleteId('');
```

Fetch DELETE thành công mới filter tạo array mới. Những hồ sơ khác giữ thứ tự/dữ liệu. Lỗi giữ dòng và dialog, hiện message để thử lại. pending/ref khóa xác nhận lặp và chặn đóng dialog khi đang ghi.

## 5. Express và file JSON

server/app.js có ba route GET/POST/DELETE. GET trả array; POST nhận name/email/className, trả hồ sơ có ID; DELETE trả {id}. Không có res.render/EJS.

server/store.js đọc JSON từ đường dẫn cấu hình cố định, validate schema/ID/email/danh mục. add/remove đi qua queue để hai request không cùng đọc bản cũ rồi ghi mất dữ liệu nhau. Store tạo array mới và ghi file tạm có flush, rename sang runtime. API trả thành công **sau await save**, không trước. Seed chỉ dùng khi runtime chưa tồn tại; JSON lỗi không bị tự reset.

Counter theo khóa lưu cùng students, xóa không giảm counter. Vì vậy restart không tái cấp mã đã xóa.

## 6. Vì sao vẫn là CSR và F5 giữ dữ liệu?

Browser tải HTML shell không có các hàng Student List → chạy main.jsx/createRoot → React Fetch JSON → setStudents → JSX tạo bảng. Server trả dữ liệu, không render bảng HTML. Add/Delete giữ document cũ, Fetch/XHR riêng; React cập nhật UI từ state.

F5 cố ý tạo document mới, App lại bắt đầu [], sau GET nhận file đã lưu (ví dụ 41) nên không mất sinh viên. React State tự nó không tồn tại sau F5; chính JSON backend cung cấp dữ liệu bền vững.

SSR Block3: form POST → Express lưu → redirect 303 → GET → EJS render HTML bảng mới. CSR Block4: Fetch POST → JSON response → setStudents → UI trong document hiện hành.

## 7. Quan sát state và request

- React DevTools: Components → App → Hooks, nhìn students trước/sau Add/Delete. Extension chưa được kiểm thử trong phiên này.
- Không cần extension: Chrome Sources mở App.jsx, đặt breakpoint tại pendingStudent hoặc setStudents. Xem students trong Scope khi render/cập nhật; resume để tránh giữ request quá lâu.
- Network bật Keep log/Preserve log và lọc Doc: ghi count trước/sau submit, không nhấn F5 trong cửa sổ đo.
- Chuyển Fetch/XHR để xem GET/POST/DELETE và JSON response; sau đó F5 để kiểm tra persistence, tính document request này riêng.

Log mới [react-state-log.json](evidence/json-persistence/react-state-log.json) đã đọc biến students trong call frame App qua Chrome CDP Debugger: 40 → 40 → 40 → 40 → 41 → 41 (StrictMode render lặp). Chạy lại bằng npm.cmd run evidence:state, dùng fixture JSON riêng.
