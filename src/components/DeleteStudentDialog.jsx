import { useEffect, useRef } from 'react';
import majors from '../data/majors.json' with { type: 'json' };

export default function DeleteStudentDialog({ student, onConfirm, onCancel }) {
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);
  const majorName = majors.find((major) => major.code === student.major)?.name || student.major;

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal(); // Native dialog giữ focus trong hộp thoại.
    cancelRef.current.focus(); // Enter khi vừa mở mặc định Hủy, tránh xóa ngoài ý muốn.
    return () => dialog.close();
  }, []);

  function handleSubmit(event) {
    event.preventDefault(); // Không submit form/navigate lên server.
    onConfirm(); // App mới là component được cập nhật students.
  }

  function handleCancel(event) {
    event.preventDefault(); // Escape cũng đi qua callback để đóng đúng React state.
    onCancel();
  }

  return (
    <dialog ref={dialogRef} className="panel delete-panel delete-dialog" aria-labelledby="delete-title" aria-describedby="delete-description" onCancel={handleCancel}>
      <p className="eyebrow">QUẢN LÝ SINH VIÊN</p>
      <h2 id="delete-title">Xác nhận xóa sinh viên</h2>
      <p id="delete-description" className="page-description">Kiểm tra hồ sơ trước khi xác nhận. Chỉ sinh viên dưới đây sẽ bị xóa.</p>
      <dl className="student-details">
        <div><dt>MSSV</dt><dd>{student.id}</dd></div>
        <div><dt>Họ và tên</dt><dd>{student.name}</dd></div>
        <div><dt>Email</dt><dd>{student.email}</dd></div>
        <div><dt>Lớp sinh hoạt</dt><dd>{student.className}</dd></div>
        <div><dt>Ngành học</dt><dd>{majorName}</dd></div>
      </dl>
      <div className="notice notice-error delete-warning" id="delete-warning">
        <strong>Bạn có chắc chắn muốn xóa sinh viên này? Hành động này không thể hoàn tác trong phiên trang hiện tại.</strong>
      </div>
      <form className="delete-form" onSubmit={handleSubmit} aria-describedby="delete-warning">
        <button className="danger-button" type="submit">Xác nhận xóa</button>
        <button ref={cancelRef} className="cancel-button" type="button" onClick={onCancel}>Hủy</button>
      </form>
      <p className="delete-footnote">MSSV đã cấp sẽ không được sử dụng lại trong phiên trang. Reload sẽ khôi phục seed ban đầu.</p>
    </dialog>
  );
}
