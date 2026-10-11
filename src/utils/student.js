import classes from '../data/classes.json' with { type: 'json' };

// Metadata cấp mã theo khóa; backend lưu cùng danh sách trong runtime JSON.
export function getSequenceCounters(students) {
  return students.reduce((counters, student) => {
    const prefix = student.id.slice(0, 3);
    counters[prefix] = Math.max(counters[prefix] || 0, Number(student.id.slice(3)));
    return counters;
  }, {});
}

// Dùng chung ở client và server; backend luôn validate lại với dữ liệu đã lưu.
export function validateStudentInput(input, students) {
  const fields = ['name', 'email', 'className'];
  if (!input || typeof input !== 'object' || Array.isArray(input) ||
      !fields.every((key) => typeof input[key] === 'string') ||
      Object.keys(input).some((key) => !fields.includes(key))) {
    return { status: 400, error: 'Chỉ nhập họ tên, email và lớp dưới dạng chuỗi; MSSV do server cấp.' };
  }
  const name = input.name.trim().normalize('NFC').replace(/\s+/gu, ' ');
  const email = input.email.trim();
  const selectedClass = classes.find((item) => item.code === input.className);
  if (!name || name.length > 100) return { error: 'Họ và tên phải có từ 1 đến 100 ký tự.' };
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Vui lòng nhập email hợp lệ, ví dụ: sinhvien@example.com.' };
  }
  if (!selectedClass) return { error: 'Vui lòng chọn lớp sinh hoạt.' };
  if (students.some((student) => student.email.toLowerCase() === email.toLowerCase())) {
    return { status: 409, error: 'Email này đã được sử dụng. Vui lòng nhập email khác.' };
  }
  return { values: { name, email, className: selectedClass.code, major: selectedClass.majorCode } };
}

// Hàm thuần: trả hồ sơ mới/lỗi, không mutate danh sách hoặc bộ đếm.
export function createStudent(input, students, issuedCounters = {}) {
  const result = validateStudentInput(input, students);
  if (result.error) return result;
  const selectedClass = classes.find((item) => item.code === result.values.className);
  const prefix = '0' + selectedClass.cohort;
  const maxSequence = students.reduce((maximum, student) =>
    student.id.startsWith(prefix)
      ? Math.max(maximum, Number(student.id.slice(3))) : maximum, issuedCounters[prefix] || 0);
  if (maxSequence >= 99999) return { error: 'Khóa này đã hết phạm vi cấp MSSV.' };
  return { student: { id: prefix + String(maxSequence + 1).padStart(5, '0'), ...result.values } };
}
