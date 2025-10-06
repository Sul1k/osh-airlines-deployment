import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FlightsService } from './flights.service';
import { FlightsController } from './flights.controller';
import { Flight, FlightSchema } from '../schemas/flight.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Flight.name, schema: FlightSchema }])],
  providers: [FlightsService],
  controllers: [FlightsController],
  exports: [FlightsService],
})
export class FlightsModule {}
