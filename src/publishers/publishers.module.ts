import {Module} from '@nestjs/common';
import {IDModule} from '../common/id/id.module';
import {BookResolver} from './resolvers/books.resolver';
import {PublishersResolver} from './resolvers/publishers.resolver';
import {PublishersService} from './services/publishers.service';

@Module({
  imports: [IDModule],
  providers: [PublishersService, PublishersResolver, BookResolver],
  exports: [PublishersService],
})
export class PublishersModule {}
