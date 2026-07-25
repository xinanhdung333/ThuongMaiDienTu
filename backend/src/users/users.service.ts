import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Address } from './entities/address.entity';
import { UserRole } from './entities/user-role.entity';
import { Role } from './entities/role.entity';
import { createHash } from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Address) private readonly addressRepository: Repository<Address>,
    @InjectRepository(UserRole) private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
  ) {}

  async findAll(role?: string) {
    const users = await this.userRepository.find({ relations: ['roles', 'roles.role', 'addresses'] });
    return users.map((u: any) => ({
      ...u,
      roles: (u.roles || []).map((ur: any) => (ur?.role ? ur.role.role_name : ur)),
    }));
  }

  async findByEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email }, relations: ['roles', 'roles.role', 'addresses'] });
    if (!user) return null;
    return { ...user, roles: (user.roles || []).map((ur: any) => (ur?.role ? ur.role.role_name : ur)) };
  }

  async findOne(user_id: string) {
    const user = await this.userRepository.findOne({ where: { user_id }, relations: ['roles', 'roles.role', 'addresses'] });
    if (!user) throw new NotFoundException('User not found');
    return { ...user, roles: (user.roles || []).map((ur: any) => (ur?.role ? ur.role.role_name : ur)) };
  }

  async create(userData: Partial<User> & { roles?: string[] }) {
    const password_hash = this.hashPassword(userData.password_hash || '123456');
    const newUser = this.userRepository.create({ ...userData, password_hash, status: 'ACTIVE' });
    const savedUser = await this.userRepository.save(newUser);

    await this.ensureRoles(savedUser.user_id, userData.roles || ['Customer']);

    return this.findOne(savedUser.user_id);
  }

  private async ensureRoles(user_id: string, roles: string[]) {
    for (const roleName of roles) {
      const role = await this.roleRepository.findOne({ where: { role_name: roleName } });
      if (!role) continue;
      const exists = await this.userRoleRepository.findOne({ where: { user_id, role_id: role.role_id } });
      if (!exists) {
        const userRole = this.userRoleRepository.create({ user_id, role_id: role.role_id });
        await this.userRoleRepository.save(userRole);
      }
    }
  }

  private hashPassword(password: string) {
    return createHash('sha256').update(password).digest('hex');
  }

  async update(user_id: string, patch: Partial<User>) {
    await this.userRepository.update({ user_id }, patch);
    return this.findOne(user_id);
  }

  async delete(user_id: string) {
    const user = await this.findOne(user_id);
    return this.userRepository.remove(user);
  }

  async assignRole(user_id: string, roleName: string) {
    const role = await this.roleRepository.findOne({ where: { role_name: roleName } });
    if (!role) throw new NotFoundException('Role not found');
    const userRole = this.userRoleRepository.create({ user_id, role_id: role.role_id });
    return this.userRoleRepository.save(userRole);
  }

  async removeRole(user_id: string, roleName: string) {
    const role = await this.roleRepository.findOne({ where: { role_name: roleName } });
    if (!role) throw new NotFoundException('Role not found');
    await this.userRoleRepository.delete({ user_id, role_id: role.role_id });
    return { deleted: true };
  }

  async addAddress(user_id: string, addressData: Partial<Address>) {
    const address = this.addressRepository.create({ ...addressData, user_id });
    return this.addressRepository.save(address);
  }
}
