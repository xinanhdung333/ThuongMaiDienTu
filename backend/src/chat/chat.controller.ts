import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversation')
  findConversation(@Query('userA') userA: string, @Query('userB') userB: string) {
    return this.chatService.findConversation(userA, userB);
  }

  @Get('unread')
  findUnread(@Query('user_id') user_id: string) {
    return this.chatService.findUnread(user_id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatService.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.chatService.create(body);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string) {
    return this.chatService.markRead(id);
  }
}
