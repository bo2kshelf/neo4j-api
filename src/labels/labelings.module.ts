import {Module} from '@nestjs/common';
import {BooksModule} from '../books/books.module';
import {LabelsModule} from './labels.module';
import {LabelingsResolver} from './resolvers/labeling.resolver';

@Module({
  imports: [BooksModule, LabelsModule],
  providers: [LabelingsResolver],
  exports: [],
})
export class LabelingsModule {}
