import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEventDto {
    @IsString()
    @IsNotEmpty()
    titulo: string;

    @IsString()
    @IsOptional()
    descricao?: string;

    @IsDateString()
    @IsNotEmpty()
    data: string;

    @IsString()
    @IsNotEmpty()
    hora: string;

    @IsString()
    @IsNotEmpty()
    local: string;

    @IsString()
    @IsNotEmpty()
    tipo: string;
}
