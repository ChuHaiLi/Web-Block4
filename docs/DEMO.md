# Kịch bản demo khoảng 10 phút

JSON Persistence/Delete là mở rộng theo quyết định nhóm. Bốn tiêu chí Add CSR trong PDF vẫn là trọng tâm.

Trước demo: cài dependency, chạy backend + Vite hoặc build + npm start; kiểm tra API. Nếu cần bắt đầu đúng 40 hồ sơ, dùng file test mới theo JSON_PERSISTENCE.md, không reset runtime thật. Chọn email demo chưa tồn tại.

| Phút | Thao tác và lời giải thích |
|---|---|
| 0–1 | Mở trang. Giải thích HTML shell → JS → Fetch JSON → React State → UI. Chỉ API storage là mở rộng. |
| 1–2 | F12 Network, bật Keep log/Preserve log, lọc Doc. Reload một lần để có baseline, chờ GET xong. Ghi số document; từ đây chưa F5. |
| 2–4 | Mở popup, nhập tên/email/lớp. Giải thích controlled inputs và preventDefault. Submit, chỉ hồ sơ mới/tổng số; mở lại form thấy ba trường rỗng. |
| 4–5 | So Doc trước/sau: không tăng. Chuyển Fetch/XHR thấy POST 201 JSON; request API được phép trong CSR. |
| 5–6 | F5 chủ động: document mới do F5 là bình thường. Hồ sơ vừa thêm vẫn còn vì GET đọc JSON đã lưu. Có thể xem runtime trong editor, chỉ đọc. |
| 6–7 | Chỉ App.jsx: students useState, setStudents spread; Form onAdd callback; List.map/Row props. JSON là storage, App là React owner duy nhất. |
| 7–8 | Xóa hồ sơ demo: mở dialog chưa xóa, Hủy thử; mở lại xác nhận, dòng biến mất. Đo Doc riêng trước/sau Delete; F5 sau đo, dòng không trở lại. |
| 8–9 | So Block3 POST→303→GET→EJS HTML với Block4 Fetch JSON→setStudents→React render. Express có mặt không đồng nghĩa SSR. |
| 9–10 | Mở sơ đồ/bằng chứng. Nêu API lỗi giữ form/list, queue và counter. Trả lời câu hỏi, nhóm tự nộp artifact theo PDF. |

Muốn chứng minh restart: dừng đúng backend bằng Ctrl+C, chạy lại cùng cấu hình file, F5 xác minh. Không đổi STUDENT_DATA_FILE giữa hai lần. Có thể thay một phút đọc code bằng thao tác này.

Câu hỏi luyện tập:
- State nào render bảng? App.students.
- Input do ai giữ? AddStudentForm.values.
- Vì sao state đổi? Callback App await API rồi setStudents tạo array mới.
- Vì sao không reload? preventDefault + Fetch, không form navigation.
- Vì sao F5 giữ hồ sơ? React tải lại JSON runtime, không phải state còn trong RAM.
- Vì sao không reset khi lỗi file? Bảo toàn dữ liệu lỗi để sửa/khôi phục có kiểm soát.
