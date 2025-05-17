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
    offset: number = 0,
    sort?: { by: 'name' | 'date'; order: 'asc' | 'desc' }[]
  ) {
    // Приведение sort к массиву (устраняет ошибку sort.map is not a function)
    if (!Array.isArray(sort)) {
      sort = sort ? [sort] : [];
    }

    const results = {
      projects: [],
      tasks: [],
      clients: [],
      users: [],
    };

    // Вспомогательная функция мультисортировки
    function multiSort(arr: any[], sortArr: { by: string; order: 'asc' | 'desc' }[]) {
      if (!arr || !arr.length || !sortArr || !sortArr.length) return arr;
      // Оставляем только валидные критерии сортировки
      const validSortArr = sortArr.filter(s => s.by === 'name' || s.by === 'date');
      if (!validSortArr.length) return arr;
      return arr.sort((a, b) => {
        for (const sortItem of validSortArr) {
          let aValue, bValue;
          if (sortItem.by === 'name') {
            aValue = a.title !== undefined ? a.title : a.name;
            bValue = b.title !== undefined ? b.title : b.name;
          } else if (sortItem.by === 'date') {
            aValue = a.createdAt;
            bValue = b.createdAt;
          } else {
            continue;
          }
          if (aValue === undefined || bValue === undefined) continue;
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
          }
          if (aValue < bValue) return sortItem.order === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortItem.order === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

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
      if (sort && sort.length) {
        // Для проектов: name → name, date → createdAt
        results.projects = multiSort(
          results.projects,
          sort.map(s => ({
            by: s.by === 'name' ? 'name' : 'createdAt',
            order: s.order,
          }))
        );
      }
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
      if (sort && sort.length) {
        // Для задач: name → title, date → createdAt
        results.tasks = multiSort(
          results.tasks,
          sort.map(s => ({
            by: s.by === 'name' ? 'title' : 'createdAt',
            order: s.order,
          }))
        );
      }
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
      if (sort && sort.length) {
        // Для клиентов: name → name, date → createdAt
        results.clients = multiSort(
          results.clients,
          sort.map(s => ({
            by: s.by === 'name' ? 'name' : 'createdAt',
            order: s.order,
          }))
        );
      }
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
      if (sort && sort.length) {
        // Для пользователей: name → name, date → createdAt
        results.users = multiSort(
          results.users,
          sort.map(s => ({
            by: s.by === 'name' ? 'name' : 'createdAt',
            order: s.order,
          }))
        );
      }
    }

    return results;
  }
}
