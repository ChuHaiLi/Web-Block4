# TASK: XÂY DỰNG STUDENT MANAGEMENT CSR BẰNG REACT – BLOCK 4

## 1. Bối cảnh dự án

Tôi đang thực hiện bài tập môn Phát triển ứng dụng Web.

Ở bài tập trước, nhóm tôi đã hoàn thành ứng dụng Student Management sử dụng Server-Side Rendering (SSR) với Express + EJS.

Bài tập hiện tại yêu cầu xây dựng phiên bản Student Management sử dụng Client-Side Rendering (CSR), tập trung vào React, component, props, state và event.

Workspace hiện tại:

`D:\VSCode\HCMUS\Web`

Cấu trúc thư mục:

- `Block1_2/`: Dự án cũ khác.
- `Block3/`: Dự án Student Management SSR đã hoàn thành.
- `Block4/`: Thư mục triển khai dự án Student Management CSR mới, đồng thời chứa file PDF bài tập.

## 2. Lưu ý đặc biệt về tên Block trong PDF

Trong PDF, giảng viên sử dụng tên "Block 1" để tham chiếu đến dự án Student Management SSR trước đó.

Tuy nhiên, dự án Student Management SSR thực tế của tôi nằm trong thư mục `Block3`.

**Quy tắc ánh xạ bắt buộc:**

- "Block 1" trong PDF, khi đề cập đến Student Management SSR trước đó, phải được hiểu là `Block3` trong workspace.
- "Seed data giống hệt Block 1" nghĩa là sử dụng seed data từ `Block3`.
- "So sánh với POST form ở Block 1" nghĩa là so sánh với cơ chế submit form SSR trong `Block3`.
- Không sử dụng `Block1_2` để lấy source hoặc seed data cho bài CSR này.

Đây chỉ là sự khác biệt về cách đặt tên, không phải thay đổi nội dung yêu cầu kỹ thuật.

Không chỉnh sửa PDF gốc.

## 3. Đọc tài liệu và phân tích dự án

Trước khi triển khai, hãy:

1. Đọc toàn bộ file Block4/Block4_CSR_Assignment.pdf và sử dụng nó làm tài liệu yêu cầu chính thức của dự án.
2. Xác định toàn bộ yêu cầu chức năng, điều kiện ban đầu, tiêu chí nghiệm thu và bằng chứng cần nộp.
3. Đọc và phân tích toàn bộ source code liên quan trong `Block3`.
4. Xác định cách Express + EJS đang render Student List.
5. Tìm và phân tích seed data sinh viên đang sử dụng.
6. Phân tích UI, CSS, form, các chức năng và cấu trúc của Student Management SSR.
7. Phân loại những phần có thể tái sử dụng và những phần cần chuyển đổi sang React.
8. Đối chiếu yêu cầu PDF với kiến trúc CSR dự kiến.

**PDF là nguồn yêu cầu chính thức.** Nếu có mâu thuẫn giữa prompt này và PDF về chức năng hoặc nghiệm thu, ưu tiên PDF, ngoại trừ quy tắc ánh xạ tên Block đã giải thích.

## 4. Mục tiêu sản phẩm

Xây dựng một dự án Student Management CSR mới bên trong `Block4` với các đặc điểm:

- Sử dụng React để tạo và cập nhật giao diện.
- Có giao diện và phong cách thiết kế tương tự Student Management SSR của `Block3`.
- Tái sử dụng CSS và tài nguyên thích hợp từ dự án cũ.
- Giữ nguyên seed data sinh viên từ `Block3`.
- Danh sách sinh viên được quản lý bằng React State.
- Cho phép thêm sinh viên mà không reload toàn trang.
- Không sử dụng backend API hoặc database cho chức năng thêm sinh viên trong bài này.
- Đảm bảo code dễ đọc, dễ hiểu, phù hợp với sinh viên đang học React cơ bản.

Có thể sử dụng React + Vite nếu phù hợp.

Không sao chép nguyên xi toàn bộ backend SSR vào dự án mới.

## 5. Yêu cầu chức năng bắt buộc

Theo PDF bài tập:

### 5.1. Render Student List từ State

- Danh sách sinh viên phải lấy từ React State.
- State được khởi tạo từ seed data của `Block3`.
- Mỗi sinh viên phải có tối thiểu `id`, `name`, `email`.
- Sử dụng React để render các dòng sinh viên.

### 5.2. Form Add Student

- Có form nhập thông tin sinh viên mới.
- Sử dụng Controlled Inputs.
- Input được liên kết với React State.
- Sử dụng event handler để xử lý submit.
- Sử dụng `event.preventDefault()` để ngăn submit mặc định làm reload trang.

### 5.3. Cập nhật danh sách

Sau khi submit thành công:

- Sinh viên mới xuất hiện ngay lập tức.
- Danh sách được cập nhật bằng React State.
- Không reload toàn trang.
- Không cần gửi request lên server để tạo lại HTML.
- Form được reset về trạng thái ban đầu.

### 5.4. State Management

- Chỉ có một nguồn state chính thức cho danh sách sinh viên.
- Component sở hữu state phải được xác định rõ.
- Truyền dữ liệu xuống component con bằng props.
- Truyền callback phù hợp để component con yêu cầu cập nhật state.
- Không mutate trực tiếp state array.
- Sử dụng immutable update, ví dụ tạo mảng mới bằng spread syntax.

## 6. Kiến trúc React

Tách giao diện thành các component phù hợp, ví dụ:

- `App` hoặc `StudentPage`: Quản lý state danh sách sinh viên.
- `StudentList`: Hiển thị danh sách.
- `StudentRow`: Hiển thị từng sinh viên.
- `AddStudentForm`: Quản lý giao diện nhập thông tin và gửi sự kiện thêm sinh viên.

Có thể điều chỉnh tên và cấu trúc component nếu có phương án tốt hơn.

Yêu cầu:

- State ownership rõ ràng.
- Props truyền đúng hướng.
- Event flow dễ giải thích.
- Không gom toàn bộ code vào một component lớn.
- Không sử dụng giải pháp state management phức tạp nếu không cần thiết.

## 7. Kế thừa giao diện Block3

Hãy ưu tiên giữ lại:

- Bố cục tổng thể.
- Bảng danh sách sinh viên.
- Phong cách màu sắc.
- Typography và spacing.
- Form nhập sinh viên.
- CSS hoặc tài nguyên phù hợp.

Tuy nhiên, chỉ kế thừa những thành phần liên quan đến yêu cầu CSR trong PDF.

Không bắt buộc chuyển tất cả chức năng của Block3 sang Block4.

Nếu Block3 có thêm các chức năng vượt ngoài phạm vi PDF, hãy đánh giá và chỉ giữ lại khi thực sự cần thiết.

Mục tiêu là tạo cảm giác đây là phiên bản CSR kế tiếp của cùng một ứng dụng Student Management.

## 8. Kiểm thử và tiêu chí nghiệm thu

Phải kiểm tra các tiêu chí chính thức trong PDF:

1. Student mới xuất hiện ngay sau submit.
2. Network không xuất hiện document request mới do submit.
3. Form được reset sau khi thêm.
4. Mã nguồn chỉ có một nguồn state cho danh sách.

Đồng thời kiểm tra:

- Seed data hiển thị đúng.
- Dữ liệu có đầy đủ `id`, `name`, `email`.
- Controlled inputs hoạt động chính xác.
- Form submit không reload trang.
- Danh sách cập nhật đúng thứ tự.
- Không xuất hiện lỗi JavaScript nghiêm trọng.
- Dự án chạy và build thành công.

Có thể bổ sung kiểm tra đầu vào đơn giản nếu cần để chương trình hoạt động ổn định, nhưng không mở rộng bài tập quá mức.

Phải phân biệt rõ các kiểm tra đã chạy thực tế, kiểm tra chưa thực hiện và kiểm tra cần người dùng thao tác thủ công.

Không tuyên bố PASS nếu chưa có kết quả xác minh.

## 9. Bằng chứng bắt buộc theo PDF

Chuẩn bị đầy đủ bốn loại bằng chứng:

### Evidence 1: Component Diagram & State Owner

Tạo sơ đồ thể hiện:

- Các React component.
- Quan hệ cha – con.
- Component sở hữu state `students`.
- Luồng truyền props.
- Luồng callback khi thêm sinh viên.

Có thể sử dụng Mermaid trong tài liệu Markdown.

### Evidence 2: Recording Add Student

Cần video quay màn hình chứng minh:

- Truy cập trang Student Management.
- Nhập thông tin sinh viên.
- Submit form.
- Sinh viên mới xuất hiện.
- Form được reset.
- Trang không reload.

Nếu không thể quay màn hình thực tế, hãy cung cấp hướng dẫn quay chi tiết. Không tạo recording giả.

### Evidence 3: Network Before & After Submit

Cần chứng minh bằng Chrome DevTools:

- Mở Network.
- Lọc request theo `Doc`.
- Ghi nhận trạng thái trước submit.
- Submit thêm sinh viên.
- Chứng minh không xuất hiện document request mới do thao tác submit.

Không yêu cầu Network hoàn toàn không có request; tiêu chí chính là không phát sinh document navigation mới.

Nếu có công cụ kiểm thử trình duyệt thực tế, hãy sử dụng để thu thập bằng chứng xác thực.

Nếu không, hãy ghi rõ phần này cần tôi tự thực hiện.

### Evidence 4: Agent-Generated Code Explanation

Chọn một đoạn code quan trọng do agent tạo ra, ví dụ:

- Khởi tạo state bằng `useState`.
- Hàm `addStudent`.
- Immutable state update.
- Controlled inputs.
- Xử lý submit bằng `preventDefault`.

Giải thích bằng tiếng Việt:

- Đoạn code có nhiệm vụ gì?
- Cách hoạt động từng bước?
- State thay đổi như thế nào?
- Vì sao UI được cập nhật?
- Vì sao trang không reload?

Phần giải thích phải dễ hiểu để nhóm có thể tự trình bày trước giảng viên.

## 10. Tài liệu kỹ thuật và hướng dẫn demo

Chuẩn bị README và tài liệu cần thiết để nhóm có thể giải thích:

- Sự khác biệt giữa SSR và CSR.
- HTML shell → JavaScript → UI.
- Component, props, state và event.
- State owner của danh sách.
- Luồng dữ liệu khi thêm sinh viên.
- Tại sao React cập nhật UI mà không reload.
- Cách quan sát state bằng log hoặc React DevTools.
- Cách kiểm tra request trong Network.

Đồng thời chuẩn bị kịch bản demo khoảng 10 phút theo PDF:

1. Mở Network với bộ lọc Doc.
2. Thêm một Student mới.
3. Chỉ ra component giữ state.
4. So sánh với cơ chế POST form SSR trong Block3.

Không cần tạo bài thuyết trình PowerPoint trừ khi PDF thực sự yêu cầu.

## 11. Ràng buộc an toàn

- Chỉ tạo, sửa và xóa file dự án mới trong `Block4`.
- Tuyệt đối không chỉnh sửa source `Block3`.
- Không chỉnh sửa `Block1_2`.
- Không làm thay đổi Git history hoặc branch của các dự án cũ.
- Không tự động push lên GitHub.
- Không xóa file PDF gốc.
- Không tự ý thay đổi cấu trúc các dự án bên ngoài `Block4`.
- Không sử dụng backend API hay database khi PDF không yêu cầu.
- Không thêm chức năng phức tạp ngoài phạm vi.
- Không tạo bằng chứng nghiệm thu giả.
- Không tạo báo cáo khẳng định kết quả kiểm thử chưa được xác minh.

Nếu cần chạy lệnh cài đặt dependency hoặc build dự án, hãy thực hiện trong đúng thư mục `Block4`.

## 12. Quy trình triển khai

Thực hiện theo trình tự:

**Giai đoạn 1 – Phân tích**
- Đọc PDF và Block3.
- Đối chiếu yêu cầu.
- Xác định seed data, giao diện và kiến trúc.

**Giai đoạn 2 – Xây dựng**
- Khởi tạo dự án React.
- Tạo cấu trúc component.
- Kế thừa giao diện phù hợp.
- Triển khai Student List và Add Student.
- Kết nối props, state và event.

**Giai đoạn 3 – Kiểm thử**
- Cài đặt dependencies.
- Chạy dự án.
- Build và kiểm tra lỗi.
- Kiểm tra chức năng.
- Xác minh những tiêu chí nghiệm thu có thể kiểm tra.

**Giai đoạn 4 – Tài liệu và bằng chứng**
- Tạo sơ đồ component.
- Chuẩn bị tài liệu giải thích code.
- Chuẩn bị hướng dẫn recording và Network evidence.
- Chuẩn bị kịch bản demo.

**Giai đoạn 5 – Đánh giá**
- Đối chiếu từng yêu cầu PDF.
- Chỉ rõ tiêu chí PASS/FAIL/NOT VERIFIED.
- Xác nhận Block3 và Block1_2 không bị thay đổi.

## 13. Kết quả cần báo cáo

Sau khi hoàn thành, trả lời bằng tiếng Việt với các nội dung:

1. Cấu trúc thư mục Block4.
2. Những gì đã kế thừa từ Block3.
3. Những gì đã chuyển đổi từ SSR sang CSR.
4. Danh sách React component và vai trò.
5. Hướng dẫn chạy dự án trên Windows.
6. Kết quả build và kiểm thử.
7. Bảng đối chiếu toàn bộ yêu cầu PDF.
8. Danh sách bằng chứng đã hoàn thành.
9. Danh sách bằng chứng tôi cần tự quay hoặc chụp.
10. Những vấn đề còn tồn tại, nếu có.

**Ưu tiên cao nhất:** Dự án phải đáp ứng đúng PDF, giữ sự nhất quán với giao diện Block3, không ảnh hưởng dự án cũ và đủ điều kiện nghiệm thu của giảng viên.

Hãy bắt đầu bằng việc đọc PDF và phân tích Block3, sau đó triển khai trong Block4.