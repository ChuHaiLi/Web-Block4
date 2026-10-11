import { useEffect, useRef } from 'react';
import majors from '../data/majors.json' with { type: 'json' };

export default function StudentRow({ student, isNew, onRequestDelete }) {
  const rowRef = useRef(null);
  const majorName = majors.find((major) => major.code === student.major)?.name || student.major;

  // Đưa hồ sơ vừa thêm vào vùng nhìn thấy, kể cả khi bảng đã dài.
  useEffect(() => {
    if (isNew) rowRef.current?.scrollIntoView({ block: 'center' });
  }, [isNew]);

  return (
    <tr ref={rowRef} className={isNew ? 'student-new' : undefined}>
      <th scope="row" className="student-id">{student.id}</th>
      <td className="student-name">{student.name}</td>
      <td className="student-email">{student.email}</td>
      <td><span className="class-badge">{student.className}</span></td>
      <td>{majorName}</td>
      <td className="student-actions">
        <button className="delete-link" type="button" onClick={() => onRequestDelete(student.id)} aria-label={`Xóa sinh viên ${student.name}, MSSV ${student.id}`}>Xóa</button>
      </td>
    </tr>
  );
}
