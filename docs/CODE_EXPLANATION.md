# Evidence 4 - Giải thích code agent tạo

Đoạn dưới lấy nguyên văn từ src/App.jsx và src/components/AddStudentForm.jsx của bản đã kiểm tra. Nhóm cần hiểu và tự giải thích trước giảng viên.

## App giữ danh sách

```jsx
  const [students, setStudents] = useState(() => seed.map((student) => ({ ...student })));
  const [createdId, setCreatedId] = useState('');
  const [deletedId, setDeletedId] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState('');
  // Chỉ lưu số thứ tự đã cấp theo khóa, không giữ danh sách thứ hai.
  const issuedCounters = useRef(getSequenceCounters(seed));
  const pendingStudent = students.find((student) => student.id === pendingDeleteId);

  function addStudent(values) {
    const result = createStudent(values, students, issuedCounters.current);
    if (result.error) return result.error;

    // Tạo mảng mới, nối vào cuối; không dùng students.push().
    setStudents((current) => [...current, result.student]);
    const id = result.student.id;
    issuedCounters.current = { ...issuedCounters.current, [id.slice(0, 3)]: Number(id.slice(3)) };
    setCreatedId(id);
    setDeletedId('');
    return ''; // Form chỉ reset khi callback thành công.
  }

  function requestDelete(id) {
    if (students.some((student) => student.id === id)) setPendingDeleteId(id);
  }

  function deleteStudent() {
    if (!pendingStudent) return;
    // filter tạo mảng mới, giữ nguyên hồ sơ/thứ tự của các sinh viên còn lại.
    setStudents((current) => current.filter((student) => student.id !== pendingDeleteId));
    setDeletedId(pendingDeleteId);
    setCreatedId('');
    setPendingDeleteId('');
  }

```

1. useState khởi tạo students bằng một bản sao của 40 seed records. Hàm khởi tạo được React dùng khi mount; các render tiếp theo giữ state hiện tại. StrictMode có thể gọi initializer hai lần ở development để kiểm tra tính thuần, nhưng không thêm hồ sơ trùng.
2. students là danh sách hiện tại; setStudents là hàm yêu cầu React cập nhật. createdId/deletedId chỉ lưu MSSV cho feedback; pendingDeleteId chỉ định hồ sơ chờ xác nhận. Không có bản sao danh sách. issuedCounters dùng useRef, chỉ giữ số thứ tự theo khóa để không tái cấp MSSV khi xóa; không dùng nó để render bảng.
3. addStudent nhận values từ callback của form. createStudent kiểm tra tên/email/lớp, chặn email trùng và tạo object có id/name/email/className/major. Nó chỉ đọc students, không đổi mảng hoặc hồ sơ cũ.
4. Khi lỗi, callback trả thông báo cho form; không gọi setStudents. Khi hợp lệ, setStudents nhận một functional updater. current là state mới nhất React đưa vào updater; [...current, result.student] tạo mảng mới gồm hồ sơ cũ rồi hồ sơ mới ở cuối. Không dùng push hay sửa phần tử của current.
5. React lên lịch render App với state mới. StudentList nhận students mới qua props; map tạo các StudentRow, key=id giúp React nhận diện từng hồ sơ. React cập nhật DOM và tổng số; document hiện tại được giữ.
6. Callback trả chuỗi rỗng để báo thành công. Setter cập nhật theo cơ chế React, không phải ghi trực tiếp vào biến students trong handler hiện tại.

## Controlled inputs và submit

```jsx
  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setError('');
  }

  function handleSubmit(event) {
    event.preventDefault(); // Chặn submit mặc định và document navigation.
    const message = onAdd(values); // Đề nghị App cập nhật state danh sách.
    if (message) {
      setError(message);
      return; // Giữ dữ liệu để người dùng sửa lỗi.
    }
    setValues(EMPTY_FORM); // Reset controlled inputs sau khi thêm thành công.
    setError('');
    if (typeof panelRef.current?.hidePopover === 'function' && panelRef.current.matches(':popover-open')) panelRef.current.hidePopover();
  }

```

Input họ tên trong JSX nối value={values.name} và onChange={handleChange}; email và select lớp dùng cùng cơ chế. Vì value do React state quyết định, chúng là controlled inputs.

- Gõ ký tự → onChange nhận event → đọc name/value của trường → setValues tạo object mới, giữ hai trường còn lại → React render giá trị đang nhập. values chỉ là form, không phải students.
- Submit → handleSubmit gọi event.preventDefault() đầu tiên. Browser không thực hiện submit form mặc định để navigate hoặc yêu cầu HTML mới. Handler gọi onAdd(values), chính là addStudent của App được truyền xuống bằng prop.
- Nếu callback trả lỗi, form giữ values và hiển thị role=alert. Nếu callback thành công, setValues(EMPTY_FORM) đưa cả tên/email/lớp về chuỗi rỗng; React cập nhật ba input/select.
- Ref chỉ giúp đóng native popover sau khi thành công. Mở lại form để thấy reset. StudentRow dùng effect để cuộn đến dòng vừa thêm; đây không phải document navigation.

Không reload là kết quả của preventDefault **và** handler không gọi location/reload, không submit POST hoặc fetch backend. Chỉ tên React không đủ chứng minh điều này; đã kiểm tra Chrome/Network thật.

## Ví dụ state transition

Ban đầu: students.length=40, values trống. Nhập Nguyễn Minh Anh CSR / csr.demo@example.com / 24C11: chỉ values thay đổi. Submit: App tạo MSSV 02410011, students thành mảng mới dài 41, createdId='02410011'. Form trở về ba chuỗi rỗng. Bảng vẫn giữ 40 hồ sơ cũ và nối hồ sơ mới vào cuối.

Nếu email trùng, students vẫn dài 40/41 và values giữ dữ liệu để sửa. Nếu refresh chủ động, App mount lại và danh sách trở về 40 seed records, vì bài này không lưu bền vững.

## Quan sát trực tiếp

React DevTools: Components → App → hooks → students; xem 40 rồi41. Components → AddStudentForm → values để thấy controlled state. Extension chưa được thao tác trong lượt kiểm tra, đây là hướng dẫn nhóm tự dùng.

Không cần extension: Sources → mở App.jsx → đặt breakpoint ngay trước return của App, thêm Watch students.length và students[students.length - 1]. Tiếp tục F8 qua render ban đầu; thêm hồ sơ rồi xem state ở render tiếp theo. Khi debugger dừng, Console có thể đọc students.length và students; đây là đọc state trong đúng scope, không đặt một window.students hay store thứ hai.

Không đặt console.log(students) ngay sau setStudents rồi nghĩ giá trị cũ là lỗi; state mới có ở lần render tiếp theo. Dùng breakpoint sau render hoặc DevTools để quan sát đúng thời điểm.

Trong lần triển khai ban đầu, đã quan sát state trực tiếp qua Chrome Debugger trong scope của App và ghi [react-state-log.json](evidence/react-state-log.json): 40 → 41 phần tử, MSSV cuối 02410010 → 02410011. StrictMode development tạo hai lần quan sát ở mỗi trạng thái; không có hồ sơ bị thêm hai lần. React DevTools extension vẫn là phần chưa thao tác thực tế.

## Delete Student: xác nhận rồi cập nhật bằng filter

1. App truyền requestDelete dưới tên prop onRequestDelete vào StudentList; List truyền tiếp cho StudentRow. Bấm Xóa gọi onRequestDelete(student.id), App đặt pendingDeleteId. Danh sách lúc này chưa thay đổi.
2. App dùng students.find để tính pendingStudent. Đây là giá trị suy ra từ state chính thức, không phải state danh sách thứ hai. Có hồ sơ thì render DeleteStudentDialog với student/onConfirm/onCancel.
3. Dialog kế thừa nội dung xác nhận từ Block3. Effect gọi showModal và focus nút Hủy; native dialog giới hạn focus bên trong. Hủy hoặc Escape gọi onCancel, App chỉ xóa pendingDeleteId, không gọi setStudents.
4. Xác nhận xóa là submit form. handleSubmit gọi event.preventDefault trước onConfirm; browser không POST/navigate. onConfirm chính là deleteStudent của App.
5. setStudents(current => current.filter(student => student.id !== pendingDeleteId)) tạo **mảng mới**, loại đúng ID được xác nhận. filter không mutate current; những object còn lại và thứ tự của chúng giữ nguyên. Không dùng splice hoặc gán trực tiếp vào students.
6. App cập nhật thông báo và đóng dialog. React render với students mới; List map các dòng còn lại, số lượng giảm ngay. Không có fetch/API hoặc reload. Nếu danh sách rỗng, List hiện “Chưa có sinh viên”; Add vẫn dùng cùng callback cũ.
7. issuedCounters không giảm khi xóa. Ví dụ đã cấp 02410012 rồi xóa hồ sơ đó, lần thêm tiếp theo lấy 02410013. Ref chỉ chứa metadata số thứ tự; việc sửa ref không phải nguyên nhân cập nhật bảng, setStudents mới là nguyên nhân. Reload dựng lại cả danh sách và metadata từ seed; không lưu lịch sử bền vững.

```jsx
// DeleteStudentDialog.jsx
function handleSubmit(event) {
  event.preventDefault();
  onConfirm();
}

function handleCancel(event) {
  event.preventDefault();
  onCancel();
}
```

So sánh SSR: Block3 mở GET /students/:id/delete để render EJS xác nhận; form POST xóa ghi store rồi 303/GET render document mới. Block4 dùng dialog và callback tại client; cả thêm và xóa đều cập nhật App state trong document hiện tại.
