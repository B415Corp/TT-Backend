import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../../entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
    constructor(
        @InjectRepository(Tag)
        private tagsRepository: Repository<Tag>,
    ) { }

    async create(createTagDto: CreateTagDto, user_id: string): Promise<Tag> {
        // Check if a tag with the same name already exists
        const existingTag = await this.tagsRepository.findOne({ where: { name: createTagDto.name } });
        if (existingTag) {
            throw new ConflictException(`Тег с именем "${createTagDto.name}" уже существует`);
        }

        const tag = this.tagsRepository.create({ ...createTagDto, user_id });
        return this.tagsRepository.save(tag);
    }

    findAll(): Promise<Tag[]> {
        return this.tagsRepository.find();
    }

    findOne(id: string): Promise<Tag> {
        return this.tagsRepository.findOneBy({ tag_id: id });
    }

    async findByUserId(user_id: string): Promise<Tag[]> {
        const tags = await this.tagsRepository.find({ where: { user_id } });
        if (!tags.length) {
            throw new NotFoundException(`Теги для пользователя с ID "${user_id}" не найдены`);
        }
        return tags;
    }

    async update(id: string, updateTagDto: UpdateTagDto, user_id: string): Promise<Tag> {
        const tag = await this.tagsRepository.findOneBy({ tag_id: id });
        if (!tag) {
            throw new NotFoundException(`Тег с ID "${id}" не найден`);
        }

        // Check if the tag belongs to the user
        if (tag.user_id !== user_id) {
            throw new ConflictException(`Вы не можете редактировать этот тег`);
        }

        // Update the tag
        const updatedTag = this.tagsRepository.merge(tag, updateTagDto);
        return this.tagsRepository.save(updatedTag);
    }

    async remove(id: string, user_id: string): Promise<void> {
        const tag = await this.tagsRepository.findOneBy({ tag_id: id });
        if (!tag) {
            throw new NotFoundException(`Тег с ID "${id}" не найден`);
        }

        // Check if the tag belongs to the user
        if (tag.user_id !== user_id) {
            throw new ConflictException(`Вы не можете удалить этот тег`);
        }

        await this.tagsRepository.delete(id);
    }
} 