import { Module } from '@nestjs/common';
import {MongooseModule} from "@nestjs/mongoose";
import {ResultType, ResultTypeSchema, Result, ResultSchema} from "../../shared/schemas/result.schema";
import {ResultTypeController} from "./result-type.controller";
import {ResultTypeService} from "./result-type.service";
import {CountersModule} from "../counters/counters.module";
import {UsersModule} from "../users/users.module";


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ResultType.name, schema: ResultTypeSchema },
      { name: Result.name, schema: ResultSchema },
    ]),
    CountersModule,
    UsersModule
  ],
  controllers: [ResultTypeController],
  providers: [ResultTypeService],
  exports: [ResultTypeService]
})
export class ResultTypeModule { }
