import {Module} from '@nestjs/common';
import {IDModule} from '../id/id.module';
import {AuthorsResolver} from './authors.resolver';
import {AuthorsService} from './authors.service';

@Module({
  imports: [IDModule],
  providers: [AuthorsService, AuthorsResolver],
  exports: [AuthorsService],
})
export class AuthorsModule {}
