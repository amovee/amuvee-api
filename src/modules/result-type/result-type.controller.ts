import {Controller, Get, Delete, Put, Body, Param, Post, UseGuards, Query} from '@nestjs/common';
import { ResultTypeService } from './result-type.service';
import {CreateResultTypeDTO, UpdateResultTypeDTO} from "../../shared/dtos/results.dto";
import {ApiBearerAuth, ApiParam, ApiTags, ApiBody, ApiQuery} from "@nestjs/swagger";
import {Right} from "../auth/rights/rights.decorator";
import {RightsGuard} from "../auth/rights/rights.guard";
import {JwtAuthGuard} from "../auth/jwt/jwt-auth.guard";
import {CreateResultTypeDTOAPI} from "../../shared/dtos/types.dto";


@ApiTags('ResultType')
@Controller('result-type')
export class ResultTypeController {
  constructor(private readonly resultTypeService: ResultTypeService) {}

  @Get()
  @ApiQuery({ name: 'limit', required: false, type: Number})
  @ApiQuery({ name: 'skip', required: false, type: Number })
  async getAllResultTypes(@Query('limit') limit = 10, @Query('skip') skip = 0) {
    return this.resultTypeService.getAllResultTypes(limit, skip);
  }

  @Get('counter')
  async getCount(): Promise<{totalCount: number}> {
    return await this.resultTypeService.getCount() ;
  }

  @ApiParam( {required: true, description: ' id of resultType where it used in results', name: 'id', type: String})
  @Get('usedresulttypes/:id')
  async getUsedResultTypes(@Param('id') id: string): Promise<{TotalUsageCount: number}> {
    return this.resultTypeService.getUsedResultTypes(id);
  }

  @Get(':id')
  async getResultType(@Param('id') id: string) {
    return this.resultTypeService.getResultType(id);
  }

  @ApiParam( {required: true, description: 'id of result type to delete', name: 'id', type: String})
  @Right('RESULTTYPES_DELETE')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @ApiBearerAuth('jwt')
  @Delete(':id')
  async deleteResultType(@Param('id') id: string) {
    return this.resultTypeService.deleteResultType(id);
  }

  @ApiParam( {required: true, description: 'id of result type to updated', name: 'id', type: String})
  @Right('RESULTTYPES_UPDATE')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @ApiBearerAuth('jwt')
  @Put(':id')
  async updateResultType(@Param('id') id:string, @Body() body: UpdateResultTypeDTO) {
    return this.resultTypeService.updateResultType(id, body);
  }


  @Right('RESULTTYPES_CREATE')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @ApiBearerAuth('jwt')
  @ApiBody({type: CreateResultTypeDTOAPI})
  @Post()
  async createResultType(@Body() body: CreateResultTypeDTO) {
    return this.resultTypeService.createResultType(body);
  }
}
