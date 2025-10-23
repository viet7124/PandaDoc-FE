# HƯỚNG DẪN TÍCH HỢP PAYOS - PANDADOCS MARKETPLACE

## 📋 MỤC LỤC
1. [Tổng quan](#tổng-quan)
2. [Cài đặt và cấu hình](#cài-đặt-và-cấu-hình)
3. [Luồng thanh toán User](#luồng-thanh-toán-user)
4. [Luồng thanh toán Seller](#luồng-thanh-toán-seller)
5. [API Endpoints](#api-endpoints)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 TỔNG QUAN

Hệ thống đã được tích hợp PayOS cho 2 luồng thanh toán:

### 1. **User mua Template** (PayOS Payment Gateway)
- User chọn template → Tạo order → PayOS tạo payment link
- User thanh toán qua PayOS → Webhook callback → Template thêm vào Library

### 2. **Admin trả tiền Seller** (Manual Payout Tracking)
- Seller upload template → Admin approve và nhập số tiền trả
- Tạo SellerPayout record (PENDING)
- Admin chuyển khoản thủ công → Mark PAID
- Seller xem earnings trong dashboard

---

## ⚙️ CÀI ĐẶT VÀ CẤU HÌNH

### Bước 1: Cập nhật application.properties

Mở file `src/main/resources/application.properties` và **thay thế** các giá trị sau bằng thông tin thực từ PayOS:

```properties
# PayOS API credentials (THAY ĐỔI GIÁ TRỊ NÀY)
payos.client-id=YOUR_ACTUAL_CLIENT_ID
payos.api-key=YOUR_ACTUAL_API_KEY
payos.checksum-key=YOUR_ACTUAL_CHECKSUM_KEY

# PayOS return URLs (Cập nhật URL frontend của bạn)
payos.return-url=http://localhost:3000/payment/success
payos.cancel-url=http://localhost:3000/payment/cancel

# PayOS webhook URL (Cần URL public cho production)
payos.webhook-url=https://your-domain.com/api/payments/payos-webhook
```

**Lấy PayOS Credentials:**
1. Đăng nhập vào [PayOS Dashboard](https://my.payos.vn)
2. Vào **Settings** → **API Keys**
3. Copy **Client ID**, **API Key**, và **Checksum Key**

### Bước 2: Cấu hình Webhook (Quan trọng!)

Để nhận callback từ PayOS khi thanh toán thành công:

#### Development (Local Testing):
1. Cài đặt **ngrok**:
   ```bash
   ngrok http 8081
   ```
2. Copy URL ngrok (ví dụ: `https://abc123.ngrok.io`)
3. Cập nhật `payos.webhook-url`:
   ```properties
   payos.webhook-url=https://abc123.ngrok.io/api/payments/payos-webhook
   ```

#### Production:
```properties
payos.webhook-url=https://your-production-domain.com/api/payments/payos-webhook
```

### Bước 3: Chạy ứng dụng

```bash
mvn spring-boot:run
```

Kiểm tra console có log:
```
✅ PayOS configuration loaded successfully
✅ Webhook endpoint: /api/payments/payos-webhook
```

---

## 💳 LUỒNG THANH TOÁN USER

### Flow chi tiết:

```
┌─────────┐      ┌──────────┐      ┌─────────┐      ┌──────────┐
│ User    │─────▶│ Backend  │─────▶│ PayOS   │─────▶│ User     │
│ Frontend│◀─────│ API      │◀─────│ API     │      │ Payment  │
└─────────┘      └──────────┘      └─────────┘      └──────────┘
    │                 │                  │                │
    │  1. POST        │                  │                │
    │  /purchases     │                  │                │
    ├────────────────▶│                  │                │
    │                 │  2. Create       │                │
    │                 │  Payment Link    │                │
    │                 ├─────────────────▶│                │
    │                 │                  │                │
    │  3. Return      │◀─────────────────┤                │
    │  paymentUrl     │                  │                │
    │◀────────────────┤                  │                │
    │                 │                  │  4. User pays  │
    │  5. Redirect    │                  │◀───────────────┤
    │  to PayOS       │                  │                │
    ├─────────────────┼──────────────────┼───────────────▶│
    │                 │                  │                │
    │                 │  6. Webhook      │                │
    │                 │  (Payment OK)    │                │
    │                 │◀─────────────────┤                │
    │                 │  7. Add to       │                │
    │                 │  Library         │                │
    │  8. Redirect    │                  │                │
    │  to success     │                  │                │
    │◀────────────────┼──────────────────┘                │
```

### Frontend Implementation:

**1. Gọi API mua template:**

```javascript
// POST /api/purchases
const response = await fetch('http://localhost:8081/api/purchases', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}`
  },
  body: JSON.stringify({
    templateId: 123
  })
});

const data = await response.json();
// Response:
// {
//   "orderId": 456,
//   "paymentUrl": "https://pay.payos.vn/web/abc123...",
//   "message": "Vui lòng thanh toán để hoàn tất mua template"
// }
```

**2. Redirect user đến PayOS:**

```javascript
if (data.paymentUrl) {
  // Redirect user đến trang thanh toán PayOS
  window.location.href = data.paymentUrl;
}
```

**3. Tạo success page để handle redirect:**

```javascript
// /payment/success page
const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get('orderCode'); // PayOS trả orderCode về

// Complete payment (add template to library)
const completeResponse = await fetch(`http://localhost:8081/api/payments/complete/${orderId}`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`
  }
});

const result = await completeResponse.json();

if (result.success) {
  showSuccess('Thanh toán thành công! Template đã được thêm vào thư viện.');
  redirectTo('/library');
} else {
  showError('Có lỗi xảy ra: ' + result.message);
}
```

**Lưu ý về Webhook:**
- PayOS không cho phép config webhook URL trực tiếp trên dashboard
- Thay vào đó, dùng endpoint `/complete` để frontend complete payment sau khi user quay về
- Endpoint này sẽ:
  - ✅ Update order status → PAID
  - ✅ Add template vào Library
  - ✅ Create notification cho user

---

## 💰 LUỒNG THANH TOÁN SELLER

### Flow chi tiết:

```
1. Seller đăng ký và upload template với thông tin bank
   POST /api/sellers/register
   Body: {
     "businessName": "...",
     "description": "...",
     "portfolioUrl": "...",
     "bankName": "Vietcombank",
     "bankAccountNumber": "1234567890",
     "bankAccountHolderName": "NGUYEN VAN A"
   }

2. Admin xem template pending
   GET /api/admin/templates/pending

3. Admin approve template và tạo payout
   POST /api/admin/payouts/template/{templateId}
   Body: {
     "agreedPrice": 80000,
     "adminNote": "Template chất lượng cao"
   }

4. Admin chuyển khoản thủ công qua banking app

5. Admin xem danh sách payout cần trả
   GET /api/admin/payouts/pending
   Response: [
     {
       "id": 1,
       "templateTitle": "Template ABC",
       "sellerUsername": "seller123",
       "bankName": "Vietcombank",
       "bankAccountNumber": "1234567890",
       "bankAccountHolderName": "NGUYEN VAN A",
       "agreedPrice": 80000,
       "status": "PENDING"
     }
   ]



6. Admin mark payout đã trả
   PUT /api/admin/payouts/{payoutId}/mark-paid

7. Seller xem earnings
   GET /api/sellers/dashboard
   Response: {
     "totalEarnings": 80000,
     ...
   }
```

### Frontend - Seller Registration Form:

```javascript
// Thêm fields bank vào form đăng ký seller
const registerSeller = async (formData) => {
  const response = await fetch('http://localhost:8081/api/sellers/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    },
    body: JSON.stringify({
      businessName: formData.businessName,
      description: formData.description,
      portfolioUrl: formData.portfolioUrl,
      // Thông tin ngân hàng MỚI
      bankName: formData.bankName,
      bankAccountNumber: formData.bankAccountNumber,
      bankAccountHolderName: formData.bankAccountHolderName
    })
  });
};
```

### Frontend - Admin Payout Management:

```javascript
// Lấy danh sách pending payouts
const getPendingPayouts = async () => {
  const response = await fetch('http://localhost:8081/api/admin/payouts/pending', {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
  const payouts = await response.json();

  // Hiển thị table với thông tin bank để admin chuyển tiền
  // ...
};

// Mark payout đã trả
const markAsPaid = async (payoutId) => {
  await fetch(`http://localhost:8081/api/admin/payouts/${payoutId}/mark-paid`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });

  alert('Đã đánh dấu payout đã thanh toán!');
};
```

---

## 📡 API ENDPOINTS

### User Payment Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/purchases` | USER | Tạo order và nhận payment link |
| POST | `/api/payments/complete/{orderId}` | USER | **Complete payment & add template to library** |
| GET | `/api/payments/verify/{orderId}` | USER | Query payment status (read-only) |
| POST | `/api/payments/cancel/{orderId}` | USER | Hủy thanh toán |
| POST | `/api/payments/payos-webhook` | PUBLIC | Webhook callback từ PayOS (không dùng) |

### Admin Payout Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/payouts/pending` | ADMIN | Danh sách payout chờ thanh toán |
| GET | `/api/admin/payouts/history` | ADMIN | Lịch sử tất cả payouts |
| POST | `/api/admin/payouts/template/{templateId}` | ADMIN | Tạo payout khi approve template |
| PUT | `/api/admin/payouts/{payoutId}/mark-paid` | ADMIN | Đánh dấu đã chuyển tiền |
| GET | `/api/admin/payouts/{payoutId}` | ADMIN | Chi tiết một payout |

### Seller Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/sellers/dashboard` | SELLER | Dashboard với earnings thực tế |
| GET | `/api/sellers/payouts` | SELLER | Lịch sử nhận tiền |

---

## 🧪 TESTING

### Test 1: User Purchase Flow

```bash
# 1. Login as user
curl -X POST http://localhost:8081/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","password":"123456"}'

# 2. Create purchase (nhận payment URL)
curl -X POST http://localhost:8081/api/purchases \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"templateId":1}'

# Response:
# {
#   "orderId": 123,
#   "paymentUrl": "https://pay.payos.vn/...",
#   "message": "Vui lòng thanh toán..."
# }

# 3. Open paymentUrl trong browser và test thanh toán trên PayOS

# 4. Sau khi thanh toán xong, complete payment
curl -X POST http://localhost:8081/api/payments/complete/123 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response:
# {
#   "success": true,
#   "message": "Payment completed successfully",
#   "orderId": 123,
#   "paymentStatus": "PAID"
# }

# 5. Check template đã vào Library chưa
curl -X GET http://localhost:8081/api/users/me/library \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 2: Seller Payout Flow

```bash
# 1. Admin tạo payout
curl -X POST http://localhost:8081/api/admin/payouts/template/1 \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"agreedPrice":80000,"adminNote":"Good template"}'

# 2. Admin xem pending payouts
curl -X GET http://localhost:8081/api/admin/payouts/pending \
  -H "Authorization: Bearer ADMIN_TOKEN"

# 3. Admin mark paid
curl -X PUT http://localhost:8081/api/admin/payouts/1/mark-paid \
  -H "Authorization: Bearer ADMIN_TOKEN"

# 4. Seller check dashboard
curl -X GET http://localhost:8081/api/sellers/dashboard \
  -H "Authorization: Bearer SELLER_TOKEN"
```

---

## 🔍 TROUBLESHOOTING

### Lỗi thường gặp:

#### 1. "Failed to create payment link"
**Nguyên nhân:**
- PayOS credentials không đúng
- PayOS API endpoint không available

**Giải quyết:**
- Kiểm tra lại `client-id`, `api-key`, `checksum-key` trong application.properties
- Test PayOS API bằng Postman

#### 2. "Webhook not received"
**Nguyên nhân:**
- Webhook URL không public (localhost)
- Firewall block incoming requests

**Giải quyết:**
- Dùng ngrok cho local development:
  ```bash
  ngrok http 8081
  ```
- Cập nhật webhook URL trong PayOS dashboard

#### 3. "Order already processed"
**Nguyên nhân:**
- PayOS gửi webhook nhiều lần (retry mechanism)

**Giải quyết:**
- Code đã handle idempotency, kiểm tra paymentStatus trước khi process

#### 4. "Payout for this template already exists"
**Nguyên nhân:**
- Admin đã tạo payout cho template này rồi

**Giải quyết:**
- Check payout history trước khi tạo mới

### Debug Tips:

**1. Bật logging:**
```properties
# application.properties
logging.level.com.pandadocs.api.service.PayOSService=DEBUG
logging.level.com.pandadocs.api.controller.PaymentController=DEBUG
```

**2. Xem logs:**
```bash
# Tìm logs liên quan đến PayOS
grep -i "payos" logs/spring.log
```

**3. Test webhook locally:**
```bash
# Giả lập PayOS webhook
curl -X POST http://localhost:8081/api/payments/payos-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "code":"00",
    "desc":"Success",
    "success":true,
    "data":{
      "orderCode":123,
      "amount":50000,
      "description":"Test payment"
    }
  }'
```

---

## 📚 TÀI LIỆU THAM KHẢO

- [PayOS Official Documentation](https://docs.payos.vn)
- [PayOS API Reference](https://api-docs.payos.vn)
- [PayOS Webhook Guide](https://docs.payos.vn/webhooks)

---

## 🎉 KẾT LUẬN

Hệ thống đã tích hợp đầy đủ:
✅ PayOS payment gateway cho user purchase
✅ Seller payout tracking system
✅ Admin manual payout management
✅ Real-time earnings calculation
✅ Webhook handling với idempotency

**Next Steps:**
1. Cập nhật PayOS credentials trong application.properties
2. Setup ngrok cho webhook testing
3. Test toàn bộ flow từ purchase đến payout
4. Deploy lên production với webhook URL thực

Chúc bạn tích hợp thành công! 🚀
