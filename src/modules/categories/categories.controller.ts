import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, Request, UseGuards, } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoryDTO, CreateCategoryDTO, UpdateCategoryDTO } from 'src/shared/dtos/categories.dto';
import {ApiBearerAuth, ApiBody, ApiParam, ApiTags} from '@nestjs/swagger';
import { Right } from '../auth/rights/rights.decorator';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RightsGuard } from '../auth/rights/rights.guard';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService
  ) {}
  // No Auth
  @ApiBearerAuth('jwt')
  @Post('migrate')
  async migrate(): Promise<void> {
    await this.categoriesService.migrate();
  }

  
  @Get('counter')
  async getCount(): Promise<number> {
    try {
      return await this.categoriesService.countEvents();
    } catch (error) {
      throw new HttpException('Invalid query!', HttpStatus.BAD_REQUEST);
    }
  }

  @Get() async getAll(@Query('language') language?: string): Promise<CategoryDTO[]> {
    return  await this.categoriesService.getCategories(language);
  }
  @Right('CATEGORY_CREATE')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @ApiBearerAuth('jwt')
  @ApiBody({ type: CreateCategoryDTO })
  @Post()
  async createCategory(@Body() category: CreateCategoryDTO, @Request() req) {
    return this.categoriesService.create(category, req.user._id);
  }

  @Get('/:id')
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
  })
  async getOne(@Param('id') id: string): Promise<CategoryDTO | undefined> {
    return this.categoriesService.getOneFromId(id);
  }

  @Right('CATEGORY_UPDATE')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @ApiBearerAuth('jwt')
  @ApiBody({ type: UpdateCategoryDTO })
  @Put('/:id')
  async updateCategory(
    @Body() body: UpdateCategoryDTO,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.categoriesService.update(id, body, req.user._id);
  }

  @Right('CATEGORY_DELETE')
  @UseGuards(JwtAuthGuard, RightsGuard)
  @ApiBearerAuth('jwt')
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
  })
  @Delete('/:id')
  async deleteCategory(@Param('id') id: string) {
    return this.categoriesService.delete(id);
  }
}
