import { Injectable, NotFoundException } from '@nestjs/common';
import { ProjectsService } from '../projects/projects.service';
import { TasksService } from '../tasks/tasks.service';
import { ClientsService } from '../clients/clients.service';
import { UsersService } from '../users/users.service'; // Импортируем UsersService
import { User } from '../../entities/user.entity';
import { ErrorMessages } from '../../common/error-messages';

@Injectable()
export class SearchService {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly tasksService: TasksService,
    private readonly clientsService: ClientsService,
    private readonly usersService: UsersService // Добавляем UsersService в конструктор
  ) {}

  async search(user: User, searchTerm: string) {
    // Поиск проектов, задач, клиентов и пользователей, связанных с пользователем
    const projects = await this.projectsService.findByUserIdAndSearchTerm(
      user.user_id,
      searchTerm
    );
    const tasks = await this.tasksService.findByUserIdAndSearchTerm(
      user.user_id,
      searchTerm
    );
    const clients = await this.clientsService.findByUserIdAndSearchTerm(
      user.user_id,
      searchTerm
    );
    const users = await this.usersService.searchUsers({ searchTerm }); // Поиск пользователей

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
}
