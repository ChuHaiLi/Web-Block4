import { useEffect, useRef, useState } from 'react';
import { validateStudentInput } from './utils/student.js';
import { loadStudents, saveStudent, removeStudent } from './api/students.js';
import SiteHeader from './components/SiteHeader.jsx';
import StudentList from './components/StudentList.jsx';
import AddStudentForm from './components/AddStudentForm.jsx';
import DeleteStudentDialog from './components/DeleteStudentDialog.jsx';

export default function App() {
  // App là owner React duy nhất; JSON backend là nơi lưu bền vững.
  const [students, setStudents] = useState([]);
  const [createdId, setCreatedId] = useState('');
  const [deletedId, setDeletedId] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const mutationBusy = useRef(false); // Chặn hai thao tác ghi cùng lúc từ UI.
  const pendingStudent = students.find((student) => student.id === pendingDeleteId);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError('');
    loadStudents(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        if (!Array.isArray(data)) throw new Error('Phản hồi danh sách không hợp lệ.');
        setStudents(data);
      })
      .catch((error) => {
        if (!controller.signal.aborted) setLoadError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [loadAttempt]);

  async function addStudent(values) {
    const validation = validateStudentInput(values, students);
    if (validation.error) return validation.error;
    if (mutationBusy.current) return 'Đang lưu một thao tác khác. Vui lòng chờ.';
    mutationBusy.current = true;
    try {
      const student = await saveStudent(values);
      setStudents((current) => [...current, student]);
      setCreatedId(student.id);
      setDeletedId('');
      return ''; // Form chỉ reset khi server đã xác nhận ghi JSON.
    } catch (error) {
      return error.message;
    } finally {
      mutationBusy.current = false;
    }
  }

  function requestDelete(id) {
    if (students.some((student) => student.id === id)) setPendingDeleteId(id);
  }

  async function deleteStudent() {
    if (!pendingStudent) return 'Sinh viên không còn trong danh sách.';
    if (mutationBusy.current) return 'Đang lưu một thao tác khác. Vui lòng chờ.';
    mutationBusy.current = true;
    const id = pendingDeleteId;
    try {
      await removeStudent(id);
      setStudents((current) => current.filter((student) => student.id !== id));
      setDeletedId(id);
      setCreatedId('');
      setPendingDeleteId('');
      return '';
    } catch (error) {
      return error.message; // Giữ dòng và dialog khi lưu thất bại.
    } finally {
      mutationBusy.current = false;
    }
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
            <strong>{loading || loadError ? "—" : students.length}</strong><span>sinh viên</span>
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
        {loading ? (
          <div className="notice" role="status">Đang tải danh sách sinh viên…</div>
        ) : loadError ? (
          <div className="notice notice-error" role="alert">
            <p>{loadError}</p>
            <button className="cancel-button" type="button" onClick={() => setLoadAttempt((current) => current + 1)}>Thử lại</button>
          </div>
        ) : (
          <>
            <AddStudentForm onAdd={addStudent} />
            <div className="workspace-grid">
              <StudentList students={students} createdId={createdId} onRequestDelete={requestDelete} />
            </div>
          </>
        )}
        <footer className="page-footer">Quản lý học vụ <span>Danh sách &amp; hồ sơ sinh viên</span></footer>
      </main>
    </>
  );
}
