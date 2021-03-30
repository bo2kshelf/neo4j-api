import {Module} from '@nestjs/common';
import {IDModule} from '../id/id.module';
import {AuthorsResolver} from './resolvers/authors.resolver';
import {AuthorsService} from './services/authors.service';

@Module({
  imports: [IDModule],
  providers: [AuthorsService, AuthorsResolver],
  exports: [AuthorsService],
})
export class AuthorsModule {}
