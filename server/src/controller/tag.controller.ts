import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { Tag } from 'src/model/entity/tag.entity';
import { TagService } from 'src/service/tag.service';

@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get('findAll')
  async findAll(): Promise<Tag[]> {
    return this.tagService.findAll();
  }

  @Post('persist')
  persist(@Body() tag: Tag): Promise<Tag> {
    return this.tagService.persist(tag);
  }

  @Delete('delete/:id')
  delete(@Param() params): Promise<void> {
    return this.tagService.delete(params.id);
  }
}
