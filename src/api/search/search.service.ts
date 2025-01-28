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
        const projects = await this.projectsService.findByUserIdAndSearchTerm(user.user_id, searchTerm);
        const tasks = await this.tasksService.findByUserIdAndSearchTerm(user.user_id, searchTerm);
        const clients = await this.clientsService.findByUserIdAndSearchTerm(user.user_id, searchTerm);

        // Fetch related entities for each found project, task, and client
        const projectDetails = await Promise.all(projects.map(async project => {
            return {
                ...project,
                // Add any related data you want to include
                // e.g., related tasks or clients
            };
        }));

        const taskDetails = await Promise.all(tasks.map(async task => {
            return {
                ...task,
                // Add any related data you want to include
            };
        }));

        const clientDetails = await Promise.all(clients.map(async client => {
            return {
                ...client,
                // Add any related data you want to include
            };
        }));

        return {
            projects: projectDetails,
            tasks: taskDetails,
            clients: clientDetails,
        };
    }
}