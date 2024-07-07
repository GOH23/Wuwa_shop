import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
export type UserRoleType = "admin" | "user";
@Entity()
export class User{
    @PrimaryGeneratedColumn()
    ID!: number;
    @Column()
    Userid!: number;
    @Column({default: 'null'})
    first_name!: string
    @Column({default: 'null'})
    username!: string
    @Column({default: 0})
    Balance!: number;
    @Column({default: 100})
    TokenBalance!: number;
    @Column({
        type: "enum",
        enum: ["admin", "user"],
        default: "user"
    })
    UserRole!: UserRoleType
}