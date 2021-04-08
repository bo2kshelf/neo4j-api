import {Args, Parent, ResolveField, Resolver} from '@nestjs/graphql';
import {UserEntity} from '../../users/entities/users.entity';
import {RecordsService} from '../services/records.service';
import {
  ResolveUsersReadBooksArgs,
  ResolveUsersReadBooksReturnEntity,
} from './dto/resolve-users-read-books.dto';
import {
  ResolveUsersRecordsArgs,
  ResolveUsersRecordsReturnEntity,
} from './dto/resolve-users-records.dto';

@Resolver(() => UserEntity)
export class UsersResolver {
  constructor(private readonly recordsService: RecordsService) {}

  @ResolveField(() => ResolveUsersRecordsReturnEntity)
  async records(
    @Parent() {id: userId}: UserEntity,
    @Args({type: () => ResolveUsersRecordsArgs})
    args: ResolveUsersRecordsArgs,
  ): Promise<ResolveUsersRecordsReturnEntity> {
    return this.recordsService.getRecordsFromUser(userId, args);
  }

  @ResolveField(() => ResolveUsersReadBooksReturnEntity)
  async readBooks(
    @Parent() {id: userId}: UserEntity,
    @Args({type: () => ResolveUsersReadBooksArgs})
    args: ResolveUsersReadBooksArgs,
  ): Promise<ResolveUsersReadBooksReturnEntity> {
    return this.recordsService.getReadBooksFromUser(userId, args);
  }
}
