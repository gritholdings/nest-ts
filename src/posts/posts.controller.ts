import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { SessionUser } from '../auth/auth.service';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  /** Create a post owned by the logged-in user. */
  @UseGuards(AuthenticatedGuard)
  @Post()
  create(@Body() dto: CreatePostDto, @Req() req: Request) {
    return this.posts.create(dto, (req.user as SessionUser).id);
  }

  @Get()
  findAll() {
    return this.posts.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.posts.findOne(id);
  }

  /** Update a post — only its author may do so. */
  @UseGuards(AuthenticatedGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePostDto,
    @Req() req: Request,
  ) {
    return this.posts.update(id, dto, (req.user as SessionUser).id);
  }

  /** Delete a post — only its author may do so. */
  @UseGuards(AuthenticatedGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.posts.remove(id, (req.user as SessionUser).id);
  }
}
