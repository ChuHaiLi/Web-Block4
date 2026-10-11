import { useRef, useState } from 'react';
import classes from '../data/classes.json' with { type: 'json' };
import majors from '../data/majors.json' with { type: 'json' };

const EMPTY_FORM = { name: '', email: '', className: '' };

export default function AddStudentForm({ onAdd }) {
  // State form chỉ lưu dữ liệu đang nhập, không lưu một bản sao danh sách.
  const [values, setValues] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const panelRef = useRef(null);
  const submittingRef = useRef(false);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault(); // Chặn document navigation ngay cả khi đang lưu.
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setError('');
    try {
      const message = await onAdd(values);
      if (message) {
        setError(message);
        return; // Giữ controlled inputs khi server/network từ chối.
      }
      setValues(EMPTY_FORM);
      if (typeof panelRef.current?.hidePopover === 'function' && panelRef.current.matches(':popover-open')) panelRef.current.hidePopover();
    } catch {
      setError('Không thể lưu sinh viên. Vui lòng thử lại.');
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <section ref={panelRef} id="create-student" className="panel create-panel" popover="auto" role="dialog" aria-labelledby="create-title">
      <div className="form-heading">
        <div><span className="form-symbol" aria-hidden="true">+</span><h2 id="create-title">Thêm sinh viên</h2><p>Điền thông tin để tạo hồ sơ mới.</p></div>
        <button disabled={submitting} className="form-close native-popover-control" type="button" popoverTarget="create-student" popoverTargetAction="hide" aria-label="Đóng biểu mẫu thêm sinh viên">×</button>
        <a aria-disabled={submitting} onClick={(event) => { if (submitting) event.preventDefault(); }} className="form-close popover-fallback-control" href="#roster-title" aria-label="Trở lại hồ sơ sinh viên">×</a>
      </div>
      <form aria-busy={submitting} className="create-form" onSubmit={handleSubmit} noValidate>
        <p className="required-note">Các trường có <span aria-hidden="true">*</span> đều bắt buộc.</p>
        <p className="auto-id-note">MSSV được tự động cấp theo khóa tuyển sinh; ngành học được xác định từ lớp sinh hoạt.</p>
        {error && <p className="notice notice-error" role="alert">{error}</p>}
        <div className="form-field">
          <label htmlFor="name">Họ và tên <span aria-hidden="true">*</span></label>
          <input disabled={submitting} id="name" name="name" type="text" value={values.name} onChange={handleChange} maxLength={100} required autoComplete="name" autoFocus placeholder="Ví dụ: Nguyễn Minh Anh" />
        </div>
        <div className="form-field">
          <label htmlFor="email">Email <span aria-hidden="true">*</span></label>
          <input disabled={submitting} id="email" name="email" type="email" value={values.email} onChange={handleChange} maxLength={254} required autoComplete="email" spellCheck={false} placeholder="sinhvien@example.com" />
        </div>
        <div className="form-field class-selection">
          <label htmlFor="className">Lớp sinh hoạt <span aria-hidden="true">*</span></label>
          <select disabled={submitting} id="className" name="className" value={values.className} onChange={handleChange} required aria-describedby="className-hint">
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
          <button disabled={submitting} className="cancel-button native-popover-control" type="button" popoverTarget="create-student" popoverTargetAction="hide">Hủy</button>
          <a aria-disabled={submitting} onClick={(event) => { if (submitting) event.preventDefault(); }} className="cancel-button popover-fallback-control" href="#roster-title">Hủy</a>
          <button disabled={submitting} className="submit-button" type="submit"><span aria-hidden="true">+</span> {submitting ? "Đang lưu…" : "Thêm sinh viên"}</button>
        </div>
        <p className="form-footnote">Email phải khác với các hồ sơ đã có.</p>
      </form>
    </section>
  );
}
