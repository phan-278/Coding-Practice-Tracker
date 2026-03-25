📦 multiple-code-practice-tracking
┣ 📜 README.md                 <-- Hướng dẫn setup, chạy dự án cho Giảng viên/Team
┣ 📜 .gitignore                <-- Chặn đẩy file rác, file bảo mật (.env, node_modules) lên Github
┃
┣ 📂 frontend                  <-- 🌐 [DEPLOY: VERCEL / NETLIFY]
┃ ┣ 📂 assets
┃ ┃ ┣ 📂 css
┃ ┃ ┃ ┣ 📜 global.css          <-- Reset CSS, biến màu sắc, font chữ dùng chung
┃ ┃ ┃ ┣ 📜 auth.css            <-- CSS cho trang Login/Register
┃ ┃ ┃ ┗ 📜 dashboard.css       <-- CSS cho các trang trong App
┃ ┃ ┣ 📂 js
┃ ┃ ┃ ┣ 📂 auth
┃ ┃ ┃ ┃ ┣ 📜 login.js
┃ ┃ ┃ ┃ ┣ 📜 register.js
┃ ┃ ┃ ┃ ┗ 📜 authService.js    <-- Hàm xử lý lưu/xóa Token (localStorage/Cookies)
┃ ┃ ┃ ┣ 📂 services
┃ ┃ ┃ ┃ ┣ 📜 api.js            <-- Cấu hình chung cho Fetch/Axios (Base URL, tự động gắn Token)
┃ ┃ ┃ ┃ ┗ 📜 problemApi.js     <-- Gọi API lấy danh sách bài tập, submit code
┃ ┃ ┃ ┣ 📂 utils
┃ ┃ ┃ ┃ ┣ 📜 helpers.js        <-- Các hàm phụ trợ (VD: format ngày tháng, check validate email)
┃ ┃ ┃ ┃ ┗ 📜 constants.js      <-- Lưu các hằng số (VD: ENDPOINT_URL)
┃ ┃ ┃ ┗ 📜 global.js           <-- Chạy ở mọi trang (Check nếu chưa đăng nhập thì đuổi về Login)
┃ ┃ ┗ 📂 images
┃ ┣ 📂 pages
┃ ┃ ┣ 📂 auth
┃ ┃ ┃ ┣ 📜 login.html
┃ ┃ ┃ ┗ 📜 register.html
┃ ┃ ┣ 📂 app
┃ ┃ ┃ ┣ 📜 dashboard.html      <-- Trang thống kê tổng quan (Charts, Heatmap)
┃ ┃ ┃ ┣ 📜 problems.html       <-- Bảng danh sách bài tập (Có Filter theo Leetcode/Hackerrank)
┃ ┃ ┃ ┗ 📜 profile.html
┃ ┣ 📜 index.html              <-- Landing page (Trang chủ giới thiệu tính năng Web)
┃ ┣ 📜 package.json            <-- (Frontend) Quản lý thư viện Frontend (nếu dùng Vite/Tailwind)
┃ ┗ 📜 vite.config.js          <-- (Optional) Cấu hình tối ưu, nén code Frontend
┃
┣ 📂 backend                   <-- ⚙️ [DEPLOY: RENDER.COM / RAILWAY.APP]
┃ ┣ 📂 src
┃ ┃ ┣ 📂 config
┃ ┃ ┃ ┗ 📜 db.js               <-- File kết nối đến Supabase / PostgreSQL / MongoDB
┃ ┃ ┣ 📂 models                <-- Cấu trúc dữ liệu trả về/tương tác với DB (Mongoose/Prisma)
┃ ┃ ┃ ┣ 📜 userModel.js
┃ ┃ ┃ ┗ 📜 problemModel.js
┃ ┃ ┣ 📂 controllers           <-- Tiếp nhận Request từ Frontend và trả về Response (JSON)
┃ ┃ ┃ ┣ 📜 authController.js
┃ ┃ ┃ ┗ 📜 problemController.js
┃ ┃ ┣ 📂 services              <-- Nơi xử lý logic não bộ (Nghiệp vụ cốt lõi)
┃ ┃ ┃ ┣ 📜 authService.js      <-- Băm mật khẩu (Bcrypt), tạo Token (JWT)
┃ ┃ ┃ ┗ 📜 syncService.js      <-- Logic gọi API Codeforces hoặc cào dữ liệu Leetcode
┃ ┃ ┣ 📂 routes                <-- Phân luồng đường dẫn (VD: POST /api/v1/auth/login)
┃ ┃ ┃ ┣ 📜 authRoutes.js
┃ ┃ ┃ ┗ 📜 problemRoutes.js
┃ ┃ ┣ 📂 middleware            <-- Trạm kiểm tra an ninh (Bảo vệ API)
┃ ┃ ┃ ┣ 📜 authMiddleware.js   <-- Kiểm tra xem Request có mang Token hợp lệ không
┃ ┃ ┃ ┗ 📜 errorMiddleware.js  <-- (Bổ sung) Bắt mọi lỗi Backend để Server không bị sập (Crash)
┃ ┃ ┣ 📂 utils
┃ ┃ ┃ ┗ 📜 scraper.js          <-- (Bổ sung) Script dùng Puppeteer/Cheerio cào web nếu cần
┃ ┃ ┗ 📜 server.js             <-- Trái tim của Backend (Khởi tạo Express app, gắn Routes, chạy Port)
┃ ┣ 📜 package.json            <-- (Backend) Chứa Express, Mongoose, JsonWebToken, Bcrypt...
┃ ┣ 📜 .env                    <-- CHỨA KEY BẢO MẬT (DB_URL, JWT_SECRET) - Tuyệt đối không Push!
┃ ┗ 📜 .env.example            <-- (Bổ sung) Bản sao của .env (nhưng che đi key thật) để người khác biết cần biến gì
┃
┗ 📂 database                  <-- 🗄️ [TÀI LIỆU CƠ SỞ DỮ LIỆU]
  ┣ 📜 schema.sql              <-- Chứa lệnh tạo bảng (CREATE TABLE Users, Problems...)
  ┗ 📜 seed.sql                <-- (Bổ sung) Chứa lệnh tạo dữ liệu giả (INSERT INTO) để test web