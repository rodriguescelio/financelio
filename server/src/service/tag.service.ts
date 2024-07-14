import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from 'src/model/entity/tag.entity';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    private readonly authService: AuthService,
  ) {}

  async findAll(): Promise<Tag[]> {
    return await this.tagRepository.findBy({
      account: {
        id: this.authService.sessionAccount.id,
      },
    });
  }

  async persist(tag: Tag): Promise<Tag> {
    const tagDB = tag.id
      ? await this.tagRepository.findOneBy({ id: tag.id })
      : new Tag();

    tagDB.label = tag.label;

    if (!tag.id) {
      tagDB.account = this.authService.sessionAccount;
    }

    await this.tagRepository.save(tagDB);

    return tagDB;
  }

  async delete(tagId: string): Promise<void> {
    const tag = await this.tagRepository.findOneBy({
      account: {
        id: this.authService.sessionAccount.id,
      },
      id: tagId,
    });

    if (!tag) {
      throw new HttpException('Invalid request!', HttpStatus.BAD_REQUEST);
    }

    await this.tagRepository.remove(tag);
  }
}
