import {Module} from '@nestjs/common';
import {IDModule} from '../id/id.module';
import {PublishersService} from './publishers.service';
import {PublicationsResolver} from './resolvers/publications.resolver';
import {PublishersResolver} from './resolvers/publishers.resolver';

@Module({
  imports: [IDModule],
  providers: [PublishersService, PublishersResolver, PublicationsResolver],
  exports: [PublishersService],
})
export class PublishersModule {}
