import {Module} from '@nestjs/common';
import {BookResolver} from './resolvers/books.resolver';
import {PublishersResolver} from './resolvers/publishers.resolver';
import {PublishersService} from './services/publishers.service';

@Module({
  providers: [PublishersService, PublishersResolver, BookResolver],
  exports: [PublishersService],
})
export class PublishersModule {}
