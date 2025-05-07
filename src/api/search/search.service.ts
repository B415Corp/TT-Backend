import { Injectable, NotFoundException } from '@nestjs/common';
import { ProjectsService } from '../projects/projects.service';
import { TasksService } from '../tasks/tasks.service';
import { ClientsService } from '../clients/clients.service';
import { UsersService } from '../users/users.service'; // Импортируем UsersService
import { User } from '../../entities/user.entity';
import { ErrorMessages } from '../../common/error-messages';
import { SEARCH_LOCATION } from 'src/common/enums/search-location.enum';

@Injectable()
export class SearchService {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly tasksService: TasksService,
    private readonly clientsService: ClientsService,
    private readonly usersService: UsersService
  ) {}

  async search(
    user: User,
    searchTerm: string,
    maxResults: number = 5,
    offset: number = 0
  ) {
    // Поиск проектов, задач, клиентов и пользователей, связанных с пользователем
    const projects = await this.projectsService.findByUserIdAndSearchTerm(
      user.user_id,
      searchTerm,
      maxResults,
      offset
    );
    const tasks = await this.tasksService.findByUserIdAndSearchTerm(
      user.user_id,
      searchTerm,
      maxResults,
      offset
    );
    const clients = await this.clientsService.findByUserIdAndSearchTerm(
      user.user_id,
      searchTerm,
      maxResults,
      offset
    );
    const users = await this.usersService.searchUsers(
      { searchTerm },
      maxResults,
      offset
    ); // Поиск пользователей

    if (!projects && !tasks && !clients && !users.length) {
      // Проверяем наличие пользователей
      throw new NotFoundException(ErrorMessages.NO_TASKS_FOUND);
    }

    return {
      projects,
      tasks,
      clients,
      users, // Возвращаем найденных пользователей
    };
  }

  async searchV2(
    user: User,
    searchTerm: string,
    searchLocation: SEARCH_LOCATION = SEARCH_LOCATION.ALL,
    maxResults: number = 5,
    offset: number = 0
  ) {
    const results = {
      projects: [],
      tasks: [],
      clients: [],
      users: [],
    };

    if (
      searchLocation === SEARCH_LOCATION.ALL ||
      searchLocation === SEARCH_LOCATION.PROJECTS
    ) {
      results.projects = await this.projectsService.findByUserIdAndSearchTerm(
        user.user_id,
        searchTerm,
        maxResults,
        offset
      );
    }
    if (
      searchLocation === SEARCH_LOCATION.ALL ||
      searchLocation === SEARCH_LOCATION.TASKS
    ) {
      results.tasks = await this.tasksService.findByUserIdAndSearchTerm(
        user.user_id,
        searchTerm,
        maxResults,
        offset
      );
    }
    if (
      searchLocation === SEARCH_LOCATION.ALL ||
      searchLocation === SEARCH_LOCATION.CLIENTS
    ) {
      results.clients = await this.clientsService.findByUserIdAndSearchTerm(
        user.user_id,
        searchTerm,
        maxResults,
        offset
      );
    }
    if (
      searchLocation === SEARCH_LOCATION.ALL ||
      searchLocation === SEARCH_LOCATION.USERS
    ) {
      results.users = await this.usersService.searchUsers(
        { searchTerm },
        maxResults,
        offset
      );
    }

    return results;
  }
}
