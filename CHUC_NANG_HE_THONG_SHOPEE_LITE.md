# Đặc tả chức năng hệ thống Shopee Lite

Tài liệu này mô tả toàn bộ chức năng ứng dụng cần có để tương ứng với database hiện tại trong file `ecommerce_postgresql (4).sql`.

Mục tiêu của tài liệu là giúp AI agent hoặc lập trình viên hiểu rõ hệ thống cần làm gì, mỗi chức năng dùng bảng nào, dữ liệu cần kiểm tra ra sao và luồng nghiệp vụ chính phải vận hành như thế nào.

## 1. Tổng quan hệ thống

Shopee Lite là hệ thống thương mại điện tử nhiều người bán. Người dùng có thể đăng ký tài khoản, trở thành người mua hoặc người bán, tạo shop, đăng sản phẩm, quản lý SKU, tồn kho, giỏ hàng, đơn hàng, thanh toán, vận chuyển, voucher, đánh giá sản phẩm, trả hàng và hoàn tiền.

Các nhóm vai trò chính:

- Admin: Quản trị hệ thống, quản lý user, shop, danh mục, thương hiệu, sản phẩm, đơn hàng, voucher và xử lý vi phạm.
- Seller: Chủ shop, quản lý shop, sản phẩm, SKU, tồn kho, đơn theo shop, vận chuyển, voucher của shop.
- Customer: Người mua, quản lý tài khoản, địa chỉ, giỏ hàng, yêu thích, đặt hàng, thanh toán, theo dõi giao hàng, đánh giá, trả hàng.

Các bảng chính:

- Tài khoản và phân quyền: `users`, `roles`, `user_roles`.
- Địa chỉ: `addresses`.
- Shop: `shops`, `shop_followers`.
- Danh mục và thương hiệu: `categories`, `brands`.
- Sản phẩm: `products`, `product_images`, `attributes`, `attribute_values`, `product_variants`, `variant_attribute_values`, `inventory`.
- Hành vi người dùng: `carts`, `cart_items`, `wishlists`, `product_views`.
- Thanh toán và vận chuyển: `payment_methods`, `shipping_methods`, `payments`, `shipments`.
- Voucher: `vouchers`, `order_vouchers`.
- Đơn hàng: `orders`, `order_shop_groups`, `order_items`, `order_status_history`.
- Đánh giá: `product_reviews`.
- Trả hàng và hoàn tiền: `return_requests`, `refunds`.

## 2. Quy tắc chung cho AI agent

Khi xây dựng backend, API hoặc giao diện dựa trên database này, agent cần tuân thủ các quy tắc sau:

- Không tự tạo trạng thái ngoài các giá trị đã được `CHECK` trong database.
- Không ghi số tiền âm, số lượng âm, rating ngoài khoảng cho phép.
- Không dùng `product_variants.stock` vì cột này đã bị bỏ. Tồn kho chỉ lấy từ bảng `inventory`.
- Khi tạo đơn hàng, phải tạo cả `orders`, `order_shop_groups` và `order_items`.
- Khi đơn có sản phẩm từ nhiều shop, phải tách theo `order_shop_groups`.
- Khi tạo `order_items`, `order_shop_id` phải thuộc đúng `order_id`.
- Khi tính tiền, phải đảm bảo:
  - `orders.total_amount = orders.subtotal + orders.shipping_fee - orders.discount`.
  - `order_shop_groups.total_amount = subtotal + shipping_fee - discount`.
  - `order_items.subtotal = quantity * unit_price - discount`.
- Khi giữ hàng trong quá trình đặt hàng, cập nhật `inventory.reserved_quantity`, nhưng không được vượt quá `inventory.quantity`.
- Khi đơn hoàn tất, cập nhật `products.sold_quantity` và giảm tồn kho thật.
- Khi có review hợp lệ, cập nhật `products.average_rating` và `products.review_count`.
- Không xóa cứng dữ liệu nghiệp vụ quan trọng như đơn hàng, thanh toán, vận chuyển nếu hệ thống thật cần lịch sử. Có thể dùng status để ẩn hoặc khóa.

## 3. Chức năng tài khoản và phân quyền

### 3.1 Đăng ký tài khoản

Bảng liên quan: `users`, `roles`, `user_roles`, `carts`.

Chức năng:

- Cho phép người dùng tạo tài khoản mới.
- Lưu `full_name`, `email`, `phone`, `password_hash`, `avatar`, `gender`, `birthday`.
- Email không được trùng.
- Phone không được trùng nếu có nhập.
- Password phải lưu dạng hash, không lưu mật khẩu plain text.
- Sau khi đăng ký, gán role mặc định là `Customer`.
- Tạo sẵn một cart cho user trong bảng `carts`.

Trạng thái hợp lệ:

- `users.status`: `ACTIVE`, `BLOCKED`.
- `users.gender`: `MALE`, `FEMALE`, `OTHER` hoặc `NULL`.

### 3.2 Đăng nhập

Bảng liên quan: `users`, `roles`, `user_roles`.

Chức năng:

- Xác thực bằng email hoặc phone và password.
- Chỉ cho phép đăng nhập khi `users.status = 'ACTIVE'`.
- Trả về thông tin user và danh sách role.

### 3.3 Quản lý hồ sơ cá nhân

Bảng liên quan: `users`.

Chức năng:

- Xem thông tin cá nhân.
- Cập nhật `full_name`, `phone`, `avatar`, `gender`, `birthday`.
- Không cho cập nhật email trùng user khác.
- Khi update, trigger tự cập nhật `updated_at`.

### 3.4 Quản lý role

Bảng liên quan: `roles`, `user_roles`.

Chức năng dành cho Admin:

- Xem danh sách role.
- Gán role cho user.
- Gỡ role khỏi user.
- Một user có thể có nhiều role.

Quy tắc:

- Không gán trùng role vì khóa chính là `(user_id, role_id)`.
- Role mặc định gồm `Admin`, `Seller`, `Customer`.

### 3.5 Khóa và mở khóa user

Bảng liên quan: `users`.

Chức năng dành cho Admin:

- Chuyển `users.status` sang `BLOCKED` khi user vi phạm.
- Chuyển lại `ACTIVE` khi mở khóa.

Quy tắc:

- User bị `BLOCKED` không được đăng nhập, mua hàng, tạo shop, đánh giá hoặc trả hàng.

## 4. Chức năng địa chỉ giao hàng

Bảng liên quan: `addresses`, `users`.

Chức năng:

- Thêm địa chỉ giao hàng.
- Sửa địa chỉ.
- Xóa địa chỉ.
- Xem danh sách địa chỉ của user.
- Đặt một địa chỉ làm mặc định.

Dữ liệu bắt buộc:

- `receiver_name`.
- `phone`.
- `province`.
- `district`.
- `ward`.
- `detail_address`.

Quy tắc:

- Mỗi user chỉ có tối đa một địa chỉ mặc định do unique partial index `uq_addresses_one_default_per_user`.
- Khi đặt địa chỉ mới làm mặc định, cần bỏ mặc định ở địa chỉ cũ trước hoặc xử lý trong transaction.
- Địa chỉ đã gắn với đơn hàng cũ không nên xóa cứng trong hệ thống thật nếu cần lưu lịch sử giao hàng.

## 5. Chức năng shop

### 5.1 Đăng ký shop

Bảng liên quan: `shops`, `users`, `user_roles`, `roles`.

Chức năng:

- Customer có thể đăng ký trở thành Seller.
- Tạo bản ghi shop mới với `owner_id`, `shop_name`, `logo`, `description`.
- Gán thêm role `Seller` cho user.

Quy tắc:

- Một user chỉ được sở hữu một shop vì `shops.owner_id` là `UNIQUE`.
- Shop mới mặc định `status = 'ACTIVE'`.
- Rating mặc định là `5.0`.

Trạng thái shop:

- `ACTIVE`: Shop đang hoạt động.
- `INACTIVE`: Shop tạm ngưng.
- `BANNED`: Shop bị khóa do vi phạm.

### 5.2 Cập nhật thông tin shop

Bảng liên quan: `shops`.

Chức năng:

- Seller cập nhật `shop_name`, `logo`, `description`.
- Admin có thể cập nhật `status`.

Quy tắc:

- `rating` phải trong khoảng 0 đến 5.
- `total_followers` không âm.

### 5.3 Theo dõi shop

Bảng liên quan: `shop_followers`, `shops`, `users`.

Chức năng:

- Customer theo dõi shop.
- Customer bỏ theo dõi shop.
- Xem danh sách follower của shop.
- Xem danh sách shop user đang theo dõi.

Quy tắc:

- Một user không được follow cùng một shop nhiều lần vì khóa chính là `(shop_id, user_id)`.
- Khi follow/unfollow, nên cập nhật `shops.total_followers`.

## 6. Chức năng danh mục

Bảng liên quan: `categories`.

Chức năng dành cho Admin:

- Tạo danh mục.
- Sửa danh mục.
- Ẩn/hiện danh mục.
- Xóa danh mục nếu chưa có dữ liệu quan trọng liên quan.
- Xem cây danh mục nhiều cấp.

Dữ liệu:

- `category_name`.
- `parent_id`.
- `image`.
- `description`.
- `status`.

Quy tắc:

- `parent_id` tham chiếu lại `categories.category_id`.
- Nếu danh mục cha bị xóa, danh mục con được set `parent_id = NULL`.
- `status` chỉ nhận `ACTIVE` hoặc `INACTIVE`.
- Không nên cho tạo vòng lặp danh mục, ví dụ A là cha của B và B lại là cha của A. Logic này cần kiểm tra ở tầng backend.

## 7. Chức năng thương hiệu

Bảng liên quan: `brands`.

Chức năng dành cho Admin hoặc Seller nếu được phép:

- Tạo thương hiệu.
- Sửa thông tin thương hiệu.
- Xem danh sách thương hiệu.
- Gắn thương hiệu vào sản phẩm.

Quy tắc:

- `brand_name` là duy nhất.
- Một brand có thể có nhiều product.

## 8. Chức năng sản phẩm

### 8.1 Tạo sản phẩm

Bảng liên quan: `products`, `shops`, `brands`, `categories`.

Chức năng:

- Seller tạo sản phẩm thuộc shop của mình.
- Gắn sản phẩm với category và brand nếu có.
- Lưu `product_name`, `slug`, `description`, `thumbnail`.

Quy tắc:

- `slug` là duy nhất nếu có.
- Seller chỉ được tạo sản phẩm cho shop của chính mình.
- Shop phải `ACTIVE` mới được đăng sản phẩm.
- Product mới mặc định `status = 'ACTIVE'`.

Trạng thái sản phẩm:

- `ACTIVE`: Đang bán.
- `INACTIVE`: Tạm ẩn.
- `BANNED`: Bị khóa do vi phạm.
- `OUT_OF_STOCK`: Hết hàng.

### 8.2 Cập nhật sản phẩm

Bảng liên quan: `products`.

Chức năng:

- Seller sửa tên, mô tả, ảnh đại diện, category, brand.
- Seller bật/tắt bán sản phẩm.
- Admin có thể chuyển sản phẩm sang `BANNED`.

Quy tắc:

- `average_rating` chỉ được cập nhật từ review, không nên cho seller sửa trực tiếp.
- `sold_quantity` chỉ nên cập nhật từ đơn hàng hoàn tất.

### 8.3 Quản lý ảnh sản phẩm

Bảng liên quan: `product_images`.

Chức năng:

- Thêm nhiều ảnh cho sản phẩm.
- Sắp xếp thứ tự ảnh bằng `display_order`.
- Xóa ảnh sản phẩm.

Quy tắc:

- `image_url` bắt buộc.
- `display_order` phải lớn hơn 0.
- Seller chỉ được sửa ảnh sản phẩm thuộc shop mình.

## 9. Chức năng thuộc tính và SKU

### 9.1 Quản lý thuộc tính

Bảng liên quan: `attributes`, `attribute_values`.

Chức năng:

- Tạo thuộc tính như Color, Size, RAM, Storage.
- Tạo giá trị thuộc tính như Red, Blue, 128GB.
- Xem danh sách thuộc tính và giá trị.

Quy tắc:

- `attribute_name` là duy nhất.
- Trong cùng một attribute, `value_name` không được trùng.

### 9.2 Tạo biến thể sản phẩm

Bảng liên quan: `product_variants`, `variant_attribute_values`, `inventory`.

Chức năng:

- Seller tạo SKU cho sản phẩm.
- Mỗi SKU có `sku`, `price`, `original_price`, `weight`, `status`.
- Gắn SKU với các giá trị thuộc tính.
- Tạo bản ghi inventory cho SKU.

Quy tắc:

- `sku` là duy nhất toàn hệ thống.
- `price` không âm.
- `original_price` phải lớn hơn hoặc bằng `price` nếu có.
- `weight` không âm nếu có.
- `status` chỉ nhận `ACTIVE` hoặc `INACTIVE`.
- Tồn kho không lưu trong `product_variants`, chỉ lưu trong `inventory`.

### 9.3 Quản lý tồn kho

Bảng liên quan: `inventory`, `product_variants`.

Chức năng:

- Xem tồn kho theo SKU.
- Cập nhật số lượng tồn.
- Giữ hàng khi user đặt hàng.
- Giải phóng hàng giữ khi hủy đơn hoặc thanh toán thất bại.
- Trừ hàng thật khi đơn được xác nhận hoặc hoàn tất tùy nghiệp vụ.

Quy tắc:

- `quantity >= 0`.
- `reserved_quantity >= 0`.
- `reserved_quantity <= quantity`.
- Một variant có tối đa một bản ghi inventory.

Gợi ý xử lý tồn kho:

- Khi user bắt đầu checkout: tăng `reserved_quantity`.
- Khi thanh toán thành công hoặc đơn được xác nhận: giảm `quantity`, giảm `reserved_quantity`.
- Khi hủy đơn trước khi xác nhận: giảm `reserved_quantity`.
- Khi trả hàng thành công nếu nhập lại kho: tăng `quantity`.

## 10. Chức năng giỏ hàng

### 10.1 Xem giỏ hàng

Bảng liên quan: `carts`, `cart_items`, `product_variants`, `products`, `inventory`.

Chức năng:

- Xem các sản phẩm trong giỏ của user.
- Hiển thị tên sản phẩm, ảnh, SKU, thuộc tính, giá, số lượng, tồn kho khả dụng.

Quy tắc:

- Mỗi user có một cart.
- Chỉ hiển thị item còn product/variant hợp lệ.

### 10.2 Thêm sản phẩm vào giỏ

Bảng liên quan: `cart_items`.

Chức năng:

- Thêm variant vào cart.
- Nếu variant đã có trong cart, tăng quantity.

Quy tắc:

- `quantity > 0`.
- Không được thêm variant `INACTIVE`.
- Không được thêm product không `ACTIVE`.
- Không được thêm số lượng vượt tồn kho khả dụng.
- Tồn kho khả dụng có thể tính là `inventory.quantity - inventory.reserved_quantity`.

### 10.3 Cập nhật và xóa item trong giỏ

Bảng liên quan: `cart_items`.

Chức năng:

- Tăng/giảm số lượng.
- Xóa item.
- Xóa toàn bộ giỏ hàng.

Quy tắc:

- Số lượng mới phải lớn hơn 0.
- Nếu quantity bằng 0 theo thao tác UI, nên hiểu là xóa item.

## 11. Chức năng wishlist

Bảng liên quan: `wishlists`, `products`, `users`.

Chức năng:

- Thêm sản phẩm vào danh sách yêu thích.
- Xóa sản phẩm khỏi danh sách yêu thích.
- Xem danh sách yêu thích của user.

Quy tắc:

- Một user không được yêu thích cùng một sản phẩm nhiều lần vì `UNIQUE(user_id, product_id)`.
- Chỉ cho thêm product đang hợp lệ.

## 12. Chức năng lịch sử xem sản phẩm

Bảng liên quan: `product_views`.

Chức năng:

- Ghi lại mỗi lượt xem sản phẩm.
- Hỗ trợ gợi ý sản phẩm hoặc thống kê sản phẩm được xem nhiều.

Quy tắc:

- `user_id` có thể NULL nếu là khách hoặc user đã bị xóa.
- `product_id` tham chiếu product.
- Không bắt buộc chống trùng vì nhiều lượt xem là dữ liệu hợp lệ.

## 13. Chức năng phương thức thanh toán

Bảng liên quan: `payment_methods`.

Chức năng dành cho Admin:

- Xem danh sách phương thức thanh toán.
- Bật/tắt phương thức thanh toán.
- Thêm phương thức thanh toán nếu cần.

Dữ liệu mặc định:

- COD.
- VNPay.
- MoMo.
- PayPal.
- Stripe.

Quy tắc:

- Khi checkout, chỉ cho chọn phương thức có `is_active = TRUE`.

## 14. Chức năng phương thức vận chuyển

Bảng liên quan: `shipping_methods`.

Chức năng:

- Admin quản lý phương thức vận chuyển.
- User chọn phương thức vận chuyển khi checkout.

Dữ liệu mặc định:

- Standard.
- Fast.
- Express.

Quy tắc:

- `shipping_fee >= 0`.
- `estimated_days > 0` nếu có.
- Khi checkout, chỉ cho chọn phương thức có `is_active = TRUE`.

## 15. Chức năng voucher

### 15.1 Tạo voucher

Bảng liên quan: `vouchers`, `shops`.

Chức năng:

- Admin tạo voucher toàn sàn bằng cách để `shop_id = NULL`.
- Seller tạo voucher cho shop của mình bằng cách gắn `shop_id`.

Dữ liệu:

- `voucher_code`.
- `voucher_name`.
- `discount_type`: `PERCENT` hoặc `FIXED`.
- `discount_value`.
- `max_discount`.
- `min_order_amount`.
- `usage_limit`.
- `start_at`, `end_at`.
- `status`.

Quy tắc:

- `voucher_code` là duy nhất.
- `discount_value > 0`.
- Nếu `discount_type = 'PERCENT'`, `discount_value <= 100`.
- `max_discount >= 0` nếu có.
- `min_order_amount >= 0`.
- `end_at > start_at`.
- `used_count <= usage_limit` nếu có giới hạn.
- `status` chỉ nhận `ACTIVE`, `INACTIVE`, `EXPIRED`.

### 15.2 Áp dụng voucher vào đơn hàng

Bảng liên quan: `vouchers`, `order_vouchers`, `orders`.

Chức năng:

- Kiểm tra voucher hợp lệ.
- Tính số tiền giảm.
- Ghi voucher đã áp dụng vào `order_vouchers`.
- Cập nhật `orders.discount`.

Quy tắc:

- Voucher phải đang `ACTIVE`.
- Thời gian hiện tại phải nằm trong `start_at` và `end_at`.
- Tổng tiền phải đạt `min_order_amount`.
- Nếu là voucher shop, chỉ áp dụng cho sản phẩm thuộc shop đó.
- Nếu là voucher toàn sàn, có thể áp dụng cho cả đơn.
- Không vượt `usage_limit`.
- Sau khi đơn được xác nhận, tăng `vouchers.used_count`.

## 16. Chức năng checkout và tạo đơn hàng

Bảng liên quan: `carts`, `cart_items`, `orders`, `order_shop_groups`, `order_items`, `order_vouchers`, `inventory`, `addresses`, `payment_methods`, `shipping_methods`.

Chức năng:

- User chọn sản phẩm từ giỏ hàng để checkout.
- Chọn địa chỉ giao hàng.
- Chọn phương thức thanh toán.
- Chọn phương thức vận chuyển.
- Áp dụng voucher nếu có.
- Tạo đơn hàng tổng.
- Tách đơn theo từng shop.
- Tạo chi tiết đơn hàng.
- Giữ hoặc trừ tồn kho tùy chiến lược.

Luồng xử lý khuyến nghị:

1. Validate user đang `ACTIVE`.
2. Validate địa chỉ thuộc user.
3. Validate payment method và shipping method đang active.
4. Lấy các cart item được chọn.
5. Kiểm tra product, variant, shop đều hợp lệ.
6. Kiểm tra tồn kho khả dụng.
7. Nhóm item theo shop.
8. Tính subtotal từng item.
9. Tính subtotal từng shop group.
10. Tính shipping fee, discount.
11. Tạo `orders`.
12. Tạo `order_shop_groups` cho từng shop.
13. Tạo `order_items`.
14. Tạo `order_vouchers` nếu có voucher.
15. Cập nhật `inventory.reserved_quantity`.
16. Xóa item đã checkout khỏi cart.
17. Ghi trạng thái đầu tiên vào `order_status_history`.

Trạng thái đơn hàng:

- `PENDING`: Mới tạo, chờ xác nhận hoặc thanh toán.
- `CONFIRMED`: Đã xác nhận.
- `PACKING`: Shop đang đóng gói.
- `SHIPPING`: Đang giao.
- `COMPLETED`: Hoàn tất.
- `CANCELLED`: Đã hủy.
- `RETURNED`: Đã trả hàng.

Quy tắc tính tiền:

- `order_items.subtotal = quantity * unit_price - discount`.
- `order_shop_groups.total_amount = subtotal + shipping_fee - discount`.
- `orders.total_amount = subtotal + shipping_fee - discount`.

## 17. Chức năng quản lý đơn hàng của Customer

Bảng liên quan: `orders`, `order_shop_groups`, `order_items`, `payments`, `shipments`, `order_status_history`.

Chức năng:

- Xem danh sách đơn hàng của mình.
- Xem chi tiết đơn hàng.
- Theo dõi trạng thái từng shop package.
- Hủy đơn khi còn ở trạng thái cho phép.
- Xác nhận đã nhận hàng.
- Yêu cầu trả hàng.
- Đánh giá sản phẩm sau khi hoàn tất.

Quy tắc:

- Customer chỉ được xem đơn của chính mình.
- Chỉ được hủy khi đơn chưa chuyển sang trạng thái vận chuyển hoặc theo rule của hệ thống.
- Khi hủy, phải giải phóng `reserved_quantity` nếu hàng đang được giữ.
- Khi xác nhận nhận hàng, chuyển trạng thái phù hợp sang `COMPLETED`.

## 18. Chức năng quản lý đơn hàng của Seller

Bảng liên quan: `order_shop_groups`, `order_items`, `shipments`, `order_status_history`, `shops`.

Chức năng:

- Seller xem các đơn thuộc shop của mình.
- Xác nhận đơn.
- Chuyển trạng thái đóng gói.
- Tạo/thêm thông tin vận chuyển.
- Cập nhật trạng thái giao hàng nếu được phân quyền.
- Từ chối/hủy đơn trong trường hợp hợp lệ.

Quy tắc:

- Seller chỉ được thao tác trên `order_shop_groups` có `shop_id` thuộc shop của mình.
- Mỗi `order_shop_group` có tối đa một shipment.
- Khi seller cập nhật trạng thái group, hệ thống có thể cập nhật trạng thái tổng của `orders` dựa trên tất cả group.

## 19. Chức năng quản lý đơn hàng của Admin

Bảng liên quan: `orders`, `order_shop_groups`, `order_items`, `payments`, `shipments`, `order_status_history`.

Chức năng:

- Xem toàn bộ đơn hàng.
- Lọc theo user, shop, trạng thái, thời gian.
- Can thiệp trạng thái khi có tranh chấp.
- Xem lịch sử trạng thái.

Quy tắc:

- Mọi thay đổi trạng thái quan trọng phải ghi vào `order_status_history`.

## 20. Chức năng lịch sử trạng thái đơn hàng

Bảng liên quan: `order_status_history`.

Chức năng:

- Ghi log mỗi lần trạng thái đơn thay đổi.
- Hiển thị timeline đơn hàng cho customer/admin.

Quy tắc:

- `status` phải thuộc cùng tập trạng thái với `orders.order_status`.
- Nên ghi `note` khi admin/seller thay đổi trạng thái thủ công.

## 21. Chức năng thanh toán

Bảng liên quan: `payments`, `orders`, `payment_methods`.

Chức năng:

- Tạo bản ghi payment cho order.
- Cập nhật trạng thái thanh toán.
- Lưu mã giao dịch từ cổng thanh toán.
- Ghi thời điểm thanh toán thành công.

Trạng thái thanh toán:

- `PENDING`: Chờ thanh toán.
- `SUCCESS`: Thanh toán thành công.
- `FAILED`: Thanh toán thất bại.
- `REFUNDED`: Đã hoàn tiền.

Quy tắc:

- Mỗi order có tối đa một payment vì `payments.order_id` là `UNIQUE`.
- `amount >= 0`.
- Nếu payment thất bại, có thể hủy đơn hoặc cho thanh toán lại tùy nghiệp vụ.
- Nếu COD, payment có thể ở `PENDING` cho đến khi giao hàng thành công.

## 22. Chức năng vận chuyển

Bảng liên quan: `shipments`, `order_shop_groups`.

Chức năng:

- Tạo shipment cho từng nhóm đơn theo shop.
- Lưu `tracking_number`, `carrier`, `shipped_at`, `delivered_at`.
- Cập nhật trạng thái vận chuyển.

Trạng thái vận chuyển:

- `PREPARING`: Chuẩn bị hàng.
- `SHIPPING`: Đang giao.
- `DELIVERED`: Đã giao.
- `FAILED`: Giao thất bại.
- `RETURNED`: Đã hoàn về.

Quy tắc:

- `tracking_number` là duy nhất nếu có.
- Một `order_shop_group` có tối đa một shipment.
- Khi shipment chuyển `DELIVERED`, có thể cập nhật group/order sang trạng thái hoàn tất nếu đủ điều kiện.

## 23. Chức năng đánh giá sản phẩm

Bảng liên quan: `product_reviews`, `products`, `order_items`, `users`.

Chức năng:

- Customer đánh giá sản phẩm sau khi mua hàng.
- Xem danh sách review của sản phẩm.
- Admin ẩn review vi phạm.

Dữ liệu:

- `rating`: 1 đến 5.
- `comment`.
- `status`: `VISIBLE` hoặc `HIDDEN`.

Quy tắc:

- User chỉ nên được review sản phẩm đã mua và đơn đã hoàn tất.
- `order_item_id` là `UNIQUE`, nghĩa là mỗi dòng hàng chỉ được review một lần.
- Sau khi tạo/sửa/xóa/ẩn review, cần tính lại:
  - `products.average_rating`.
  - `products.review_count`.
- Seller không được tự sửa review của customer.

## 24. Chức năng trả hàng

Bảng liên quan: `return_requests`, `order_items`, `users`, `orders`, `order_shop_groups`.

Chức năng:

- Customer gửi yêu cầu trả hàng cho một order item.
- Seller hoặc Admin duyệt/từ chối yêu cầu.
- Cập nhật trạng thái trả hàng.

Trạng thái trả hàng:

- `REQUESTED`: Đã gửi yêu cầu.
- `APPROVED`: Đã chấp nhận.
- `REJECTED`: Bị từ chối.
- `RETURNING`: Khách đang gửi hàng trả.
- `RECEIVED`: Shop/kho đã nhận hàng trả.
- `REFUNDED`: Đã hoàn tiền.

Quy tắc:

- Chỉ cho tạo yêu cầu trả hàng với đơn đã giao hoặc hoàn tất.
- `reason` bắt buộc.
- User chỉ được tạo return request cho order item thuộc đơn của mình.
- Nếu hàng được nhập lại kho, cập nhật `inventory.quantity`.

## 25. Chức năng hoàn tiền

Bảng liên quan: `refunds`, `return_requests`, `payments`.

Chức năng:

- Tạo yêu cầu hoàn tiền sau khi return được duyệt.
- Cập nhật trạng thái hoàn tiền.
- Lưu thời điểm hoàn tiền thành công.

Trạng thái hoàn tiền:

- `PENDING`: Chờ hoàn tiền.
- `SUCCESS`: Hoàn tiền thành công.
- `FAILED`: Hoàn tiền thất bại.

Quy tắc:

- Mỗi return request có tối đa một refund.
- `amount >= 0`.
- Khi refund thành công, cập nhật `return_requests.return_status = 'REFUNDED'`.
- Có thể cập nhật `payments.payment_status = 'REFUNDED'` nếu toàn bộ order đã hoàn tiền.

## 26. Chức năng tìm kiếm và lọc sản phẩm

Bảng liên quan: `products`, `product_variants`, `categories`, `brands`, `shops`, `product_reviews`, `inventory`.

Chức năng:

- Tìm sản phẩm theo tên.
- Lọc theo category.
- Lọc theo brand.
- Lọc theo shop.
- Lọc theo khoảng giá.
- Lọc theo rating.
- Lọc sản phẩm còn hàng.
- Sắp xếp theo mới nhất, bán chạy, giá tăng/giảm, rating.

Quy tắc:

- Chỉ hiển thị sản phẩm `products.status = 'ACTIVE'`.
- Chỉ hiển thị shop `shops.status = 'ACTIVE'`.
- Nếu lọc còn hàng, cần kiểm tra tồn kho qua `inventory`.

## 27. Chức năng trang chi tiết sản phẩm

Bảng liên quan: `products`, `product_images`, `product_variants`, `variant_attribute_values`, `attribute_values`, `attributes`, `inventory`, `shops`, `product_reviews`, `product_views`.

Chức năng:

- Hiển thị thông tin sản phẩm.
- Hiển thị ảnh sản phẩm.
- Hiển thị shop bán hàng.
- Hiển thị SKU và thuộc tính.
- Hiển thị giá theo variant.
- Hiển thị tồn kho khả dụng.
- Hiển thị rating và review.
- Ghi nhận lượt xem vào `product_views`.

Quy tắc:

- Khi user chọn variant, giá và tồn kho phải đổi theo variant.
- Nếu variant hết hàng, không cho thêm vào giỏ.

## 28. Chức năng Admin dashboard

Bảng liên quan: hầu hết các bảng.

Chức năng:

- Quản lý user.
- Quản lý shop.
- Quản lý danh mục.
- Quản lý thương hiệu.
- Quản lý sản phẩm.
- Quản lý đơn hàng.
- Quản lý payment method.
- Quản lý shipping method.
- Quản lý voucher toàn sàn.
- Xem thống kê tổng quan.

Thống kê gợi ý:

- Tổng số user.
- Tổng số shop.
- Tổng số sản phẩm.
- Tổng số đơn hàng.
- Doanh thu theo ngày/tháng.
- Sản phẩm bán chạy.
- Shop có doanh thu cao.
- Đơn theo trạng thái.
- Tỷ lệ hoàn/trả hàng.

## 29. Chức năng Seller dashboard

Bảng liên quan: `shops`, `products`, `product_variants`, `inventory`, `order_shop_groups`, `order_items`, `shipments`, `vouchers`, `product_reviews`.

Chức năng:

- Xem tổng quan shop.
- Quản lý sản phẩm.
- Quản lý SKU.
- Quản lý tồn kho.
- Quản lý đơn của shop.
- Quản lý vận chuyển của shop.
- Quản lý voucher shop.
- Xem đánh giá sản phẩm của shop.
- Xem doanh thu theo shop.

Quy tắc:

- Seller chỉ được truy cập dữ liệu thuộc shop của mình.
- Không được sửa order item thuộc shop khác.
- Không được sửa review của customer, chỉ có thể báo cáo hoặc phản hồi nếu hệ thống bổ sung bảng phản hồi sau này.

## 30. API gợi ý

Danh sách endpoint gợi ý để agent xây backend:

- `POST /auth/register`
- `POST /auth/login`
- `GET /me`
- `PATCH /me`
- `GET /me/addresses`
- `POST /me/addresses`
- `PATCH /me/addresses/{address_id}`
- `DELETE /me/addresses/{address_id}`
- `POST /seller/shops`
- `GET /shops/{shop_id}`
- `PATCH /seller/shop`
- `POST /shops/{shop_id}/follow`
- `DELETE /shops/{shop_id}/follow`
- `GET /categories`
- `POST /admin/categories`
- `PATCH /admin/categories/{category_id}`
- `GET /brands`
- `POST /admin/brands`
- `GET /products`
- `GET /products/{product_id}`
- `POST /seller/products`
- `PATCH /seller/products/{product_id}`
- `POST /seller/products/{product_id}/images`
- `POST /seller/products/{product_id}/variants`
- `PATCH /seller/variants/{variant_id}`
- `PATCH /seller/variants/{variant_id}/inventory`
- `GET /cart`
- `POST /cart/items`
- `PATCH /cart/items/{cart_item_id}`
- `DELETE /cart/items/{cart_item_id}`
- `POST /wishlist/{product_id}`
- `DELETE /wishlist/{product_id}`
- `POST /checkout`
- `GET /orders`
- `GET /orders/{order_id}`
- `POST /orders/{order_id}/cancel`
- `POST /orders/{order_id}/confirm-received`
- `GET /seller/orders`
- `PATCH /seller/order-groups/{order_shop_id}/status`
- `POST /seller/order-groups/{order_shop_id}/shipment`
- `POST /payments/{order_id}`
- `PATCH /payments/{payment_id}/status`
- `POST /products/{product_id}/reviews`
- `GET /products/{product_id}/reviews`
- `POST /order-items/{order_item_id}/return`
- `PATCH /seller/returns/{return_id}`
- `POST /admin/refunds`

## 31. Transaction bắt buộc

Các chức năng sau nên chạy trong database transaction:

- Đăng ký user kèm tạo cart và gán role.
- Đăng ký shop kèm gán role Seller.
- Checkout tạo order, order groups, order items, voucher, cập nhật tồn kho và xóa cart item.
- Hủy đơn kèm cập nhật trạng thái, lịch sử và giải phóng tồn kho giữ.
- Xác nhận đơn kèm trừ tồn kho và cập nhật sold quantity.
- Tạo review kèm cập nhật average rating và review count.
- Duyệt trả hàng kèm cập nhật trạng thái order/order item nếu cần.
- Hoàn tiền kèm cập nhật refund, return request và payment.

## 32. Các case lỗi cần xử lý

Agent cần xử lý rõ các lỗi sau:

- Email đã tồn tại.
- Phone đã tồn tại.
- User bị khóa.
- User không có quyền Seller/Admin.
- Shop không tồn tại.
- Shop không thuộc seller hiện tại.
- Shop bị khóa hoặc inactive.
- Product không tồn tại.
- Product không thuộc shop hiện tại.
- Product hoặc variant inactive.
- SKU bị trùng.
- Tồn kho không đủ.
- Địa chỉ không thuộc user.
- Payment method không active.
- Shipping method không active.
- Voucher không tồn tại.
- Voucher hết hạn.
- Voucher chưa đến thời gian dùng.
- Voucher vượt usage limit.
- Voucher không đạt min order amount.
- Voucher shop áp dụng sai shop.
- Order không thuộc user.
- Order không ở trạng thái cho phép hủy.
- Order group không thuộc shop của seller.
- Không thể review sản phẩm chưa mua.
- Order item đã được review.
- Return request không thuộc user.
- Refund đã tồn tại cho return request.

## 33. Gợi ý dữ liệu mẫu

Khi cần seed dữ liệu để demo, nên tạo:

- 3 role mặc định: Admin, Seller, Customer.
- Một admin user.
- Một vài customer.
- Một vài seller kèm shop.
- Cây category ít nhất 3 cấp.
- Một số brand.
- Mỗi shop có vài product.
- Mỗi product có nhiều image và variant.
- Mỗi variant có inventory.
- Một vài voucher toàn sàn và voucher shop.
- Một vài order có nhiều shop để chứng minh `order_shop_groups`.
- Một vài payment, shipment.
- Một vài product review.
- Một vài return request và refund.

## 34. Kết luận cho AI agent

Database hiện tại đã đủ để xây một hệ thống thương mại điện tử kiểu Shopee Lite ở mức khá đầy đủ. Khi triển khai chức năng, agent cần đặc biệt chú ý bốn điểm:

1. Đơn hàng phải tách theo shop bằng `order_shop_groups`.
2. Tồn kho chỉ lấy từ `inventory`, không tự thêm stock ở nơi khác.
3. Mọi phép tính tiền phải khớp với các ràng buộc `CHECK`.
4. Review, return và refund phải dựa trên order item thật để tránh dữ liệu giả hoặc thao tác sai quyền.
