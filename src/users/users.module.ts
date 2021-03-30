import {Module} from '@nestjs/common';
import {UsersResolver} from './resolvers/users.resolver';
import {UsersService} from './services/users.service';

@Module({
  imports: [],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
