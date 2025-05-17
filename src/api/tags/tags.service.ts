import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../../entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { ErrorMessages } from '../../common/error-messages';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>
  ) {}

  async create(createTagDto: CreateTagDto, user_id: string): Promise<Tag> {
    const existingTag = await this.tagsRepository.findOneBy({
      name: createTagDto.name,
    });
    if (existingTag) {
      throw new ConflictException(
        ErrorMessages.TAG_ALREADY_EXISTS(createTagDto.name)
      );
    }

    const tag = this.tagsRepository.create({ ...createTagDto, user_id });
    return this.tagsRepository.save(tag);
  }

  findAll(): Promise<Tag[]> {
    return this.tagsRepository.find();
  }

  async findOne(id: string): Promise<Tag> {
    const tag = await this.tagsRepository.findOneBy({ tag_id: id });
    if (!tag) {
      throw new NotFoundException(ErrorMessages.TAG_NOT_FOUND(id));
    }
    return tag;
  }

  async findByUserId(user_id: string): Promise<Tag[]> {
    const tags = await this.tagsRepository.find({ where: { user_id } });
    if (!tags.length) {
      throw new NotFoundException(ErrorMessages.TAG_NOT_FOUND(user_id));
    }
    return tags;
  }

  async update(
    id: string,
    updateTagDto: UpdateTagDto,
    user_id: string
  ): Promise<Tag> {
    const tag = await this.tagsRepository.findOneBy({ tag_id: id });
    if (!tag) {
      throw new NotFoundException(ErrorMessages.TAG_NOT_FOUND(id));
    }

    if (tag.user_id !== user_id) {
      throw new ConflictException(ErrorMessages.UNAUTHORIZED);
    }

    const updatedTag = this.tagsRepository.merge(tag, updateTagDto);
    return this.tagsRepository.save(updatedTag);
  }

  async remove(id: string, user_id: string): Promise<void> {
    const tag = await this.tagsRepository.findOneBy({ tag_id: id });
    if (!tag) {
      throw new NotFoundException(ErrorMessages.TAG_NOT_FOUND(id));
    }

    if (tag.user_id !== user_id) {
      throw new ConflictException(ErrorMessages.UNAUTHORIZED);
    }

    await this.tagsRepository.delete(id);
  }
}
