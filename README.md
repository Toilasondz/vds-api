# VDS License Manager — Vercel Deployment

## Tổng quan
Hệ thống quản lý License Key cho iOS Tweak / Tool, chạy 100% trên **Vercel** (không cần server).

## Tài khoản Admin
| Thông tin | Giá trị |
|---|---|
| **Username** | `hson` |
| **Password** | `Son2012@` |
| **URL Dashboard** | `https://vds-kohl.vercel.app/` |

## Key có sẵn (hoạt động ngay)
| Key | Gói | Hạn |
|---|---|---|
| `VDS-HSON-2026-VIP` | VIP | Vĩnh viễn (10 năm) |
| `VDS-FREE-TRIAL-001` | BASIC | 30 ngày |

## Cách deploy lên Vercel

### Bước 1: Cài Vercel CLI
```bash
npm install -g vercel
```

### Bước 2: Tạo Vercel KV (database)
1. Vào [vercel.com/dashboard](https://vercel.com/dashboard)
2. Chọn project → **Storage** → **Connect Database** → **KV**
3. Tạo database mới, copy environment variables

### Bước 3: Deploy
```bash
cd C:\Users\hson\.gemini\antigravity\scratch\vds-vercel
npm install
vercel --prod
```

### Bước 4: Set environment variables trên Vercel
Sau khi tạo KV store, Vercel sẽ tự thêm:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

> **Nếu không có KV**: App vẫn chạy bằng in-memory (data reset khi serverless restart). Dùng KV để data tồn tại lâu dài.

## API Endpoints

### Cho iPhone / Tweak
```
POST /api/verify
Body: { "key": "VDS-HSON-2026-VIP", "deviceID": "abc123" }

POST /api/sign-out  
Body: { "key": "...", "deviceID": "..." }
```

### Cho Admin Web (cần đăng nhập)
```
GET  /admin/api/keys           — Lấy danh sách key
POST /admin/api/create         — Tạo key mới
POST /admin/api/reset-device   — Gỡ thiết bị
POST /admin/api/toggle-status  — Khoá/Mở key
POST /admin/api/delete         — Xoá key
```

## Cấu trúc file
```
vds-vercel/
├── api/
│   ├── _auth.js   # Xác thực admin (hson / Son2012@)
│   ├── _db.js     # Database layer (KV + in-memory fallback)
│   ├── web.js     # Trang đăng nhập + Dashboard HTML
│   ├── admin.js   # Admin API (protected)
│   └── app.js     # Public API cho iPhone
├── vercel.json    # Routing config
├── package.json
└── README.md
```
