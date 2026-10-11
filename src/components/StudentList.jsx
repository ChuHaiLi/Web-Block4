import StudentRow from './StudentRow.jsx';

export default function StudentList({ students, createdId, onRequestDelete }) {
  return (
    <section className="panel roster-panel" aria-labelledby="roster-title">
      <div className="panel-heading">
        <div><h2 id="roster-title">Hồ sơ sinh viên</h2><p>Danh sách thông tin học vụ của sinh viên.</p></div>
        <div className="roster-heading-actions">
          <span className="count-badge">{students.length} hồ sơ</span>
          <button className="submit-button add-student-button native-popover-control" type="button" popoverTarget="create-student" popoverTargetAction="show">+ Thêm sinh viên</button>
          <a className="submit-button add-student-button popover-fallback-control" href="#create-student">+ Thêm sinh viên</a>
        </div>
      </div>
      {students.length === 0 ? (
        <div className="empty-state"><span className="empty-symbol" aria-hidden="true">∅</span><h3>Chưa có sinh viên</h3><p>Hãy dùng biểu mẫu để thêm sinh viên đầu tiên.</p></div>
      ) : (
        <>
          <div className="table-scroll" tabIndex="0" role="region" aria-label="Bảng sinh viên, có thể cuộn ngang trên màn hình nhỏ">
            <table>
              <caption className="visually-hidden">Danh sách {students.length} sinh viên gồm MSSV, họ tên, email, lớp sinh hoạt ngành học và thao tác xóa.</caption>
              <colgroup><col className="col-id" /><col className="col-name" /><col className="col-email" /><col className="col-class" /><col className="col-major" /><col className="col-actions" /></colgroup>
              <thead><tr><th scope="col">MSSV</th><th scope="col">Họ và tên</th><th scope="col">Email</th><th scope="col">Lớp sinh hoạt</th><th scope="col">Ngành học</th><th scope="col">Thao tác</th></tr></thead>
              <tbody>{students.map((student) => <StudentRow key={student.id} student={student} isNew={student.id === createdId} onRequestDelete={onRequestDelete} />)}</tbody>
            </table>
          </div>
          <div className="table-footer">Hiển thị {students.length} sinh viên <span>Danh sách &amp; hồ sơ sinh viên</span></div>
        </>
      )}
    </section>
  );
}
