import { useRef, useState } from 'react';
import classes from '../data/classes.json' with { type: 'json' };
import majors from '../data/majors.json' with { type: 'json' };

const EMPTY_FORM = { name: '', email: '', className: '' };

export default function AddStudentForm({ onAdd }) {
  // State form chỉ lưu dữ liệu đang nhập, không lưu một bản sao danh sách.
  const [values, setValues] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const panelRef = useRef(null);

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

  return (
    <section ref={panelRef} id="create-student" className="panel create-panel" popover="auto" role="dialog" aria-labelledby="create-title">
      <div className="form-heading">
        <div><span className="form-symbol" aria-hidden="true">+</span><h2 id="create-title">Thêm sinh viên</h2><p>Điền thông tin để tạo hồ sơ mới.</p></div>
        <button className="form-close native-popover-control" type="button" popoverTarget="create-student" popoverTargetAction="hide" aria-label="Đóng biểu mẫu thêm sinh viên">×</button>
        <a className="form-close popover-fallback-control" href="#roster-title" aria-label="Trở lại hồ sơ sinh viên">×</a>
      </div>
      <form className="create-form" onSubmit={handleSubmit} noValidate>
        <p className="required-note">Các trường có <span aria-hidden="true">*</span> đều bắt buộc.</p>
        <p className="auto-id-note">MSSV được tự động cấp theo khóa tuyển sinh; ngành học được xác định từ lớp sinh hoạt.</p>
        {error && <p className="notice notice-error" role="alert">{error}</p>}
        <div className="form-field">
          <label htmlFor="name">Họ và tên <span aria-hidden="true">*</span></label>
          <input id="name" name="name" type="text" value={values.name} onChange={handleChange} maxLength={100} required autoComplete="name" autoFocus placeholder="Ví dụ: Nguyễn Minh Anh" />
        </div>
        <div className="form-field">
          <label htmlFor="email">Email <span aria-hidden="true">*</span></label>
          <input id="email" name="email" type="email" value={values.email} onChange={handleChange} maxLength={254} required autoComplete="email" spellCheck={false} placeholder="sinhvien@example.com" />
        </div>
        <div className="form-field class-selection">
          <label htmlFor="className">Lớp sinh hoạt <span aria-hidden="true">*</span></label>
          <select id="className" name="className" value={values.className} onChange={handleChange} required aria-describedby="className-hint">
            <option value="">Chọn lớp sinh hoạt</option>
            {majors.map((major) => (
              <optgroup key={major.code} label={major.name}>
                {classes.filter((item) => item.majorCode === major.code).map((item) => (
                  <option key={item.code} value={item.code}>{item.name} — {major.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <p id="className-hint" className="field-hint">Lớp sinh hoạt là lớp quản lý hành chính, không phải lớp học phần.</p>
        </div>
        <div className="create-actions">
          <button className="cancel-button native-popover-control" type="button" popoverTarget="create-student" popoverTargetAction="hide">Hủy</button>
          <a className="cancel-button popover-fallback-control" href="#roster-title">Hủy</a>
          <button className="submit-button" type="submit"><span aria-hidden="true">+</span> Thêm sinh viên</button>
        </div>
        <p className="form-footnote">Email phải khác với các hồ sơ đã có.</p>
      </form>
    </section>
  );
}
