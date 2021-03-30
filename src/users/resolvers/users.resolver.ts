import {Resolver} from '@nestjs/graphql';
import {UserEntity} from '../entities/users.entity';
import {UsersService} from '../services/users.service';

@Resolver(() => UserEntity)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}
}
