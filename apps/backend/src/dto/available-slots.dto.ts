import { ApiProperty } from '@nestjs/swagger';

export class TimeSlot {
  @ApiProperty()
  time: string;

  @ApiProperty()
  available: boolean;

  @ApiProperty()
  reserved?: boolean;
}

export class DaySlots {
  @ApiProperty()
  date: string;

  @ApiProperty()
  dayName: string;

  @ApiProperty()
  isToday: boolean;

  @ApiProperty()
  isPast: boolean;

  @ApiProperty()
  isWithin24Hours: boolean;

  @ApiProperty({ type: [TimeSlot] })
  slots: TimeSlot[];
}

export class AvailableSlotsResponseDto {
  @ApiProperty({ type: [DaySlots] })
  days: DaySlots[];

  @ApiProperty()
  weekStart: string;

  @ApiProperty()
  weekEnd: string;
}
