import {Module} from '@nestjs/common';
import {AccontResolver} from './accounts.resolver';
import {AccountsService} from './accounts.service';

@Module({
  imports: [],
  providers: [AccountsService, AccontResolver],
  exports: [AccountsService],
})
export class AccountsModule {}
