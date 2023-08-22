import { User } from 'src/shared/schemas/user.schema';
import { UserDTO } from './types.dto';
import { Ref } from 'src/shared/dtos/ref';

export interface RolesDTO {
  author?: RoleDetail;
  reviewer?: RoleDetail;
  history: [RoleDetail];
}

interface RoleDetail {
  by: Ref<UserDTO>;
  date: Date;
}

interface History extends RoleDetail {
  type: string;
  value?: string;
}

export function migrateRoles(obj: any, users) {
  const userUpdated: User = users.find((user) => {
    return user.oldId == obj.user_updated;
  });
  const userCreated: User = users.find((user) => {
    return user.oldId == obj.user_created;
  });
  const roles = {
    author: undefined,
    reviewer: undefined,
    history: [],
  };
  if (userCreated) {
    roles.author = {
      by: userCreated._id,
      date: obj.date_created,
    };
    roles.reviewer = roles.author;
    roles.history.push({
      by: userCreated._id,
      date: obj.date_created,
      eventType: 'CREATED',
    });
  }
  if (userUpdated) {
    roles.reviewer = {
      by: userUpdated._id,
      date: obj.date_created,
    };
    roles.history.push({
      by: userUpdated._id,
      date: obj.date_updated,
      eventType: 'UPDATED',
      value: 'Last update by Directus UI',
    });
  }
  return roles;
}
