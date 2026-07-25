import assert from 'node:assert/strict';
import { ShopsService } from '../src/shops/shops.service';

(async () => {
  const repository = {
    findOne: async () => null,
    create: (data: any) => data,
    save: async (data: any) => data,
  };

  const service = new ShopsService(repository as any);
  const created = await service.create({
    owner_id: '11111111-1111-1111-1111-111111111111',
    shop_name: 'Regression Shop',
    description: 'Test pending approval flow',
    status: 'PENDING',
  } as any);

  assert.equal(created.status, 'PENDING');
  console.log('Shop service regression passed');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
