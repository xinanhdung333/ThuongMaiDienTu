import React from 'react';
import { useParams } from 'react-router-dom';

export const ProductEditor: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">{productId ? 'Chỉnh sửa sản phẩm' : 'Tạo sản phẩm mới'}</h1>
      <div className="mt-4">
        <p>Form tạo/chỉnh sửa sản phẩm (placeholder). Thêm fields: tên, mô tả, biến thể, ảnh, giá, tồn kho.</p>
      </div>
    </div>
  );
};

export default ProductEditor;
