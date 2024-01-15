import { Controller, Get, Post, Query, } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoryDTO } from 'src/shared/dtos/categories.dto';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';

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
  @Get() async getAll(@Query('language') language?: string): Promise<CategoryDTO[]> {
    return  await this.categoriesService.getCategories(language);
  }
}
