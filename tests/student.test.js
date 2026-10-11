import test from 'node:test';
import assert from 'node:assert/strict';
import seed from '../src/data/students.seed.json' with { type: 'json' };
import { createStudent, getSequenceCounters } from '../src/utils/student.js';

const values = { name: '  Nguyễn   Minh Anh  ', email: 'new.student@example.com', className: '24C11' };

test('seed: 40 hồ sơ đầy đủ, ID và email duy nhất', () => {
  assert.equal(seed.length, 40);
  for (const student of seed) {
    for (const field of ['id', 'name', 'email', 'className', 'major']) assert.equal(typeof student[field], 'string');
    assert.match(student.id, /^0[0-9]{7}$/);
  }
  assert.equal(new Set(seed.map((student) => student.id)).size, 40);
  assert.equal(new Set(seed.map((student) => student.email.toLowerCase())).size, 40);
});

test('chuẩn hóa tên và dùng majorCode của lớp 24C11', () => {
  const { student } = createStudent(values, seed);
  assert.deepEqual(student, { id: '02410011', name: 'Nguyễn Minh Anh', email: 'new.student@example.com', className: '24C11', major: 'CNTT' });
});

test('cấp MSSV theo khóa, giữ số 0 ở đầu', () => {
  assert.equal(createStudent({ ...values, className: '25KHDL1' }, seed).student.id, '02500011');
  assert.equal(createStudent({ ...values, className: '26TOAN1' }, seed).student.id, '02600011');
});

test('không thay đổi seed, input hoặc hồ sơ cũ', () => {
  const students = Object.freeze(seed.map((student) => Object.freeze({ ...student })));
  const input = Object.freeze({ ...values });
  const previous = JSON.stringify(students);
  createStudent(input, students);
  assert.equal(JSON.stringify(students), previous);
  assert.equal(input.name, values.name);
});

test('từ chối tên trắng, email sai và lớp ngoài danh mục', () => {
  assert.ok(createStudent({ ...values, name: '   ' }, seed).error);
  assert.ok(createStudent({ ...values, email: 'email-sai' }, seed).error);
  assert.ok(createStudent({ ...values, className: 'unknown' }, seed).error);
});

test('từ chối email trùng kể cả khác hoa/thường và có khoảng trắng', () => {
  assert.ok(createStudent({ ...values, email: '  MINH.AN01@EXAMPLE.COM  ' }, seed).error);
});

test('chặn dữ liệu vượt độ dài', () => {
  assert.ok(createStudent({ ...values, name: 'A'.repeat(101) }, seed).error);
  assert.ok(createStudent({ ...values, email: 'a'.repeat(250) + '@example.com' }, seed).error);
});

test('hết mã một khóa không ảnh hưởng khóa khác', () => {
  const full = [...seed, { id: '02699999', name: 'Mẫu', email: 'last@example.com', className: '26TOAN1', major: 'TOAN' }];
  assert.ok(createStudent({ ...values, className: '26TOAN1' }, full).error);
  assert.equal(createStudent({ ...values, className: '25KHDL1' }, full).student.id, '02500011');
});


test('metadata chỉ giữ số thứ tự theo khóa, không mutate hồ sơ seed', () => {
  const frozen = Object.freeze(seed.map((student) => Object.freeze({ ...student })));
  assert.deepEqual(getSequenceCounters(frozen), { '024': 10010, '025': 10, '026': 10 });
  assert.deepEqual(getSequenceCounters([]), {});
});

test('xóa MSSV seed cao nhất vẫn không cấp lại mã đó trong phiên', () => {
  const counters = Object.freeze(getSequenceCounters(seed));
  const remaining = Object.freeze(seed.filter((student) => student.id !== '02410010'));
  assert.equal(createStudent(values, remaining, counters).student.id, '02410011');
  assert.equal(counters['024'], 10010);
});

test('xóa hết danh sách không làm mất bộ đếm và có thể dùng lại email', () => {
  const counters = Object.freeze({ '024': 10013, '025': 11, '026': 10 });
  assert.equal(createStudent({ ...values, email: seed[0].email }, [], counters).student.id, '02410014');
  assert.equal(createStudent({ ...values, className: '25KHDL1' }, [], counters).student.id, '02500012');
});

test('mã cuối đã xóa vẫn được coi là đã cấp; khóa khác tiếp tục thêm', () => {
  const counters = Object.freeze({ ...getSequenceCounters(seed), '026': 99999 });
  assert.ok(createStudent({ ...values, className: '26TOAN1' }, seed, counters).error);
  assert.equal(createStudent({ ...values, className: '25KHDL1' }, seed, counters).student.id, '02500011');
});
