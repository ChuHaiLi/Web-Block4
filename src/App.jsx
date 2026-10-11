import { useRef, useState } from 'react';
import seed from './data/students.seed.json' with { type: 'json' };
import { createStudent, getSequenceCounters } from './utils/student.js';
import SiteHeader from './components/SiteHeader.jsx';
import StudentList from './components/StudentList.jsx';
import AddStudentForm from './components/AddStudentForm.jsx';
import DeleteStudentDialog from './components/DeleteStudentDialog.jsx';

export default function App() {
  // App là owner duy nhất của danh sách. Seed chỉ là dữ liệu khởi tạo.
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

  return (
    <>
      <a className="skip-link" href="#main-content">Đến nội dung chính</a>
      <SiteHeader />
      <main id="main-content" className="page-shell">
        <div className="page-heading">
          <div>
            <p className="eyebrow">QUẢN LÝ SINH VIÊN</p>
            <h1>Danh sách sinh viên</h1>
            <p className="page-description">Thông tin học vụ rõ ràng, tập trung trong một nơi.</p>
          </div>
          <div className="student-total" aria-label="Tổng số sinh viên">
            <strong>{students.length}</strong><span>sinh viên</span>
          </div>
        </div>
        {createdId && (
          <div className="notice notice-success" role="status">
            <strong>Đã thêm sinh viên thành công.</strong> MSSV được cấp: <strong>{createdId}</strong>.
          </div>
        )}
        {deletedId && (
          <div className="notice notice-success" role="status">
            <strong>Đã xóa sinh viên thành công.</strong> MSSV: <strong>{deletedId}</strong>. Danh sách đã được cập nhật.
          </div>
        )}
        {pendingStudent && (
          <DeleteStudentDialog student={pendingStudent} onConfirm={deleteStudent} onCancel={() => setPendingDeleteId('')} />
        )}
        <AddStudentForm onAdd={addStudent} />
        <div className="workspace-grid">
          <StudentList students={students} createdId={createdId} onRequestDelete={requestDelete} />
        </div>
        <footer className="page-footer">Quản lý học vụ <span>Danh sách &amp; hồ sơ sinh viên</span></footer>
      </main>
    </>
  );
}
