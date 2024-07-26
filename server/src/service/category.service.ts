import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/model/entity/category.entity';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private readonly authService: AuthService,
  ) {}

  async findAll(): Promise<Category[]> {
    return await this.categoryRepository.findBy({
      account: {
        id: this.authService.sessionAccount.id,
      },
    });
  }

  async persist(category: Category): Promise<Category> {
    const categoryDB = category.id
      ? await this.categoryRepository.findOneBy({ id: category.id })
      : new Category();

    categoryDB.label = category.label;

    if (!category.id) {
      categoryDB.account = this.authService.sessionAccount;
    }

    await this.categoryRepository.save(categoryDB);

    return categoryDB;
  }

  async delete(categoryId): Promise<void> {
    const category = await this.categoryRepository.findOneBy({
      account: {
        id: this.authService.sessionAccount.id,
      },
      id: categoryId,
    });

    if (!category) {
      throw new HttpException('Invalid request!', HttpStatus.BAD_REQUEST);
    }

    await this.categoryRepository.remove(category);
  }
}
