import { Module } from '@nestjs/common';
import {MongooseModule} from "@nestjs/mongoose";
import {ResultType, ResultTypeSchema} from "../../shared/schemas/result.schema";
import {ResultTypeController} from "./result-type.controller";
import {ResultTypeService} from "./result-type.service";


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ResultType.name, schema: ResultTypeSchema },
    ]),
  ],
  controllers: [ResultTypeController],
  providers: [ResultTypeService],
  exports: [ResultTypeService]
})
export class ResultTypeModule { }
