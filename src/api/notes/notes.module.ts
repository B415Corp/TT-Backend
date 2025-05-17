import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notes } from '../../entities/notes.entity.js';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';


@Module({
  imports: [TypeOrmModule.forFeature([Notes])],
  providers: [NotesService],
  exports: [NotesService],
  controllers: [NotesController],
})
export class NotesModule {}
