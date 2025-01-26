import { Entity } from 'typeorm';
import { ProjectDto } from './project.dto.js';

@Entity()
export class CreateProjectDto extends ProjectDto {

}
