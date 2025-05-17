import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notes } from '../../entities/notes.entity.js';
import { CreateNotesDto } from './dto/create-notes.dto.js';
import { UpdateNotesDto } from './dto/update-notes.dto.js';
import { PaginationQueryDto } from 'src/common/pagination/pagination-query.dto.js';

@Injectable()
export class NotesService {
  @InjectRepository(Notes)
  private notesRepository: Repository<Notes>;

  async create(note: CreateNotesDto, user_id: string): Promise<Notes> {
    const newNote = this.notesRepository.create({ ...note, user_id });
    return this.notesRepository.save(newNote);
  }

  async findAll(user_id: string, paginationQuery: PaginationQueryDto) {
    const { page, limit } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, total] = await this.notesRepository.findAndCount({
      where: { user_id },
      skip,
      take: limit,
      order: { created_at: 'DESC' },
      select: {
        notes_id: true,
        name: true,
        text_content: true,
        created_at: true,
        updated_at: true,
      },
    });

    return [data, total];
  }

  async findOne(notes_id: string, user_id: string): Promise<Notes> {
    return this.notesRepository.findOne({
      where: { notes_id, user_id },
      order: { created_at: 'DESC' },
      select: {
        notes_id: true,
        name: true,
        text_content: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async update(notes_id: string, updateData: UpdateNotesDto): Promise<Notes> {
    await this.notesRepository.update(notes_id, updateData);
    return this.notesRepository.findOneBy({ notes_id });
  }

  async remove(id: string): Promise<void> {
    await this.notesRepository.delete(id);
  }
}
