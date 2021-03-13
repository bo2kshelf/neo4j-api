import {Resolver} from '@nestjs/graphql';
import {UserEntity} from './users.entity';
import {UsersService} from './users.service';

@Resolver(() => UserEntity)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}
}
