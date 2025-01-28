import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Currency } from 'src/entities/currency.entity';
import { Project } from 'src/entities/project.entity';
import { ProjectsModule } from '../projects/projects.module';
import { TasksModule } from '../tasks/tasks.module';
import { ClientsModule } from '../clients/clients.module';

@Module({
    imports: [
        ProjectsModule,
        TasksModule,
        ClientsModule,
    ],
    providers: [SearchService],
    exports: [SearchService],
    controllers: [SearchController],
})
export class SearchModule {}