import { Global, Module } from '@nestjs/common';
import { db } from './index';

export const DATABASE = 'DATABASE';

@Global()
@Module({
  providers: [{ provide: DATABASE, useValue: db }],
  exports: [DATABASE],
})
export class DatabaseModule {}
