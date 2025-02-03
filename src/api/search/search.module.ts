import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { ProjectsModule } from '../projects/projects.module';
import { TasksModule } from '../tasks/tasks.module';
import { ClientsModule } from '../clients/clients.module';

@Module({
  imports: [ProjectsModule, TasksModule, ClientsModule],
  providers: [SearchService],
  exports: [SearchService],
  controllers: [SearchController],
})
export class SearchModule {}
