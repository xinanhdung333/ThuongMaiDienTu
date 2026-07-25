import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getUsers(@Query('role') role?: string) {
    return this.usersService.findAll(role);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto as any);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }

  @Post(':id/roles')
  assignRole(@Param('id') id: string, @Body('role') role: string) {
    return this.usersService.assignRole(id, role);
  }

  @Delete(':id/roles')
  removeRole(@Param('id') id: string, @Body('role') role: string) {
    return this.usersService.removeRole(id, role);
  }

  @Post(':id/addresses')
  addAddress(@Param('id') id: string, @Body() body: any) {
    return this.usersService.addAddress(id, body);
  }
}
