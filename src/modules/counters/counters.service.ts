import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Counter,
  CountersDocument as CounterDocument,
} from 'src/shared/schemas/counters.schema';
import { Model } from 'mongoose';

@Injectable()
export class CounterService {
  constructor(
    @InjectModel(Counter.name) private countersModel: Model<CounterDocument>,
  ) {}
  public async getNextSequenceValue(sequenceName: string) {
    const sequenceDocument =
      await this.countersModel.findByIdAndUpdate<Counter>(
        sequenceName,
        {
          $inc: { sequence_value: 1 },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
    return sequenceDocument.sequence_value;
  }
  public async deleteSequenzDocument(sequenceName: string) {
    await this.countersModel.findOneAndDelete({_id: sequenceName}).exec();
  }
  public async setMaxSequenceValue(
    sequenceName: string,
    value: number,
  ): Promise<number> {
    await this.countersModel.findByIdAndUpdate<Counter>(
      sequenceName,
      {
        $max: { sequence_value: value },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    return value;
  }
}
