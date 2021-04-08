import {Module} from '@nestjs/common';
import {IDModule} from '../common/id/id.module';
import {BooksResolver} from './resolvers/books.resolver';
import {LabelsResolver} from './resolvers/labels.resolver';
import {LabelsService} from './services/labels.service';

@Module({
  imports: [IDModule],
  providers: [LabelsService, LabelsResolver, BooksResolver],
  exports: [LabelsService],
})
export class LabelsModule {}
