import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { createHash } from 'crypto';
import { User } from './users/entities/user.entity';
import { Role } from './users/entities/role.entity';
import { UserRole } from './users/entities/user-role.entity';

@Injectable()
export class DatabaseSeedService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSeedService.name);

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRole) private readonly userRoleRepository: Repository<UserRole>,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    await this.ensureShopStatusConstraint();
    await this.seedRoles();
    await this.seedDefaultUsers();
  }

  private async seedRoles() {
    const defaultRoles = ['Admin', 'Seller', 'Customer'];
    for (const roleName of defaultRoles) {
      const existing = await this.roleRepository.findOne({ where: { role_name: roleName } });
      if (!existing) {
        await this.roleRepository.save({ role_name: roleName });
        this.logger.log(`Seeded role: ${roleName}`);
      }
    }
  }

  private async seedDefaultUsers() {
    const accounts = [
      {
        email: 'admin@lumina.com',
        full_name: 'Lumina Administrator',
        phone: '0987654321',
        password: 'admin123',
        roles: ['Admin', 'Customer'],
      },
      {
        email: 'seller@lumina.com',
        full_name: 'Alex Mercer (Lumina Seller)',
        phone: '0912345678',
        password: 'seller123',
        roles: ['Seller', 'Customer'],
      },
      {
        email: 'buyer@lumina.com',
        full_name: 'Emma Watson (Default Buyer)',
        phone: '0901234567',
        password: 'buyer123',
        roles: ['Customer'],
      },
    ];

    for (const account of accounts) {
      const existing = await this.userRepository.findOne({ where: { email: account.email } });
      if (!existing) {
        const password_hash = this.hashPassword(account.password);
        const newUser = this.userRepository.create({
          full_name: account.full_name,
          email: account.email,
          phone: account.phone,
          password_hash,
          status: 'ACTIVE',
        });
        const savedUser = await this.userRepository.save(newUser);
        await this.ensureRoles(savedUser.user_id, account.roles);
        this.logger.log(`Seeded user: ${account.email}`);
      }
    }
  }

  private async ensureRoles(user_id: string, roleNames: string[]) {
    for (const roleName of roleNames) {
      const role = await this.roleRepository.findOne({ where: { role_name: roleName } });
      if (!role) continue;
      const existing = await this.userRoleRepository.findOne({ where: { user_id, role_id: role.role_id } });
      if (!existing) {
        await this.userRoleRepository.save({ user_id, role_id: role.role_id });
      }
    }
  }

  private async ensureShopStatusConstraint() {
    try {
      const exists = await this.dataSource.query(
        `SELECT 1 FROM pg_constraint WHERE conname = 'shops_status_check' AND conrelid = 'public.shops'::regclass`,
      );

      if (exists.length) {
        await this.dataSource.query(`ALTER TABLE shops DROP CONSTRAINT IF EXISTS shops_status_check`);
      }

      await this.dataSource.query(
        `ALTER TABLE shops ADD CONSTRAINT shops_status_check CHECK (status IN ('ACTIVE','INACTIVE','BANNED','PENDING'))`,
      );
      this.logger.log('Ensured shops.status constraint allows PENDING');
    } catch (error) {
      this.logger.warn(`Unable to update shops status constraint: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private hashPassword(password: string) {
    return createHash('sha256').update(password).digest('hex');
  }
}
