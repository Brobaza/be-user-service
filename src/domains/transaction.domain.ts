import { Injectable } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
@Injectable()
export class TransactionDomain {
  constructor(private readonly dataSource: DataSource) {}

  async withTransaction<T>(fn: (queryRunner: QueryRunner) => Promise<T>) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      const result = await fn(queryRunner);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
