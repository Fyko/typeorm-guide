import { Entity, Column, PrimaryColumn, BaseEntity } from 'typeorm';

@Entity('guilds')
export default class Guild extends BaseEntity {
	@PrimaryColumn('bigint')
	public id!: string;

	@Column({ default: '!!' })
	public prefix!: string;
}
