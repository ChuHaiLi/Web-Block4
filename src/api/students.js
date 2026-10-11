async function requestJson(url, options = {}) {
  let response;
  try {
    response = await fetch(url, { ...options, signal: options.signal ? AbortSignal.any([options.signal, AbortSignal.timeout(10000)]) : AbortSignal.timeout(10000) });
  } catch (error) {
    if (options.signal?.aborted) throw error;
    throw new Error('Không kết nối được backend hoặc request quá thời gian chờ. Vui lòng thử lại.');
  }
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Không thể lưu dữ liệu. Vui lòng thử lại.');
  return data;
}

export const loadStudents = (signal) => requestJson('/api/students', { signal });
export const saveStudent = (values) => requestJson('/api/students', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values),
});
export const removeStudent = (id) => requestJson('/api/students/' + encodeURIComponent(id), { method: 'DELETE' });
