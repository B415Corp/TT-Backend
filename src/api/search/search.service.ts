import { Injectable } from '@nestjs/common';
import { ProjectsService } from '../projects/projects.service';
import { TasksService } from '../tasks/tasks.service';
import { ClientsService } from '../clients/clients.service';
import { User } from '../../entities/user.entity';

@Injectable()
export class SearchService {
    constructor(
        private readonly projectsService: ProjectsService,
        private readonly tasksService: TasksService,
        private readonly clientsService: ClientsService,
    ) { }

    async search(user: User, searchTerm: string) {
        // Search for projects, tasks, and clients related to the user
        const projects = await this.projectsService.findByUserIdAndSearchTerm(user.user_id, searchTerm);
        const tasks = await this.tasksService.findByUserIdAndSearchTerm(user.user_id, searchTerm);
        const clients = await this.clientsService.findByUserIdAndSearchTerm(user.user_id, searchTerm);

        return {
            projects,
            tasks,
            clients,
        };
    }
}