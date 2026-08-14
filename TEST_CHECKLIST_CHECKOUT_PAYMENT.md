# Checklist test checkout, tồn kho và thanh toán

Tài liệu này dùng để kiểm thử các thay đổi bảo vệ checkout, tồn kho, MoMo và COD.

## Chuẩn bị

- Khởi động PostgreSQL, backend (`backend`) và frontend.
- Đăng nhập tối thiểu ba tài khoản: khách hàng A, khách hàng B và nhân viên/shipper có role `STAFF` hoặc `SHIPPER`.
- Tạo một variant `ACTIVE`, có inventory `quantity = 5`, `reserved_quantity = 0`.
- Dùng ID thật trong database cho `payment_method_id` và `shipping_method_id`; frontend demo hiện có một số ID minh hoạ, không thay thế cho UUID từ database.
- Với MoMo, cấu hình `MOMO_PARTNER_CODE`, `MOMO_ACCESS_KEY`, `MOMO_SECRET`, `MOMO_REDIRECT_URL` và một `MOMO_IPN_URL` HTTPS công khai.

## Cart và xác thực

| ID | Thao tác | Kết quả mong đợi |
| --- | --- | --- |
| CART-01 | Gọi `GET /api/carts/:userId` không có Bearer token | `401 Unauthorized`. |
| CART-02 | Khách A gọi cart của khách B | `403 Forbidden`; không đọc/sửa/xoá được cart của B. |
| CART-03 | Thêm 3 sản phẩm khi khả dụng là 5 | Thành công, nhưng `reserved_quantity` vẫn là 0. |
| CART-04 | Sửa số lượng cart từ 3 lên 6 | Bị từ chối `Insufficient stock available`; quantity trong cart không đổi. |
| CART-05 | Gửi quantity 0, âm, thập phân hoặc chuỗi | Bị từ chối; chỉ chấp nhận số nguyên dương. |

## Tạo đơn và giữ tồn

| ID | Thao tác | Kết quả mong đợi |
| --- | --- | --- |
| ORD-01 | Tạo đơn 2 sản phẩm | Order, group, item, payment `PENDING` cùng tồn tại; inventory thành `quantity=5`, `reserved_quantity=2`. |
| ORD-02 | Tạo đồng thời 2 đơn, mỗi đơn 3 sản phẩm với tồn khả dụng 5 | Chỉ một đơn thành công; đơn còn lại báo thiếu hàng. Không được oversell. |
| ORD-03 | Gửi `user_id` của khách B trong payload nhưng token là khách A | Order lưu `user_id` của khách A. |
| ORD-04 | Gửi `unit_price`, `subtotal`, `discount`, `shipping_fee`, `total_amount` giả | Giá item lấy từ variant; phí ship lấy từ `shipping_methods`; các tổng của client không được lưu. |
| ORD-05 | Đưa variant của shop X vào group khai shop Y | Bị từ chối. |
| ORD-06 | Variant không active, không có inventory hoặc số lượng vượt khả dụng | Toàn bộ transaction rollback; không tạo order/payment và không tăng reserve. |
| ORD-07 | Tạo đơn khi `shipping_method_id` không tồn tại/inactive | Bị từ chối; không có bản ghi dang dở. |
| ORD-08 | Khách B đọc danh sách/chi tiết order của A | Không nhận được dữ liệu của A. |

## MoMo

| ID | Thao tác | Kết quả mong đợi |
| --- | --- | --- |
| MOMO-01 | Khách A tạo link MoMo cho order `PENDING` của mình | Payment đã có `transaction_code` MoMo và `PENDING` trước khi trả `payUrl`. Amount dùng `orders.total_amount`, không dùng amount client gửi. |
| MOMO-02 | Khách B gọi `POST /api/orders/:id/momo-create` cho order A | `403 Forbidden`. |
| MOMO-03 | Gửi IPN chữ ký sai tới `POST /api/payments/momo/ipn` | Phản hồi lỗi; payment/order/inventory không đổi. |
| MOMO-04 | Gửi IPN amount khác amount payment | Phản hồi lỗi; không đổi trạng thái. |
| MOMO-05 | Gửi IPN hợp lệ `resultCode=0` | Payment `SUCCESS`, `paid_at` có giá trị; order `CONFIRMED`; reserve giảm và quantity giảm đúng số lượng. |
| MOMO-06 | Gửi lại chính IPN thành công | Idempotent: không trừ stock lần hai, không thêm history lần hai. |
| MOMO-07 | Gửi IPN hợp lệ thất bại/hết hạn (`resultCode != 0`) | Payment `FAILED`, order `CANCELLED`, `reserved_quantity` được giải phóng; `quantity` không bị trừ. |
| MOMO-08 | Gửi lại IPN thất bại | Idempotent: reserve không âm, không thêm history lần hai. |
| MOMO-09 | Tạo MoMo rồi thanh toán thất bại | Cart frontend vẫn còn; khách có thể thử lại hoặc tạo đơn khác sau khi tồn được giải phóng. |

## Chống giả thanh toán và COD

| ID | Thao tác | Kết quả mong đợi |
| --- | --- | --- |
| PAY-01 | Client gọi `POST /api/orders/:id/payments` với `payment_status=SUCCESS` | Endpoint không tồn tại (`404`) hoặc không thể đổi payment sang `SUCCESS`. |
| COD-01 | Tạo đơn COD | Payment là `PENDING`, hàng được reserve, chưa trừ `quantity`. |
| COD-02 | Khách hàng gọi `POST /api/orders/:id/cod/confirm-collection` | `403 Forbidden`. |
| COD-03 | Staff/shipper gọi COD confirm khi order chưa `SHIPPING` | `400 Bad Request`; không đổi payment/stock. |
| COD-04 | Staff/shipper xác nhận thu tiền cho order `SHIPPING` | Payment `SUCCESS`, order `COMPLETED`, reserve chuyển thành stock đã trừ. |
| COD-05 | Gọi lại COD confirm | Bị từ chối hoặc idempotent; tuyệt đối không trừ stock thêm lần nữa. |

## Chuyển trạng thái đơn

| ID | Thao tác | Kết quả mong đợi |
| --- | --- | --- |
| STT-01 | Thử `PENDING → SHIPPING` | Bị từ chối. |
| STT-02 | Luồng hợp lệ `CONFIRMED → PACKING → SHIPPING → COMPLETED` bởi chủ shop | Thành công và ghi history cho từng bước. |
| STT-03 | Người không phải chủ shop đổi `PACKING/SHIPPING/COMPLETED` | `403 Forbidden`. |
| STT-04 | Khách hàng hủy đơn đang `PENDING` hoặc chủ shop hủy trạng thái hợp lệ | Order `CANCELLED` và reserve được giải phóng đúng một lần. |
| STT-05 | Hủy order đã `COMPLETED` hoặc chuyển ngược trạng thái | Bị từ chối. |

## Kiểm tra dữ liệu sau mỗi test

- `inventory.quantity >= 0`, `reserved_quantity >= 0` và `reserved_quantity <= quantity`.
- Mỗi order có đúng một payment; amount payment bằng `orders.total_amount`.
- Không có order `CANCELLED` còn tồn reserve của các `order_items` tương ứng.
- Không có payment `SUCCESS` mà order chưa được cập nhật theo luồng tương ứng.
- `order_status_history` không có bản ghi lặp do IPN/COD bị gửi lại.

## Gợi ý tự động hoá

- Viết integration test với PostgreSQL test database cho các case `ORD-02`, `MOMO-05` đến `MOMO-08`, `COD-04` và `STT-01`.
- Với IPN, dùng fixture payload MoMo đã ký bằng `MOMO_SECRET` test; không dùng secret sandbox thật trong CI.
- Chạy các test cạnh tranh (`Promise.all`) cho cùng một variant để xác nhận pessimistic lock hoạt động.
