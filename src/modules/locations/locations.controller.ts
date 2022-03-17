import { Controller, Get, Param } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { Location } from 'src/shared/schemas/location.schema';
import { Schema } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Controller('locations')
export class LocationsController {
    constructor(
        private readonly locationsService: LocationsService,
        ){}
    @Get(':id')
    async getOneLocation(@Param('id') id: string):Promise<Location> {
        return await this.locationsService.findOne(id);
    }
}
