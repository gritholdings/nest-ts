import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

/** Attach a lightweight author summary to every post returned. */
const withAuthor = {
  author: { select: { id: true, name: true, email: true } },
} satisfies Prisma.PostInclude;

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreatePostDto, authorId: number) {
    return this.prisma.post.create({
      data: { ...dto, authorId },
      include: withAuthor,
    });
  }

  findAll() {
    return this.prisma.post.findMany({
      include: withAuthor,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: withAuthor,
    });
    if (!post) {
      throw new NotFoundException(`Post ${id} not found`);
    }
    return post;
  }

  async update(id: number, dto: UpdatePostDto, userId: number) {
    await this.assertOwnership(id, userId);
    return this.prisma.post.update({
      where: { id },
      data: dto,
      include: withAuthor,
    });
  }

  async remove(id: number, userId: number) {
    await this.assertOwnership(id, userId);
    await this.prisma.post.delete({ where: { id } });
    return { deleted: true };
  }

  /** 404 if the post is missing, 403 if the requester is not its author. */
  private async assertOwnership(id: number, userId: number): Promise<void> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: { authorId: true },
    });
    if (!post) {
      throw new NotFoundException(`Post ${id} not found`);
    }
    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only modify your own posts');
    }
  }
}
