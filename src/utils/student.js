import classes from '../data/classes.json' with { type: 'json' };

// Metadata cấp mã theo khóa, không phải bản sao danh sách sinh viên.
export function getSequenceCounters(students) {
  return students.reduce((counters, student) => {
    const prefix = student.id.slice(0, 3);
    counters[prefix] = Math.max(counters[prefix] || 0, Number(student.id.slice(3)));
    return counters;
  }, {});
}

// Hàm thuần: chỉ đọc danh sách, trả hồ sơ mới hoặc lỗi; không mutate state.
export function createStudent(values, students, issuedCounters = {}) {
  const name = values.name.trim().normalize('NFC').replace(/\s+/gu, ' ');
  const email = values.email.trim();
  const selectedClass = classes.find((item) => item.code === values.className);

  if (!name || name.length > 100) {
    return { error: 'Họ và tên phải có từ 1 đến 100 ký tự.' };
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Vui lòng nhập email hợp lệ, ví dụ: sinhvien@example.com.' };
  }
  if (!selectedClass) return { error: 'Vui lòng chọn lớp sinh hoạt.' };
  if (students.some((student) => student.email.toLowerCase() === email.toLowerCase())) {
    return { error: 'Email này đã được sử dụng. Vui lòng nhập email khác.' };
  }

  // Cấp MSSV trong phiên hiện tại, theo khóa của lớp; giữ số 0 ở đầu.
  // Bộ đếm trong App giữ MSSV đã cấp ngay cả khi xóa; reload khởi tạo lại từ seed.
  const prefix = '0' + selectedClass.cohort;
  const maxSequence = students.reduce((maximum, student) =>
    student.id.startsWith(prefix)
      ? Math.max(maximum, Number(student.id.slice(3))) : maximum, issuedCounters[prefix] || 0);
  if (maxSequence >= 99999) return { error: 'Khóa này đã hết phạm vi cấp MSSV.' };

  return {
    student: {
      id: prefix + String(maxSequence + 1).padStart(5, '0'),
      name, email, className: selectedClass.code, major: selectedClass.majorCode,
    },
  };
}
