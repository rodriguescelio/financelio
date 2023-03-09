import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { Category } from 'src/model/entity/category.entity';
import { CategoryService } from 'src/service/category.service';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('findAll')
  async findAll(): Promise<Category[]> {
    return this.categoryService.findAll();
  }

  @Post('persist')
  persist(@Body() category: Category): Promise<Category> {
    return this.categoryService.persist(category);
  }

  @Delete('delete/:id')
  delete(@Param() params): Promise<void> {
    return this.categoryService.delete(params.id);
  }
}
