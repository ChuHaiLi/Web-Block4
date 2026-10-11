import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import seed from '../src/data/students.seed.json' with { type: 'json' };
import classes from '../src/data/classes.json' with { type: 'json' };
import { createStudent, getSequenceCounters } from '../src/utils/student.js';

export const projectRoot = fileURLToPath(new URL('../', import.meta.url));
export const defaultDataFile = path.join(projectRoot, 'data/students.json');

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Chỉ cấu hình khi chạy server/test; request API không được nhận đường dẫn file.
export function resolveDataFile(file = defaultDataFile) {
  const resolved = path.resolve(projectRoot, file);
  const relative = path.relative(projectRoot, resolved).replaceAll('\\', '/');
  if ((!relative.startsWith('data/') && !relative.startsWith('.tools/test-data/')) ||
      !relative.endsWith('.json') || relative.includes('../')) {
    throw new Error('Runtime JSON phải nằm trong Block4/data hoặc thư mục test riêng.');
  }
  return resolved;
}

function validateDocument(document) {
  if (!document || document.version !== 1 || !Array.isArray(document.students) ||
      !document.counters || typeof document.counters !== 'object' || Array.isArray(document.counters)) {
    throw new Error('Cấu trúc runtime JSON không hợp lệ; không tự reset.');
  }
  const ids = new Set();
  const emails = new Set();
  for (const student of document.students) {
    if (!student || !['id', 'name', 'email', 'className', 'major'].every((key) => typeof student[key] === 'string') ||
        !/^0[0-9]{7}$/.test(student.id) || !student.name.trim() || student.name.length > 100 ||
        student.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
      throw new Error('Hồ sơ trong runtime JSON không hợp lệ.');
    }
    const selectedClass = classes.find((item) => item.code === student.className);
    if (!selectedClass || selectedClass.majorCode !== student.major ||
        !student.id.startsWith('0' + selectedClass.cohort) ||
        ids.has(student.id) || emails.has(student.email.toLowerCase())) {
      throw new Error('Runtime có hồ sơ sai danh mục hoặc trùng ID/email.');
    }
    ids.add(student.id);
    emails.add(student.email.toLowerCase());
  }
  const maximums = getSequenceCounters(document.students);
  for (const prefix of new Set(classes.map((item) => '0' + item.cohort))) {
    const counter = document.counters[prefix];
    if (!Number.isInteger(counter) || counter < (maximums[prefix] || 0) || counter > 99999) {
      throw new Error('Bộ đếm MSSV không hợp lệ; không tự hạ bộ đếm.');
    }
  }
  return document;
}

export function createStudentStore({ file = defaultDataFile, fileSystem = fs } = {}) {
  const dataFile = resolveDataFile(file);
  let queue = Promise.resolve();

  function serialize(operation) {
    const result = queue.then(operation);
    queue = result.catch(() => {}); // Một lỗi không khóa các thao tác tiếp theo.
    return result;
  }

  async function read() {
    return validateDocument(JSON.parse(await fileSystem.readFile(dataFile, 'utf8')));
  }

  async function save(document, { firstCreation = false } = {}) {
    const temporary = dataFile + '.' + randomUUID() + '.tmp';
    try {
      await fileSystem.writeFile(temporary, JSON.stringify(document, null, 2) + '\n', {
        encoding: 'utf8', flag: 'wx', flush: true,
      });
      // Tạo lần đầu: link không ghi đè file đã có. Cập nhật: rename cùng thư mục.
      if (firstCreation) await fileSystem.link(temporary, dataFile);
      else await fileSystem.rename(temporary, dataFile);
    } finally {
      await fileSystem.unlink(temporary).catch(() => {});
    }
  }

  async function initialize() {
    await fileSystem.mkdir(path.dirname(dataFile), { recursive: true });
    try {
      await read(); // Có runtime thì chỉ đọc/validate; không ghi lại seed.
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      const initial = validateDocument({
        version: 1, students: seed.map((student) => ({ ...student })), counters: getSequenceCounters(seed),
      });
      try { await save(initial, { firstCreation: true }); }
      catch (creationError) {
        if (creationError.code !== 'EEXIST') throw creationError;
        await read(); // Tiến trình khác vừa tạo file: đọc dữ liệu đó, không overwrite.
      }
    }
  }

  const getAll = () => serialize(async () => (await read()).students);

  function add(values) {
    return serialize(async () => {
      const current = await read();
      const result = createStudent(values, current.students, current.counters);
      if (result.error) throw new ApiError(result.status || 400, result.error);
      const student = result.student;
      const next = {
        ...current,
        students: [...current.students, student],
        counters: { ...current.counters, [student.id.slice(0, 3)]: Number(student.id.slice(3)) },
      };
      await save(next); // Chỉ trả student sau khi ghi/rename thành công.
      return student;
    });
  }

  function remove(id) {
    return serialize(async () => {
      const current = await read();
      if (!/^0[0-9]{7}$/.test(id) || !current.students.some((student) => student.id === id)) {
        throw new ApiError(404, 'Sinh viên không tồn tại hoặc đã được xóa.');
      }
      await save({ ...current, students: current.students.filter((student) => student.id !== id) });
      return { id }; // Không giảm counter khi xóa.
    });
  }

  return { initialize, getAll, add, remove, dataFile };
}
